import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { registerSchema, loginSchema, updateMeSchema } from './auth.schema'
import { register, login, getMe, updateMe } from './auth.service'
import { AuthRequest, TokenPayload } from '../../middleware/auth.middleware'
import { createDemoUser, DEMO_TTL_MS } from '../demo/demo.service'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

// Demo sessions end when the demo account is deleted (24h);
// the token carries `demo: true` so routes can block demo users cheaply
const setAuthCookie = (res: Response, userId: string, { demo = false } = {}) => {
  const maxAge = demo ? DEMO_TTL_MS : SEVEN_DAYS
  const payload: TokenPayload = demo ? { userId, demo } : { userId }
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: maxAge / 1000 })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  })
}

// No try/catch needed: Express 5 sends errors thrown here (including
// ZodError from .parse()) to the error middleware in src/middleware.

export const registerController = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body)
  const user = await register(data)

  setAuthCookie(res, user.id)
  res.status(201).json({ user })
}

export const loginController = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body)
  const user = await login(data)

  setAuthCookie(res, user.id)
  res.status(200).json({ user })
}

// "Try the demo": a fresh, private, pre-filled account per visitor
export const demoController = async (_req: Request, res: Response) => {
  const user = await createDemoUser()

  setAuthCookie(res, user.id, { demo: true })
  res.status(201).json({ user })
}

export const logoutController =(_req: Request, res: Response) => {
  res.clearCookie('token').status(200).json({ message: 'Logged out successfully.' })
}

export const meController = async (req: AuthRequest, res: Response) => {
  const user = await getMe(req.userId!)
  res.status(200).json(user)
}

export const updateMeController = async (req: AuthRequest, res: Response) => {
  const data = updateMeSchema.parse(req.body)
  const user = await updateMe(req.userId!, data)
  res.status(200).json(user)
}
