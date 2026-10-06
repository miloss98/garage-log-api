import { z } from 'zod'

export const serviceRecordSchema = z.object({
  type: z.enum(['OIL_CHANGE', 'SMALL_SERVICE', 'BIG_SERVICE', 'TIRE_CHANGE', 'REGISTRATION']),
  service_date: z.string(),
  next_service_date: z.string().optional(),
  mileage_at_service: z.number().int().optional(),
  notes: z.string().optional(),
})

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>
