import { useEffect, useRef, useState } from 'react'

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10))

async function put(id, body) {
  const r = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  })
  return r.ok
}

/**
 * Saves a lead to the server while the visitor is still typing, so partial
 * details are never lost. `meta` = { kind, title, source }.
 */
export function useLeadForm(meta) {
  const [id] = useState(newId)
  const timer = useRef(null)
  const submitted = useRef(false)

  const collect = (form) => {
    const f = Object.fromEntries(new FormData(form))
    return { ...meta, ...f }
  }
  const save = (form, extra = {}) => {
    const data = collect(form)
    if (!(data.name || '').trim() && !(data.phone || '').trim()) return Promise.resolve(true)
    return put(id, { ...data, ...extra }).catch(() => false)
  }

  const onChange = (e) => {
    const form = e.currentTarget
    clearTimeout(timer.current)
    timer.current = setTimeout(() => save(form), 500)
  }
  const flush = (form) => {
    if (!form || submitted.current) return
    clearTimeout(timer.current)
    save(form)
  }
  const submit = async (form) => {
    clearTimeout(timer.current)
    const ok = await save(form, { submitted: true })
    if (ok) submitted.current = true
    return ok
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  return { onChange, flush, submit }
}
