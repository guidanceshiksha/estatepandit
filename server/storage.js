// Two storage back-ends with the same async interface:
//  - fileStorage: JSON files on disk (local dev, Render, any VPS)
//  - redisStorage: Upstash Redis over REST (Vercel and other serverless hosts)
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export function fileStorage(dir) {
  fs.mkdirSync(path.join(dir, 'uploads'), { recursive: true })
  const f = (n) => path.join(dir, n)
  const read = (n, fb) => { try { return JSON.parse(fs.readFileSync(f(n), 'utf8')) } catch { return fb } }
  const write = (n, v) => { const t = f(n) + '.tmp'; fs.writeFileSync(t, JSON.stringify(v)); fs.renameSync(t, f(n)) }
  let leads = read('leads.json', [])
  const store = read('content.json', {})
  let auth = read('auth.json', null)
  let secret
  try { secret = fs.readFileSync(f('secret.key')) } catch { secret = crypto.randomBytes(32); fs.writeFileSync(f('secret.key'), secret) }
  const hits = new Map()

  return {
    kind: 'file',
    async getLeads() { return leads },
    async getLead(id) { return leads.find((l) => l.id === id) || null },
    async countLeads() { return leads.length },
    async saveLead(lead) {
      const i = leads.findIndex((l) => l.id === lead.id)
      if (i >= 0) leads[i] = lead; else leads.push(lead)
      write('leads.json', leads)
    },
    async deleteLead(id) { leads = leads.filter((l) => l.id !== id); write('leads.json', leads) },
    async getContent() { return store },
    async setContent(key, value) { store[key] = value; write('content.json', store) },
    async delContent(key) { delete store[key]; write('content.json', store) },
    async getAuth() { return auth },
    async setAuth(a) { auth = a; write('auth.json', a) },
    async getSecret() { return secret },
    async saveUpload(name, buf) { fs.writeFileSync(path.join(dir, 'uploads', name), buf) },
    async getUpload(name) { const p = path.join(dir, 'uploads', name); return fs.existsSync(p) ? fs.readFileSync(p) : null },
    async hit(key, windowMs) {
      const now = Date.now()
      const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
      arr.push(now); hits.set(key, arr)
      return arr.length
    },
  }
}

export function redisStorage(url, token) {
  const cmd = async (...args) => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
    const j = await r.json()
    if (j.error) throw new Error(j.error)
    return j.result
  }
  const pairs = (flat) => { const o = {}; for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = JSON.parse(flat[i + 1]); return o }
  let secret

  return {
    kind: 'redis',
    async getLeads() { return Object.values(pairs(await cmd('HGETALL', 'pe:leads'))) },
    async getLead(id) { const v = await cmd('HGET', 'pe:leads', id); return v ? JSON.parse(v) : null },
    async countLeads() { return cmd('HLEN', 'pe:leads') },
    async saveLead(lead) { await cmd('HSET', 'pe:leads', lead.id, JSON.stringify(lead)) },
    async deleteLead(id) { await cmd('HDEL', 'pe:leads', id) },
    async getContent() { return pairs(await cmd('HGETALL', 'pe:content')) },
    async setContent(key, value) { await cmd('HSET', 'pe:content', key, JSON.stringify(value)) },
    async delContent(key) { await cmd('HDEL', 'pe:content', key) },
    async getAuth() { const v = await cmd('GET', 'pe:auth'); return v ? JSON.parse(v) : null },
    async setAuth(a) { await cmd('SET', 'pe:auth', JSON.stringify(a)) },
    async getSecret() {
      if (secret) return secret
      let v = await cmd('GET', 'pe:secret')
      if (!v) { await cmd('SET', 'pe:secret', crypto.randomBytes(32).toString('hex'), 'NX'); v = await cmd('GET', 'pe:secret') }
      secret = Buffer.from(v, 'hex')
      return secret
    },
    async saveUpload(name, buf) { await cmd('SET', 'pe:up:' + name, buf.toString('base64')) },
    async getUpload(name) { const v = await cmd('GET', 'pe:up:' + name); return v ? Buffer.from(v, 'base64') : null },
    async hit(key, windowMs) {
      const k = 'pe:rl:' + key
      const n = await cmd('INCR', k)
      if (n === 1) await cmd('EXPIRE', k, Math.ceil(windowMs / 1000))
      return n
    },
  }
}

/** Picks Redis when the Upstash/Vercel KV variables exist, otherwise files in `dir`. */
export function pickStorage(dir) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? redisStorage(url, token) : fileStorage(dir)
}
