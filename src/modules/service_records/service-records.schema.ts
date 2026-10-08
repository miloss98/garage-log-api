import { z } from 'zod'
import { SRType } from '../../generated/prisma/enums'

// These types have no fixed meaning, so the user must say what was done
const TYPES_REQUIRING_TITLE: SRType[] = [SRType.REPAIR, SRType.OTHER]

export const serviceRecordSchema = z
  .object({
    // z.enum accepts Prisma's generated enum object: the list of types
    // lives in one place (schema.prisma)
    type: z.enum(SRType),
    title: z.string().trim().max(100).nullish(),
    service_date: z.coerce.date(),
    mileage_at_service: z.number().int().nonnegative().nullish(),
    next_service_date: z.coerce.date().nullish(),
    next_service_mileage: z.number().int().positive().nullish(),
    // Rounded to cents; stored as an exact Decimal
    cost: z
      .number()
      .nonnegative()
      .max(99_999_999)
      .transform((value) => Math.round(value * 100) / 100)
      .nullish(),
    workshop: z.string().trim().max(100).nullish(),
    notes: z.string().trim().max(1000).nullish(),
  })
  // Rules that involve more than one field
  .superRefine((data, ctx) => {
    if (TYPES_REQUIRING_TITLE.includes(data.type) && !data.title) {
      ctx.addIssue({
        code: 'custom',
        path: ['title'],
        message: 'Title is required for repairs and other records',
      })
    }

    if (data.next_service_date && data.next_service_date <= data.service_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['next_service_date'],
        message: 'Next service date must be after the service date',
      })
    }

    if (
      data.next_service_mileage != null &&
      data.mileage_at_service != null &&
      data.next_service_mileage <= data.mileage_at_service
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['next_service_mileage'],
        message: 'Next service mileage must be higher than the mileage at service',
      })
    }
  })

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>
