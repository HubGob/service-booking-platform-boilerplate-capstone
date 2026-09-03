# Full-Stack CI/CD + Tailwind Migration Learning Roadmap

## Project: service-booking-platform-boilerplate-capstone

> A full-stack service booking platform (React + Vite frontend, Node.js/Express + MongoDB backend, Stripe payments) — enhanced with Tailwind CSS, frontend testing, and CI/CD.

---

## Phase 1: Tailwind CSS Migration

### Goal
Replace the hand-written CSS (CSS variables + per-page `.css` files) with Tailwind CSS utility classes, while preserving the existing design tokens (colors, spacing, etc.).

### Current State
- **No Tailwind** — the project uses plain CSS with `:root` CSS custom properties
- ~10 `.css` files across `frontend/src/` (1 for layout, 1 per page/component)
- Design tokens defined in `frontend/src/index.css`:
  - `--accent: #6366f1` (indigo-500)
  - `--foreground: #1e293b` (slate-800)
  - `--card: #ffffff`
  - `--border: #e2e8f0` (slate-200)
  - etc.

### Steps
1. Install `tailwindcss`, `postcss`, `autoprefixer`
2. Generate `tailwind.config.js` (or `.cjs`) with content paths
3. Create `postcss.config.js`
4. Update `index.css` to use `@tailwind base`, `@tailwind components`, `@tailwind utilities`
5. Define a custom theme in `tailwind.config.js` that maps the existing CSS variables (so the color palette stays identical)
6. Convert page CSS files to Tailwind utility classes — starting with the most complex pages (Services, Dashboard) and keeping it incremental

### Learning Outcomes
- How Tailwind's JIT compiler works
- Configuring custom themes (extending Tailwind with your own design system)
- Migrating from CSS classes to utility-first approach
- PurgeCSS/content configuration for production builds

---

## Phase 2: Frontend Testing (Vitest + React Testing Library)

### Goal
Add a modern frontend testing setup and write meaningful unit/component tests.

### What's Missing
- No test runner installed (Vitest recommended — Vite-native, zero config)
- No test library (React Testing Library is the standard)
- No test environment configured (need jsdom for DOM APIs)

### Steps
1. Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
2. Add `vitest.config.ts` (or use Vite's built-in test config)
3. Create `frontend/src/setupTests.ts` with jest-dom matchers
4. Write tests:
   - **Header component** — test rendering, auth state (logged in vs logged out), logout button
   - **Home component** — test hero section, featured services rendering (with mocked fetch)
   - **AuthContext** — test provider, login/logout state management
   - **ProtectedRoute** — test redirect behavior for unauthenticated users
5. Add `test` script to `frontend/package.json`

### Learning Outcomes
- Vitest configuration and CLI usage
- React Testing Library patterns (render, screen, userEvent)
- Mocking fetch/API calls
- Testing React context providers
- Testing route protection logic
- TDD workflow: write failing test → implement → green

---

## Phase 3: CI/CD with GitHub Actions

### Goal
Automate testing, type-checking, and building for both frontend and backend on every push and pull request.

### Current State
- **No CI/CD** — no `.github/workflows/` directory exists
- Backend has Jest tests but nothing runs automatically
- Frontend has no tests yet (see Phase 2)
- `render.yaml` exists for backend deployment but no automated pipeline

### Steps
1. Create `.github/workflows/ci.yml`:
   - Trigger on `push` (main branch) and `pull_request`
   - Checkout code + setup Node.js
   - Install root monorepo deps + workspace deps
   - Run backend tests (`npm test --workspace=backend`)
   - Run frontend tests (`npm test --workspace=frontend`)
   - Run TypeScript type checking on both (`tsc --noEmit`)
   - Build frontend for production (`npm run build --workspace=frontend`)
2. Add CI status badge to `README.md`
3. Optionally: Add a separate `deploy.yml` workflow that deploys to Vercel/Render on merge to main

### Learning Outcomes
- GitHub Actions YAML syntax and best practices
- Job/step structure, dependency caching
- Running tests in parallel for monorepo workspaces
- Type checking as a CI gate
- Status badges and README documentation
- Separation of CI (on PR) vs CD (on merge)

---

## Phase 4: Verification & Polish

### Goal
Ensure everything is wired up and working end-to-end.

### Steps
1. Run the full test suite locally (`npm test` at root)
2. Verify TypeScript compilation passes for both frontend and backend
3. Verify production build succeeds for frontend
4. Commit everything with a meaningful message
5. Push to GitHub and confirm the CI workflow runs green

---

## Key Skills You'll Practice

| Skill | Where |
|---|---|
| **Build tool integration** (Vite + Tailwind + PostCSS) | Phase 1 |
| **Utility-first CSS** vs traditional CSS | Phase 1 |
| **Component testing** (React Testing Library) | Phase 2 |
| **Test runners** (Vitest, Jest) | Phase 2 |
| **Mocking** (fetch, API calls) | Phase 2 |
| **Context/provider testing** | Phase 2 |
| **GitHub Actions** (CI pipelines, jobs, caching) | Phase 3 |
| **Monorepo tooling** (npm workspaces) | Phase 3 |
| **TypeScript as a quality gate** | Phase 3 |
| **Production builds** (Vite build, Render deploy) | Phase 3-4 |

---

## Execution Order

We'll build this incrementally — each phase delivers working, committed code:

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

You'll be able to run tests and see the Tailwind styles at every checkpoint.
