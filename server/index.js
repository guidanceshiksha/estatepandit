// Pandit Estate server: lead capture, admin auth, editable site content, uploads, SEO. No external dependencies.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { defaults } from '../src/data.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(here, '..')
try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* env may come from the host */ }

// `npm run dev` pins the API to 3001 (the Vite proxy target); production uses the host's PORT.
const PORT = process.argv.includes('--dev') ? 3001 : Number(process.env.PORT) || 3001

/* ---------- storage ---------- */
// Point DATA_DIR at a persistent disk in production so leads, content and uploads survive deploys.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, 'data')
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const file = (n) => path.join(DATA_DIR, n)
const readJson = (n, fallback) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')) } catch { return fallback } }
const writeJson = (n, v) => { const t = file(n) + '.tmp'; fs.writeFileSync(t, JSON.stringify(v)); fs.renameSync(t, file(n)) }

let leads = readJson('leads.json', [])
let store = readJson('content.json', {}) // only keys the admin has saved; the rest fall back to defaults
let auth = readJson('auth.json', null)  // { user, salt, hash }; absent = demo login admin / admin123

let secret
try { secret = fs.readFileSync(file('secret.key')) } catch { secret = crypto.randomBytes(32); fs.writeFileSync(file('secret.key'), secret) }

/* ---------- auth ---------- */
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex')
const DEMO = { user: 'admin', pass: 'admin123' }
const usingDemo = () => !auth
function checkLogin(user, pass) {
  const eq = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(); const y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y) }
  if (!auth) return eq(user, DEMO.user) & eq(pass, DEMO.pass) ? true : false
  return eq(user, auth.user) & (eq(hash(String(pass), auth.salt), auth.hash)) ? true : false
}
const sign = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return body + '.' + crypto.createHmac('sha256', secret).update(body).digest('base64url')
}
const verify = (token) => {
  const [body, sig] = String(token || '').split('.')
  if (!body || !sig) return false
  const good = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now() } catch { return false }
}
const isAdmin = (req) => verify((req.headers.authorization || '').replace(/^Bearer /, ''))

/* ---------- helpers ---------- */
const STATUSES = ['partial', 'new', 'contacted', 'qualified', 'closed', 'lost']
const KINDS = ['enquiry', 'visit', 'area', 'service', 'contact', 'search', 'callback']
const CONTENT_KEYS = Object.keys(defaults)
const clean = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n) : '')
const content = () => Object.fromEntries(CONTENT_KEYS.map((k) => [k, { ...defaults[k], ...(store[k] || {}) }]))

const hits = new Map()
const limited = (req, key, max) => {
  const k = key + (req.socket.remoteAddress || '')
  const now = Date.now()
  const arr = (hits.get(k) || []).filter((t) => now - t < 60000)
  arr.push(now)
  hits.set(k, arr)
  return arr.length > max
}
const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}
const readBody = (req, limit = 32 * 1024) => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  req.on('data', (c) => {
    size += c.length
    if (size > limit) { reject(new Error('too large')); req.destroy(); return }
    chunks.push(c)
  })
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')) } catch (e) { reject(e) } })
  req.on('error', reject)
})

