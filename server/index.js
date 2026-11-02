// Pandit Estate Node server: serves the built site and the API. Storage is files by default,
// Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, or Redis when KV_REST_API_URL / UPSTASH_REDIS_REST_URL is set.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCore } from './core.js'
import { pickStorage } from './storage.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(here, '..')
try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* env may come from the host */ }

// `npm run dev` pins the API to 3001 (the Vite proxy target); production uses the host's PORT.
const PORT = process.argv.includes('--dev') ? 3001 : Number(process.env.PORT) || 3001
// Point DATA_DIR at a persistent disk in production so leads, content and uploads survive deploys.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, 'data')

const core = createCore(pickStorage(DATA_DIR))
const DIST = path.join(ROOT, 'dist')
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json', '.vcf': 'text/vcard', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.webm': 'video/webm' }
const readIndex = async () => { try { return fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') } catch { return null } }

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  try {
    if (url.pathname.startsWith('/api/')) return await core.api(req, res, url)
    // real files from the build (assets, images, icons) are served directly
    const f = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)))
    if (f.startsWith(DIST) && path.basename(f) !== 'index.html' && fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=3600' })
      return fs.createReadStream(f).pipe(res)
    }
    return await core.page(req, res, url, readIndex)
  } catch (e) {
    console.error(e)
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end('{"error":"server error"}') }
  }
}).listen(PORT, () => console.log(`Pandit Estate server on http://localhost:${PORT}`))
