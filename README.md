# Pandit Estate

Website, lead capture and admin panel for Pandit Estate, Dwarka (React + Vite, Node server, no database needed).

## Run locally

```bash
npm install
npm run dev        # website on http://localhost:5173, API on :3001
```

Admin panel: `/admin` (demo login `admin` / `admin123`; change it in Settings > Account & Login before going live).

## Go live

```bash
npm install
npm run build
npm start          # serves the site, API, sitemap and SEO tags; uses the host's PORT
```

Needs a host that runs Node and keeps `server/data/` between restarts (leads, saved content, uploads, login).
After launch, set the website address in Admin > SEO > Site SEO.

## Deploy on Render (one-time)

1. Render.com par login karo, **New + > Blueprint** chuno aur is GitHub repo ko connect karo.
2. Render `render.yaml` padh kar service aur 1 GB disk bana dega (disk ke liye paid "Starter" plan chahiye).
3. Deploy hone ke baad site ka URL milega. `/admin` kholo, demo login se aao aur **Settings > Account & Login** mein password badlo.
4. **SEO > Site SEO** mein apna final website address bharo.

`DATA_DIR=/var/data` disk par leads, saved content, uploads aur login rakhta hai, isliye redeploy par kuch nahi jaata.
