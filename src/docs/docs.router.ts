import express, { Router } from 'express'
import { getAbsoluteFSPath } from 'swagger-ui-dist'
import { openApiDocument } from './openapi'

// Swagger UI at /api/docs.
// Assets use ABSOLUTE paths (/api/docs/assets/...): the usual relative setup
// needs a trailing slash (/api/docs/), but Next.js strips trailing slashes, so
// through the frontend proxy the two would redirect in a loop.
// No inline <script>: the init code is a separate file, so helmet's
// Content-Security-Policy doesn't block it.
const router = Router()

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GarageLog API docs</title>
  <link rel="stylesheet" href="/api/docs/assets/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/api/docs/assets/favicon-32x32.png" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/docs/assets/swagger-ui-bundle.js"></script>
  <script src="/api/docs/init.js"></script>
</body>
</html>`

const init = `window.ui = SwaggerUIBundle({
  url: '/api/docs/openapi.json',
  dom_id: '#swagger-ui',
  deepLinking: true,
  // Send the auth cookie with "Try it out" requests
  withCredentials: true,
  presets: [SwaggerUIBundle.presets.apis],
  layout: 'BaseLayout',
})`

router.get('/', (_req, res) => {
  res.type('html').send(page)
})

router.get('/init.js', (_req, res) => {
  res.type('application/javascript').send(init)
})

router.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

router.use('/assets', express.static(getAbsoluteFSPath(), { index: false, maxAge: '7d' }))

export default router
