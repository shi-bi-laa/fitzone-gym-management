# FitZone — Gym Management (Supabase backend)

React + Vite frontend → Cloudflare Worker API (`worker/index.ts`) → Supabase Postgres.
Members (add / edit) and Attendance (check-in / check-out) are stored in Supabase.
Plans, Payments and Reports still use demo data.

## Setup (3 steps, ~5 minutes)

### 1. Create the tables in Supabase
Supabase Dashboard → **SQL Editor** → **New query** → paste the whole of `supabase.sql` → **Run**.
(Includes 4 demo members; delete the last INSERT block if you want an empty start. Safe to re-run.)

### 2. Check the project URL
`wrangler.jsonc` → `vars.SUPABASE_URL` should be `https://<your-project-ref>.supabase.co`
(Supabase → Project Settings → API → Project URL).

### 3. Give the Worker your secret key (never put it in code or GitHub)
Supabase → **Project Settings → API Keys** → copy the **Secret key** (`sb_secret_…`)
(or the legacy `service_role` key).

Cloudflare → Workers & Pages → **fitzone-gym-management** → **Settings → Variables and Secrets → Add**
- Type: **Secret**
- Name: `SUPABASE_SECRET_KEY`
- Value: the key → **Deploy**

Then push to GitHub (or Retry deployment). Done. Open `https://<your-site>/api/health` — it should show `"database": true`.

## Run locally
Create a file `.dev.vars` (git-ignored):
```
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SECRET_KEY=<your secret key>
```
```
npm install
npm run build
npm run dev:api        # app + API at http://localhost:8787
```

## API
| Method | Path | Body |
|---|---|---|
| GET | /api/members | |
| POST | /api/members | name*, email, phone, gender, plan, joined, expiry, status (ID auto: FZ1001…) |
| PUT | /api/members/:id | same |
| GET | /api/attendance?date=YYYY-MM-DD | defaults to today |
| POST | /api/attendance/checkin | memberId*, method (Manual/QR) — blocks Expired/Inactive and double check-in |
| POST | /api/attendance/:id/checkout | |

"Today" uses `TIMEZONE` in `wrangler.jsonc` (default Asia/Kolkata).

## Security
- Tables have Row Level Security on with no public policies, so the public anon key cannot read or write them. Only the Worker (secret key) can.
- The site/API itself has no login: anyone with your URL can add members. Free fix: Cloudflare Zero Trust → Access (email login) in front of the site.
- Free tier note: Supabase free projects pause after ~1 week of inactivity; open the dashboard and click Restore if that happens.
