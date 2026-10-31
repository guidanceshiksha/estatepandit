// Vercel function: every non-file URL (home, /blog, /admin, uploads, sitemap, robots) is rewritten here.
import fs from 'node:fs'
import path from 'node:path'
import { createCore } from '../server/core.js'
import { pickStorage } from '../server/storage.js'

const core = createCore(pickStorage('/tmp/pandit-data'))

export const config = { api: { bodyParser: false } }

// build step renames dist/index.html to dist/app.html so "/" is not served as a bare static file
async function readHtml() {
  for (const p of [path.join(process.cwd(), 'dist', 'app.html'), path.join(process.cwd(), 'app.html')]) {
    try { return fs.readFileSync(p, 'utf8') } catch { /* try next */ }
  }
  return null
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://localhost').searchParams.get('p') || '/'
  const url = new URL(q.startsWith('/') ? q : '/' + q, 'http://localhost')
  try {
    return await core.page(req, res, url, readHtml)
  } catch (e) {
    console.error(e)
    if (!res.headersSent) { res.statusCode = 500; res.end('Server error') }
  }
}
