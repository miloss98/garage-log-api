import express from 'express'

import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import authRouter from './modules/auth/auth.router'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
