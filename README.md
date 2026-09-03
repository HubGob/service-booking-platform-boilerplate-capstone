# Service Booking Platform

[![CI](https://github.com/HubGob/service-booking-platform-boilerplate-capstone/actions/workflows/ci.yml/badge.svg)](https://github.com/HubGob/service-booking-platform-boilerplate-capstone/actions/workflows/ci.yml)
[![CD](https://github.com/HubGob/service-booking-platform-boilerplate-capstone/actions/workflows/cd.yml/badge.svg)](https://github.com/HubGob/service-booking-platform-boilerplate-capstone/actions/workflows/cd.yml)

A full-stack service booking platform — React (Vite) frontend, Node.js/Express REST API, MongoDB (Mongoose), Stripe test-mode payments.

## Features

- **Service Marketplace** — Browse services by category, search, paginate
- **Provider Dashboard** — Create services, manage availability, confirm bookings
- **Client Booking** — Book time slots, track status, cancel if needed
- **JWT Authentication** — Access + refresh token rotation, role-based access (client/provider)
- **Stripe Payments** — Test-mode PaymentIntents + webhook signature verification
- **Free Deployment** — Frontend on Vercel, Backend on Render, MongoDB Atlas free tier

## Tech Stack

- **Frontend:** React 18, React Router v6 (lazy loading + Suspense), Vite, Axios, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose, jsonwebtoken, bcryptjs, Stripe
- **Database:** MongoDB Atlas (M0 free tier)
- **Deployment:** Vercel (frontend) + Render (backend)
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest + Supertest (backend), Vitest + React Testing Library (frontend), mongodb-memory-server
- **CI/CD:** GitHub Actions (CI on push/PR, CD on merge to main)

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Stripe account (test mode)

### Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Copy env templates
cp .env.example .env        # backend env vars
# Fill in: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET,
#          STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL

cp frontend/.env.example frontend/.env   # fill in VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY

# Start backend (port 3000)
cd backend && npm run dev

# In another terminal, start frontend (port 5173)
cd frontend && npm run dev
```

Open `http://localhost:5173` — the Vite dev server proxies `/api` requests to the backend.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Backend | Secret for signing refresh tokens |
| `STRIPE_SECRET_KEY` | Backend | Stripe secret key (test mode, `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signing secret |
| `CLIENT_URL` | Backend | Frontend URL (for CORS + webhook success redirect) |
| `VITE_API_URL` | Frontend | Backend API URL (used by Axios) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend | Stripe publishable key (test mode, `pk_test_...`) |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns accessToken + refreshToken)
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Revoke refresh token
- `GET /api/auth/me` — Current user profile (requires auth)

### Services
- `GET /api/services` — List active services (public, filter by `category`, `provider`, `search`)
- `GET /api/services/:id` — Service detail (public)
- `POST /api/services` — Create service (**provider only**)
- `PUT /api/services/:id` — Update service (owner only)
- `DELETE /api/services/:id` — Soft-delete (owner only)

### Availability
- `GET /api/availability?provider=...` — List slots by provider
- `GET /api/availability/provider/:id` — Provider's availability
- `POST /api/availability` — Create slot (**provider only**)
- `PUT /api/availability/:id` — Update slot (owner only)
- `DELETE /api/availability/:id` — Delete slot (owner only)

### Bookings
- `GET /api/bookings` — List bookings (filtered by role: client sees own, provider sees own)
- `GET /api/bookings/:id` — Booking detail (only involved parties)
- `POST /api/bookings` — Create booking (**client only**, creates Stripe PaymentIntent)
- `POST /api/bookings/:id/confirm` — Confirm (**provider only**)
- `POST /api/bookings/:id/cancel` — Cancel (client or provider, not if completed)
- `POST /api/bookings/:id/complete` — Complete (**provider only**)
- `POST /api/webhook/stripe` — Stripe webhook (raw body, signature verified)

## Deployment

### MongoDB Atlas (Database, free)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Network Access → Add IP `0.0.0.0/0` (or your deployment IP)
5. Copy connection string → `MONGODB_URI`

### Backend (Render, free)
1. Push repo to GitHub
2. [Render Dashboard](https://dashboard.render.com) → New Web Service
3. Connect your GitHub repo
4. Build command: `cd backend && npm install`
5. Start command: `cd backend && npm start`
6. Add all environment variables from `.env`
7. Deploy — note the URL (e.g. `https://service-booking-api.onrender.com`)

### Frontend (Vercel, free)
1. [Vercel Dashboard](https://vercel.com) → Add New Project
2. Connect your GitHub repo
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variables:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://service-booking-api.onrender.com`)
   - `VITE_STRIPE_PUBLISHABLE_KEY`
7. Deploy — note the URL (e.g. `https://service-booking-platform.vercel.app`)

### Wiring it together
1. Set Render backend `CLIENT_URL` = your Vercel URL
2. Stripe Dashboard → Developers → Webhooks → Add endpoint at `https://service-booking-api.onrender.com/webhook/stripe`
3. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`
4. Redeploy backend with updated env vars
5. Test the full flow in production

## License

MIT

## Development

### Code Quality

```bash
# Frontend lint & format
npm run lint --workspace=frontend
npm run format:check --workspace=frontend

# Backend lint & format
npm run lint --workspace=backend
npm run format:check --workspace=backend
```

### Tests

```bash
# Frontend tests (Vitest + React Testing Library)
npm run test:run --workspace=frontend
npm run test:coverage --workspace=frontend

# Backend tests (Jest + Supertest + mongodb-memory-server)
npm test --workspace=backend
```

### CI/CD

This project uses GitHub Actions for automated testing and deployment:

- **CI workflow** (`.github/workflows/ci.yml`): Runs on every push/PR to `main`
  - Lints and checks formatting (frontend + backend)
  - Type checks all TypeScript
  - Runs backend tests (Jest) and frontend tests (Vitest)
  - Builds both frontend and backend

- **CD workflow** (`.github/workflows/cd.yml`): Runs on push to `main` or manual trigger
  - Builds the frontend with Vite
  - Deploys frontend to Vercel
  - Triggers backend deploy on Render

Set the following as GitHub repository secrets for CD:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RENDER_SERVICE_ID`, `RENDER_API_KEY`
