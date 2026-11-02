// Request handling shared by the Node server (server/index.js) and the Vercel functions (api/*).
import path from 'node:path'
import crypto from 'node:crypto'
import { defaults } from '../src/data.js'

const STATUSES = ['partial', 'new', 'contacted', 'qualified', 'closed', 'lost']
const KINDS = ['enquiry', 'visit', 'area', 'service', 'contact', 'search', 'callback', 'loan', 'referral']
const CONTENT_KEYS = Object.keys(defaults)
const DEMO = { user: 'admin', pass: 'admin123' }
// For now the admin panel is open (no login). Set ADMIN_REQUIRE_LOGIN=1 on the host to turn the login back on.
const LOGIN_REQUIRED = ['1', 'true', 'yes', 'on'].includes(String(process.env.ADMIN_REQUIRE_LOGIN || '').trim().toLowerCase())
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }

const clean = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n) : '')
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex')
const sha = (v) => crypto.createHash('sha256').update(String(v)).digest()
const same = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))
const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}
const readBody = (req, limit = 32 * 1024) => new Promise((resolve, reject) => {
  // Serverless hosts (Vercel) may already have read and parsed the body into req.body.
  const pre = req.body
  if (pre !== undefined && pre !== null) {
    try {
      if (Buffer.isBuffer(pre)) return resolve(JSON.parse(pre.toString() || '{}'))
      if (typeof pre === 'string') return resolve(JSON.parse(pre || '{}'))
      return resolve(pre)
    } catch (e) { return reject(e) }
  }
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

export function createCore(storage) {
  const content = async () => {
    // A database problem must not take the public site down: show the built-in content instead.
    const saved = await storage.getContent().catch((e) => { console.error('getContent failed:', e.message); return {} })
    return Object.fromEntries(CONTENT_KEYS.map((k) => [k, { ...defaults[k], ...(saved[k] || {}) }]))
  }

  /* ---------- auth ---------- */
  async function checkLogin(user, pass) {
    const auth = await storage.getAuth()
    if (!auth) return same(user, DEMO.user) && same(pass, DEMO.pass)
    return same(user, auth.user) && same(hash(String(pass), auth.salt), auth.hash)
  }
  const sign = async (payload) => {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return body + '.' + crypto.createHmac('sha256', await storage.getSecret()).update(body).digest('base64url')
  }
  async function isAdmin(req) {
    if (!LOGIN_REQUIRED) return true
    const [body, sig] = String((req.headers.authorization || '').replace(/^Bearer /, '')).split('.')
    if (!body || !sig) return false
    const good = crypto.createHmac('sha256', await storage.getSecret()).update(body).digest('base64url')
    if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false
    try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now() } catch { return false }
  }
  const localHits = new Map() // cheap in-memory limiter for lead autosave
  const leadLimited = (req, max) => {
    const k = ip(req), now = Date.now()
    const arr = (localHits.get(k) || []).filter((t) => now - t < 60000)
    arr.push(now); localHits.set(k, arr)
    return arr.length > max
  }

  /* ---------- JSON api ---------- */
  async function api(req, res, url) {
    const parts = url.pathname.split('/').filter(Boolean) // ['api', ...]

    if (req.method === 'GET' && parts[1] === 'content' && !parts[2]) return send(res, 200, await content(), { 'Cache-Control': 'no-cache' })

    // public: create/update a lead (called repeatedly while the visitor types)
    if (req.method === 'PUT' && parts[1] === 'leads' && parts[2]) {
      const id = parts[2]
      if (!/^[a-zA-Z0-9-]{8,48}$/.test(id)) return send(res, 400, { error: 'bad id' })
      if (leadLimited(req, 240)) return send(res, 429, { error: 'slow down' })
      const b = await readBody(req)
      const now = new Date().toISOString()
      let lead = await storage.getLead(id)
      if (!lead) {
        if ((await storage.countLeads()) > 50000) return send(res, 507, { error: 'full' })
        lead = { id, createdAt: now, status: 'partial', submitted: false, notes: '' }
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
      await storage.saveLead(lead)
      return send(res, 200, { ok: true })
    }

    if (req.method === 'POST' && parts[1] === 'admin' && parts[2] === 'login') {
      if ((await storage.hit('login:' + ip(req), 60000)) > 8) return send(res, 429, { error: 'Too many attempts. Try again in a minute.' })
      const b = await readBody(req)
      if (!(await checkLogin(b.username, b.password))) return send(res, 401, { error: 'Wrong username or password' })
      return send(res, 200, { token: await sign({ exp: Date.now() + 1000 * 60 * 60 * 12 }), demo: !(await storage.getAuth()) })
    }

    if (parts[1] === 'admin') {
      if (!(await isAdmin(req))) return send(res, 401, { error: 'Unauthorized' })
      const auth = await storage.getAuth()

      if (req.method === 'GET' && parts[2] === 'me') return send(res, 200, { demo: !auth, user: auth ? auth.user : DEMO.user, open: !LOGIN_REQUIRED })

      if (req.method === 'POST' && parts[2] === 'account') {
        const b = await readBody(req)
        if (!(await checkLogin(auth ? auth.user : DEMO.user, b.current))) return send(res, 403, { error: 'Current password is wrong' })
        const user = clean(b.username, 40)
        const pass = String(b.password || '')
        if (user.length < 3) return send(res, 400, { error: 'Username must be at least 3 characters' })
        if (pass.length < 8) return send(res, 400, { error: 'Password must be at least 8 characters' })
        const salt = crypto.randomBytes(16).toString('hex')
        await storage.setAuth({ user, salt, hash: hash(pass, salt) })
        return send(res, 200, { ok: true })
      }

      if (req.method === 'GET' && parts[2] === 'leads') {
        const all = await storage.getLeads()
        return send(res, 200, { leads: [...all].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')) })
      }
      if (parts[2] === 'leads' && parts[3]) {
        const lead = await storage.getLead(parts[3])
        if (!lead) return send(res, 404, { error: 'not found' })
        if (req.method === 'PATCH') {
          const b = await readBody(req)
          if (STATUSES.includes(b.status)) lead.status = b.status
          if ('notes' in b) lead.notes = clean(b.notes, 4000)
          lead.updatedAt = new Date().toISOString()
          await storage.saveLead(lead)
          return send(res, 200, { lead })
        }
        if (req.method === 'DELETE') { await storage.deleteLead(lead.id); return send(res, 200, { ok: true }) }
      }

      // editable site content
      if (parts[2] === 'content' && parts[3]) {
        const key = parts[3]
        if (!CONTENT_KEYS.includes(key)) return send(res, 404, { error: 'unknown section' })
        if (req.method === 'PUT') {
          const b = await readBody(req, 3 * 1024 * 1024)
          if (!b.value || typeof b.value !== 'object' || Array.isArray(b.value)) return send(res, 400, { error: 'bad value' })
          await storage.setContent(key, b.value)
          return send(res, 200, { ok: true })
        }
        if (req.method === 'DELETE') { await storage.delContent(key); return send(res, 200, { value: { ...defaults[key] } }) }
      }

      // image upload (data URL in JSON)
      if (req.method === 'POST' && parts[2] === 'upload') {
        const b = await readBody(req, 4 * 1024 * 1024)
        const m = /^data:(image\/(jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''))
        if (!m) return send(res, 400, { error: 'Only JPG, PNG, WebP or GIF images are allowed' })
        const buf = Buffer.from(m[3], 'base64')
        if (buf.length > 3 * 1024 * 1024) return send(res, 413, { error: 'Image is larger than 3 MB' })
        const name = crypto.randomBytes(9).toString('hex') + '.' + (m[2] === 'jpeg' ? 'jpg' : m[2])
        await storage.saveUpload(name, buf)
        return send(res, 200, { url: '/uploads/' + name })
      }
    }
    return send(res, 404, { error: 'not found' })
  }

  /* ---------- SEO ---------- */
  const origin = (req, c) => {
    if (c.seo.siteUrl) return c.seo.siteUrl.replace(/\/+$/, '')
    const host = req.headers['x-forwarded-host'] || req.headers.host
    return `${String(req.headers['x-forwarded-proto'] || 'http').split(',')[0]}://${host}`
  }
  const abs = (o, u) => (!u ? '' : /^https?:/.test(u) ? u : o + u)

  function seoFor(c, o, pathname) {
    const slug = /^\/blog\/([^/]+)$/.exec(pathname)?.[1]
    const post = slug && c.blogs.items.find((p) => p.slug === decodeURIComponent(slug) && p.published !== false)
    // Share previews need an absolute image URL, so fall back to the bundled brand image.
    let title = c.seo.title, description = c.seo.description, image = abs(o, c.seo.ogImage) || o + '/og-default.jpg', canonical = o + '/'
    let keywords = c.seo.keywords, published = ''
    const business = {
      '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: c.site.name, url: o + '/', telephone: c.site.phone, email: c.site.email, image, logo: o + '/images/logo.png',
      address: { '@type': 'PostalAddress', streetAddress: c.site.address, addressLocality: 'Dwarka', addressRegion: 'New Delhi', addressCountry: 'IN' },
      areaServed: c.areas.items,
      sameAs: [c.site.facebook, c.site.instagram, c.site.youtube, c.site.linkedin].filter(Boolean),
      ...(c.reviews.score && c.reviews.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: c.reviews.score, reviewCount: String(c.reviews.count).replace(/\D/g, '') || '1' } } : {}),
    }
    let ld = business
    if (pathname === '/blog') { title = `${c.blogs.title} | ${c.site.name}`; description = c.blogs.sub; canonical = o + '/blog' }
    if (post) {
      title = post.seoTitle || `${post.title} | ${c.site.name}`
      description = post.seoDescription || post.excerpt
      image = abs(o, post.image) || image
      keywords = post.seoKeywords || [post.category, c.seo.keywords].filter(Boolean).join(', ')
      published = post.date || ''
      canonical = `${o}/blog/${post.slug}`
      ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description, image, datePublished: post.date, author: { '@type': 'Organization', name: c.site.name }, publisher: { '@type': 'Organization', name: c.site.name }, mainEntityOfPage: canonical }
    }
    return { title, description, keywords, image, canonical, ld, published, og: post ? 'article' : 'website', siteName: c.site.name }
  }

  function injectHead(html, c, o, pathname) {
    const s = seoFor(c, o, pathname)
    const noindex = pathname.startsWith('/admin')
    const dflt = s.image.endsWith('/og-default.jpg')
    const tags = [
      `<meta name="description" content="${esc(s.description)}" />`,
      s.keywords && `<meta name="keywords" content="${esc(s.keywords)}" />`,
      noindex ? '<meta name="robots" content="noindex,nofollow" />' : '<meta name="robots" content="index,follow,max-image-preview:large" />',
      `<link rel="canonical" href="${esc(s.canonical)}" />`,
      `<meta property="og:type" content="${s.og}" />`, `<meta property="og:site_name" content="${esc(s.siteName)}" />`,
      `<meta property="og:title" content="${esc(s.title)}" />`, `<meta property="og:description" content="${esc(s.description)}" />`,
      `<meta property="og:url" content="${esc(s.canonical)}" />`, '<meta property="og:locale" content="en_IN" />',
      `<meta property="og:image" content="${esc(s.image)}" />`, `<meta property="og:image:alt" content="${esc(s.title)}" />`,
      dflt && '<meta property="og:image:width" content="1200" />', dflt && '<meta property="og:image:height" content="630" />',
      s.published && `<meta property="article:published_time" content="${esc(s.published)}" />`,
      '<meta name="twitter:card" content="summary_large_image" />', `<meta name="twitter:title" content="${esc(s.title)}" />`,
      `<meta name="twitter:description" content="${esc(s.description)}" />`, `<meta name="twitter:image" content="${esc(s.image)}" />`,
      `<script type="application/ld+json">${JSON.stringify(s.ld).replace(/</g, '\\u003c')}</script>`,
      `<script>window.__CONTENT__=${JSON.stringify(c).replace(/</g, '\\u003c')}</script>`,
    ].filter(Boolean).join('\n    ')
    return html.replace(/<title>.*?<\/title>/s, `<title>${esc(s.title)}</title>`).replace(/<meta name="description"[^>]*>\s*/, '').replace('</head>', `    ${tags}\n  </head>`)
  }

  /** Uploads, robots.txt, sitemap.xml and the app's HTML (with SEO tags + inlined content). */
  async function page(req, res, url, readHtml) {
    const p = url.pathname
    if (p.startsWith('/uploads/')) {
      const name = path.basename(decodeURIComponent(p))
      const buf = /^[\w-]+\.(jpg|png|webp|gif)$/.test(name) ? await storage.getUpload(name) : null
      if (!buf) { res.writeHead(404); return res.end() }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(name)], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=31536000, immutable' })
      return res.end(buf)
    }
    const c = await content()
    const o = origin(req, c)
    if (p === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      return res.end(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${o}/sitemap.xml\n`)
    }
    if (p === '/sitemap.xml') {
      const urls = [[o + '/', new Date().toISOString().slice(0, 10)], [o + '/blog', ''], ...c.blogs.items.filter((x) => x.published !== false).map((x) => [`${o}/blog/${x.slug}`, x.date])]
      res.writeHead(200, { 'Content-Type': 'application/xml' })
      return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${esc(u)}</loc>${d ? `<lastmod>${esc(d)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`)
    }
    const html = await readHtml()
    if (!html) { res.writeHead(404); return res.end('Run "npm run build" first.') }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    return res.end(injectHead(html, c, o, p))
  }

  return { api, page }
}
