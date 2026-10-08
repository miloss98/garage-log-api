import { z } from 'zod'

// GET /api/stats?months=12 -> how many months the monthly chart covers
export const statsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(60).default(12),
})

export type StatsQuery = z.infer<typeof statsQuerySchema>
