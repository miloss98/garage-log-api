import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { HttpError } from '../lib/http-error'

export interface AuthRequest extends Request {
  userId?: string
  isDemo?: boolean
}

export type TokenPayload = { userId: string; demo?: boolean }

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    req.userId = payload.userId
    req.isDemo = payload.demo === true
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Use after authenticate on routes demo accounts must not use (e.g. uploads)
export const blockDemo = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.isDemo) throw new HttpError(403, 'This is disabled in the demo account')
  next()
}
