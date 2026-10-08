import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { registerSchema, loginSchema, updateMeSchema } from './auth.schema'
import { register, login, getMe, updateMe } from './auth.service'
import { AuthRequest } from '../../middleware/auth.middleware'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

const setAuthCookie = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
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

export const logoutController = (_req: Request, res: Response) => {
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
