import { useRef, useState } from 'react'
import { ICONS, NEEDS } from '../data.js'
import { Ic } from '../ui.jsx'
import { uploadImage } from './api.js'

/* A field spec: { k, label, type, hint, options, rows, wide, item: { fields, titleKey, blank, noun } } */

function ImageInput({ value, onChange, token }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const ref = useRef(null)
  const pick = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true); setErr('')
    try { onChange(await uploadImage(token, f)) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <div className="imgin">
      <div className="thumb-prev">{value ? <img src={value} alt="" onError={(e) => { e.currentTarget.style.opacity = 0.2 }} /> : <span>No image</span>}</div>
      <div className="imgin-r">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image link, or upload" />
        <div className="imgin-btns">
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={pick} />
          <button type="button" className="abtn alt sm" onClick={() => ref.current.click()} disabled={busy}>{busy ? 'Uploading…' : 'Upload photo'}</button>
          {value && <button type="button" className="abtn alt sm" onClick={() => onChange('')}>Remove</button>}
        </div>
        {err && <div className="aerr">{err}</div>}
      </div>
    </div>
  )
}

function ImageList({ value = [], onChange, token }) {
  return (
    <div className="imglist">
      {value.map((u, i) => (
        <div key={i} className="imglist-row">
          <ImageInput value={u} token={token} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
          <button type="button" className="icobtn" title="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="abtn alt sm" onClick={() => onChange([...value, ''])}>+ Add image</button>
    </div>
  )
}

export function Field({ f, value, onChange, token }) {
  const set = (v) => onChange(v)
  const common = { id: undefined }
  switch (f.type) {
    case 'textarea': return <textarea rows={f.rows || 3} value={value ?? ''} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} {...common} />
    case 'number': return <input type="number" value={value ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} />
    case 'date': return <input type="date" value={value ?? ''} onChange={(e) => set(e.target.value)} />
    case 'bool': return <label className="switch"><input type="checkbox" checked={value !== false && !!value} onChange={(e) => set(e.target.checked)} /><i /><span>{value !== false && value ? f.on || 'Yes' : f.off || 'No'}</span></label>
    case 'select': return <select value={value ?? ''} onChange={(e) => set(e.target.value)}>{(f.options || []).map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}</select>
    case 'icon': return (
      <div className="iconpick">
        {ICONS.map((n) => <button type="button" key={n} className={value === n ? 'on' : ''} title={n} onClick={() => set(n)}><Ic n={n} size={18} /></button>)}
      </div>
    )
    case 'need': return <select value={value ?? ''} onChange={(e) => set(e.target.value)}>{NEEDS.map((o) => <option key={o}>{o}</option>)}</select>
    case 'image': return <ImageInput value={value} onChange={set} token={token} />
    case 'images': return <ImageList value={value} onChange={set} token={token} />
    case 'tags': return <textarea rows={f.rows || 5} value={(value || []).join('\n')} onChange={(e) => set(e.target.value.split('\n'))} placeholder="One per line" />
    case 'array': return <ArrayField f={f} value={value || []} onChange={set} token={token} />
    default: return <input value={value ?? ''} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} />
  }
}

export function ObjectForm({ fields, value, onChange, token }) {
  return (
    <div className="oform">
      {fields.map((f) => (
        <div key={f.k} className={f.wide || ['textarea', 'tags', 'array', 'images', 'image', 'icon'].includes(f.type) ? 'fld wide' : 'fld'}>
          <label>{f.label}</label>
          <Field f={f} value={value[f.k]} token={token} onChange={(v) => onChange({ ...value, [f.k]: v })} />
          {f.hint && <small className="hint">{f.hint}</small>}
          {f.max && <small className={(value || '').length > f.max ? 'hint bad' : 'hint'}>{(value || '').length}/{f.max} characters</small>}
        </div>
      ))}
    </div>
  )
}

function ArrayField({ f, value, onChange, token }) {
  const { fields, titleKey, blank, noun = 'item' } = f.item
  const [open, setOpen] = useState(-1)
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const a = [...value]; [a[i], a[j]] = [a[j], a[i]]
    onChange(a); setOpen(j)
  }
  const add = () => { onChange([...value, typeof blank === 'function' ? blank() : { ...blank }]); setOpen(value.length) }
  return (
    <div className="arr">
      {value.length === 0 && <p className="muted">No {noun}s yet.</p>}
      {value.map((it, i) => (
        <div key={i} className={open === i ? 'arr-i open' : 'arr-i'}>
          <div className="arr-h" onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="arr-n">{i + 1}</span>
            <b>{it[titleKey] || `New ${noun}`}</b>
            {it.active === false && <em className="off">hidden</em>}
            <span className="arr-act" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="icobtn" title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="icobtn" title="Move down" onClick={() => move(i, 1)} disabled={i === value.length - 1}>↓</button>
              <button type="button" className="icobtn" title="Duplicate" onClick={() => onChange([...value.slice(0, i + 1), { ...it }, ...value.slice(i + 1)])}>⧉</button>
              <button type="button" className="icobtn del" title="Delete" onClick={() => { if (confirm(`Delete this ${noun}?`)) { onChange(value.filter((_, j) => j !== i)); setOpen(-1) } }}>🗑</button>
            </span>
            <span className="arr-c">{open === i ? '▴' : '▾'}</span>
          </div>
          {open === i && <div className="arr-b"><ObjectForm fields={fields} value={it} token={token} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} /></div>}
        </div>
      ))}
      <button type="button" className="abtn alt" onClick={add}>+ Add {noun}</button>
    </div>
  )
}
