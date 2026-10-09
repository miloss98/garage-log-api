import { z } from 'zod'
import { registerSchema, loginSchema, updateMeSchema } from '../modules/auth/auth.schema'
import { carSchema } from '../modules/cars/cars.schema'
import { serviceRecordSchema } from '../modules/service_records/service-records.schema'
import { statsQuerySchema } from '../modules/stats/stats.schema'

// Request bodies are generated from the same zod schemas the API validates
// with, so the docs can't drift from the real rules.
// JSON Schema has no Date type: dates are documented as "YYYY-MM-DD" strings,
// which is exactly what z.coerce.date() accepts.
const body = (schema: z.ZodType) =>
  z.toJSONSchema(schema, {
    io: 'input',
    unrepresentable: 'any',
    override: (ctx) => {
      const def = (ctx.zodSchema as { _zod: { def: { type: string } } })._zod.def
      if (def.type === 'date') {
        ctx.jsonSchema.type = 'string'
        ctx.jsonSchema.format = 'date'
      }
    },
  })

// One property of a converted schema, e.g. the enum of service types
const prop = (schema: z.ZodType, key: string): object => {
  const value = body(schema).properties?.[key]
  // A JSON Schema may also be a plain true/false; we only expect objects here
  return typeof value === 'object' ? value : {}
}

const json = (schema: object) => ({ content: { 'application/json': { schema } } })
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const obj = (properties: Record<string, object>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
})

const errors = {
  400: { description: 'Validation failed', ...json(ref('ValidationError')) },
  401: { description: 'Not logged in', ...json(ref('Error')) },
  404: { description: 'Not found (or belongs to another user)', ...json(ref('Error')) },
}
const idParam = (name: string) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
})
const PUBLIC = [] as object[]

