# AGENTS.md - EasyPIVA Coding Guidelines

## Build, Lint, Test

```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npm run test         # Vitest unit/integration tests
npm run test:e2e     # Playwright end-to-end tests on port 4173
npm run format       # Prettier write
npm run format:check # Prettier check
npm run ci           # Full local/CI verification pipeline
```

Install dependencies with `npm ci`. npm is the canonical package manager for this repository.

## Tech Stack

- React 19, TypeScript 5, Vite 6.
- Tailwind CSS v4 with `@tailwindcss/vite`.
- Base UI / shadcn-style primitives in `components/ui/`.
- Zustand for local client state.
- React Hook Form and Zod for validated forms.
- Recharts, motion, jsPDF, and html2canvas for charts, animation, and PDF export.
- Vitest for unit/UI tests and Playwright for E2E.

## Project Structure

```text
src/
  pages/           # Route pages, lazy loaded in App.tsx
  components/      # App components
  lib/
    calculations/  # Pure fiscal domain logic
    quote/         # Quote builder model, pagination, export
    fiscal-data.ts # Fiscal constants and ATECO categories
    number-input.ts # Numeric input normalization helpers
    public-copy.ts # Public warning/disclaimer copy
  store/           # Zustand stores
  test/            # Vitest setup and storage mocks
components/ui/     # Shared UI primitives
tests/e2e/         # Playwright tests
docs/              # Architecture, privacy, fiscal assumptions
```

## Coding Rules

- Keep fiscal calculations pure and covered by tests.
- Centralize tax thresholds and rates in `src/lib/fiscal-data.ts`.
- When changing fiscal assumptions, update code, `docs/ADRs/0001-fiscal-assumptions.md`, and public copy together.
- Normalize numeric form inputs through shared helpers instead of ad hoc `Number(...)` parsing.
- Use the `DomainWarning` pattern plus `warningCopy` for user-facing fiscal warnings.
- Keep browser storage access behind `src/lib/browser-storage.ts`.
- Preserve the local-first/no-backend architecture unless explicitly changing product scope.

## Testing Rules

- Add or update Vitest tests for every fiscal behavior change.
- Add UI tests when form validation or user-visible copy changes.
- Keep Playwright on its dedicated port via `npm run dev:e2e`; do not reuse port 3000 for E2E.
- Run `npm run ci` before considering work complete.

## GitHub Repository Hygiene

- Keep `.github/workflows/ci.yml`, `.github/dependabot.yml`, and `.github/workflows/dependency-review.yml` aligned with `package.json` scripts.
- Update `docs/repository-governance.md` when repository settings, branch protection recommendations, or supply-chain policy change.
- Use the PR template checklist for maintainer reviews.
- Do not route security reports through public issues; follow `SECURITY.md`.

## Style

- UI copy is Italian.
- Prefer `@/` imports for `src/` and `@/components/` for UI primitives.
- Use `type` imports for type-only imports.
- Use `cn()` for class merging.
- Keep comments sparse and useful; avoid restating obvious code.
