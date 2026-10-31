import { createContext, useContext, useEffect, useState } from 'react'
import { defaults } from './data.js'
import { DEMO_ADMIN } from './config.js'
import { demoContentSaved } from './demo.js'

export const merge = (saved) => {
  const all = DEMO_ADMIN ? { ...(saved || {}), ...demoContentSaved() } : saved // demo edits made in /admin win
  return Object.fromEntries(Object.keys(defaults).map((k) => [k, { ...defaults[k], ...((all && all[k]) || {}) }]))
}

const Ctx = createContext(merge())
export const useContent = () => useContext(Ctx)

// The production server inlines the saved content into the page; in dev we fetch it.
export function ContentProvider({ children }) {
  const inline = typeof window !== 'undefined' ? window.__CONTENT__ : null
  const [c, setC] = useState(() => (inline ? merge(inline) : null))
  useEffect(() => {
    if (c) return
    fetch('/api/content').then((r) => r.json()).then((s) => setC(merge(s))).catch(() => setC(merge()))
  }, [])
  if (!c) return null
  return <Ctx.Provider value={c}>{children}</Ctx.Provider>
}

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', value || '')
}

/** Keeps <title> and meta tags in sync when the visitor navigates inside the app. */
export function useSeo({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) { setMeta('name', 'description', description); setMeta('property', 'og:description', description) }
    if (title) setMeta('property', 'og:title', title)
    if (image) setMeta('property', 'og:image', image)
  }, [title, description, image])
}
