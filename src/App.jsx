import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion'
import QRCode from 'qrcode'
import { NEEDS } from './data.js'
import { useContent, useSeo } from './content.jsx'
import { useLeadForm } from './leads.js'
import { Logo, Ic, Social } from './ui.jsx'
import { Markdown } from './md.jsx'

const fade = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const vp = { once: true, margin: '-60px' }
const tel = (p) => `tel:${String(p).replace(/\s/g, '')}`

const Enquiry = createContext(() => {})
const useEnquiry = () => useContext(Enquiry)

const Reveal = ({ children, className }) => (
  <motion.div className={className} variants={fade} initial="hidden" whileInView="show" viewport={vp}>{children}</motion.div>
)
const Group = ({ children, className }) => (
  <motion.div className={className} variants={stagger} initial="hidden" whileInView="show" viewport={vp}>{children}</motion.div>
)
const Item = ({ children, className, lift = -6 }) => (
  <motion.div className={className} variants={fade} whileHover={{ y: lift }}>{children}</motion.div>
)
const Title = ({ children, sub, light }) => (
  <Reveal className={light ? 'sec-title light' : 'sec-title'}><h2>{children}</h2>{sub && <p>{sub}</p>}</Reveal>
)

/* ---------- Google marks ---------- */
const GoogleG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Google">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)
const GoogleWord = () => (
  <span className="gword" aria-label="Google">
    <b style={{ color: '#4285F4' }}>G</b><b style={{ color: '#EA4335' }}>o</b><b style={{ color: '#FBBC05' }}>o</b>
    <b style={{ color: '#4285F4' }}>g</b><b style={{ color: '#34A853' }}>l</b><b style={{ color: '#EA4335' }}>e</b>
  </span>
)
const Stars = ({ n = 5 }) => <span className="gstars" aria-label={`${n} out of 5`}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>

function Photo({ src, alt, className = 'bld', initials }) {
  const [bad, setBad] = useState(false)
  useEffect(() => setBad(false), [src])
  if (!src || bad) return <div className={`${className} noimg`} role="img" aria-label={alt}>{initials && <span className="initials">{initials}</span>}</div>
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />
}

