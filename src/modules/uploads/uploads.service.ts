import { UTFile } from 'uploadthing/server'
import { utapi } from '../../lib/uploadthing'

export const uploadImage = async (file: Express.Multer.File) => {
  // UTFile is a File-like object: bytes + a name + a mime type
  const utFile = new UTFile([new Uint8Array(file.buffer)], file.originalname, {
    type: file.mimetype,
  })

  const { data, error } = await utapi.uploadFiles(utFile)
  if (error) throw new Error(error.message)

  return data.ufsUrl
}
