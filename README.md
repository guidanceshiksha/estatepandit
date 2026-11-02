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

## Deploy on Vercel (database: Supabase)

Vercel par server files save nahi kar sakta, isliye leads, content, blog aur login Supabase mein rakhte hain.

1. supabase.com par project banao (ya Vercel > Storage / Marketplace se **Supabase** connect karo).
2. Supabase > **SQL Editor** mein `supabase/schema.sql` paste karke **Run** karo (ek table `pe_kv` banti hai).
3. Vercel > Settings > Environment Variables mein ye rakho:
   - `SUPABASE_URL` (Supabase > Project Settings > API > Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (wahin ki **service_role** key; ise kabhi `VITE_` ya public mat banao)
   - `VITE_REAL_ADMIN=1` (asli admin login)
   - `ADMIN_REQUIRE_LOGIN=1`
4. **Redeploy** karo (`VITE_REAL_ADMIN` build ke time padha jata hai). `vercel.json` build, rewrites aur functions sambhal leta hai.
5. `/admin` kholo (`admin` / `admin123`) aur turant **Settings > Account & Login** mein naya username/password set karo.
6. **SEO > Site SEO** mein apna final website address bharo.

Supabase variables ke bina site dikhegi, par leads aur admin changes save nahi honge.

## Admin login on/off

Abhi admin login **band** hai (`/admin` seedha khulta hai). Login wapas chalu karne ke liye host par environment variable `ADMIN_REQUIRE_LOGIN=1` set karo (Vercel: Settings > Environment Variables) aur redeploy karo. Tab demo login `admin` / `admin123` kaam karega; Settings > Account & Login se badal lo.

## Demo mode (default)

Abhi `/admin` **demo mode** mein hai: login box mein `admin` / `admin123` pehle se bhare rehte hain, bas "Sign in" dabao. Panel sample leads ke saath browser mein hi chalta hai, koi server ya database nahi chahiye, aur changes sirf us browser mein rehte hain.

Asli server login aur database wala admin chahiye to build ke time environment variable `VITE_REAL_ADMIN=1` set karo (Vercel: Settings > Environment Variables) aur redeploy karo. Tab Supabase aur `ADMIN_REQUIRE_LOGIN=1` bhi lagega (upar ke section dekho).

## Tests

```bash
node scripts/test/backend.test.mjs   # leads, admin login, content, uploads, SEO, rate limit (files and Supabase)
```

## Photos to add

`public/images/office.jpg` (office front, shown beside the map), `public/images/owner.jpg`, and the images listed in `docs/IMAGE-PROMPTS.md`.
Logo, office photo, credit line, social links etc. can be changed from Admin > Settings once the real admin is switched on.