function Counter({ to, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const t0 = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min((t - t0) / 1800, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return <span ref={ref}>{n.toLocaleString('en-IN')}{suffix}</span>
}

/* ---------- enquiry modal: every field is saved to the server as it is typed ---------- */
const SLOTS = ['10 AM – 12 PM', '12 PM – 2 PM', '2 PM – 4 PM', '4 PM – 6 PM', '6 PM – 7 PM']

function EnquiryModal({ data, onClose }) {
  const { site } = useContent()
  const [need, setNeed] = useState(data.need || 'Buy')
  const [state, setState] = useState('form') // form | sending | done | error
  const formRef = useRef(null)
  const visit = need === 'Site visit'
  const kind = visit ? 'visit' : data.kind || 'enquiry'
  const lead = useLeadForm({ title: data.title, source: data.source || 'Website' })
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    const form = formRef.current
    return () => {
      document.removeEventListener('keydown', k)
      document.body.style.overflow = ''
      lead.flush(form) // keep whatever was typed even if the visitor closes the popup
    }
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    setState((await lead.submit(e.currentTarget)) ? 'done' : 'error')
  }
  return (
    <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" role="dialog" aria-modal="true" aria-label={data.title}
        initial={{ y: 40, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        {state === 'done' ? (
          <div className="thanks">
            <div className="tick"><Ic n="check" size={30} /></div>
            <h3>Thank you!</h3>
            <p>{visit ? 'Your site visit request is received.' : 'Your request is received.'} We will call you shortly about <b>{data.title}</b>.</p>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} onChange={lead.onChange}>
            <span className="eyebrow">{visit ? 'Book a Site Visit' : 'Quick Enquiry'}</span>
            <h3>{data.title}</h3>
            <p className="msub">Share your details and we will call you back within 30 minutes.</p>
            <input type="hidden" name="kind" value={kind} />
            <input name="name" required placeholder="Your name" autoFocus />
            <input name="phone" required type="tel" pattern="[0-9+ ]{10,15}" placeholder="Mobile number" />
            <select name="need" value={need} onChange={(e) => setNeed(e.target.value)}>
              {NEEDS.map((o) => <option key={o}>{o}</option>)}
            </select>
            {visit && (
              <div className="row2">
                <input name="visitDate" type="date" min={today} required aria-label="Preferred date" />
                <select name="visitTime" required defaultValue="" aria-label="Preferred time">
                  <option value="" disabled>Time slot</option>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <textarea name="message" rows="2" placeholder="Anything specific? (optional)" defaultValue={data.message || ''} />
            {state === 'error' && <p className="err">Could not send right now. Please call us on {site.phone}.</p>}
            <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : visit ? 'Confirm Visit Request' : 'Request Callback'}</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ---------- navigation ---------- */
const navLinks = [['Home', '/#home'], ['Listings', '/#listings'], ['About', '/#about'], ['Blog', '/blog'], ['Contact', '/#contact']]

function Nav() {
  const { services } = useContent()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const enquire = useEnquiry()
  const close = () => { setOpen(false); setMenu(false) }
  return (
    <motion.header className="nav" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}>
      <a href="/" className="logo" aria-label="Pandit Estate home"><Logo /></a>
      <nav className={open ? 'links open' : 'links'}>
        {navLinks.slice(0, 3).map(([l, h]) => <a key={l} href={h} onClick={close}>{l}</a>)}
        <div className="dd" onMouseEnter={() => setMenu(true)} onMouseLeave={() => setMenu(false)}>
          <button onClick={() => setMenu(!menu)} aria-expanded={menu}>Services <span className="caret" /></button>
          <AnimatePresence>
            {menu && (
              <motion.ul initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                {services.items.map((s) => <li key={s.title}><a href="/#services" onClick={close}>{s.title}</a></li>)}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        {navLinks.slice(3).map(([l, h]) => <a key={l} href={h} onClick={close}>{l}</a>)}
      </nav>
      <button className="btn sm" onClick={() => enquire({ title: 'Get in touch', source: 'Navbar button' })}>Get in Touch</button>
      <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
    </motion.header>
  )
}

/* ---------- hero ---------- */
function Hero() {
  const { site, reviews, track } = useContent()
  const enquire = useEnquiry()
  const slides = site.heroSlides.length ? site.heroSlides : ['']
  const [slide, setSlide] = useState(0)
  const [custom, setCustom] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [slides.length])
  const search = (e) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const budget = f.budget === 'custom' ? `₹${f.min || '?'} Lac to ₹${f.max || '?'} Lac` : f.budget || 'any'
    enquire({
      title: 'Find my home', need: 'Buy', source: 'Hero search', kind: 'search',
      message: `Looking for: ${f.type || 'any type'} in ${f.location || 'any location'}. Budget: ${budget}.`,
    })
  }
  return (
    <section id="home" className="hero">
      <div className="slides" aria-hidden>
        <AnimatePresence initial={false}>
          <motion.div key={slide} className="slide" style={{ backgroundImage: slides[slide % slides.length] ? `url(${slides[slide % slides.length]})` : undefined }}
            initial={{ opacity: 0, scale: 1 }} animate={{ opacity: 1, scale: 1.12 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 8, ease: 'linear' } }} />
        </AnimatePresence>
      </div>
      <div className="hero-shade" />
      <motion.div className="hero-in" initial="hidden" animate="show" variants={stagger}>
        <motion.span className="eyebrow light" variants={fade}>{site.heroEyebrow}</motion.span>
        <motion.h1 variants={fade}>
          {site.heroTitle.split('\n').map((line, i, all) => (
            <span key={i} className={i === 0 ? 'h-brand' : i === all.length - 1 ? 'h-hl' : 'h-mid'}>{line}</span>
          ))}
        </motion.h1>
        <motion.p variants={fade} className="hero-sub">{site.heroSub}</motion.p>
        <motion.div variants={fade} className="hero-cta">
          <a className="btn gold" href={tel(site.phone)}><Ic n="phone" size={18} /> Call Now</a>
          <a className="btn wa-b" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer"><Social name="whatsapp" size={18} /> WhatsApp</a>
        </motion.div>
        <motion.ul variants={fade} className="hero-trust">
          <li><GoogleG size={16} /> <b>{reviews.score}</b> <Stars /> <span>{reviews.count} reviews</span></li>
          <li><Ic n="key" size={16} /> <b>{track.items[2]?.value?.toLocaleString('en-IN')}{track.items[2]?.suffix}</b> <span>{track.items[2]?.label}</span></li>
        </motion.ul>
        <motion.form variants={fade} className="search" onSubmit={search}>
          <select name="type" aria-label="Property type" defaultValue="">
            <option value="" disabled>Property Type</option>
            <option>All Types</option>
            {site.propertyTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select name="location" aria-label="Location" defaultValue="">
            <option value="" disabled>Location</option>
            <AreaOptions />
          </select>
          <select name="budget" aria-label="Budget" defaultValue="" onChange={(e) => setCustom(e.target.value === 'custom')}>
            <option value="" disabled>Budget</option>
            {site.budgets.map((b) => <option key={b}>{b}</option>)}
            <option value="custom">Custom Budget…</option>
          </select>
          {custom && (
            <div className="custom-budget">
              <input name="min" type="number" min="0" placeholder="Min (₹ Lac)" aria-label="Minimum budget in lakh" />
              <span>to</span>
              <input name="max" type="number" min="0" placeholder="Max (₹ Lac)" aria-label="Maximum budget in lakh" />
            </div>
          )}
          <button className="btn">Find Your Home</button>
        </motion.form>
        <motion.div variants={fade} className="deals">
          <span>Deals in:</span>{site.dealsIn.map((d) => <a key={d} href="#listings" className="deal">{d}</a>)}
        </motion.div>
      </motion.div>
      <a href="#about" className="scroll-mouse" aria-label="Scroll down"><span><i /></span><em>Scroll</em></a>
      <div className="dots">
        {slides.map((_, i) => <button key={i} aria-label={`Slide ${i + 1}`} className={i === slide % slides.length ? 'on' : ''} onClick={() => setSlide(i)} />)}
      </div>
    </section>
  )
}
const AreaOptions = () => {
  const { areas } = useContent()
  return (
    <>
      <optgroup label="Dwarka">{areas.items.map((a) => <option key={a}>{a.startsWith('Sector') ? `${a}, Dwarka` : a}</option>)}</optgroup>
      <optgroup label="Delhi NCR">{(areas.ncr || []).map((a) => <option key={a}>{a}</option>)}</optgroup>
    </>
  )
}

/* ---------- services ---------- */
function Services() {
  const { services } = useContent()
  const enquire = useEnquiry()
  return (
    <section id="services" className="sec">
      <Title sub={services.sub}>{services.title}</Title>
      <Group className="grid g5">
        {services.items.map((s) => (
          <Item key={s.title} className="card scard">
            <div className="simg">
              <Photo src={s.image} alt={s.title} />
              <span className="sbadge"><Ic n={s.icon} size={22} /></span>
            </div>
            <div className="sbody">
              <h3>{s.title}</h3>
              <p>{s.line}</p>
              <button className="btn xs" onClick={() => enquire({ title: s.title, need: s.need, source: `Service: ${s.title}`, kind: 'service' })}>{s.cta} <Ic n="arrow" size={15} /></button>
            </div>
          </Item>
        ))}
      </Group>
    </section>
  )
}

/* ---------- featured properties ---------- */
function Listings() {
  const { properties } = useContent()
  const enquire = useEnquiry()
  const [saved, setSaved] = useState({})
  const items = properties.items.filter((p) => p.active !== false)
  return (
    <section id="listings" className="sec tint">
      <Title sub={properties.sub}>{properties.title}</Title>
      <Group className="grid g3">
        {items.map((p, i) => (
          <Item key={p.title + p.location + i} className="card prop">
            <div className="thumb">
              <Photo src={p.image} alt={`${p.title} in ${p.location}`} />
              {p.tag && <span className={`tag t${i % 3}`}>{p.tag}</span>}
              <button className={saved[i] ? 'heart on' : 'heart'} aria-label="Save" onClick={() => setSaved({ ...saved, [i]: !saved[i] })}>{saved[i] ? '♥' : '♡'}</button>
              {p.status && <span className="status">{p.status}</span>}
            </div>
            <div className="pbody">
              <div className="prow"><strong>{p.price}</strong>{p.sqft ? <span className="area">{Number(p.sqft).toLocaleString('en-IN')} sq.ft</span> : null}</div>
              <h3>{p.title}</h3>
              <small className="loc"><Ic n="pin" size={14} /> {p.location}</small>
              <ul className="specs">
                {p.beds ? <li><b>{p.beds}</b> Beds</li> : null}{p.baths ? <li><b>{p.baths}</b> Baths</li> : null}
                {p.floor ? <li><b>{p.floor}</b></li> : null}{p.facing ? <li><b>{p.facing}</b> facing</li> : null}
              </ul>
              <div className="furn">{p.furnishing}</div>
              <div className="pact">
                <button className="btn xs" onClick={() => enquire({ title: `${p.title}, ${p.location}`, need: p.kind === 'rent' ? 'Rent' : 'Buy', source: `Property: ${p.title}, ${p.location} (${p.price})` })}>Enquire Now</button>
                <button className="btn xs ghost" onClick={() => enquire({ title: `${p.title}, ${p.location}`, need: 'Site visit', source: `Property visit: ${p.title}, ${p.location} (${p.price})`, kind: 'visit' })}>Book Visit</button>
              </div>
            </div>
          </Item>
        ))}
      </Group>
    </section>
  )
}

/* ---------- about ---------- */
function About() {
  const { about: a, site } = useContent()
  const enquire = useEnquiry()
  return (
    <section id="about" className="sec about-sec">
      <div className="about">
        <Reveal className="about-img">
          <div className="portrait">
            <Photo src={a.ownerPhoto} alt={a.ownerName} className="pimg" initials={a.ownerName.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
            <div className="pcap"><b>{a.ownerName}</b><span>{a.ownerRole}</span></div>
          </div>
        </Reveal>
        <Reveal className="about-txt">
          <span className="eyebrow">{a.eyebrow}</span>
          <h2>{a.heading}</h2>
          <p className="lead">{a.lead}</p>
          {a.expValue && <div className="exp"><b>{a.expValue}</b><span>{a.expLabel}</span></div>}
          <div className="ribbon">SALE <i>✱</i> PURCHASE <i>✱</i> RENTING</div>
          <h4 className="mini">{a.tilesTitle}</h4>
          <div className="tiles">
            {a.tiles.map((t) => (
              <motion.div key={t.title} className="tile" whileHover={{ y: -4 }}>
                <span><Ic n={t.icon} size={20} /></span><b>{t.title}</b>{t.sub && <small>{t.sub}</small>}
              </motion.div>
            ))}
          </div>
          <ul className="checks">{a.points.map((p) => <li key={p}><span><Ic n="check" size={13} stroke={3} /></span>{p}</li>)}</ul>
          <div className="about-cta">
            <button className="btn" onClick={() => enquire({ title: 'Talk to our team', source: 'About section' })}>Talk to Our Team</button>
            <a className="phone" href={tel(site.phone)}><Ic n="phone" size={16} /> {site.phone}</a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- stats ---------- */
const Stats = () => {
  const { track } = useContent()
  return (
    <section className="stats">
      <div className="stats-in">
        <Title light sub={track.sub}>{track.title}</Title>
        <Group className="grid g4">
          {track.items.map((s) => (
            <Item key={s.label} className="stat" lift={-8}>
              <span className="sico"><Ic n={s.icon} size={24} /></span>
              <b><Counter to={Number(s.value) || 0} suffix={s.suffix} /></b>
              <i className="bar"><motion.em initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.6 }} /></i>
              <span className="slabel">{s.label}</span>
            </Item>
          ))}
        </Group>
      </div>
    </section>
  )
}

/* ---------- Google reviews ---------- */
function Testimonials() {
  const { reviews } = useContent()
  const list = reviews.items
  const [i, setI] = useState(0)
  const [per, setPer] = useState(3)
  const [hover, setHover] = useState(false)
  useEffect(() => {
    const f = () => setPer(innerWidth < 720 ? 1 : innerWidth < 1000 ? 2 : 3)
    f(); addEventListener('resize', f)
    return () => removeEventListener('resize', f)
  }, [])
  const max = Math.max(0, list.length - per)
  useEffect(() => {
    if (hover || max === 0) return
    const t = setInterval(() => setI((x) => (x >= max ? 0 : x + 1)), 4500)
    return () => clearInterval(t)
  }, [max, hover])
  const idx = Math.min(i, max)
  return (
    <section className="sec">
      <Reveal className="ghead">
        <div className="gscore">
          <GoogleWord />
          <div><b>{reviews.score}</b><Stars /><small>Based on {reviews.count} Google reviews</small></div>
        </div>
        <a className="btn gbtn" href={reviews.url} target="_blank" rel="noreferrer"><GoogleG size={18} /> Write a review</a>
      </Reveal>
      <div className="carousel" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <button onClick={() => setI(idx <= 0 ? max : idx - 1)} aria-label="Previous">‹</button>
        <div className="viewport">
          <div className="rtrack" style={{ '--per': per, transform: `translateX(calc(-1 * ${idx} * (100% + 20px) / ${per}))` }}>
            {list.map((r, k) => (
              <article key={r.name + k} className="rcard">
                <div className="rtop">
                  <span className="av" style={{ background: `hsl(${(r.name.charCodeAt(0) * 17) % 360} 55% 45%)` }}>{r.name[0]}</span>
                  <div><b>{r.name}</b><small>{r.when}</small></div>
                  <GoogleG size={22} />
                </div>
                <Stars n={Number(r.rating) || 5} />
                <p>{r.text}</p>
                <div className="rtag"><GoogleG size={14} /> Google Review</div>
              </article>
            ))}
          </div>
        </div>
        <button onClick={() => setI(idx >= max ? 0 : idx + 1)} aria-label="Next">›</button>
      </div>
      <div className="pager">{Array.from({ length: max + 1 }).map((_, k) => <button key={k} aria-label={`Go to ${k + 1}`} className={k === idx ? 'on' : ''} onClick={() => setI(k)} />)}</div>
    </section>
  )
}

/* ---------- why choose us ---------- */
function Why() {
  const { why, reviews } = useContent()
  const enquire = useEnquiry()
  return (
    <section className="sec tint why">
      <div className="why-grid">
        <Reveal className="why-intro">
          <span className="eyebrow">Why Pandit Estate</span>
          <h2>{why.title}</h2>
          <p>{why.sub}</p>
          <div className="why-score">
            <b>{reviews.score}<span>★</span></b>
            <small>{why.scoreNote}</small>
          </div>
          <button className="btn" onClick={() => enquire({ title: 'Speak to an advisor', source: 'Why choose us' })}>Speak to an Advisor <Ic n="arrow" size={16} /></button>
        </Reveal>
        <Group className="why-cards">
          {why.items.map((w, i) => (
            <Item key={w.title} className="wcard">
              <span className="wnum">0{i + 1}</span>
              <motion.span className="wicon" whileHover={{ rotate: 8, scale: 1.1 }}><Ic n={w.icon} size={26} /></motion.span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
              <span className="wline" />
            </Item>
          ))}
        </Group>
      </div>
    </section>
  )
}

/* ---------- bank loan assistance ---------- */
function Loans() {
  const { loans } = useContent()
  const enquire = useEnquiry()
  return (
    <section id="loans" className="sec loans-sec">
      <Reveal className="loans">
        <div className="loans-l">
          <span className="eyebrow light">{loans.eyebrow}</span>
          <h2>{loans.title}</h2>
          <p>{loans.sub}</p>
          <ol className="lsteps">
            {loans.steps.map((st, i) => (
              <li key={st.title}><span className="lnum">{i + 1}</span><div><b>{st.title}</b><small>{st.text}</small></div></li>
            ))}
          </ol>
          <button className="btn coral" onClick={() => enquire({ title: 'Home loan assistance', need: 'Home loan', source: 'Home loan section', kind: 'loan' })}>{loans.cta} <Ic n="arrow" size={16} /></button>
        </div>
        <div className="loans-r">
          <h3><Ic n="bank" size={20} /> {loans.bankTitle}</h3>
          <Group className="banks">
            {loans.banks.map((b) => (
              <Item key={b.name} className="bank" lift={-4}>
                {b.logo ? <img src={b.logo} alt={b.full || b.name} /> : <><span className="bank-ic"><Ic n="bank" size={20} /></span><b>{b.name}</b><small>{b.full}</small></>}
              </Item>
            ))}
          </Group>
          <p className="lnote">{loans.note}</p>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------- referral / commission ---------- */
function Referral() {
  const { referral } = useContent()
  const enquire = useEnquiry()
  return (
    <section id="refer" className="sec refer-sec">
      <Reveal className="refer">
        <div className="refer-l">
          <span className="gift"><Ic n="gift" size={30} /></span>
          <span className="eyebrow">{referral.eyebrow}</span>
          <h2>{referral.title}</h2>
          <p>{referral.sub}</p>
          <button className="btn coral" onClick={() => enquire({ title: 'Refer a client', need: 'Refer a client', source: 'Refer & Earn section', kind: 'referral' })}>{referral.cta} <Ic n="arrow" size={16} /></button>
          <small className="rnote">{referral.note}</small>
        </div>
        <ol className="rsteps">
          {referral.steps.map((st, i) => (
            <li key={st.title}>
              <span className="ric"><Ic n={st.icon} size={22} /></span>
              <div><em>Step {i + 1}</em><b>{st.title}</b><p>{st.text}</p></div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  )
}

/* ---------- partners ---------- */
function Partners() {
  const { partners } = useContent()
  const list = [...partners.items, ...partners.items]
  return (
    <section className="partners" aria-label="Partners">
      <motion.div className="track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 25, ease: 'linear', repeat: Infinity }}>
        {list.map((p, i) => (p.logo ? <img key={i} className="plogo" src={p.logo} alt={p.name} /> : <span key={i}>{p.name}</span>))}
      </motion.div>
    </section>
  )
}

/* ---------- areas ---------- */
function Areas() {
  const { areas } = useContent()
  const enquire = useEnquiry()
  const chip = (a, label) => (
    <Item key={a} className="chip-wrap" lift={-3}>
      <button className="chip" onClick={() => enquire({ title: `Properties in ${label}`, need: 'Buy', source: `Area: ${label}`, kind: 'area' })}><Ic n="pin" size={14} /> {a}</button>
    </Item>
  )
  return (
    <section className="sec">
      <Title sub={areas.sub}>{areas.title}</Title>
      <h3 className="agroup">{areas.dwarkaTitle}</h3>
      <Group className="areas">{areas.items.map((a) => chip(a, a.startsWith('Sector') ? `${a}, Dwarka` : a))}</Group>
      {areas.ncr?.length > 0 && (
        <>
          <h3 className="agroup">{areas.ncrTitle}</h3>
          <Group className="areas">{areas.ncr.map((a) => chip(a, a))}</Group>
        </>
      )}
    </section>
  )
}

/* ---------- blog ---------- */
const published = (blogs) => blogs.items.filter((p) => p.published !== false).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

function BlogCard({ b }) {
  return (
    <Item className="card bcard">
      <a href={`/blog/${b.slug}`} className="bimg" aria-label={b.title}><Photo src={b.image} alt={b.title} /></a>
      <div className="pbody">
        <div className="bmeta-row">
          <span className="bcat inline">{b.category}</span>
          <span className="bdate"><Ic n="clock" size={13} /> {fmtDate(b.date)}</span>
        </div>
        <h3><a href={`/blog/${b.slug}`}>{b.title}</a></h3>
        <p>{b.excerpt}</p>
        <a href={`/blog/${b.slug}`} className="link">Read article →</a>
      </div>
    </Item>
  )
}
const Blog = () => {
  const { blogs } = useContent()
  return (
    <section id="blog" className="sec">
      <Title sub={blogs.sub}>{blogs.title}</Title>
      <Group className="grid g3">{published(blogs).slice(0, 3).map((b) => <BlogCard key={b.id} b={b} />)}</Group>
      <Reveal className="center"><a href="/blog" className="btn">View All Articles <Ic n="arrow" size={16} /></a></Reveal>
    </section>
  )
}
function BlogPage() {
  const { blogs, site } = useContent()
  useSeo({ title: `${blogs.title} | ${site.name}`, description: blogs.sub })
  return (
    <section className="sec blogpage">
      <Title sub={blogs.sub}>All Articles</Title>
      <Group className="grid g3">{published(blogs).map((b) => <BlogCard key={b.id} b={b} />)}</Group>
    </section>
  )
}
function PostPage({ slug }) {
  const { blogs, site } = useContent()
  const enquire = useEnquiry()
  const post = blogs.items.find((p) => p.slug === slug && p.published !== false)
  useSeo({ title: post ? post.seoTitle || `${post.title} | ${site.name}` : `Article not found | ${site.name}`, description: post ? post.seoDescription || post.excerpt : '', image: post?.image })
  if (!post) {
    return <section className="sec center"><h2>Article not found</h2><p className="muted-p">It may have been moved or unpublished.</p><a href="/blog" className="btn">Back to blog</a></section>
  }
  const more = published(blogs).filter((p) => p.id !== post.id).slice(0, 3)
  return (
    <>
      <article className="sec post">
        <a href="/blog" className="back">← All articles</a>
        <span className="bcat inline">{post.category}</span>
        <h1>{post.title}</h1>
        <small className="bmeta">{post.readTime} · {fmtDate(post.date)} · By {site.name}</small>
        <div className="post-img"><Photo src={post.image} alt={post.title} /></div>
        <div className="post-body"><Markdown text={post.body} /></div>
        {post.sources?.length > 0 && (
          <aside className="sources">
            <h3>Sources</h3>
            <ol>{post.sources.map(([name, link]) => <li key={link}><a href={link} target="_blank" rel="noreferrer noopener nofollow">{name}</a></li>)}</ol>
          </aside>
        )}
        <div className="author">
          <span className="av-lg">{site.ownerName.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          <div><b>{site.ownerName}</b><small>Founder, {site.name} · 25+ years in Dwarka property</small></div>
          <div className="share">
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + (typeof location !== 'undefined' ? location.href : ''))}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp"><Social name="whatsapp" size={18} /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof location !== 'undefined' ? location.href : '')}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook"><Social name="facebook" size={18} /></a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof location !== 'undefined' ? location.href : '')}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn"><Social name="linkedin" size={18} /></a>
          </div>
        </div>
        <div className="post-cta">
          <div><b>Looking for a property in Dwarka?</b><span>Talk to our team for verified options and honest advice.</span></div>
          <button className="btn gold" onClick={() => enquire({ title: `Enquiry from article: ${post.title}`, source: `Blog: ${post.title}` })}>Request a Callback</button>
        </div>
      </article>
      {more.length > 0 && (
        <section className="sec tint"><Title>More Articles</Title><Group className="grid g3">{more.map((b) => <BlogCard key={b.id} b={b} />)}</Group></section>
      )}
    </>
  )
}

/* ---------- faq: website queries | general property queries ---------- */
function FaqColumn({ title, icon, items }) {
  const [o, setO] = useState(0)
  return (
    <div className="faq-col">
      <h3><span><Ic n={icon} size={18} /></span>{title}</h3>
      {items.map(({ q, a }, i) => (
        <div key={q + i} className={o === i ? 'faq-i open' : 'faq-i'}>
          <button onClick={() => setO(o === i ? -1 : i)} aria-expanded={o === i}>
            <span>{q}</span>
            <motion.span className="fplus" animate={{ rotate: o === i ? 45 : 0 }}>+</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {o === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{a}</motion.p>}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
const FAQ = () => {
  const { faqs } = useContent()
  return (
    <section className="sec tint">
      <Title sub={faqs.sub}>{faqs.title}</Title>
      <Reveal className="faq-grid">
        <FaqColumn title={faqs.siteTitle} icon="eye" items={faqs.site} />
        <FaqColumn title={faqs.generalTitle} icon="home" items={faqs.general} />
      </Reveal>
    </section>
  )
}

/* ---------- contact card + QR (scan to save contact) ---------- */
const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1')
function buildVcard(site) {
  const [first, ...rest] = site.ownerName.split(' ')
  return [
    'BEGIN:VCARD', 'VERSION:3.0', `N:${esc(rest.join(' '))};${esc(first)};;;`, `FN:${esc(site.ownerName)}`, `ORG:${esc(site.name)}`, 'TITLE:Property Consultant',
    `TEL;TYPE=CELL,VOICE:${site.phone.replace(/\s/g, '')}`, site.phone2 && `TEL;TYPE=CELL:${site.phone2.replace(/\s/g, '')}`,
    `EMAIL;TYPE=INTERNET:${site.email}`, `ADR;TYPE=WORK:;;${esc(site.address)};Dwarka;New Delhi;110075;India`,
    `NOTE:${esc('Deals in ' + site.dealsIn.join(', '))}`, 'END:VCARD',
  ].filter(Boolean).join('\r\n')
}

function Contact() {
  const { site } = useContent()
  const enquire = useEnquiry()
  const [svg, setSvg] = useState('')
  const vcard = buildVcard(site)
  useEffect(() => {
    QRCode.toString(vcard, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#07423c', light: '#ffffff' } }).then(setSvg).catch(() => setSvg(''))
  }, [vcard])
  const download = () => {
    const url = URL.createObjectURL(new Blob([vcard], { type: 'text/vcard' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${site.ownerName.replace(/\s+/g, '-')}-${site.name.replace(/\s+/g, '-')}.vcf` })
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <section id="contact" className="sec contact-sec">
      <Title sub="Call, visit or scan the card to save our number.">Contact Us</Title>
      <Reveal className="vcard">
        <div className="vc-left">
          <Logo dark size={52} />
          <h3>{site.ownerName}</h3>
          <p className="vc-role">Property Consultant · Dwarka</p>
          <div className="ribbon sm">SALE <i>✱</i> PURCHASE <i>✱</i> RENTING</div>
          <p className="vc-deals">Deals in: {site.dealsIn.join(' · ')}</p>
          <ul className="vc-list">
            <li><Ic n="phone" size={18} /><span><a href={tel(site.phone)}>{site.phone}</a>{site.phone2 && <><br /><a href={tel(site.phone2)}>{site.phone2}</a></>}</span></li>
            <li><Ic n="mail" size={18} /><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><Ic n="pin" size={18} /><span>{site.address}</span></li>
            {site.hours && <li><Ic n="clock" size={18} /><span>{site.hours}</span></li>}
          </ul>
          <div className="about-cta">
            <button className="btn gold" onClick={() => enquire({ title: 'Contact request', source: 'Contact card' })}>Request a Callback</button>
          </div>
        </div>
        <div className="vc-right">
          <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <b>Scan to save our contact</b>
          <small>Opens Add Contact on your phone with our numbers, email and address.</small>
          <button className="btn ghost-w" onClick={download}><Ic n="download" size={16} /> Download vCard</button>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------- google map ---------- */
const MapSection = () => {
  const { site } = useContent()
  return (
    <section className="sec map-sec">
      <Title sub={`Visit us at ${site.address}`}>Find Us on Google Maps</Title>
      <Reveal className="map-wrap">
        <iframe title="Pandit Estate on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`} />
        <div className="map-card">
          <GoogleG size={26} />
          <b>{site.name}</b>
          <span>{site.address}</span>
          <a className="btn xs" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`} target="_blank" rel="noreferrer">Get Directions <Ic n="arrow" size={14} /></a>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------- footer ---------- */
function Footer() {
  const { site, services } = useContent()
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState(false)
  const lead = useLeadForm({ kind: 'callback', title: 'Footer callback request', source: 'Footer form' })
  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const ok = await lead.submit(form)
    setSent(ok); setErr(!ok)
    if (ok) form.reset()
  }
  const socials = [['facebook', 'Facebook', site.facebook], ['instagram', 'Instagram', site.instagram], ['youtube', 'YouTube', site.youtube], ['linkedin', 'LinkedIn', site.linkedin], ['whatsapp', 'WhatsApp', `https://wa.me/${site.whatsapp}`]]
  return (
    <footer className="footer">
      <div className="fgrid">
        <div className="fbrand">
          <Logo dark size={52} />
          <p>{site.footerText}</p>
          <div className="socials">
            {socials.map(([n, label, href]) => (
              <a key={n} href={href || '#'} target={href ? '_blank' : undefined} rel="noreferrer" aria-label={label} className={`soc ${n}`}><Social name={n} size={19} /></a>
            ))}
          </div>
        </div>
        <div><h4>Services</h4>{services.items.slice(0, 6).map((s) => <a key={s.title} href="/#services">{s.title}</a>)}</div>
        <div>
          <h4>Contact</h4>
          <a href={tel(site.phone)}><Ic n="phone" size={15} /> {site.phone}</a>
          {site.phone2 && <a href={tel(site.phone2)}><Ic n="phone" size={15} /> {site.phone2}</a>}
          <a href={`mailto:${site.email}`}><Ic n="mail" size={15} /> {site.email}</a>
          <p><Ic n="pin" size={15} /> {site.address}</p>
        </div>
        <form onSubmit={submit} onChange={lead.onChange}>
          <h4>Get a Free Callback</h4>
          <input name="name" required placeholder="Name" />
          <input name="phone" required type="tel" pattern="[0-9+ ]{10,15}" placeholder="Phone" />
          <textarea name="message" rows="2" placeholder="Message (optional)" />
          <button className="btn gold">{sent ? 'Thank you! ✓' : 'Submit'}</button>
          {err && <small className="err">Could not send. Please call us.</small>}
        </form>
      </div>
      <div className="fbar"><span>© {new Date().getFullYear()} {site.name} · All rights reserved</span><span>{site.hours}</span></div>
      <div className="mega" aria-hidden>{site.name.toUpperCase()}</div>
    </footer>
  )
}

/* ---------- branded mouse cursor (desktop only): gold dot + trailing ring ---------- */
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let x = -100, y = -100, rx = -100, ry = -100, raf
    const move = (e) => {
      x = e.clientX; y = e.clientY
      const hot = e.target.closest?.('a,button,select,input,textarea,label,[role=button]')
      ring.current?.classList.toggle('hot', !!hot)
      dot.current?.classList.toggle('hot', !!hot)
    }
    const down = () => ring.current?.classList.add('press')
    const up = () => ring.current?.classList.remove('press')
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(tick)
    }
    addEventListener('mousemove', move); addEventListener('mousedown', down); addEventListener('mouseup', up)
    raf = requestAnimationFrame(tick)
    return () => {
      removeEventListener('mousemove', move); removeEventListener('mousedown', down); removeEventListener('mouseup', up)
      cancelAnimationFrame(raf); document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  return <><div ref={ring} className="cur-ring" aria-hidden /><div ref={dot} className="cur-dot" aria-hidden /></>
}

/* ---------- floating buttons: WhatsApp + back to top (bottom right) ---------- */
function Floaters() {
  const { site } = useContent()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const f = () => setShow(scrollY > 500)
    f(); addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])
  return (
    <div className="floaters">
      <AnimatePresence>
        {show && (
          <motion.button className="totop" aria-label="Back to top" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}><Ic n="arrow" size={20} stroke={2.4} /></motion.button>
        )}
      </AnimatePresence>
      <motion.a className="wa" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
        initial={{ scale: 0 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.2 }}>
        <Social name="whatsapp" size={30} />
      </motion.a>
    </div>
  )
}

export default function App({ page = 'home', slug = '' }) {
  const { seo } = useContent()
  const { scrollYProgress } = useScroll()
  const w = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const [modal, setModal] = useState(null)
  useSeo(page === 'home' ? { title: seo.title, description: seo.description, image: seo.ogImage } : {})
  return (
    <Enquiry.Provider value={setModal}>
      <motion.div className="progress" style={{ scaleX: w }} />
      <Nav />
      {page === 'blog' ? <BlogPage /> : page === 'post' ? <PostPage slug={slug} /> : (
        <><Hero /><About /><Services /><Listings /><Stats /><Testimonials /><Why /><Loans /><Referral /><Partners /><Areas /><Blog /><FAQ /><Contact /><MapSection /></>
      )}
      <Footer />
      <Floaters />
      <Cursor />
      <AnimatePresence>{modal && <EnquiryModal data={modal} onClose={() => setModal(null)} />}</AnimatePresence>
    </Enquiry.Provider>
  )
}
