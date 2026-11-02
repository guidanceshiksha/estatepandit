// Vercel function: JSON API (/api/*). Data lives in Supabase (see supabase/schema.sql).
import { createCore } from '../server/core.js'
import { pickStorage } from '../server/storage.js'

const core = createCore(pickStorage('/tmp/pandit-data'))

// Vercel may pre-parse JSON into req.body; core.readBody handles both cases.

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  try {
    return await core.api(req, res, url)
  } catch (e) {
    console.error(e)
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end('{"error":"server error"}') }
  }
}
