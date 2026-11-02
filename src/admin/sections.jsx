import { useEffect, useState } from 'react'
import { defaults } from '../data.js'
import { ObjectForm } from './fields.jsx'
import { call, download } from './api.js'
import { useAdmin } from './ctx.js'

const T = (k, label, extra = {}) => ({ k, label, type: 'text', ...extra })
const A = (k, label, extra = {}) => ({ k, label, type: 'textarea', ...extra })
const I = (k, label, extra = {}) => ({ k, label, type: 'image', ...extra })

const arr = (k, label, item) => ({ k, label, type: 'array', item })

export const SECTIONS = {
  home: {
    key: 'site', title: 'Hero & Home Page', desc: 'The big banner, sliding photos, search bar choices and the "Deals in" strip.', link: '/#home',
    fields: [
      T('heroEyebrow', 'Small label above heading'), A('heroTitle', 'Main heading', { rows: 2, hint: 'Press Enter to start a new line.' }), T('heroSub', 'Sub heading', { wide: true }),
      { k: 'heroSlides', label: 'Sliding background photos', type: 'images', hint: 'They change automatically every few seconds. Wide photos work best.' },
      { k: 'dealsIn', label: 'Deals in (shown under search bar)', type: 'tags' },
      { k: 'propertyTypes', label: 'Property types in the search bar', type: 'tags', rows: 8 },
      { k: 'budgets', label: 'Budget options in the search bar', type: 'tags' },
    ],
  },
  services: {
    key: 'services', title: 'Services', desc: 'Cards in the "Our Services" section.', link: '/#services',
    fields: [
      T('title', 'Section heading'), T('sub', 'Section sub heading'),
      arr('items', 'Services', {
        titleKey: 'title', noun: 'service', blank: { title: '', line: '', cta: 'Enquire Now', need: 'Buy', icon: 'home', image: '' },
        fields: [T('title', 'Service name'), T('cta', 'Button text'), A('line', 'Short description', { rows: 2 }), { k: 'need', label: 'Pre-selected request type in the form', type: 'need' }, { k: 'icon', label: 'Icon', type: 'icon' }, I('image', 'Photo')],
      }),
    ],
  },
  properties: {
    key: 'properties', title: 'Properties / Listings', desc: 'Featured properties shown on the home page. Hide a property without deleting it.', link: '/#listings',
    fields: [
      T('title', 'Section heading'), T('sub', 'Section sub heading'),
      arr('items', 'Properties', {
        titleKey: 'title', noun: 'property',
        blank: () => ({ price: '', title: '', location: '', beds: 2, baths: 2, sqft: '', floor: '', facing: '', furnishing: '', status: 'Ready to Move', tag: '', kind: 'sale', active: true, image: '' }),
        fields: [
          T('title', 'Title (e.g. 3 BHK DDA Flat)'), T('price', 'Price (e.g. ₹ 85 Lac)'), T('location', 'Location'),
          { k: 'kind', label: 'For', type: 'select', options: [{ v: 'sale', l: 'Sale' }, { v: 'rent', l: 'Rent' }] },
          { k: 'beds', label: 'Bedrooms', type: 'number' }, { k: 'baths', label: 'Bathrooms', type: 'number' }, { k: 'sqft', label: 'Area (sq.ft)', type: 'number' },
          T('floor', 'Floor (e.g. 3rd of 7)'), T('facing', 'Facing'), T('furnishing', 'Furnishing'), T('status', 'Status (e.g. Ready to Move)'), T('tag', 'Badge (e.g. Verified, Hot Deal)'),
          { k: 'active', label: 'Show on website', type: 'bool', on: 'Visible', off: 'Hidden' }, I('image', 'Photo'),
        ],
      }),
    ],
  },
  about: {
    key: 'about', title: 'About Us / Profile', desc: 'Owner profile, photo and the "We deal in" tiles.', link: '/#about',
    fields: [
      T('eyebrow', 'Small label'), T('heading', 'Heading'), A('lead', 'Short intro', { rows: 2 }),
      T('ownerName', 'Name on photo'), T('ownerRole', 'Role on photo'), I('ownerPhoto', 'Owner photo'),
      T('expValue', 'Experience number (e.g. 25+)'), T('expLabel', 'Experience label'), T('tilesTitle', 'Tiles heading'),
      arr('tiles', 'We deal in tiles', { titleKey: 'title', noun: 'tile', blank: { icon: 'home', title: '', sub: '' }, fields: [T('title', 'Title'), T('sub', 'Small text (optional)'), { k: 'icon', label: 'Icon', type: 'icon' }] }),
      { k: 'points', label: 'Check-list points', type: 'tags' },
    ],
  },
  track: {
    key: 'track', title: 'Track Record (Counters)', desc: 'The animated numbers section.', link: '/#home',
    fields: [
      T('title', 'Heading'), T('sub', 'Sub heading'),
      arr('items', 'Counters', { titleKey: 'label', noun: 'counter', blank: { value: 0, suffix: '+', label: '', icon: 'building' }, fields: [T('label', 'Label'), T('prefix', 'Before the number (e.g. #)'), { k: 'value', label: 'Number', type: 'number' }, T('suffix', 'After the number (e.g. +)'), { k: 'icon', label: 'Icon', type: 'icon' }] }),
    ],
  },
  reviews: {
    key: 'reviews', title: 'Google Reviews', desc: 'Rating summary and the review cards.', link: '/#home',
    fields: [
      T('score', 'Rating (e.g. 4.9)'), T('count', 'Review count (e.g. 600+)'), T('url', 'Link for "Write a review" button', { wide: true }),
      arr('items', 'Reviews', { titleKey: 'name', noun: 'review', blank: { name: '', when: 'Just now', rating: 5, text: '' }, fields: [T('name', 'Reviewer name'), T('when', 'When (e.g. 2 weeks ago)'), { k: 'rating', label: 'Stars (1–5)', type: 'number' }, A('text', 'Review text', { rows: 3 })] }),
    ],
  },
  why: {
    key: 'why', title: 'Why Choose Us', desc: 'The six reason cards.', link: '/#home',
    fields: [
      T('title', 'Heading'), T('sub', 'Sub heading'), T('scoreNote', 'Note under rating'),
      arr('items', 'Reasons', { titleKey: 'title', noun: 'reason', blank: { icon: 'check', title: '', text: '' }, fields: [T('title', 'Title'), T('text', 'Short text'), { k: 'icon', label: 'Icon', type: 'icon' }] }),
    ],
  },
  areas: {
    key: 'areas', title: 'Areas We Serve', desc: 'Each area becomes a button that opens the enquiry form.', link: '/#home',
    fields: [T('title', 'Heading'), T('sub', 'Sub heading'), T('dwarkaTitle', 'Dwarka group title'), { k: 'items', label: 'Dwarka areas / sectors', type: 'tags', rows: 12 }, T('ncrTitle', 'Delhi NCR group title'), { k: 'ncr', label: 'Delhi NCR areas', type: 'tags', rows: 8 }],
  },
  loans: {
    key: 'loans', title: 'Home Loan Section', desc: 'Bank loan assistance block. Upload the official logo of each bank; without a logo the bank name is shown.', link: '/#loans',
    fields: [
      T('eyebrow', 'Small label'), T('title', 'Heading', { wide: true }), A('sub', 'Sub heading', { rows: 2 }), T('cta', 'Button text'), T('bankTitle', 'Banks heading'), T('note', 'Small note under banks', { wide: true }),
      arr('steps', 'Steps', { titleKey: 'title', noun: 'step', blank: { icon: 'check', title: '', text: '' }, fields: [T('title', 'Title'), T('text', 'Short text'), { k: 'icon', label: 'Icon', type: 'icon' }] }),
      arr('banks', 'Banks', { titleKey: 'name', noun: 'bank', blank: { name: '', full: '', logo: '' }, fields: [T('name', 'Short name'), T('full', 'Full name'), I('logo', 'Official logo (optional)')] }),
    ],
  },
  referral: {
    key: 'referral', title: 'Refer & Earn', desc: 'The commission / reward block. No amounts are shown on the website.', link: '/#refer',
    fields: [
      T('eyebrow', 'Small label'), T('title', 'Heading', { wide: true }), A('sub', 'Text', { rows: 3 }), T('cta', 'Button text'), T('note', 'Small note', { wide: true }),
      arr('steps', 'Steps', { titleKey: 'title', noun: 'step', blank: { icon: 'check', title: '', text: '' }, fields: [T('title', 'Title'), A('text', 'Short text', { rows: 2 }), { k: 'icon', label: 'Icon', type: 'icon' }] }),
    ],
  },
  partners: {
    key: 'partners', title: 'Partner Logos', desc: 'The scrolling strip. Upload a logo or leave it empty to show the name as text.', link: '/#home',
    fields: [arr('items', 'Partners', { titleKey: 'name', noun: 'partner', blank: { name: '', logo: '' }, fields: [T('name', 'Name'), I('logo', 'Logo image')] })],
  },
  faqs: {
    key: 'faqs', title: 'FAQs', desc: 'Two columns: website questions and property questions.', link: '/#home',
    fields: [
      T('title', 'Heading'), T('sub', 'Sub heading'), T('siteTitle', 'Left column title'), T('generalTitle', 'Right column title'),
      arr('site', 'Left column questions', { titleKey: 'q', noun: 'question', blank: { q: '', a: '' }, fields: [T('q', 'Question', { wide: true }), A('a', 'Short answer', { rows: 2 })] }),
      arr('general', 'Right column questions', { titleKey: 'q', noun: 'question', blank: { q: '', a: '' }, fields: [T('q', 'Question', { wide: true }), A('a', 'Short answer', { rows: 2 })] }),
    ],
  },
  business: {
    key: 'site', title: 'Business & Contact Details', desc: 'Used in the contact card, QR contact, footer, map and enquiry forms.', link: '/#contact',
    fields: [
      T('name', 'Business name'), T('tagline', 'Tagline'), T('ownerName', 'Contact person'), T('phone', 'Phone 1'), T('phone2', 'Phone 2'),
      T('whatsapp', 'WhatsApp number', { hint: 'Digits only with country code, e.g. 919811093769' }), T('email', 'Email'),
      A('address', 'Address', { rows: 2 }), T('mapQuery', 'Google Maps search text', { hint: 'Text typed into Google Maps to find your office.', wide: true }),
      T('hours', 'Working hours'), A('footerText', 'Footer description', { rows: 2 }),
    ],
  },
  social: {
    key: 'site', title: 'Social Media Links', desc: 'Leave empty to keep the icon without a link.', link: '/#contact',
    fields: [T('facebook', 'Facebook page link', { placeholder: 'https://facebook.com/…' }), T('instagram', 'Instagram link', { placeholder: 'https://instagram.com/…' }), T('youtube', 'YouTube channel link', { placeholder: 'https://youtube.com/…' }), T('linkedin', 'LinkedIn link', { placeholder: 'https://linkedin.com/…' })],
  },
  seo: {
    key: 'seo', title: 'Site SEO', desc: 'How your website appears on Google and when shared on WhatsApp or Facebook.', link: '/',
    fields: [
      T('title', 'Page title', { max: 60, wide: true, hint: 'Keep it near 50–60 characters.' }),
      A('description', 'Meta description', { rows: 3, max: 160, hint: 'The text under your title on Google. Aim for 120–160 characters.' }),
      A('keywords', 'Keywords', { rows: 2, hint: 'Comma separated.' }), I('ogImage', 'Share image (WhatsApp / Facebook preview)'),
      T('siteUrl', 'Website address', { placeholder: 'https://www.panditestate.com', wide: true, hint: 'Used for the sitemap, canonical links and share previews. Set this once the site is live.' }),
    ],
  },
  'blog-settings': {
    key: 'blogs', title: 'Blog Page Text', desc: 'Headings for the blog section and blog page.', link: '/blog',
    fields: [T('title', 'Blog section heading'), T('sub', 'Blog sub heading')],
  },
}

