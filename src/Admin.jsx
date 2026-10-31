import { useCallback, useEffect, useMemo, useState } from 'react'
import { Logo, Ic } from './ui.jsx'
import { defaults } from './data.js'
import { merge } from './content.jsx'
import { call, loadContent, TOKEN_KEY } from './admin/api.js'
import { DEMO_ADMIN, DEMO_USER, DEMO_PASS } from './config.js'
import { AdminCtx } from './admin/ctx.js'
import { Dashboard, LeadsView } from './admin/Leads.jsx'
import { SECTIONS, SectionEditor, AccountPage, BackupPage } from './admin/sections.jsx'
import { BlogManager } from './admin/Blog.jsx'
import './admin.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'building' },
  { group: 'leads', label: 'Leads', icon: 'phone', items: [['leads', 'All Leads'], ['visits', 'Visit Bookings'], ['partial', 'Incomplete Forms']] },
  { group: 'website', label: 'Website Content', icon: 'home', items: [['home', 'Hero & Home'], ['services', 'Services'], ['properties', 'Properties'], ['about', 'About Us'], ['track', 'Track Record'], ['reviews', 'Google Reviews'], ['why', 'Why Choose Us'], ['areas', 'Areas We Serve'], ['partners', 'Partner Logos'], ['faqs', 'FAQs']] },
  { group: 'blog', label: 'Blog', icon: 'eye', items: [['blog-all', 'All Posts'], ['blog-new', 'New Post'], ['blog-settings', 'Blog Page Text']] },
  { group: 'seo', label: 'SEO', icon: 'badge', items: [['seo', 'Site SEO']] },
  { group: 'settings', label: 'Settings', icon: 'shield', items: [['business', 'Business & Contact'], ['social', 'Social Links'], ['account', 'Account & Login'], ['backup', 'Backup & SEO Files']] },
]
const groupOf = (tab) => NAV.find((n) => n.items?.some(([id]) => id === tab))?.group

function Login({ onLogin }) {
  const [u, setU] = useState(DEMO_ADMIN ? DEMO_USER : '')
  const [pw, setPw] = useState(DEMO_ADMIN ? DEMO_PASS : '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    if (DEMO_ADMIN) {
      if (u === DEMO_USER && pw === DEMO_PASS) onLogin('demo')
      else { setErr('Demo login is admin / admin123'); setBusy(false) }
      return
    }
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: pw }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || `Server error (${r.status}). Check that Redis is connected and redeploy.`)
      onLogin(j.token)
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <div className="adm login-wrap">
      <form className="login" onSubmit={go}>
        <Logo size={54} />
        <h1>Admin Panel</h1>
        <p>Sign in to manage your website, blog and leads.</p>
        <input placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} autoFocus required autoComplete="username" />
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" />
        {err && <div className="aerr">{err}</div>}
        <button className="abtn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="demo-hint">Demo login: <b>admin</b> / <b>admin123</b>{DEMO_ADMIN ? ' (already filled in, just press Sign in)' : ''}</div>
      </form>
    </div>
  )
}

