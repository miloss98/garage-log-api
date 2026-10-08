import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { HttpError } from '../../lib/http-error'
import { uploadImage } from './uploads.service'

export const uploadImageController = async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new HttpError(400, 'No image provided')

  const url = await uploadImage(req.file)
  res.status(201).json({ url })
}
