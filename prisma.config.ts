import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// if studio can't connect, unset the .env: $env:DATABASE_URL=""
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