function Panel({ token, onLogout }) {
  const [leads, setLeads] = useState([])
  const [content, setContent] = useState(merge())
  const [me, setMe] = useState({ demo: false, user: 'admin', open: false })
  const [tab, setTab] = useState('dashboard')
  const [openGroup, setOpenGroup] = useState('')
  const [menu, setMenu] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const guard = useCallback((e) => { if (e.message === 'auth') onLogout(); else throw e }, [onLogout])
  const loadLeads = useCallback(() => call('/api/admin/leads', token).then((r) => setLeads(r.leads)).catch(guard), [token, guard])
  const refreshMe = useCallback(() => call('/api/admin/me', token).then(setMe).catch(guard), [token, guard])
  useEffect(() => {
    Promise.all([loadLeads(), loadContent().then((c) => setContent(merge(c))), refreshMe()]).then(() => setLoaded(true)).catch(() => setLoaded(true))
    const t = setInterval(loadLeads, 8000)
    return () => clearInterval(t)
  }, [loadLeads, refreshMe])

  const saveSection = useCallback(async (key, value) => {
    await call(`/api/admin/content/${key}`, token, { method: 'PUT', body: JSON.stringify({ value }) }).catch(guard)
    setContent((c) => ({ ...c, [key]: value }))
  }, [token, guard])
  const resetSection = useCallback(async (key) => {
    await call(`/api/admin/content/${key}`, token, { method: 'DELETE' }).catch(guard)
    setContent((c) => ({ ...c, [key]: { ...defaults[key] } }))
    return { ...defaults[key] }
  }, [token, guard])

  const ctx = useMemo(() => ({ token, content, me, saveSection, resetSection, refreshMe }), [token, content, me, saveSection, resetSection, refreshMe])
  const go = (t) => { setTab(t); setOpenGroup(groupOf(t) || ''); setMenu(false) }

  const submitted = leads.filter((l) => l.submitted)
  const counts = { leads: submitted.length, visits: submitted.filter((l) => l.kind === 'visit').length, partial: leads.filter((l) => !l.submitted).length, 'blog-all': content.blogs.items.length }
  const crumb = (() => {
    if (tab === 'dashboard') return ['Dashboard']
    const g = NAV.find((n) => n.items?.some(([id]) => id === tab))
    return [g.label, g.items.find(([id]) => id === tab)[1]]
  })()

  let view
  if (!loaded) view = <p className="muted pad">Loading…</p>
  else if (tab === 'dashboard') view = <Dashboard leads={leads} go={go} open={() => go('leads')} content={content} />
  else if (['leads', 'visits', 'partial'].includes(tab)) view = <LeadsView key={tab} leads={leads} setLeads={setLeads} token={token} mode={tab} />
  else if (tab === 'blog-all' || tab === 'blog-new') view = <BlogManager key={tab} startNew={tab === 'blog-new'} />
  else if (tab === 'account') view = <AccountPage />
  else if (tab === 'backup') view = <BackupPage />
  else view = <SectionEditor key={tab} id={tab} />

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="adm">
        <aside className={menu ? 'side open' : 'side'}>
          <Logo dark size={44} />
          <nav>
            {NAV.map((n) => n.items ? (
              <div key={n.group} className={openGroup === n.group ? 'grp open' : 'grp'}>
                <button className={groupOf(tab) === n.group ? 'gh on' : 'gh'} onClick={() => setOpenGroup(openGroup === n.group ? '' : n.group)}>
                  <Ic n={n.icon} size={18} />{n.label}<span className="chev">▾</span>
                </button>
                {openGroup === n.group && (
                  <div className="sub">
                    {n.items.map(([id, label]) => (
                      <button key={id} className={tab === id ? 'on' : ''} onClick={() => go(id)}>{label}{counts[id] ? <em>{counts[id]}</em> : null}</button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button key={n.id} className={tab === n.id ? 'gh on' : 'gh'} onClick={() => go(n.id)}><Ic n={n.icon} size={18} />{n.label}</button>
            ))}
          </nav>
          <div className="side-foot">
            <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
            {!me.open && <button onClick={onLogout}>Sign out</button>}
          </div>
        </aside>
        <main>
          <header className="top">
            <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
            <div>
              <h1>{crumb[crumb.length - 1]}</h1>
              {crumb.length > 1 && <span className="crumb">{crumb[0]}</span>}
            </div>
            <span className="live"><i /> Live</span>
          </header>
          {me.sandbox && (
            <div className="note warn">Demo mode: this panel shows sample leads and works only in this browser. Your changes are not sent to any server.</div>
          )}
          {me.open && (
            <div className="note warn">Admin login is switched off, so anyone who knows the /admin link can see leads and edit the website. Turn the login back on before sharing the site widely.</div>
          )}
          {!me.open && me.demo && tab !== 'account' && (
            <div className="note warn">You are signed in with the demo login. <button className="link" onClick={() => go('account')}>Change it now →</button></div>
          )}
          {view}
        </main>
      </div>
    </AdminCtx.Provider>
  )
}

export default function Admin() {
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' } })
  const [checked, setChecked] = useState(!!token)
  // If the server has the login switched off, go straight into the panel.
  useEffect(() => {
    if (token || DEMO_ADMIN) { setChecked(true); return }
    fetch('/api/admin/me').then((r) => (r.ok ? r.json() : null)).then((m) => { if (m?.open) setToken('open') }).catch(() => {}).finally(() => setChecked(true))
  }, [])
  const login = (t) => { try { sessionStorage.setItem(TOKEN_KEY, t) } catch { /* private mode */ } setToken(t) }
  const logout = useCallback(() => { try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } setToken('') }, [])
  useEffect(() => { document.title = 'Admin · Pandit Estate' }, [])
  if (!checked) return null
  return token ? <Panel token={token} onLogout={logout} /> : <Login onLogin={login} />
}
