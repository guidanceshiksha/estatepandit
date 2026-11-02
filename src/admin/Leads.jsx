import { useEffect, useMemo, useRef, useState } from 'react'
import { Ic } from '../ui.jsx'
import { call, download } from './api.js'

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['closed', 'Closed won'], ['lost', 'Lost'], ['partial', 'Incomplete']]
const statusLabel = Object.fromEntries(STATUSES)
const KIND_LABEL = { enquiry: 'Property enquiry', visit: 'Site visit', area: 'Area enquiry', service: 'Service enquiry', contact: 'Contact', search: 'Home search', callback: 'Callback', loan: 'Home loan', referral: 'Referral' }

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–')
const ago = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}
const dayKey = (d) => new Date(d).toISOString().slice(0, 10)
const Badge = ({ s }) => <span className={`badge s-${s}`}>{statusLabel[s] || s}</span>

export function LeadTable({ rows, open, visits }) {
  if (!rows.length) return <p className="muted pad">Nothing here yet.</p>
  return (
    <div className="tw">
      <table>
        <thead><tr><th>Name</th><th>Phone</th><th>Interest</th><th>{visits ? 'Visit' : 'Source'}</th><th>Status</th><th>Received</th></tr></thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id} onClick={() => open(l.id)}>
              <td><b>{l.name || '–'}</b></td>
              <td>{l.phone || '–'}</td>
              <td>{l.need || '–'}</td>
              <td className="src">{visits ? <>{l.visitDate || '–'}<br /><small>{l.visitTime}</small><br /><small>{l.title}</small></> : <>{KIND_LABEL[l.kind] || 'Lead'}<br /><small>{l.title}</small></>}</td>
              <td><Badge s={l.status} /></td>
              <td title={fmt(l.createdAt)}>{ago(l.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Drawer({ lead, token, onClose, onChange, onDelete }) {
  const [notes, setNotes] = useState(lead.notes || '')
  const [saved, setSaved] = useState(true)
  const t = useRef(null)
  useEffect(() => { setNotes(lead.notes || ''); setSaved(true) }, [lead.id])
  const patch = async (body) => onChange(lead.id, (await call(`/api/admin/leads/${lead.id}`, token, { method: 'PATCH', body: JSON.stringify(body) })).lead)
  const onNotes = (v) => {
    setNotes(v); setSaved(false)
    clearTimeout(t.current)
    t.current = setTimeout(async () => { await patch({ notes: v }); setSaved(true) }, 600)
  }
  const phone = (lead.phone || '').replace(/[^\d+]/g, '')
  const rows = [
    ['Interested in', lead.need], ['Enquiry for', lead.title], ['Came from', lead.source],
    ...(lead.kind === 'visit' || lead.visitDate ? [['Visit date', lead.visitDate], ['Visit time', lead.visitTime]] : []),
    ['Message', lead.message], ['First seen', fmt(lead.createdAt)], ['Last activity', fmt(lead.updatedAt)],
    ['Submitted', lead.submitted ? fmt(lead.submittedAt) : 'Not yet — visitor is still filling the form'],
  ]
  return (
    <>
      <div className="dr-bg" onClick={onClose} />
      <aside className="drawer">
        <header>
          <div><h2>{lead.name || 'Unnamed visitor'}</h2><span className="muted">{KIND_LABEL[lead.kind] || 'Lead'}</span></div>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="dr-actions">
          {phone && <a className="abtn" href={`tel:${phone}`}><Ic n="phone" size={16} /> Call</a>}
          {phone && <a className="abtn alt" href={`https://wa.me/${phone.replace('+', '')}`} target="_blank" rel="noreferrer">WhatsApp</a>}
        </div>
        <label className="lbl">Phone</label>
        <div className="big">{lead.phone || '–'}</div>
        <label className="lbl">Status</label>
        <select value={lead.status} onChange={(e) => patch({ status: e.target.value })}>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <dl>{rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <label className="lbl">Internal notes {saved ? <em>saved</em> : <em className="un">saving…</em>}</label>
        <textarea rows="4" value={notes} onChange={(e) => onNotes(e.target.value)} placeholder="Call outcome, follow-up date, budget…" />
        <button className="abtn danger" onClick={() => onDelete(lead)}>Delete lead</button>
      </aside>
    </>
  )
}

export function Dashboard({ leads, go, open, content }) {
  const real = leads.filter((l) => l.submitted)
  const today = dayKey(new Date())
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return dayKey(d) })
  const perDay = days.map((d) => real.filter((l) => dayKey(l.createdAt) === d).length)
  const maxDay = Math.max(1, ...perDay)
  const bySource = {}
  real.forEach((l) => { const k = (l.source || 'Website').split(':')[0]; bySource[k] = (bySource[k] || 0) + 1 })
  const src = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const cards = [
    ['Total leads', real.length, 'building'], ['New (uncontacted)', real.filter((l) => l.status === 'new').length, 'eye'],
    ['Today', real.filter((l) => dayKey(l.createdAt) === today).length, 'clock'], ['Visit bookings', real.filter((l) => l.kind === 'visit').length, 'pin'],
    ['Incomplete forms', leads.filter((l) => !l.submitted).length, 'tag'],
  ]
  const site = [
    ['Services', content.services.items.length, 'services'], ['Properties live', content.properties.items.filter((p) => p.active !== false).length, 'properties'],
    ['Blog posts', content.blogs.items.length, 'blog-all'], ['Areas', content.areas.items.length, 'areas'],
  ]
  return (
    <>
      <div className="cards">
        {cards.map(([t, n, ic]) => <div key={t} className="acard"><span><Ic n={ic} size={20} /></span><b>{n}</b><small>{t}</small></div>)}
      </div>
      <div className="two">
        <section className="panel">
          <h3>Leads – last 7 days</h3>
          <div className="bars">
            {perDay.map((n, i) => (
              <div key={days[i]} className="barcol"><em>{n}</em><i style={{ height: `${(n / maxDay) * 100}%` }} /><small>{days[i].slice(5)}</small></div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>Where leads come from</h3>
          {src.length === 0 && <p className="muted">No leads yet.</p>}
          {src.map(([k, n]) => (
            <div key={k} className="srow"><span>{k}</span><div><i style={{ width: `${(n / src[0][1]) * 100}%` }} /></div><b>{n}</b></div>
          ))}
        </section>
      </div>
      <section className="panel">
        <h3>Website content</h3>
        <div className="chips">{site.map(([t, n, tab]) => <button key={t} className="chipbtn" onClick={() => go(tab)}><b>{n}</b> {t}</button>)}</div>
      </section>
      <section className="panel">
        <div className="phead"><h3>Recent leads</h3><button className="link" onClick={() => go('leads')}>View all →</button></div>
        <LeadTable rows={real.slice(0, 6)} open={open} />
      </section>
    </>
  )
}

export function LeadsView({ leads, setLeads, token, mode }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [openId, setOpenId] = useState(null)
  const submitted = leads.filter((l) => l.submitted)
  const base = mode === 'visits' ? submitted.filter((l) => l.kind === 'visit') : mode === 'partial' ? leads.filter((l) => !l.submitted) : submitted
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return base.filter((l) => (status === 'all' || l.status === status) && (!s || [l.name, l.phone, l.title, l.source, l.need, l.message].join(' ').toLowerCase().includes(s)))
  }, [leads, mode, q, status])
  const update = (id, lead) => setLeads((ls) => ls.map((l) => (l.id === id ? lead : l)))
  const remove = async (lead) => {
    if (!confirm(`Delete the lead from ${lead.name || 'this visitor'}? This cannot be undone.`)) return
    await call(`/api/admin/leads/${lead.id}`, token, { method: 'DELETE' })
    setLeads((ls) => ls.filter((l) => l.id !== lead.id)); setOpenId(null)
  }
  const exportCsv = () => {
    const cols = ['createdAt', 'name', 'phone', 'need', 'kind', 'title', 'source', 'visitDate', 'visitTime', 'message', 'status', 'notes']
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    download(`pandit-estate-${mode}-${dayKey(new Date())}.csv`, [cols.join(','), ...rows.map((l) => cols.map((c) => esc(l[c])).join(','))].join('\n'), 'text/csv')
  }
  const open = leads.find((l) => l.id === openId)
  return (
    <section className="panel">
      {mode === 'partial' && <p className="note">These visitors started a form but did not press submit. What they typed is saved automatically.</p>}
      <div className="toolbar">
        <input className="search-in" placeholder="Search name, phone, property…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="abtn alt" onClick={exportCsv} disabled={!rows.length}>Export CSV</button>
      </div>
      <LeadTable rows={rows} open={setOpenId} visits={mode === 'visits'} />
      {open && <Drawer lead={open} token={token} onClose={() => setOpenId(null)} onChange={update} onDelete={remove} />}
    </section>
  )
}
