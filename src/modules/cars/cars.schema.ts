import { z } from 'zod'

export const carSchema = z.object({
  name: z.string(),
  model: z.string().optional(),
  year: z.number().int(),
  color: z.string().optional(),
  licence_plate: z.string().optional(),
  mileage: z.number().int().optional(),
  fuel_type: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  image_url: z.string().optional(),
})

export type CarInput = z.infer<typeof carSchema>