/* ---------- api ---------- */
async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean) // ['api', ...]

  // public: site content
  if (req.method === 'GET' && parts[1] === 'content' && !parts[2]) {
    return send(res, 200, content(), { 'Cache-Control': 'no-cache' })
  }

  // public: create/update a lead (called repeatedly while the visitor types)
  if (req.method === 'PUT' && parts[1] === 'leads' && parts[2]) {
    const id = parts[2]
    if (!/^[a-zA-Z0-9-]{8,48}$/.test(id)) return send(res, 400, { error: 'bad id' })
    if (limited(req, 'lead', 240)) return send(res, 429, { error: 'slow down' })
    const b = await readBody(req)
    const now = new Date().toISOString()
    let lead = leads.find((l) => l.id === id)
    if (!lead) {
      if (leads.length > 50000) return send(res, 507, { error: 'full' })
      lead = { id, createdAt: now, status: 'partial', submitted: false, notes: '' }
      leads.push(lead)
    }
    for (const [k, n] of [['name', 100], ['phone', 20], ['email', 120], ['need', 60], ['message', 800], ['title', 200], ['source', 120], ['visitDate', 20], ['visitTime', 40], ['budget', 80]]) {
      if (k in b) lead[k] = clean(b[k], n)
    }
    if (KINDS.includes(b.kind)) lead.kind = b.kind
    if (b.submitted === true && !lead.submitted) {
      lead.submitted = true
      lead.submittedAt = now
      if (lead.status === 'partial') lead.status = 'new'
    }
    lead.updatedAt = now
    writeJson('leads.json', leads)
    return send(res, 200, { ok: true })
  }

  if (req.method === 'POST' && parts[1] === 'admin' && parts[2] === 'login') {
    if (limited(req, 'login', 8)) return send(res, 429, { error: 'Too many attempts. Try again in a minute.' })
    const b = await readBody(req)
    if (!checkLogin(b.username, b.password)) return send(res, 401, { error: 'Wrong username or password' })
    return send(res, 200, { token: sign({ exp: Date.now() + 1000 * 60 * 60 * 12 }), demo: usingDemo() })
  }

  if (parts[1] === 'admin') {
    if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' })

    if (req.method === 'GET' && parts[2] === 'me') return send(res, 200, { demo: usingDemo(), user: auth ? auth.user : DEMO.user })

    if (req.method === 'POST' && parts[2] === 'account') {
      const b = await readBody(req)
      if (!checkLogin(auth ? auth.user : DEMO.user, b.current)) return send(res, 403, { error: 'Current password is wrong' })
      const user = clean(b.username, 40)
      const pass = String(b.password || '')
      if (user.length < 3) return send(res, 400, { error: 'Username must be at least 3 characters' })
      if (pass.length < 8) return send(res, 400, { error: 'Password must be at least 8 characters' })
      const salt = crypto.randomBytes(16).toString('hex')
      auth = { user, salt, hash: hash(pass, salt) }
      writeJson('auth.json', auth)
      return send(res, 200, { ok: true })
    }

    if (req.method === 'GET' && parts[2] === 'leads') {
      return send(res, 200, { leads: [...leads].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')) })
    }
    if (parts[2] === 'leads' && parts[3]) {
      const lead = leads.find((l) => l.id === parts[3])
      if (!lead) return send(res, 404, { error: 'not found' })
      if (req.method === 'PATCH') {
        const b = await readBody(req)
        if (STATUSES.includes(b.status)) lead.status = b.status
        if ('notes' in b) lead.notes = clean(b.notes, 4000)
        lead.updatedAt = new Date().toISOString()
        writeJson('leads.json', leads)
        return send(res, 200, { lead })
      }
      if (req.method === 'DELETE') {
        leads = leads.filter((l) => l.id !== lead.id)
        writeJson('leads.json', leads)
        return send(res, 200, { ok: true })
      }
    }

    // editable site content
    if (parts[2] === 'content' && parts[3]) {
      const key = parts[3]
      if (!CONTENT_KEYS.includes(key)) return send(res, 404, { error: 'unknown section' })
      if (req.method === 'PUT') {
        const b = await readBody(req, 3 * 1024 * 1024)
        if (!b.value || typeof b.value !== 'object' || Array.isArray(b.value)) return send(res, 400, { error: 'bad value' })
        store[key] = b.value
        writeJson('content.json', store)
        return send(res, 200, { ok: true })
      }
      if (req.method === 'DELETE') {
        delete store[key]
        writeJson('content.json', store)
        return send(res, 200, { value: { ...defaults[key] } })
      }
    }

    // image upload (data URL in JSON)
    if (req.method === 'POST' && parts[2] === 'upload') {
      const b = await readBody(req, 9 * 1024 * 1024)
      const m = /^data:(image\/(jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''))
      if (!m) return send(res, 400, { error: 'Only JPG, PNG, WebP or GIF images are allowed' })
      const buf = Buffer.from(m[3], 'base64')
      if (buf.length > 6 * 1024 * 1024) return send(res, 413, { error: 'Image is larger than 6 MB' })
      const name = crypto.randomBytes(9).toString('hex') + '.' + (m[2] === 'jpeg' ? 'jpg' : m[2])
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buf)
      return send(res, 200, { url: '/uploads/' + name })
    }
  }
  return send(res, 404, { error: 'not found' })
}

