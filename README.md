# NHAA Stress & Trauma Assessment Module (Prototype)

A full-stack prototype for the **AI-Based Real-Time Stress and Trauma
Assessment Module** for victims/complainants accessing the National
Helpline Against Atrocities (14566) and the Integrated Portal, built for
the Ministry of Social Justice and Empowerment (MoSJE).

> ⚠️ **This is a hackathon/prototype-grade build, not production clinical
> infrastructure.** Read [Important limitations](#important-limitations-read-this)
> before showing this to real victims or real government stakeholders as
> anything other than a proof of concept.

---

## What's actually in here

- **Frontend** — Next.js (App Router) + Tailwind. A calm, multilingual
  (English / Hindi / Telugu) victim-facing portal, and a separate
  counsellor/admin dashboard.
- **Backend** — Next.js Route Handlers (`app/api/**`) acting as the REST
  API. No separate server needed; frontend and backend deploy together.
- **Middleware** — `middleware.js` gates every `/admin/*` page and
  `/api/admin/*` route, redirecting unauthenticated visitors to login.
- **Database** — PostgreSQL via Prisma ORM (works with any Postgres —
  Supabase and Neon both have permanent free tiers).
- **The SVI engine** — `lib/nlpEngine.js`: a transparent, rule-based
  multilingual text classifier that scores narratives 0–100 and buckets
  them into LOW / MODERATE / HIGH / CRITICAL, with a hard safety override
  for suicidal-ideation language. Every score is fully explainable — the
  admin dashboard shows exactly which words/phrases triggered it.

## User roles

| Portal | Who | Auth |
|---|---|---|
| Victim portal (`/`, `/report`, `/status`) | Public, anonymous | None — no login required, matches the brief's low-barrier-to-report goal |
| Admin/Counsellor dashboard (`/admin/*`) | Counsellors, Admins, Law-enforcement liaisons | Email+password, JWT session cookie |

Admin roles: `ADMIN` (can create/manage staff accounts), `COUNSELLOR`,
`LAW_ENFORCEMENT` — all three can view/triage/update cases; only `ADMIN`
can manage staff accounts (`/admin/staff`).

## Features

**Victim side**
- Consent screen (explicit, in-language) before anything is recorded
- Type or speak (browser voice-to-text) their narrative
- Multilingual UI: English, Hindi, Telugu (easy to extend — see
  `lib/i18n.js` and `lib/nlpEngine.js`'s `LEXICON`)
- Instant, anonymous case tracking code — no account needed
- Immediate resource recommendations based on risk level
- Status lookup by tracking code, no login required

**Admin/counsellor side**
- Login-gated dashboard
- Case queue sorted by urgency (SVI descending), filterable by risk
  level, status, or case code
- Analytics: totals, risk distribution, status breakdown
- Case detail: full narrative, detected indicators with the exact
  matched evidence, recommended actions, status workflow (New → In
  review → Assigned → Resolved), assign-to-self, internal notes, full
  audit/event log
- Staff management (Admin role only): create counsellor / law-enforcement
  / admin accounts

---

## Run it locally

```bash
git clone <your-repo-url>
cd nhaa-svi
npm install

cp .env.example .env
# edit .env: set DATABASE_URL (see "Get a free Postgres" below) and JWT_SECRET

npx prisma db push     # creates the tables
npm run db:seed        # creates your first admin login (reads SEED_ADMIN_* from .env)

npm run dev            # http://localhost:3000
```

Log in to the dashboard at `/admin/login` with the email/password printed
by the seed script.

### Get a free Postgres database (2 minutes)

1. Go to [supabase.com](https://supabase.com) → New project (free tier).
2. Project Settings → Database → **Connection string** (URI, "Session
   pooler" mode works well for serverless). Copy it.
3. Paste it into `.env` as `DATABASE_URL`, replacing `[YOUR-PASSWORD]`
   with your actual database password.

(Neon.tech is an equally good free alternative if you prefer it.)

---

## Deploy for free — GitHub → Vercel + Supabase

This is the simplest fully-free path: Vercel hosts the Next.js app
(frontend + API together), Supabase hosts the database.

### 1. Push to GitHub
```bash
cd nhaa-svi
git init
git add .
git commit -m "Initial commit: NHAA SVI prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Create the free Postgres database
Follow "Get a free Postgres database" above if you haven't already.
Keep the connection string handy.

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   your GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Under **Environment Variables**, add:
   - `DATABASE_URL` — your Supabase connection string
   - `JWT_SECRET` — a long random string (`openssl rand -base64 32`)
4. Click **Deploy**.
5. Once deployed, run the schema push and seed **once** against the live
   database. Easiest way: run these locally with your `.env` pointed at
   the same `DATABASE_URL` you gave Vercel:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
6. Visit `https://<your-project>.vercel.app`. Victim portal is the home
   page; staff log in at `/admin/login`.

### Alternative: Render (if you'd rather not use Vercel)
1. [render.com](https://render.com) → New → Web Service → connect your
   GitHub repo.
2. Build command: `npm install && npm run build`
   Start command: `npm start`
3. Add the same two environment variables (`DATABASE_URL`, `JWT_SECRET`)
   in Render's dashboard.
4. Deploy, then run `npx prisma db push && npm run db:seed` locally
   against that same `DATABASE_URL` (Render's free tier doesn't give you
   a shell for one-off commands).

### Alternative: GitHub Pages
GitHub Pages only serves static files — it **cannot** run the API routes,
database, or auth this app needs. It is not compatible with this project
as built. Use Vercel or Render (above) instead; both have permanent free
tiers.

---

## Project structure

```
app/
  page.js                    victim landing page
  report/                    victim narrative submission flow
  status/                    victim case-status lookup
  admin/
    login/                   staff login
    dashboard/               case queue + analytics
    case/[id]/                case detail + triage
    staff/                   staff account management (Admin only)
  api/
    report/route.js          POST — submit narrative, run SVI engine, create case
    status/route.js          GET  — public case-status lookup by code
    admin/login/route.js     POST — staff login, issues JWT cookie
    admin/logout/route.js    POST — clears session
    admin/cases/route.js     GET  — filtered case queue
    admin/cases/[id]/route.js  GET/PATCH — case detail, status/notes/assignment
    admin/analytics/route.js GET  — dashboard aggregates
    admin/staff/route.js     GET/POST — staff account management
    health/route.js          GET  — DB connectivity check for uptime monitors
lib/
  nlpEngine.js               the SVI scoring engine (start here)
  i18n.js                    UI translation strings
  auth.js / session.js       password hashing, JWT issue/verify
  db.js                      Prisma client singleton
  caseCode.js                tracking-code generator
middleware.js                route protection for /admin and /api/admin
prisma/schema.prisma         database schema
```

---

## Important limitations (read this)

This was built to be honest about what a rule-based prototype can and
cannot do, rather than to fake more than it delivers:

1. **The SVI engine is a transparent heuristic, not a validated clinical
   tool.** It scores keyword/phrase matches, coarse sentiment, and a few
   text-based proxies for distress (fragmented sentences, urgency
   language). It has **not** been validated against real clinical
   outcomes. Before this touches a real complainant, it needs review and
   sign-off from qualified mental-health professionals, and ideally a
   pilot with human-in-the-loop comparison against counsellor judgment.

2. **No real voice/acoustic analysis is implemented.** The brief asks for
   pitch, pause, and speech-pattern analysis. This prototype lets victims
   speak instead of type (via the browser's built-in speech-to-text),
   then scores the *transcript* with the same text engine — it does not
   analyze pitch or pauses in the audio itself. `lib/nlpEngine.js` has a
   `scoreVoiceMeta()` stub with a comment showing exactly where a real
   acoustic pipeline (e.g. openSMILE, praat-parselmouth, or a cloud
   speech-emotion API) would plug in.

3. **Data sensitivity.** This prototype stores narrative text, an
   optional phone number, and risk scores in a plain Postgres database
   with no field-level encryption. Real deployment against real SC/ST
   victims' caste, trauma, and identity data requires actual legal and
   data-protection review (data localization, encryption at rest,
   retention limits, access auditing) before going anywhere near
   production — this prototype does not attempt to solve that.

4. **False negatives are the costliest failure mode.** The engine
   currently biases toward over-flagging (e.g. any suicidal-ideation
   phrase forces CRITICAL regardless of the rest of the score). Keep that
   bias if you tune it further — it is deliberate.

## Extending it

- **More languages**: add a locale block to `lib/i18n.js` and extend the
  `LEXICON` terms in `lib/nlpEngine.js` for that language.
- **Real audio analysis**: wire an acoustic-feature extractor into
  `scoreVoiceMeta()` in `lib/nlpEngine.js` — the scoring pipeline already
  has a slot for it.
- **IVRS integration**: the `/api/report` endpoint accepts a `channel`
  field (`PORTAL`, `CHATBOT`, `IVRS`, `MOBILE_APP`) — an IVRS system can
  POST transcribed call text there directly.
