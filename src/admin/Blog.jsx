import { useEffect, useState } from 'react'
import { ObjectForm } from './fields.jsx'
import { useAdmin } from './ctx.js'

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({ id: 'p' + Date.now().toString(36), slug: '', title: '', excerpt: '', body: '', category: 'Guide', readTime: '3 min read', date: today(), image: '', seoTitle: '', seoDescription: '', published: false })

const FIELDS = [
  { k: 'title', label: 'Post title', type: 'text', wide: true },
  { k: 'slug', label: 'Page address (slug)', type: 'text', hint: 'Letters, numbers and dashes only. Created from the title if empty.' },
  { k: 'category', label: 'Category', type: 'text' },
  { k: 'date', label: 'Publish date', type: 'date' }, { k: 'readTime', label: 'Reading time', type: 'text' },
  { k: 'excerpt', label: 'Short summary (shown on cards)', type: 'textarea', rows: 2 },
  { k: 'image', label: 'Cover photo', type: 'image' },
  { k: 'body', label: 'Article', type: 'textarea', rows: 16, hint: 'Use "## Heading" for sections, "- item" for bullet lists and **bold** for emphasis. Leave a blank line between paragraphs.' },
  { k: 'sourcesText', label: 'Sources (one per line: Name | https://link)', type: 'tags', rows: 5, hint: 'Shown at the end of the article. Also mention the source in the paragraph.' },
  { k: 'published', label: 'Status', type: 'bool', on: 'Published', off: 'Draft (hidden)' },
]
const SEO_FIELDS = [
  { k: 'seoTitle', label: 'SEO title', type: 'text', max: 60, wide: true, hint: 'Leave empty to use the post title.' },
  { k: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 3, max: 160, hint: 'Leave empty to use the summary.' },
  { k: 'seoKeywords', label: 'Keywords', type: 'text', hint: 'Comma separated. Leave empty to use the category and site keywords.' },
]

