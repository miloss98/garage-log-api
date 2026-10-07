import { z } from 'zod'

export const carSchema = z.object({
  name: z.string().min(1),
  model: z.string().nullish(),
  year: z.number().int(),
  color: z.string().nullish(),
  licence_plate: z.string().nullish(),
  mileage: z.number().int().nullish(),
  fuel_type: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  image_url: z.string().nullish(),
})

export type CarInput = z.infer<typeof carSchema>
