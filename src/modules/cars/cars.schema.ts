import { z } from 'zod'
import { FuelType } from '../../generated/prisma/enums'

export const carSchema = z.object({
  name: z.string().trim().min(1).max(50),
  model: z.string().trim().max(50).nullish(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().trim().max(30).nullish(),
  licence_plate: z.string().trim().max(20).nullish(),
  mileage: z.number().int().nonnegative().max(5_000_000).nullish(),
  fuel_type: z.enum(FuelType).optional(),
  image_url: z.url().nullish(),
})

export type CarInput = z.infer<typeof carSchema>
