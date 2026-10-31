export const TOKEN_KEY = 'pe_admin_token'

export async function call(path, token, opts = {}) {
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
