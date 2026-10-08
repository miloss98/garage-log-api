import { Router } from 'express'
import {
  loginController,
  logoutController,
  meController,
  registerController,
  updateMeController,
} from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { loginLimiter } from '../../middleware/rate-limit.middleware'

const router = Router()

//register
router.post('/register', registerController)

//login
router.post('/login', loginLimiter, loginController)

//logout
router.post('/logout', logoutController)

//me
router.get('/me', authenticate, meController)

//update me
router.patch('/me', authenticate, updateMeController)

export default router
