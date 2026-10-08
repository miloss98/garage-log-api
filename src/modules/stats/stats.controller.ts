import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { statsQuerySchema } from './stats.schema'
import { getStats } from './stats.service'

export const getStatsController = async (req: AuthRequest, res: Response) => {
  const { months } = statsQuerySchema.parse(req.query)
  const stats = await getStats(req.userId!, months)
  res.status(200).json(stats)
}
