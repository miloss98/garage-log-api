import { ErrorRequestHandler, RequestHandler } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { HttpError } from '../lib/http-error'

// Runs when no router matched the request.
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Express recognises error middleware by its 4 arguments.
// In Express 5, errors thrown inside async handlers land here automatically.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message })
    return
  }

  // schema.parse() failed: same { errors } shape the frontend already reads
  if (err instanceof z.ZodError) {
    res.status(400).json({ errors: z.flattenError(err) })
    return
  }

  // e.g. file too large
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: err.message })
    return
  }

  // express.json() errors (invalid JSON, body too large) carry a 4xx status
  if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ message: err.message })
    return
  }

  // Anything else is a bug: log the details, but don't leak them to the client
  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
}
