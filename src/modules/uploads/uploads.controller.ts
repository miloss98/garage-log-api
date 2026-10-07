import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { uploadImage } from './uploads.service'

export const uploadImageController = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No image provided' })
    return
  }
  try {
    const url = await uploadImage(req.file)

    res.status(201).json({ url })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