const nullable = (type: string, extra: object = {}) => ({ type: [type, 'null'], ...extra })

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'GarageLog API',
    version: '2.0.0',
    license: { name: 'ISC', identifier: 'ISC' },
    description:
      'REST API behind [GarageLog](https://garage-log.vercel.app): cars, service records, reminders and expenses.\n\n' +
      '**Auth:** a JWT in an httpOnly `token` cookie, set by `/auth/login`, `/auth/register` or `/auth/demo`.\n\n' +
      '**Try it here:** run `POST /auth/demo` (Try it out → Execute) to get a private demo account, ' +
      'then every other endpoint works with that cookie. Demo accounts are deleted after 24 hours.',
  },
  // Relative URL: works on the API host and through the frontend's /api proxy
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth', description: 'Register, log in, demo accounts and the current user' },
    { name: 'Cars', description: 'Your vehicles' },
    {
      name: 'Service records',
      description: 'Services, repairs and documents of a car, with reminders',
    },
    { name: 'Stats', description: 'Spending summaries for the expenses dashboard' },
    { name: 'Uploads', description: 'Car photos (stored on UploadThing)' },
    { name: 'Health', description: 'Uptime check' },
  ],
  security: [{ cookieAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Is the API up?',
        security: PUBLIC,
        responses: { 200: { description: 'OK', ...json(obj({ status: { const: 'ok' } })) } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account (sets the auth cookie)',
        security: PUBLIC,
        requestBody: { required: true, ...json(body(registerSchema)) },
        responses: {
          201: { description: 'Registered and logged in', ...json(obj({ user: ref('User') })) },
          400: errors[400],
          409: { description: 'Email already in use', ...json(ref('Error')) },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in (sets the auth cookie)',
        security: PUBLIC,
        description: 'Rate limited: 10 failed attempts per email per 15 minutes.',
        requestBody: { required: true, ...json(body(loginSchema)) },
        responses: {
          200: { description: 'Logged in', ...json(obj({ user: ref('User') })) },
          400: errors[400],
          401: { description: 'Invalid credentials', ...json(ref('Error')) },
          429: { description: 'Too many failed attempts', ...json(ref('Error')) },
        },
      },
    },
    '/auth/demo': {
      post: {
        tags: ['Auth'],
        summary: 'Start a private demo account (sets the auth cookie)',
        security: PUBLIC,
        description:
          'Creates a temporary user with 3 cars and a year of service history. Deleted after 24 hours. Max 50 starts per hour.',
        responses: {
          201: {
            description: 'Demo account created and logged in',
            ...json(obj({ user: ref('User') })),
          },
          429: { description: 'Too many demos started', ...json(ref('Error')) },
          503: { description: 'Too many active demos', ...json(ref('Error')) },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (clears the auth cookie)',
        security: PUBLIC,
        responses: { 200: { description: 'Logged out', ...json(ref('Error')) } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'The logged-in user',
        responses: { 200: { description: 'Current user', ...json(ref('User')) }, 401: errors[401] },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Update name and/or currency',
        requestBody: { required: true, ...json(body(updateMeSchema)) },
        responses: {
          200: { description: 'Updated user', ...json(ref('User')) },
          400: errors[400],
          401: errors[401],
        },
      },
    },
    '/cars': {
      get: {
        tags: ['Cars'],
        summary: 'All your cars, with service records (newest first)',
        responses: {
          200: {
            description: 'Cars',
            ...json(obj({ cars: { type: 'array', items: ref('CarWithRecords') } })),
          },
          401: errors[401],
        },
      },
      post: {
        tags: ['Cars'],
        summary: 'Add a car',
        requestBody: { required: true, ...json(body(carSchema)) },
        responses: {
          201: { description: 'Created', ...json(obj({ newCar: ref('Car') })) },
          400: errors[400],
          401: errors[401],
        },
      },
    },
    '/cars/{id}': {
      parameters: [idParam('id')],
      get: {
        tags: ['Cars'],
        summary: 'One car',
        responses: {
          200: { description: 'Car', ...json(obj({ car: ref('Car') })) },
          401: errors[401],
          404: errors[404],
        },
      },
      put: {
        tags: ['Cars'],
        summary: "Replace a car's details",
        requestBody: { required: true, ...json(body(carSchema)) },
        responses: {
          200: { description: 'Updated', ...json(obj({ car: ref('Car') })) },
          ...errors,
        },
      },
      delete: {
        tags: ['Cars'],
        summary: 'Delete a car and its records',
        responses: {
          200: { description: 'Deleted', ...json(obj({ deletedCar: ref('Car') })) },
          401: errors[401],
          404: errors[404],
        },
      },
    },
    '/cars/{carId}/service-records': {
      parameters: [idParam('carId')],
      get: {
        tags: ['Service records'],
        summary: "A car's service history (newest first)",
        responses: {
          200: {
            description: 'Records',
            ...json(obj({ serviceRecords: { type: 'array', items: ref('ServiceRecord') } })),
          },
          401: errors[401],
          404: errors[404],
        },
      },
      post: {
        tags: ['Service records'],
        summary: 'Log a service, repair or document',
        description:
          "A title is required for REPAIR and OTHER. Next date/mileage must be after the service date/mileage. A higher mileage_at_service raises the car's mileage.",
        requestBody: { required: true, ...json(body(serviceRecordSchema)) },
        responses: {
          201: { description: 'Created', ...json(obj({ newServiceRecord: ref('ServiceRecord') })) },
          ...errors,
        },
      },
    },
    '/cars/{carId}/service-records/{serviceId}': {
      parameters: [idParam('carId'), idParam('serviceId')],
      get: {
        tags: ['Service records'],
        summary: 'One record',
        responses: {
          200: { description: 'Record', ...json(obj({ serviceRecord: ref('ServiceRecord') })) },
          401: errors[401],
          404: errors[404],
        },
      },
      put: {
        tags: ['Service records'],
        summary: 'Replace a record',
        requestBody: { required: true, ...json(body(serviceRecordSchema)) },
        responses: {
          200: {
            description: 'Updated',
            ...json(obj({ updatedServiceRecord: ref('ServiceRecord') })),
          },
          ...errors,
        },
      },
      delete: {
        tags: ['Service records'],
        summary: 'Delete a record',
        responses: {
          200: {
            description: 'Deleted',
            ...json(obj({ deletedServiceRecord: ref('ServiceRecord') })),
          },
          401: errors[401],
          404: errors[404],
        },
      },
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Spending summary for the dashboard',
        parameters: [
          {
            name: 'months',
            in: 'query',
            required: false,
            schema: prop(statsQuerySchema, 'months'),
          },
        ],
        responses: {
          200: { description: 'Totals per month, service type and car', ...json(ref('Stats')) },
          400: errors[400],
          401: errors[401],
        },
      },
    },
    '/uploads': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a car photo (max 5MB)',
        description:
          'Stores the image on UploadThing and returns its URL for `image_url`. Not available to demo accounts.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: obj({ image: { type: 'string', format: 'binary' } }) },
          },
        },
        responses: {
          201: {
            description: 'Uploaded',
            ...json(obj({ url: { type: 'string', format: 'uri' } })),
          },
          400: { description: 'No image / file too large', ...json(ref('Error')) },
          401: errors[401],
          403: { description: 'Disabled for demo accounts', ...json(ref('Error')) },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'httpOnly JWT cookie set by the auth endpoints',
      },
    },
    schemas: {
      Error: obj({ message: { type: 'string' } }),
      ValidationError: obj({
        errors: obj({
          formErrors: { type: 'array', items: { type: 'string' } },
          fieldErrors: {
            type: 'object',
            additionalProperties: { type: 'array', items: { type: 'string' } },
          },
        }),
      }),
      User: obj({
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        full_name: nullable('string'),
        avatar_url: nullable('string'),
        currency: { enum: ['EUR', 'USD', 'GBP', 'CHF', 'RSD'] },
        is_demo: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      }),
      Car: obj({
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        model: nullable('string'),
        year: { type: 'integer' },
        color: nullable('string'),
        licence_plate: nullable('string'),
        mileage: nullable('integer'),
        fuel_type: { enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'] },
        image_url: nullable('string'),
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      }),
      ServiceRecord: obj({
        id: { type: 'string', format: 'uuid' },
        car_id: { type: 'string', format: 'uuid' },
        type: prop(serviceRecordSchema, 'type'),
        title: nullable('string'),
        service_date: { type: 'string', format: 'date-time' },
        mileage_at_service: nullable('integer'),
        next_service_date: nullable('string', { format: 'date-time' }),
        next_service_mileage: nullable('integer'),
        cost: nullable('string', { description: 'Exact decimal as a string, e.g. "89.90"' }),
        workshop: nullable('string'),
        notes: nullable('string'),
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      }),
      CarWithRecords: {
        allOf: [
          ref('Car'),
          obj({ service_records: { type: 'array', items: ref('ServiceRecord') } }),
        ],
      },
      Stats: obj({
        total: { type: 'number' },
        record_count: { type: 'integer' },
        period_total: { type: 'number' },
        by_month: {
          type: 'array',
          items: obj({
            month: { type: 'string', example: '2026-05' },
            total: { type: 'number' },
            count: { type: 'integer' },
          }),
        },
        by_type: {
          type: 'array',
          items: obj({
            type: { type: 'string' },
            total: { type: 'number' },
            count: { type: 'integer' },
          }),
        },
        by_car: {
          type: 'array',
          items: obj({
            car_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            total: { type: 'number' },
          }),
        },
      }),
    },
  },
}

// Stable operation names for API client generators: "post /cars/{id}" -> "postCarsById"
const operationName = (method: string, path: string) =>
  method +
  path
    .split('/')
    .filter(Boolean)
    .map((part) => {
      const name = part.startsWith('{')
        ? 'By' + part.slice(1, -1).replace(/^./, (c) => c.toUpperCase())
        : part
      return name.replace(/(^|-)(.)/g, (_m, _dash, c: string) => c.toUpperCase())
    })
    .join('')

for (const [path, item] of Object.entries(
  openApiDocument.paths as Record<string, Record<string, unknown>>,
)) {
  for (const [method, operation] of Object.entries(item)) {
    if (method !== 'parameters')
      (operation as { operationId?: string }).operationId = operationName(method, path)
  }
}
