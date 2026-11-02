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

## Deploy on Vercel

Vercel par server files save nahi kar sakta, isliye data ke liye Upstash Redis chahiye (free plan hai).

1. Vercel project > **Storage** (ya Marketplace) > **Upstash Redis** > Create, aur use apne project se **Connect** karo. Isse `KV_REST_API_URL` aur `KV_REST_API_TOKEN` apne aap set ho jate hain.
2. Project **Redeploy** karo (Deployments > ... > Redeploy). `vercel.json` build, rewrites aur functions sambhal leta hai.
3. `/admin` kholo (demo login `admin` / `admin123`) aur **Settings > Account & Login** mein password badlo.
4. **SEO > Site SEO** mein apna final website address bharo.

Redis ke bina site dikhegi, par leads aur admin changes save nahi honge.

## Supabase se database (Vercel ke saath, Upstash ki jagah)

1. supabase.com par project banao (ya Vercel > Storage / Marketplace se **Supabase** connect karo).
2. Supabase > **SQL Editor** mein `supabase/schema.sql` paste karke **Run** karo (ek table `pe_kv` banti hai).
3. Vercel > Settings > Environment Variables mein ye do rakho:
   - `SUPABASE_URL` (Supabase > Project Settings > API > Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (wahin ki **service_role** key; ise kabhi `VITE_` ya public mat banao)
4. Admin login ke liye `VITE_REAL_ADMIN=1` aur `ADMIN_REQUIRE_LOGIN=1` bhi set karo, phir **Redeploy**.

Supabase ke variables milte hi site Redis ke bajay Supabase use karti hai. `/admin` mein `admin` / `admin123` se aao aur turant Settings > Account & Login mein password badlo.

## Admin login on/off

Abhi admin login **band** hai (`/admin` seedha khulta hai). Login wapas chalu karne ke liye host par environment variable `ADMIN_REQUIRE_LOGIN=1` set karo (Vercel: Settings > Environment Variables) aur redeploy karo. Tab demo login `admin` / `admin123` kaam karega; Settings > Account & Login se badal lo.

## Demo mode (default)

Abhi `/admin` **demo mode** mein hai: login box mein `admin` / `admin123` pehle se bhare rehte hain, bas "Sign in" dabao. Panel sample leads ke saath browser mein hi chalta hai, koi server ya database nahi chahiye, aur changes sirf us browser mein rehte hain.

Asli server login aur database wala admin chahiye to build ke time environment variable `VITE_REAL_ADMIN=1` set karo (Vercel: Settings > Environment Variables) aur redeploy karo. Tab Upstash Redis aur `ADMIN_REQUIRE_LOGIN=1` bhi lagega (upar ke sections dekho).

## Tests

```bash
node scripts/test/backend.test.mjs   # leads, admin login, content, uploads, SEO, rate limit (files and Redis)
```

## Photos to add

`public/images/office.jpg` (office front, shown beside the map), `public/images/owner.jpg`, and the images listed in `docs/IMAGE-PROMPTS.md`.
Logo, office photo, credit line, social links etc. can be changed from Admin > Settings once the real admin is switched on.
