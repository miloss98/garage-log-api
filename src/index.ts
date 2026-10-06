import express from 'express'

import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import authRouter from './modules/auth/auth.router'
import carsRouter from './modules/cars/cars.router'
import serviceRecordsRouter from './modules/service_records/service-records.router'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/cars', authenticate, carsRouter)
app.use('/api/cars/:carId/service-records', authenticate, serviceRecordsRouter)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
