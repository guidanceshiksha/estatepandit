// Vercel only: serve the app's HTML through a function (for SEO tags + inlined content).
import fs from 'node:fs'
fs.renameSync('dist/index.html', 'dist/app.html')
console.log('dist/index.html -> dist/app.html')