const clean = (v) => {
  if (Array.isArray(v)) {
    const a = v.map(clean)
    return a.every((x) => typeof x === 'string' || x === undefined) ? a.map((x) => x.trim()).filter(Boolean) : a
  }
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
  return typeof v === 'string' ? v : v
}

export function SectionEditor({ id }) {
  const { content, saveSection, resetSection, token } = useAdmin()
  const s = SECTIONS[id]
  const [draft, setDraft] = useState(content[s.key])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { setDraft(content[s.key]); setMsg('') }, [id])
  const dirty = JSON.stringify(draft) !== JSON.stringify(content[s.key])
  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    addEventListener('beforeunload', h)
    return () => removeEventListener('beforeunload', h)
  }, [dirty])

  const save = async () => {
    setBusy(true); setMsg('')
    try { const v = clean(draft); await saveSection(s.key, v); setDraft(v); setMsg('Saved. Your website is updated.') } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }
  const reset = async () => {
    if (!confirm('Reset this whole section to the original text? Your edits to it will be lost.')) return
    setDraft(await resetSection(s.key)); setMsg('Restored to the original content.')
  }
  return (
    <section className="panel editor">
      <div className="ed-head">
        <div><h2>{s.title}</h2><p className="muted">{s.desc}</p></div>
        <a className="abtn alt sm" href={s.link} target="_blank" rel="noreferrer">View on website ↗</a>
      </div>
      <ObjectForm fields={s.fields} value={draft} onChange={setDraft} token={token} />
      <div className={dirty ? 'savebar dirty' : 'savebar'}>
        <span>{msg || (dirty ? 'You have unsaved changes' : 'All changes saved')}</span>
        <button className="abtn alt" onClick={reset}>Reset to original</button>
        {dirty && <button className="abtn alt" onClick={() => setDraft(content[s.key])}>Discard</button>}
        <button className="abtn" onClick={save} disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </section>
  )
}

