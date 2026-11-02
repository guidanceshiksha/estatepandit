import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ContentProvider } from './content.jsx'
import './styles.css'

const path = location.pathname.replace(/\/+$/, '')
const root = createRoot(document.getElementById('root'))
if (path === '/admin') {
  // Admin code and styles load only on /admin, so visitors download a lighter site.
  import('./Admin.jsx').then(({ default: Admin }) => root.render(<Admin />))
} else {
  const post = /^\/blog\/([^/]+)$/.exec(path)
  const page = post ? 'post' : path === '/blog' ? 'blog' : 'home'
  root.render(<ContentProvider><App page={page} slug={post ? decodeURIComponent(post[1]) : ''} /></ContentProvider>)
}
