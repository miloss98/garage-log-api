import express from 'express'

import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import authRouter from './modules/auth/auth.router'
import uploadsRouter from './modules/uploads/uploads.router'
import carsRouter from './modules/cars/cars.router'
import serviceRecordsRouter from './modules/service_records/service-records.router'
import statsRouter from './modules/stats/stats.router'
import { authenticate } from './middleware/auth.middleware'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Render sits in front of the app as a proxy; trust its X-Forwarded-* headers
app.set('trust proxy', 1)

app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/uploads', authenticate, uploadsRouter)
app.use('/api/cars', authenticate, carsRouter)
app.use('/api/cars/:carId/service-records', authenticate, serviceRecordsRouter)
app.use('/api/stats', authenticate, statsRouter)

// Must come after all routes: 404 for unknown routes, then the error handler
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
