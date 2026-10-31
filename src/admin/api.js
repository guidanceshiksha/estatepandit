import { DEMO_ADMIN } from '../config.js'
import { defaults } from '../data.js'
import { demoLeads, demoPatchLead, demoDeleteLead, demoSetContent, demoResetContent, demoContentSaved } from '../demo.js'

export const TOKEN_KEY = 'pe_admin_token'

// Demo mode answers every admin request from the browser's own demo store.
function demoCall(path, opts) {
  const method = (opts.method || 'GET').toUpperCase()
  const body = opts.body ? JSON.parse(opts.body) : {}
  const parts = path.split('/').filter(Boolean) // ['api','admin',...]
  const sub = parts[2]
  if (sub === 'me') return { demo: false, open: false, sandbox: true, user: 'admin' }
  if (sub === 'leads' && !parts[3]) return { leads: demoLeads() }
  if (sub === 'leads' && method === 'PATCH') return { lead: demoPatchLead(parts[3], body) }
  if (sub === 'leads' && method === 'DELETE') { demoDeleteLead(parts[3]); return { ok: true } }
  if (sub === 'content' && method === 'PUT') { demoSetContent(parts[3], body.value); return { ok: true } }
  if (sub === 'content' && method === 'DELETE') return { value: demoResetContent(parts[3]) }
  if (sub === 'upload') return { url: body.data } // keep the picture inline; nothing is uploaded anywhere
  if (sub === 'account') return { ok: true }
  throw new Error('Not available in demo mode')
}

export const loadContent = async () => (DEMO_ADMIN ? demoContentSaved() : fetch('/api/content').then((r) => r.json()))

export async function call(path, token, opts = {}) {
  if (DEMO_ADMIN) { await Promise.resolve(); return demoCall(path, opts) }
  const r = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
  if (r.status === 401) throw new Error('auth')
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Request failed')
  return j
}

// Downscale big photos in the browser before uploading (keeps pages fast).
export function resizeImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      if (file.type === 'image/gif' || (k === 1 && file.size < 1.5e6)) {
        URL.revokeObjectURL(url)
        const fr = new FileReader()
        fr.onload = () => resolve(fr.result)
        fr.onerror = reject
        return fr.readAsDataURL(file)
      }
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.86))
    }
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = url
  })
}

export async function uploadImage(token, file) {
  const data = await resizeImage(file)
  return (await call('/api/admin/upload', token, { method: 'POST', body: JSON.stringify({ data }) })).url
}

export const download = (name, text, type = 'application/json') => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type })), download: name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
