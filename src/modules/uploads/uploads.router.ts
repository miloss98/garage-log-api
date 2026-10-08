import { Router } from 'express'
import multer from 'multer'
import { uploadImageController } from './uploads.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

const router = Router()

// Multer errors (e.g. file too large) are turned into a 400 by the error middleware
router.post('/', upload.single('image'), uploadImageController)

export default router
