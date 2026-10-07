import { z } from 'zod'

export const serviceRecordSchema = z.object({
  type: z.enum(['OIL_CHANGE', 'SMALL_SERVICE', 'BIG_SERVICE', 'TIRE_CHANGE', 'REGISTRATION']),
  service_date: z.coerce.date(),
  next_service_date: z.coerce.date().nullish(),
  mileage_at_service: z.number().int().nullish(),
  notes: z.string().nullish(),
})

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>
