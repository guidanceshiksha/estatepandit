import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Admin from './Admin.jsx'
import { ContentProvider } from './content.jsx'
import './styles.css'

const path = location.pathname.replace(/\/+$/, '')
const root = createRoot(document.getElementById('root'))
if (path === '/admin') {
  root.render(<Admin />)
} else {
  const post = /^\/blog\/([^/]+)$/.exec(path)
  const page = post ? 'post' : path === '/blog' ? 'blog' : 'home'
  root.render(<ContentProvider><App page={page} slug={post ? decodeURIComponent(post[1]) : ''} /></ContentProvider>)
}
