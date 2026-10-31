// Tiny, safe markdown renderer for blog posts: ## / ### headings, - lists, **bold**, blank-line paragraphs.
const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))

export function Markdown({ text }) {
  const out = []
  let list = null
  const flush = () => { if (list) { out.push(<ul key={out.length}>{list.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>); list = null } }
  String(text || '').split(/\r?\n/).forEach((raw) => {
    const line = raw.trim()
    if (!line) return flush()
    if (/^[-*] /.test(line)) { (list ||= []).push(line.slice(2)); return }
    flush()
    if (line.startsWith('### ')) out.push(<h3 key={out.length}>{inline(line.slice(4))}</h3>)
    else if (line.startsWith('## ')) out.push(<h2 key={out.length}>{inline(line.slice(3))}</h2>)
    else out.push(<p key={out.length}>{inline(line)}</p>)
  })
  flush()
  return <>{out}</>
}
