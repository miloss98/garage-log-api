import { db } from '../../lib/db'

// Aggregates come back from Postgres as exact Decimals; for chart data we
// send plain numbers rounded to cents.
const toAmount = (value: { toString(): string } | null | undefined) =>
  value == null ? 0 : Math.round(Number(value.toString()) * 100) / 100

export const getStats = async (userId: string, months: number) => {
  const ownRecords = { car: { user_id: userId } }

  const [allTime, byType, byCarRaw, cars, byMonth] = await Promise.all([
    db.serviceRecord.aggregate({
      where: ownRecords,
      _sum: { cost: true },
      _count: { _all: true },
    }),

    db.serviceRecord.groupBy({
      by: ['type'],
      where: { ...ownRecords, cost: { not: null } },
      _sum: { cost: true },
      _count: { _all: true },
    }),

    db.serviceRecord.groupBy({
      by: ['car_id'],
      where: { ...ownRecords, cost: { not: null } },
      _sum: { cost: true },
    }),

    db.car.findMany({ where: { user_id: userId }, select: { id: true, name: true } }),

    // Prisma's query builder can't group by calendar month, so this is raw SQL.
    // generate_series produces every month in the range, and the LEFT JOIN
    // keeps months with no spending as 0, so the chart has no gaps.
    // ${...} values are sent as bound parameters, never pasted into the SQL,
    // so this is safe from SQL injection.
    db.$queryRaw<{ month: string; total: unknown; count: bigint }[]>`
      SELECT to_char(m.month, 'YYYY-MM') AS month,
             COALESCE(SUM(sr.cost), 0)    AS total,
             COUNT(sr.cost)               AS count
      FROM generate_series(
             date_trunc('month', CURRENT_DATE)::timestamp - make_interval(months => ${months - 1}::int),
             date_trunc('month', CURRENT_DATE)::timestamp,
             interval '1 month'
           ) AS m(month)
      LEFT JOIN service_records sr
             ON date_trunc('month', sr.service_date) = m.month
            AND sr.car_id IN (SELECT id FROM cars WHERE user_id = ${userId})
      GROUP BY m.month
      ORDER BY m.month
    `,
  ])

  const carNames = new Map(cars.map((car) => [car.id, car.name]))
  const monthly = byMonth.map((row) => ({
    month: row.month,
    total: toAmount(row.total as { toString(): string }),
    count: Number(row.count),
  }))

  return {
    total: toAmount(allTime._sum.cost),
    record_count: allTime._count._all,
    period_total: toAmount(monthly.reduce((sum, m) => sum + m.total, 0)),
    by_month: monthly,
    by_type: byType
      .map((row) => ({ type: row.type, total: toAmount(row._sum.cost), count: row._count._all }))
      .sort((a, b) => b.total - a.total),
    by_car: byCarRaw
      .map((row) => ({
        car_id: row.car_id,
        name: carNames.get(row.car_id) ?? 'Unknown',
        total: toAmount(row._sum.cost),
      }))
      .sort((a, b) => b.total - a.total),
  }
}
