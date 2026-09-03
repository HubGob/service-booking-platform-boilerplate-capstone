# Full-Stack CI/CD + Tailwind Learning Roadmap

## Project: service-booking-platform
## Goal: Transform into a complete full-stack CICD/testing learning project

---

## Phase 1: Code Quality (ESLint + Prettier)
**Purpose:** Establish consistent code style and catch linting errors before CI/CD runs.

- [ ] Install ESLint + Prettier + TypeScript ESLint
- [ ] Create `.eslintrc.json` and `.prettierrc`
- [ ] Add lint/format scripts to `frontend/package.json`
- [ ] Create `.prettierignore` (exclude `dist/`, `node_modules/`)

---

## Phase 2: Tailwind CSS Migration
**Purpose:** Learn modern CSS utility-first styling while seeing immediate visual results.

- [ ] Install Tailwind CSS v4 + PostCSS + Autoprefixer
- [ ] Initialize `tailwind.config.ts`
- [ ] Update `frontend/index.html` — add `@import` for Tailwind directives
- [ ] Create a conversion strategy: convert `index.css` tokens → Tailwind config theme
- [ ] Pick one page (e.g., `Home.tsx`) to migrate as a demonstration
- [ ] Show how to replace `Home.css` classes with Tailwind utility classes

**Learning outcome:** Understand how to bridge vanilla CSS variables to Tailwind's theme system.

---

## Phase 3: Frontend Testing (Vitest + React Testing Library)
**Purpose:** Learn component testing, DOM assertions, and test-driven thinking.

- [ ] Install Vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] Create `frontend/vitest.config.ts`
- [ ] Set up test environment (jsdom + global test setup)
- [ ] Write tests for:
  - `Header.tsx` — renders links correctly
  - `LoadingSpinner.tsx` — renders when `isLoading` prop is true
  - A page component — e.g., `Services.tsx` with mock API
- [ ] Add test scripts to `frontend/package.json`

**Learning outcome:** Component testing, mocking API calls, DOM assertions.

---

## Phase 4: CI/CD (GitHub Actions)
**Purpose:** Learn how automated testing, type checking, and linting work in practice.

### CI Workflow (`.github/workflows/ci.yml`)
- Trigger: `push` / `pull_request` on `main` branch
- Jobs:
  1. **Lint & Format** — ESLint + Prettier check
  2. **Backend Tests** — Install deps, run Jest, upload coverage
  3. **Frontend Tests** — Install deps, run Vitest, upload coverage
  4. **Type Check** — Run `tsc --noEmit` on both frontend and backend
  5. **Build** — `npm run build` for frontend, `npm run build` for backend

### CD Workflow (`.github/workflows/deploy.yml`)
- Trigger: `push` on `main` (after CI passes)
- Jobs:
  1. **Deploy Frontend** — Vercel Action (build + deploy)
  2. **Deploy Backend** — Render deploy (via git, or API trigger)
- **Manual approval** step before deployment

**Learning outcome:** Full pipeline understanding — from PR to production.

---

## Phase 5: Integration & Verification
- [ ] Run CI locally to verify workflows
- [ ] Add badge to README (build status, coverage)
- [ ] Write a "how to run tests" section in README
- [ ] Final verification: push a commit, watch GitHub Actions run

---

## Key Learnings by Phase
| Phase | Skill |
|---|---|
| 1 (ESLint/Prettier) | Code quality gates, consistent style |
| 2 (Tailwind) | Modern CSS, theme tokens, utility-first styling |
| 3 (Vitest/RTL) | Component testing, mocking, DOM assertions |
| 4 (GitHub Actions) | CI pipelines, test matrices, deployment automation |
| 5 (Integration) | End-to-end workflow verification |
