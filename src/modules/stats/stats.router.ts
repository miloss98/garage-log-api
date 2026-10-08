import { Router } from 'express'
import { getStatsController } from './stats.controller'

const router = Router()

//spending summary for the dashboard
router.get('/', getStatsController)

export default router
