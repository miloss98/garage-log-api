import bcrypt from 'bcryptjs'
import { randomBytes, randomUUID } from 'crypto'
import { db } from '../../lib/db'
import { HttpError } from '../../lib/http-error'
import { withoutPassword } from '../auth/auth.service'
import { buildDemoCars } from './demo.data'

export const DEMO_TTL_MS = 24 * 60 * 60 * 1000
// Safety cap for the free database: 100 demos x ~25 records is only ~1-2 MB,
// but this guarantees it can't grow without limit.
const MAX_ACTIVE_DEMOS = 100

export const createDemoUser = async () => {
  // Self-cleaning: every new demo first removes demos older than 24h.
  // Their cars and records go too (onDelete: Cascade in the schema).
  await db.user.deleteMany({
    where: { is_demo: true, created_at: { lt: new Date(Date.now() - DEMO_TTL_MS) } },
  })

  const activeDemos = await db.user.count({ where: { is_demo: true } })
  if (activeDemos >= MAX_ACTIVE_DEMOS) {
    throw new HttpError(503, 'The demo is busy right now. Please try again in a few minutes.')
  }

  // Random password nobody knows: demo accounts can only be entered via
  // the cookie set by POST /api/auth/demo
  const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10)

  // One nested create = one transaction: the user, 3 cars and their
  // records are all created, or none of them are
  const user = await db.user.create({
    data: {
      email: `demo-${randomUUID()}@demo.garagelog.app`,
      password,
      full_name: 'Demo Driver',
      is_demo: true,
      cars: { create: buildDemoCars() },
    },
  })

  return withoutPassword(user)
}
