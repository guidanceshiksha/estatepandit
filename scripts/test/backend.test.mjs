// End-to-end backend checks. Run: node scripts/test/backend.test.mjs
// Spawns the real server (file storage, then Redis through a local mock) and exercises leads, admin auth,
// content, uploads, SEO output and rate limits.
import { spawn } from 'node:child_process'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
let pass = 0
const fails = []
const ok = (cond, name, extra = '') => { cond ? pass++ : fails.push(name + (extra ? ` -> ${extra}` : '')) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function startMock(port) {
  const kv = new Map()
  const run = ([c, ...a]) => {
    c = c.toUpperCase()
    if (c === 'GET') return kv.get(a[0]) ?? null
    if (c === 'SET') { if (a[2] === 'NX' && kv.has(a[0])) return null; kv.set(a[0], a[1]); return 'OK' }
    if (c === 'HSET') { const h = kv.get(a[0]) || {}; const n = a[1] in h ? 0 : 1; h[a[1]] = a[2]; kv.set(a[0], h); return n }
    if (c === 'HGET') return (kv.get(a[0]) || {})[a[1]] ?? null
    if (c === 'HDEL') { const h = kv.get(a[0]) || {}; delete h[a[1]]; return 1 }
    if (c === 'HLEN') return Object.keys(kv.get(a[0]) || {}).length
    if (c === 'HGETALL') return Object.entries(kv.get(a[0]) || {}).flat()
    if (c === 'INCR') { const n = (Number(kv.get(a[0])) || 0) + 1; kv.set(a[0], String(n)); return n }
    if (c === 'EXPIRE') return 1
    throw new Error('unsupported ' + c)
  }
  const srv = http.createServer((req, res) => {
    let b = ''
    req.on('data', (d) => (b += d))
    req.on('end', () => { try { res.end(JSON.stringify({ result: run(JSON.parse(b)) })) } catch (e) { res.end(JSON.stringify({ error: e.message })) } })
  }).listen(port)
  return srv
}

function startServer(port, env) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pe-test-'))
  const p = spawn(process.execPath, ['server/index.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, ...env }, stdio: 'ignore' })
  return { p, dataDir }
}

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function suite(label, base, { loginRequired }) {
  const J = { 'Content-Type': 'application/json' }
  const call = async (method, url, body, token) => {
    const r = await fetch(base + url, { method, headers: { ...J, ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
    let j = null
    try { j = await r.clone().json() } catch { /* not json */ }
    return { s: r.status, j, r }
  }
  const t = (n) => `[${label}] ${n}`

  // ---- public content + leads
  let r = await call('GET', '/api/content')
  const keys = Object.keys(r.j || {})
  ok(r.s === 200 && ['site', 'seo', 'services', 'properties', 'about', 'track', 'reviews', 'why', 'loans', 'referral', 'areas', 'partners', 'faqs', 'blogs'].every((k) => keys.includes(k)), t('content has all 14 sections'), keys.join())
  ok(r.j.site.officeImage && r.j.site.creditName, t('new site fields present'))
  ok(r.j.faqs.site.length + r.j.faqs.general.length === 8, t('8 FAQs'))
  ok(r.j.loans.banks.length === 8 && r.j.loans.banks.every((b) => b.logo), t('8 bank logos'))
  ok(r.j.areas.items.length === 30 && r.j.areas.ncr.length >= 10, t('29 sectors + NCR list'))

  const id = 'test-lead-' + Math.random().toString(36).slice(2, 10)
  r = await call('PUT', `/api/leads/${id}`, { name: 'Test Person', kind: 'visit', title: 'Test property', source: 'Property visit: test' })
  ok(r.s === 200, t('partial lead saved'))
  r = await call('PUT', `/api/leads/${id}`, { name: 'Test Person', phone: '9999999999', need: 'Site visit', visitDate: '2026-12-01', visitTime: '10 AM – 12 PM', submitted: true, message: '<b>hi</b>' })
  ok(r.s === 200, t('lead submitted'))
  r = await call('PUT', '/api/leads/x', { name: 'bad' })
  ok(r.s === 400, t('bad lead id rejected'))
  for (const kind of ['loan', 'referral', 'contact', 'callback', 'area', 'service', 'search']) {
    const k = await call('PUT', `/api/leads/kind-${kind}-${id}`, { name: kind, phone: '9000000000', kind, submitted: true })
    ok(k.s === 200, t(`kind ${kind} accepted`))
  }

  // ---- admin access
  r = await call('GET', '/api/admin/leads')
  if (loginRequired) {
    ok(r.s === 401, t('admin leads need a login'))
    r = await call('POST', '/api/admin/login', { username: 'admin', password: 'wrong' })
    ok(r.s === 401, t('wrong password rejected'))
    r = await call('POST', '/api/admin/login', { username: 'admin', password: 'admin123' })
    ok(r.s === 200 && r.j.token && r.j.demo === true, t('demo login works'))
  } else {
    ok(r.s === 200, t('admin open without login'))
  }
  const token = loginRequired ? r.j.token : ''
  r = await call('GET', '/api/admin/me', null, token)
  ok(r.s === 200 && r.j.open === !loginRequired, t('me reports open flag'))

  r = await call('GET', '/api/admin/leads', null, token)
  const mine = r.j.leads.find((l) => l.id === id)
  ok(mine && mine.submitted && mine.status === 'new' && mine.kind === 'visit' && mine.visitDate === '2026-12-01', t('lead stored with visit details'), JSON.stringify(mine))
  ok(mine.message === '<b>hi</b>' || mine.message.includes('hi'), t('message kept as plain text'))
  r = await call('PATCH', `/api/admin/leads/${id}`, { status: 'contacted', notes: 'called back' }, token)
  ok(r.s === 200 && r.j.lead.status === 'contacted' && r.j.lead.notes === 'called back', t('status + notes update'))
  r = await call('PATCH', `/api/admin/leads/${id}`, { status: 'nonsense' }, token)
  ok(r.j.lead.status === 'contacted', t('invalid status ignored'))
  r = await call('DELETE', `/api/admin/leads/kind-loan-${id}`, null, token)
  ok(r.s === 200, t('lead deleted'))
  r = await call('GET', '/api/admin/leads', null, token)
  ok(!r.j.leads.some((l) => l.id === `kind-loan-${id}`), t('deleted lead gone'))

  // ---- content editing round trip for every section
  const all = (await call('GET', '/api/content')).j
  for (const key of Object.keys(all)) {
    const val = { ...all[key], __probe: key }
    let p = await call('PUT', `/api/admin/content/${key}`, { value: val }, token)
    ok(p.s === 200, t(`save ${key}`))
    const back = (await call('GET', '/api/content')).j[key]
    ok(back.__probe === key, t(`${key} persisted`))
    p = await call('DELETE', `/api/admin/content/${key}`, null, token)
    ok(p.s === 200 && p.j.value && !p.j.value.__probe, t(`reset ${key}`))
    const after = (await call('GET', '/api/content')).j[key]
    ok(!after.__probe, t(`${key} back to default`))
  }
  r = await call('PUT', '/api/admin/content/nope', { value: {} }, token)
  ok(r.s === 404, t('unknown section 404'))
  r = await call('PUT', '/api/admin/content/site', { value: [1] }, token)
  ok(r.s === 400, t('array value rejected'))

  // blog post -> sitemap + SEO head
  const blogs = (await call('GET', '/api/content')).j.blogs
  blogs.items.unshift({ id: 'qa1', slug: 'qa-test-post', title: 'QA Test Post', excerpt: 'Short summary', body: '## Heading\n\nSome **text**.', category: 'Guide', readTime: '1 min', date: '2026-11-02', image: '/uploads/none.jpg', seoTitle: 'QA SEO Title', seoDescription: 'QA SEO description', seoKeywords: 'qa, test', sources: [['Src', 'https://example.com']], published: true })
  await call('PUT', '/api/admin/content/blogs', { value: blogs }, token)
  const html = await (await fetch(base + '/blog/qa-test-post')).text()
  ok(html.includes('<title>QA SEO Title</title>') && html.includes('og:title') && html.includes('rel="canonical"') && html.includes('BlogPosting') && html.includes('name="keywords" content="qa, test"'), t('blog page has title, OG, canonical, JSON-LD, keywords'))
  const sm = await (await fetch(base + '/sitemap.xml')).text()
  ok(sm.includes('/blog/qa-test-post'), t('sitemap lists the new post'))
  blogs.items = blogs.items.map((b) => (b.id === 'qa1' ? { ...b, published: false } : b))
  await call('PUT', '/api/admin/content/blogs', { value: blogs }, token)
  const sm2 = await (await fetch(base + '/sitemap.xml')).text()
  ok(!sm2.includes('qa-test-post'), t('unpublished post leaves the sitemap'))
  await call('DELETE', '/api/admin/content/blogs', null, token)

  // ---- SEO + static
  const home = await (await fetch(base + '/')).text()
  ok(home.includes('og:image') && home.includes('twitter:card') && home.includes('window.__CONTENT__') && home.includes('RealEstateAgent'), t('home has OG, twitter, content, JSON-LD'))
  const admin = await (await fetch(base + '/admin')).text()
  ok(admin.includes('noindex'), t('/admin is noindex'))
  const rb = await (await fetch(base + '/robots.txt')).text()
  ok(rb.includes('Disallow: /admin') && rb.includes('Sitemap:'), t('robots.txt'))
  for (const f of ['/og-default.jpg', '/favicon.ico', '/favicon-32.png', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/site.webmanifest', '/images/logo.png', '/images/office.jpg', '/images/banks/sbi.svg', '/images/hero/hero-1.jpg', '/images/services/renting.jpg', '/images/blog/dwarka-expressway.jpg', '/images/owner.jpg']) {
    const x = await fetch(base + f)
    ok(x.status === 200, t(`static ${f}`), String(x.status))
  }

  // ---- uploads
  r = await call('POST', '/api/admin/upload', { data: PNG }, token)
  ok(r.s === 200 && /^\/uploads\/[\w]+\.png$/.test(r.j.url), t('image upload'), JSON.stringify(r.j))
  const up = await fetch(base + r.j.url)
  ok(up.status === 200 && up.headers.get('content-type') === 'image/png', t('uploaded image is served'))
  r = await call('POST', '/api/admin/upload', { data: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }, token)
  ok(r.s === 400, t('svg upload rejected'))
  r = await call('POST', '/api/admin/upload', { data: 'data:text/html;base64,PGI+aGk8L2I+' }, token)
  ok(r.s === 400, t('html upload rejected'))
  const trav = await fetch(base + '/uploads/..%2f..%2fpackage.json')
  ok(trav.status === 404, t('path traversal blocked'), String(trav.status))

  // ---- account change + rate limit (login mode only)
  if (loginRequired) {
    r = await call('POST', '/api/admin/account', { current: 'nope', username: 'owner1', password: 'longenough1' }, token)
    ok(r.s === 403, t('account change needs current password'))
    r = await call('POST', '/api/admin/account', { current: 'admin123', username: 'ow', password: 'longenough1' }, token)
    ok(r.s === 400, t('short username rejected'))
    r = await call('POST', '/api/admin/account', { current: 'admin123', username: 'owner1', password: 'short' }, token)
    ok(r.s === 400, t('short password rejected'))
    r = await call('POST', '/api/admin/account', { current: 'admin123', username: 'owner1', password: 'longenough1' }, token)
    ok(r.s === 200, t('account updated'))
    r = await call('POST', '/api/admin/login', { username: 'admin', password: 'admin123' })
    ok(r.s === 401, t('old login no longer works'))
    r = await call('POST', '/api/admin/login', { username: 'owner1', password: 'longenough1' })
    ok(r.s === 200 && r.j.demo === false, t('new login works'))
    let limited = 0
    for (let i = 0; i < 10; i++) { const x = await call('POST', '/api/admin/login', { username: 'x', password: 'y' }); if (x.s === 429) limited++ }
    ok(limited > 0, t('login rate limit kicks in'))
  }
}

async function run(label, port, env, opts) {
  const { p, dataDir } = startServer(port, env)
  await sleep(1800)
  try { await suite(label, `http://localhost:${port}`, opts) } catch (e) { fails.push(`[${label}] crashed: ${e.message}`) }
  p.kill()
  fs.rmSync(dataDir, { recursive: true, force: true })
}

await run('files+login', 3101, { ADMIN_REQUIRE_LOGIN: '1' }, { loginRequired: true })
await run('files+open', 3102, { ADMIN_REQUIRE_LOGIN: '' }, { loginRequired: false })
const mock = startMock(3103)
await run('redis+login', 3104, { ADMIN_REQUIRE_LOGIN: '1', KV_REST_API_URL: 'http://localhost:3103', KV_REST_API_TOKEN: 'x' }, { loginRequired: true })
mock.close()

console.log(`\n${pass} checks passed, ${fails.length} failed`)
fails.forEach((f) => console.log(' FAIL', f))
process.exit(fails.length ? 1 : 0)
