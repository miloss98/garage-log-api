import bcrypt from 'bcryptjs'
import { db } from '../../lib/db'
import { HttpError, notFound } from '../../lib/http-error'
import { LoginInput, RegisterInput, UpdateMeInput } from './auth.schema'

// Never send the password hash to the client
export const withoutPassword = <T extends { password: string }>(user: T) => {
  const { password: _, ...rest } = user
  return rest
}

export const register = async (data: RegisterInput) => {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) throw new HttpError(409, 'Email already in use')

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      full_name: data.full_name,
    },
  })

  return withoutPassword(user)
}

export const login = async (data: LoginInput) => {
  const user = await db.user.findUnique({
    where: { email: data.email },
  })

  // Same message for "no such user" and "wrong password",
  // so attackers can't find out which emails are registered
  if (!user) throw new HttpError(401, 'Invalid credentials')

  const isPasswordValid = await bcrypt.compare(data.password, user.password)
  if (!isPasswordValid) throw new HttpError(401, 'Invalid credentials')

  return withoutPassword(user)
}

export const getMe = async (userId: string) => {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw notFound('User')

  return withoutPassword(user)
}

export const updateMe = async (userId: string, data: UpdateMeInput) => {
  const user = await db.user.update({ where: { id: userId }, data })
  return withoutPassword(user)
}
