import { z } from 'zod'
import { Currency } from '../../generated/prisma/enums'

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

// Whitelist of what a user may change about themselves; both fields optional
// so the client can update just one of them
export const updateMeSchema = z.object({
  full_name: z.string().trim().min(2).optional(),
  currency: z.enum(Currency).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>
