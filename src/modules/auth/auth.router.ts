import { Router } from 'express'
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

//register
router.post('/register', registerController)

//login
router.post('/login', loginController)

//logout
router.post('/logout', authenticate, logoutController)

//me
router.get('/me', authenticate, meController)

export default router
