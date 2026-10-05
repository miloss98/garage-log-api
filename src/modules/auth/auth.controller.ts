import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { registerSchema, loginSchema } from './auth.schema'
import { register, login } from './auth.service'
import { AuthRequest } from '../../middleware/auth.middleware'
import { db } from '../../lib/db'

export const registerController = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const user = await register(parsed.data)

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({ user })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const loginController = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const user = await login(parsed.data)

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({ user })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie('token').status(200).json({ msg: 'Logged out successfully.' })
}

export const meController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const { password: _, ...userWithoutPassword } = user
    res.status(200).json(userWithoutPassword)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
