import { Router } from 'express'
import {
  demoController,
  loginController,
  logoutController,
  meController,
  registerController,
  updateMeController,
} from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { demoLimiter, loginLimiter } from '../../middleware/rate-limit.middleware'

const router = Router()

//register
router.post('/register', registerController)

//login
router.post('/login', loginLimiter, loginController)

//try the demo
router.post('/demo', demoLimiter, demoController)

//logout
router.post('/logout', logoutController)

//me
router.get('/me', authenticate, meController)

//update me
router.patch('/me', authenticate, updateMeController)

export default router