/* ---------- account (login) ---------- */
export function AccountPage() {
  const { token, me, refreshMe } = useAdmin()
  const [f, setF] = useState({ current: '', username: me.user, password: '', again: '' })
  const [msg, setMsg] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    if (f.password !== f.again) return setMsg({ bad: true, t: 'The two new passwords do not match.' })
    try {
      await call('/api/admin/account', token, { method: 'POST', body: JSON.stringify({ current: f.current, username: f.username, password: f.password }) })
      setMsg({ t: 'Login details updated. Use them next time you sign in.' }); setF({ ...f, current: '', password: '', again: '' }); refreshMe()
    } catch (x) { setMsg({ bad: true, t: x.message }) }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <section className="panel editor">
      <div className="ed-head"><div><h2>Account & Login</h2><p className="muted">Change the admin username and password.</p></div></div>
      {me.demo && <p className="note">You are using the demo login (<b>admin</b> / <b>admin123</b>). Please set your own password before the website goes live.</p>}
      <form className="oform acct" onSubmit={submit}>
        <div className="fld wide"><label>Current password</label><input type="password" value={f.current} onChange={set('current')} required autoComplete="current-password" /></div>
        <div className="fld"><label>New username</label><input value={f.username} onChange={set('username')} required minLength={3} /></div>
        <div className="fld" />
        <div className="fld"><label>New password</label><input type="password" value={f.password} onChange={set('password')} required minLength={8} autoComplete="new-password" /><small className="hint">At least 8 characters.</small></div>
        <div className="fld"><label>Repeat new password</label><input type="password" value={f.again} onChange={set('again')} required autoComplete="new-password" /></div>
        <div className="fld wide">{msg && <div className={msg.bad ? 'aerr' : 'aok'}>{msg.t}</div>}<button className="abtn">Update login</button></div>
      </form>
    </section>
  )
}

