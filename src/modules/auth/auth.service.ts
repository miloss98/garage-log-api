import bcrypt from 'bcryptjs'
import { db } from '../../lib/db'
import { LoginInput, RegisterInput } from './auth.schema'

export const register = async (data: RegisterInput) => {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error('Email already in use')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      full_name: data.full_name,
    },
  })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export const login = async (data: LoginInput) => {
  const user = await db.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