function GooglePreview({ post, site, base }) {
  const title = post.seoTitle || `${post.title || 'Post title'} | ${site.name}`
  const desc = post.seoDescription || post.excerpt || 'The summary of your post appears here.'
  return (
    <div className="gprev">
      <small>{(base || 'https://yourwebsite.com').replace(/^https?:\/\//, '')} › blog › {post.slug || 'your-post'}</small>
      <b>{title.length > 62 ? title.slice(0, 60) + '…' : title}</b>
      <p>{desc.length > 160 ? desc.slice(0, 157) + '…' : desc}</p>
    </div>
  )
}

function SeoScore({ post }) {
  const checks = [
    ['Title is 20–60 characters', post.title.length >= 20 && (post.seoTitle || post.title).length <= 60],
    ['Summary or SEO description is 70–160 characters', ((post.seoDescription || post.excerpt) || '').length >= 70 && ((post.seoDescription || post.excerpt) || '').length <= 160],
    ['Has a cover photo', !!post.image],
    ['Article is at least 150 words', post.body.trim().split(/\s+/).filter(Boolean).length >= 150],
    ['Has at least one "## Heading"', /^## /m.test(post.body)],
    ['Page address is set', !!post.slug],
  ]
  const ok = checks.filter((c) => c[1]).length
  return (
    <div className="seoscore">
      <div className="ring" style={{ '--p': (ok / checks.length) * 100 }}><b>{ok}/{checks.length}</b></div>
      <ul>{checks.map(([t, g]) => <li key={t} className={g ? 'g' : 'b'}>{g ? '✓' : '✕'} {t}</li>)}</ul>
    </div>
  )
}

export function BlogManager({ startNew }) {
  const { content, saveSection, token } = useAdmin()
  const [items, setItems] = useState(content.blogs.items)
  const [sel, setSel] = useState(null) // index being edited
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const site = content.site

  useEffect(() => {
    if (startNew) { setItems((it) => [blank(), ...it]); setSel(0) } else setSel(null)
  }, [startNew])

  const persist = async (next, note) => {
    setBusy(true); setMsg('')
    try { await saveSection('blogs', { ...content.blogs, items: next }); setItems(next); setMsg(note) } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }
  const post = sel != null ? items[sel] : null
  const setPost = (p) => setItems(items.map((x, i) => (i === sel ? p : x)))
  const dirty = JSON.stringify(items) !== JSON.stringify(content.blogs.items)

  const save = async () => {
    const p = { ...post, title: post.title.trim(), slug: slugify(post.slug || post.title) }
    if (!p.title) return setMsg('Please add a title first.')
    if (!p.slug) return setMsg('Please add a title or page address.')
    if (items.some((x, i) => i !== sel && x.slug === p.slug)) return setMsg('Another post already uses this page address. Please change it.')
    await persist(items.map((x, i) => (i === sel ? p : x)), p.published ? 'Saved and live on your website.' : 'Saved as draft (not visible on the website).')
  }
  const remove = async (i) => {
    if (!confirm(`Delete "${items[i].title || 'this post'}"? This cannot be undone.`)) return
    await persist(items.filter((_, j) => j !== i), 'Post deleted.'); setSel(null)
  }
  const toggle = (i) => persist(items.map((x, j) => (j === i ? { ...x, published: !x.published } : x)), 'Status updated.')

  if (post) {
    return (
      <section className="panel editor">
        <div className="ed-head">
          <div><h2>{post.title || 'New post'}</h2><p className="muted">{post.published ? 'Published' : 'Draft'} · /blog/{post.slug || '…'}</p></div>
          <div className="row-btns">
            <button className="abtn alt sm" onClick={() => { setItems(content.blogs.items); setSel(null); setMsg('') }}>← All posts</button>
            {post.published && post.slug && <a className="abtn alt sm" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">View live ↗</a>}
          </div>
        </div>
        <ObjectForm fields={FIELDS} value={{ ...post, sourcesText: (post.sources || []).map((x) => x.join(' | ')) }} token={token} onChange={({ sourcesText, ...p }) => {
          const sources = (sourcesText || []).map((l) => l.split('|').map((t) => t.trim())).filter((x) => x.length >= 2 && x[0] && x[1])
          const next = { ...p, sources: sourcesText ? (sourcesText.some((l) => l.includes('|')) || sourcesText.length === 0 ? sources : post.sources) : post.sources }
          setPost(next.title !== post.title && (!post.slug || post.slug === slugify(post.title)) ? { ...next, slug: slugify(next.title) } : next)
        }} />
        <h3 className="sub-h">SEO</h3>
        <div className="seo-grid">
          <div><ObjectForm fields={SEO_FIELDS} value={post} token={token} onChange={setPost} /></div>
          <div><label className="lbl">How it may look on Google</label><GooglePreview post={post} site={site} base={content.seo.siteUrl} /><SeoScore post={post} /></div>
        </div>
        <div className={dirty ? 'savebar dirty' : 'savebar'}>
          <span>{msg || (dirty ? 'You have unsaved changes' : 'All changes saved')}</span>
          <button className="abtn alt" onClick={() => remove(sel)}>Delete post</button>
          <button className="abtn" onClick={save} disabled={busy}>{busy ? 'Saving…' : post.published ? 'Save & publish' : 'Save draft'}</button>
        </div>
      </section>
    )
  }

  const rows = items.map((p, i) => ({ p, i })).filter(({ p }) => !q.trim() || (p.title + p.category).toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <section className="panel">
      <div className="toolbar">
        <input className="search-in" placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="abtn" onClick={() => { setItems([blank(), ...items]); setSel(0) }}>+ New post</button>
      </div>
      {msg && <div className="aok">{msg}</div>}
      <div className="tw">
        <table>
          <thead><tr><th>Post</th><th>Category</th><th>Date</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map(({ p, i }) => (
              <tr key={p.id} onClick={() => setSel(i)}>
                <td><b>{p.title || 'Untitled'}</b><br /><small>/blog/{p.slug}</small></td>
                <td>{p.category}</td><td>{p.date}</td>
                <td><span className={`badge ${p.published ? 's-closed' : 's-lost'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                <td className="rowact" onClick={(e) => e.stopPropagation()}>
                  <button className="abtn alt sm" onClick={() => toggle(i)}>{p.published ? 'Unpublish' : 'Publish'}</button>
                  <button className="abtn alt sm" onClick={() => remove(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="muted pad">No posts found.</p>}
      </div>
    </section>
  )
}
