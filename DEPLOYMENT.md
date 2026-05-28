# Deploy LoanGo to Vercel + Render + Neon

## Overview

- **Frontend (Vercel)**: Expo web app served as static SPA
- **Backend (Render)**: Express API server
- **Database (Neon)**: PostgreSQL via Drizzle ORM

## Prerequisites

1. **Vercel account** + CLI installed (`npm i -g vercel`)
2. **Render account** + CLI installed (`npm i -g @render/cli`)
3. **Neon account** (create project at https://neon.tech)

## Step 1: Neon Database

1. Create a new project in Neon
2. Copy the connection string (looks like `postgresql://...`)
3. Set the `DATABASE_URL` env var in Render (see Step 3)

## Step 2: Vercel (Frontend)

### Option A: Vercel CLI (recommended)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: Git Integration

1. Push your repo to GitHub
2. Import the project in Vercel dashboard
3. Set the **Root Directory** to `.`
4. Vercel will use `vercel.json` for the build configuration

### Required Environment Variables

Set these in Vercel Dashboard (Project Settings → Environment Variables):

- `EXPO_PUBLIC_API_URL` = `https://your-render-api.onrender.com` (your Render API URL)
- `REPL_ID` = `your-repl-id` (or any placeholder if not using Replit Auth)

### Important: SPA Routing

The `vercel.json` already handles SPA routing (all paths fall back to `index.html`).

## Step 3: Render (Backend)

### Option A: Render Blueprint (recommended)

The `render.yaml` file is included. Deploy via:

```bash
render blueprint create render.yaml
```

Or upload via Render Dashboard → New Blueprint.

### Option B: Manual Service

1. Create a new **Web Service** in Render
2. Connect your GitHub repo
3. Set:
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
   - **Start Command**: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
4. Set environment variables (see below)

### Required Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Neon dashboard |
| `SESSION_SECRET` | `openssl rand -hex 32` | Generate yourself |
| `ISSUER_URL` | `https://replit.com/oidc` | Default (or your OIDC provider) |
| `REPL_ID` | `your-repl-id` | Replit or any placeholder |
| `FRONTEND_URL` | `https://your-vercel-app.vercel.app` | Vercel app URL |
| `NODE_ENV` | `production` | Hardcoded |
| `PORT` | `8080` | Hardcoded |

## Step 4: Configure Auth for Cross-Origin

The current auth uses cookies with `sameSite: lax`. For cross-origin deployment (Vercel frontend → Render backend), you need to change the cookie settings.

### Update `artifacts/api-server/src/routes/auth.ts`

Change the `setSessionCookie` function:

```typescript
function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // Changed from "lax" for cross-origin
    path: "/",
    maxAge: SESSION_TTL,
  });
}
```

Also change `setOidcCookie`:

```typescript
function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // Changed from "lax" for cross-origin
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}
```

### Update CORS in `artifacts/api-server/src/app.ts`

Change the CORS configuration to allow your Vercel domain:

```typescript
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL || "https://your-vercel-app.vercel.app",
}));
```

**Note**: If you want to allow multiple origins, use a function:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://loango.vercel.app",
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
```

## Step 5: Rebuild and Deploy

After making the auth changes:

```bash
# Rebuild the API
pnpm --filter @workspace/api-server run build

# Rebuild the frontend
pnpm --filter @workspace/mobile run build

# Redeploy both
vercel --prod
# And trigger a new Render deploy
```

## Alternative: Using Replit Auth with Custom Domain

If you want to keep using Replit Auth (OIDC) on your own domain:

1. You need a custom domain that Replit can configure (e.g., via Cloudflare)
2. Point both your Vercel and Render domains to the same base domain
3. Example: `app.loango.com` (Vercel) and `api.loango.com` (Render)
4. Configure Replit Auth to accept your custom domain

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Render        │     │   Neon          │
│   (Frontend)    │────▶│   (Backend)     │────▶│   (Database)    │
│   Static SPA    │     │   Express API   │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │   API calls          │
         │   + cookies          │
         │                      │
         ▼                      ▼
  https://loango.vercel.app   https://loango-api.onrender.com
```

## Troubleshooting

### CORS Errors

- Make sure `FRONTEND_URL` is set correctly on Render
- Make sure `sameSite: "none"` is set on cookies
- Make sure `credentials: true` is set on CORS

### Auth Not Working

- Check that cookies are being sent in the Network tab
- Check that the `sid` cookie is present after login
- Verify that `REPL_ID` matches your Replit Auth configuration
- Check that the callback URL is correct (`https://your-render-api.onrender.com/api/callback`)

### Database Connection Errors

- Verify `DATABASE_URL` is set in Render
- Check that Neon allows connections from Render's IP range
- Test the connection with `psql $DATABASE_URL`

## Local Testing

To test the cross-origin setup locally:

```bash
# Terminal 1: Start API on port 8080 with FRONTEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000 pnpm --filter @workspace/api-server run dev

# Terminal 2: Serve the built frontend on port 3000
pnpm --filter @workspace/mobile run build
npx serve artifacts/mobile/dist -l 3000
```

Then visit `http://localhost:3000` and test the full flow.
