// Vercel function: JSON API (/api/*). Data lives in Upstash Redis (set up from the Vercel Marketplace).
import { createCore } from '../server/core.js'
import { pickStorage } from '../server/storage.js'

const core = createCore(pickStorage('/tmp/pandit-data'))

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  try {
    return await core.api(req, res, url)
  } catch (e) {
    console.error(e)
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end('{"error":"server error"}') }
  }
}
