# Vibe Music Hub

A mood-based music discovery app built with React, Vite, TypeScript, shadcn/ui, and Supabase.

**GitHub:** https://github.com/kalpana-pardeep-rassani/vibe-music-hub  
**Frontend (Netlify):** *(add your Netlify URL here after deploying)*  
**Backend (Railway):** https://vibe-music-hub-production.up.railway.app  
**Health check:** https://vibe-music-hub-production.up.railway.app/health

---

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Auth & DB | Supabase (PostgreSQL + Row-Level Security)   |
| State     | TanStack Query v5                            |
| Backend   | Express.js (Railway)                         |

---

## Local Development

```bash
# 1. Install frontend dependencies
npm install

# 2. Copy the environment template and fill in your values
cp .env.example .env

# 3. Start the frontend dev server
npm run dev

# 4. (Optional) Start the backend API server
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file from `.env.example` before running locally or deploying.

### Frontend (Netlify) — prefix `VITE_`
| Variable               | Description                        |
|------------------------|------------------------------------|
| `VITE_SUPABASE_URL`    | Your Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key         |

### Backend (Railway)
| Variable                    | Description                               |
|-----------------------------|-------------------------------------------|
| `PORT`                      | Injected automatically by Railway         |
| `NODE_ENV`                  | `production`                              |
| `SUPABASE_URL`              | Supabase project URL                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret (keep safe!) |
| `FRONTEND_URL`              | Netlify URL (used for CORS)               |

---

## Deployment

### 1. Push to GitHub

```bash
git init                       # if not already a git repo
git add .
git commit -m "feat: production-ready deployment setup"
git remote add origin https://github.com/kalpana-pardeep-rassani/vibe-music-hub.git
git push -u origin main
```

### 2. Deploy Frontend → Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**.
2. Select your GitHub repository.
3. Netlify will auto-detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Go to **Site configuration → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy site**.

### 3. Deploy Backend → Railway

> **Note:** The Railway project at `vibe-music-hub-production.up.railway.app` is **already live**.  
> It currently serves the React frontend (deployed via the Lovable platform). To deploy the  
> Express API instead, create a **new Railway service** inside the same project pointed at the  
> `server/` directory, or redeploy with the `railway.toml` config below.

1. In your Railway project → **+ New Service → GitHub Repo**.
2. Select `kalpana-pardeep-rassani/vibe-music-hub`. Railway reads `railway.toml` automatically.
3. Go to **Variables** and add:
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = `https://arwgbowbhgjqnkfwqbvf.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = *(from Supabase dashboard → Settings → API)*
   - `FRONTEND_URL` = your Netlify URL
4. Click **Deploy**. Railway will run `cd server && npm install && npm start`.
5. Test the live API: **https://vibe-music-hub-production.up.railway.app/health**  
   Expected response: `{"status":"ok","service":"vibe-music-hub-server",...}`

### 4. Connect Supabase

- In your Supabase dashboard → **Authentication → URL Configuration**, add your Netlify URL to **Site URL** and **Redirect URLs**.
- Your database migrations in `supabase/migrations/` are already applied to the hosted project.

---

## Project Structure

```
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Auth context
│   ├── data/             # Static song data
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase client + generated types
│   ├── pages/            # Route-level page components
│   └── lib/              # Utility functions
├── server/               # Express.js backend (Railway)
│   ├── index.js          # Entry point
│   └── package.json
├── supabase/             # Supabase config + SQL migrations
├── netlify.toml          # Netlify deployment config
├── railway.toml          # Railway deployment config
└── .env.example          # Environment variable template
```