/* ---------- backup ---------- */
export function BackupPage() {
  const { token, content } = useAdmin()
  const stamp = new Date().toISOString().slice(0, 10)
  return (
    <section className="panel editor">
      <div className="ed-head"><div><h2>Backup & Export</h2><p className="muted">Download your data as files. Keep a copy somewhere safe.</p></div></div>
      <div className="backup">
        <div><b>Website content</b><span>Every text, photo link and setting of the site.</span><button className="abtn" onClick={() => download(`pandit-estate-content-${stamp}.json`, JSON.stringify(content, null, 2))}>Download content (JSON)</button></div>
        <div><b>All leads</b><span>Every enquiry, including incomplete ones.</span><button className="abtn" onClick={async () => download(`pandit-estate-leads-${stamp}.json`, JSON.stringify((await call('/api/admin/leads', token)).leads, null, 2))}>Download leads (JSON)</button></div>
      </div>
      <h3 className="sub-h">SEO files</h3>
      <p className="muted">Created automatically from your published blog posts. Submit the sitemap in Google Search Console after launch.</p>
      <div className="seolinks"><a href="/sitemap.xml" target="_blank" rel="noreferrer">/sitemap.xml</a><a href="/robots.txt" target="_blank" rel="noreferrer">/robots.txt</a></div>
    </section>
  )
}

export { defaults }
