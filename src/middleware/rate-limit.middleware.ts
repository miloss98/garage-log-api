import rateLimit from 'express-rate-limit'

// Brute-force protection: max 10 failed logins per email per 15 minutes.
// Keyed by email, not IP: requests arrive through the Vercel proxy,
// so many users can share the same IP from the API's point of view.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => String(req.body?.email ?? '').toLowerCase(),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
})

// Every demo writes ~30 rows, so cap how many can start per hour in total
// (one shared counter for all visitors: behind the proxy, IPs aren't reliable)
export const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  keyGenerator: () => 'all-visitors',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'The demo is busy right now. Please try again later.' },
})
