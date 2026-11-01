# My Spend

A personal expense tracker. Log income and expenses, set a weekly or monthly budget, and see where your money goes with charts and reports. The budget bar changes from green to red as you spend, and you get a warning at 80% and again at 100%.

Built with React, Express and Supabase, and deployable to Vercel.

---

## Features

- **Accounts:** register, log in and log out with email and password. Sessions persist until you log out.
- **Transactions:** add, edit and delete income and expenses with an amount, title, category, date and a note for where it was spent.
- **Search and filters:** search by title or note, and filter by type, category, date range and amount range. Results are paginated.
- **Budget:** one active weekly (Mon–Sun) or monthly limit. The progress bar and badge move through four levels:

  | Used | Level |
  |---|---|
  | 0–50% | On track (green) |
  | 50–75% | Watch it (olive-yellow) |
  | 75–100% | Careful (orange) |
  | 100%+ | Over limit (red) |

- **Alerts:** a toast at 80% and at 100% of your budget, shown once per budget period.
- **Analytics:** daily, weekly and monthly grouping, with a bar chart (income vs expenses), a category donut and a cumulative spending trend.
- **Reports:** pick a month to see totals and a category breakdown.
- **CSV export:** download your transactions, either with the current filters or for a chosen month.
- **Settings:** display name, currency and theme (light, dark or system).
- **Responsive:** sidebar on desktop, bottom navigation on mobile, with a floating **+** button for quick entry.

---

## Tech stack

**Frontend (`client/`)**

| Area | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3, with CSS variables for light and dark themes |
| Routing | React Router 6 |
| State | Zustand |
| Forms and validation | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Toasts | Sonner |
| Dates | date-fns |

**Backend (`server/`)**

| Area | Technology |
|---|---|
| Runtime | Node.js 20+ (ES modules) |
| Framework | Express 5 |
| Validation | Zod |
| Database client | `@supabase/supabase-js` |

**Database and auth**

- Supabase: PostgreSQL and Supabase Auth (email and password)
- Row Level Security (RLS) on every table

**Deployment and tooling**

- Vercel (two projects: the client as a static build, the server as a serverless function)
- GitHub Actions for CI

---

## How it works

```
Browser (React)
   |-- login / signup ----------> Supabase Auth + Postgres (RLS)
   |
   |-- API calls + Bearer token -> Express API
                                   (checks the token, queries as the user)
                                   |
                                   +--> Supabase Postgres (RLS applies)
```

1. The browser logs in with Supabase and receives an access token.
2. Every API request sends that token as `Authorization: Bearer <token>`.
3. The server verifies the token, then creates a Supabase client that acts **as that user**.
4. Postgres Row Level Security makes sure users can only read and write their own rows.

Because of step 3 and 4, the server never needs the Supabase `service_role` key.

---

## Project structure

```
my-spend/
├── client/                 React app
│   ├── src/
│   │   ├── components/     layout, ui, common, transactions, budget, charts
│   │   ├── pages/          Landing, Login, Register, Dashboard, Transactions,
│   │   │                   Analytics, Budget, Reports, Settings
│   │   ├── store/          Zustand stores (auth, transactions, theme)
│   │   ├── hooks/          useBudget, useAnalytics, useCountUp, useDebounce
│   │   ├── lib/            supabase client, axios instance, utils, constants
│   │   └── schemas/        Zod form schemas
│   └── vercel.json
├── server/                 Express API
│   ├── api/index.js        Vercel serverless entry
│   ├── src/
│   │   ├── app.js          Express app
│   │   ├── server.js       local dev entry
│   │   ├── middleware/     auth, validate, error handler
│   │   ├── routes/         transactions, budget, analytics, export
│   │   ├── schemas/        Zod request schemas
│   │   └── utils/          filters, budget health levels
│   └── vercel.json
├── supabase/schema.sql     tables, seed categories, trigger, RLS policies
└── .github/workflows/ci.yml
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) account

### 1. Set up Supabase

1. Create a new project and wait for it to finish provisioning.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and click **Run**. You should then see the tables `profiles`, `categories`, `transactions` and `budgets`, and 7 rows in `categories`.
3. Open **Project Settings → API Keys** and copy:
   - the **Project URL** (`https://xxxx.supabase.co`)
   - the **anon** (public) key, or the **publishable** key (`sb_publishable_...`)
4. *(Optional, for local testing)* Go to **Authentication → Sign In / Providers → Email** and turn off **Confirm email** so new accounts can log in immediately.

> Never use the `service_role` or secret key in this project.

### 2. Run the backend

```bash
cd server
cp .env.example .env      # Windows (cmd/PowerShell): copy .env.example .env
```

Edit `server/.env`:

```
PORT=4000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:4000/api/health. You should see `{"ok":true}`.

### 3. Run the frontend

In a second terminal:

```bash
cd client
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `client/.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:4000/api
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Environment variables

| File | Variable | Purpose |
|---|---|---|
| `server/.env` | `PORT` | Local API port (default 4000) |
| `server/.env` | `CLIENT_URL` | Allowed CORS origin(s), comma-separated |
| `server/.env` | `SUPABASE_URL` | Your Supabase project URL |
| `server/.env` | `SUPABASE_ANON_KEY` | Supabase anon or publishable key |
| `client/.env` | `VITE_SUPABASE_URL` | Same project URL |
| `client/.env` | `VITE_SUPABASE_ANON_KEY` | Same key as the server |
| `client/.env` | `VITE_API_URL` | Backend base URL, must end in `/api` |

The URL and key must be **identical** in both files. After editing a `.env` file, stop and restart the dev server, because neither Vite nor the server reloads env files while running.

---

## Using the app

1. **Register** an account, then log in.
2. Go to **Budget** and set a weekly or monthly limit (for example 500).
3. Press the **+** button to add an expense or income. Pick a category, date and an optional note.
4. Watch the dashboard and budget bar update as you add transactions.
5. Use **Transactions** to search, filter, edit, delete or download a CSV.
6. Open **Analytics** to switch between daily, weekly and monthly views.
7. Open **Reports** to review a single month.
8. Use **Settings** to change your name, currency or theme, or to log out.

---

## API reference

All routes except the health check require `Authorization: Bearer <access_token>`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | List with filters: `type`, `category_id`, `from`, `to`, `min`, `max`, `q`, `page`, `limit` |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budget` | Current budget plus spend in the current week or month |
| PUT | `/api/budget` | Create or replace the budget |
| GET | `/api/analytics/summary` | Totals, time series and category breakdown (`from`, `to`, `groupBy=day\|week\|month`) |
| GET | `/api/export/csv` | CSV export (same filters as the list route) |

---

## Deploying to Vercel

The client and server are deployed as **two separate Vercel projects** from the same repository. Deploy the server first.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: my spend app"
git branch -M main
git remote add origin https://github.com/YOUR-USER/my-spend.git
git push -u origin main
```

Confirm no `.env` file was uploaded. Only the `.env.example` files should be in the repo.

### 2. Deploy the backend

1. In Vercel, choose **Add New → Project** and import the repository.
2. Set **Root Directory** to `server` and **Framework Preset** to `Other`. Leave the build and output fields empty.
3. Add environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CLIENT_URL` (use `http://localhost:5173` for now).
4. Deploy, then check `https://YOUR-SERVER.vercel.app/api/health`.

### 3. Deploy the frontend

1. Import the same repository again as a second project.
2. Set **Root Directory** to `client`, **Framework Preset** to `Vite`, **Build Command** to `npm run build`, and **Output Directory** to `dist`.
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` set to `https://YOUR-SERVER.vercel.app/api`.
4. Deploy.

### 4. Connect them

1. In the **server** project, set `CLIENT_URL` to your client URL (no trailing slash) and **redeploy** the server. Environment changes only apply to new deployments.
2. In Supabase, go to **Authentication → URL Configuration**. Set **Site URL** to your client URL and add the client URL (and `http://localhost:5173`) to **Redirect URLs**.

Before launching publicly, turn **Confirm email** back on in Supabase.

### CI

`.github/workflows/ci.yml` builds the client and checks that the server loads on every push and pull request. It uses `npm ci`, so keep the `package-lock.json` files committed.

---

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Blank page, "supabaseUrl is required" | `client/.env` is missing or wrong. Restart `npm run dev`. |
| CORS error | `CLIENT_URL` on the server must exactly match the frontend origin (including port, no trailing `/`). Restart or redeploy the server. |
| `Invalid or expired token` | The server and client use different Supabase URLs or keys, the server was not restarted after editing `.env`, or a stale session is stored. Make both `.env` files match, restart both servers, and clear the site's local storage. |
| `Email not confirmed` | Confirm via the email link, turn off **Confirm email** in Supabase, or confirm the user manually in **Authentication → Users**. |
| Empty category dropdown | The seed `insert` in `schema.sql` did not run. Run it again. |
| Production 404 on page refresh | `client/vercel.json` is missing, or the Root Directory is not `client`. |
| Production API 404 | `VITE_API_URL` is missing the `/api` suffix, or the server's Root Directory is not `server`. |
| `npm install` slow or erroring on Windows | Move the project out of OneDrive-synced folders. |
| `npm audit` warnings | Mostly dev-tool advisories. Do not run `npm audit fix --force`, which can break dependencies. |

---

## Security notes

- Real `.env` files are git-ignored. Never commit them.
- Use only the **anon / publishable** key. It is safe in the browser because Row Level Security protects the data.
- Never put the `service_role` or secret key in the client, the server, or the repository.
- Spreadsheet formula injection is blocked in CSV exports (cells starting with `=`, `+`, `-` or `@` are escaped).

