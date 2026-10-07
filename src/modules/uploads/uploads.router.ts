import { Router } from 'express'
import multer from 'multer'
import { uploadImageController } from './uploads.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

const router = Router()

router.post(
  '/',
  (req, res, next) =>
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message })
      next()
    }),
  uploadImageController,
)

export default router