/* ---------- SEO ---------- */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const origin = (req) => {
  const c = content()
  if (c.seo.siteUrl) return c.seo.siteUrl.replace(/\/+$/, '')
  return `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
}
const abs = (o, u) => (!u ? '' : /^https?:/.test(u) ? u : o + u)

function seoFor(req, pathname) {
  const c = content()
  const o = origin(req)
  const slug = /^\/blog\/([^/]+)$/.exec(pathname)?.[1]
  const post = slug && c.blogs.items.find((p) => p.slug === decodeURIComponent(slug) && p.published !== false)
  // Share previews need an absolute image URL, so fall back to the bundled brand image.
  const fallbackImage = o + '/og-default.jpg'
  let title = c.seo.title, description = c.seo.description, image = abs(o, c.seo.ogImage) || fallbackImage, canonical = o + '/', ld
  let keywords = c.seo.keywords, published = ''
  const business = {
    '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: c.site.name, url: o + '/', telephone: c.site.phone, email: c.site.email, image,
    address: { '@type': 'PostalAddress', streetAddress: c.site.address, addressLocality: 'Dwarka', addressRegion: 'New Delhi', addressCountry: 'IN' },
    areaServed: c.areas.items,
    sameAs: [c.site.facebook, c.site.instagram, c.site.youtube, c.site.linkedin].filter(Boolean),
    ...(c.reviews.score && c.reviews.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: c.reviews.score, reviewCount: String(c.reviews.count).replace(/\D/g, '') || '1' } } : {}),
  }
  ld = business
  if (pathname === '/blog') { title = `${c.blogs.title} | ${c.site.name}`; description = c.blogs.sub; canonical = o + '/blog' }
  if (post) {
    title = post.seoTitle || `${post.title} | ${c.site.name}`
    description = post.seoDescription || post.excerpt
    image = abs(o, post.image) || image
    keywords = post.seoKeywords || [post.category, c.seo.keywords].filter(Boolean).join(', ')
    published = post.date || ''
    canonical = `${o}/blog/${post.slug}`
    ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description, image: image || undefined, datePublished: post.date, author: { '@type': 'Organization', name: c.site.name }, publisher: { '@type': 'Organization', name: c.site.name }, mainEntityOfPage: canonical }
  }
  return { title, description, keywords, image, canonical, ld, published, og: post ? 'article' : 'website', siteName: c.site.name }
}

function injectHead(html, req, pathname) {
  const c = content()
  const noindex = pathname.startsWith('/admin')
  const s = seoFor(req, pathname)
  const tags = [
    `<meta name="description" content="${esc(s.description)}" />`,
    s.keywords && `<meta name="keywords" content="${esc(s.keywords)}" />`,
    noindex ? '<meta name="robots" content="noindex,nofollow" />' : '<meta name="robots" content="index,follow,max-image-preview:large" />',
    `<link rel="canonical" href="${esc(s.canonical)}" />`,
    `<meta property="og:type" content="${s.og}" />`, `<meta property="og:site_name" content="${esc(s.siteName)}" />`,
    `<meta property="og:title" content="${esc(s.title)}" />`, `<meta property="og:description" content="${esc(s.description)}" />`,
    `<meta property="og:url" content="${esc(s.canonical)}" />`, `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:image" content="${esc(s.image)}" />`, `<meta property="og:image:alt" content="${esc(s.title)}" />`,
    s.image.endsWith('/og-default.jpg') && '<meta property="og:image:width" content="1200" />', s.image.endsWith('/og-default.jpg') && '<meta property="og:image:height" content="630" />',
    s.published && `<meta property="article:published_time" content="${esc(s.published)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />', `<meta name="twitter:title" content="${esc(s.title)}" />`,
    `<meta name="twitter:description" content="${esc(s.description)}" />`, `<meta name="twitter:image" content="${esc(s.image)}" />`,
    `<script type="application/ld+json">${JSON.stringify(s.ld).replace(/</g, '\\u003c')}</script>`,
    `<script>window.__CONTENT__=${JSON.stringify(c).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('\n    ')
  return html.replace(/<title>.*?<\/title>/s, `<title>${esc(s.title)}</title>`).replace(/<meta name="description"[^>]*>\s*/, '').replace('</head>', `    ${tags}\n  </head>`)
}

/* ---------- static (production build) + uploads ---------- */
const DIST = path.join(ROOT, 'dist')
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json', '.vcf': 'text/vcard', '.ico': 'image/x-icon', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' }

function serveFile(res, f, headers = {}) {
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', ...headers })
  fs.createReadStream(f).pipe(res)
}

function serve(req, res, url) {
  if (url.pathname.startsWith('/uploads/')) {
    const f = path.join(UPLOAD_DIR, path.basename(decodeURIComponent(url.pathname)))
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
    return serveFile(res, f, { 'Cache-Control': 'public, max-age=31536000, immutable' })
  }
  if (url.pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    return res.end(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${origin(req)}/sitemap.xml\n`)
  }
  if (url.pathname === '/sitemap.xml') {
    const o = origin(req)
    const c = content()
    const urls = [[o + '/', new Date().toISOString().slice(0, 10)], [o + '/blog', ''], ...c.blogs.items.filter((p) => p.published !== false).map((p) => [`${o}/blog/${p.slug}`, p.date])]
    res.writeHead(200, { 'Content-Type': 'application/xml' })
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${esc(u)}</loc>${d ? `<lastmod>${esc(d)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`)
  }
  let f = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)))
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end() }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('Run "npm run build" first.') }
  if (path.basename(f) === 'index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    return res.end(injectHead(fs.readFileSync(f, 'utf8'), req, url.pathname))
  }
  return serveFile(res, f, { 'Cache-Control': 'public, max-age=3600' })
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url)
    return serve(req, res, url)
  } catch {
    if (!res.headersSent) send(res, 400, { error: 'bad request' })
  }
}).listen(PORT, () => console.log(`Pandit Estate server on http://localhost:${PORT}`))
