# AGENTS.md - EasyPIVA Coding Guidelines

## Build / Lint / Test Commands

```bash
# Development
bun dev              # Start dev server on port 3000

# Build & Preview
bun run build        # Production build to dist/
bun run preview      # Preview production build

# Quality Checks
bun run typecheck    # TypeScript check (tsc --noEmit)
bun run lint         # ESLint check
bun run test         # Run all tests (vitest run)
bun run test:watch   # Watch mode for tests

# Single test file
bun test src/lib/calculations/index.test.ts

# Single test by name
bun test -- --testNamePattern="calculateForfettario"

# Formatting
bun run format       # Prettier write
bun run format:check # Prettier check

# CI pipeline
bun run ci           # format:check + typecheck + lint + test + build
```

## Tech Stack

- **React 19** + **TypeScript 5.8** + **Vite 6**
- **Tailwind CSS v4** with `@tailwindcss/vite`
- **Zustand** for state management (with persist middleware)
- **React Hook Form** + **Zod** for forms and validation
- **Recharts** for charts, **motion** (framer-motion) for animations
- **jsPDF** + **html2canvas** for PDF export
- **shadcn/ui** components (located in `/components/ui/`)

## Project Structure

```
src/
  pages/           # Route pages (lazy loaded)
  components/      # React components (non-ui)
  lib/
    calculations/  # Pure business logic (well tested)
    quote/         # Quote builder logic
    fiscal-data.ts # Tax constants and ATECO categories
    format.ts      # Currency/date formatting
    public-copy.ts # UI text constants
  store/           # Zustand stores
  test/setup.ts    # Vitest setup
components/ui/     # shadcn/ui components (Button, Input, etc.)
```

## Code Style Guidelines

### Imports

- Use `@/` alias for src imports: `import { Button } from '@/components/ui/button'`
- Use `@/components/` for shadcn UI components (resolves to `./components/`)
- Group imports: React, external libs, internal (@/), types, styles
- Use `type` imports: `import type { ForfettarioInput } from './types'`

### Formatting (Prettier)

- semi: true
- singleQuote: true
- trailingComma: 'all'
- printWidth: 100
- No parentheses around single arrow function params

### Types & Naming

- **Types**: PascalCase, descriptive: `ForfettarioInput`, `InpsCalculation`
- **Functions**: camelCase, verb-noun: `calculateInps`, `formatCurrency`
- **Components**: PascalCase, noun: `Button`, `QuoteBuilder`
- **Constants**: UPPER_SNAKE_CASE for true constants: `LIMITS.ricavi`
- **Files**: kebab-case for utilities, PascalCase for components
- Use explicit return types for exported functions
- Prefer `interface` for object shapes, `type` for unions/aliases

### Error Handling

- Guard clauses for early returns (see `calculateInps`)
- Use Zod for runtime validation
- Type narrowing with `typeof` checks
- Optional chaining for nested access: `parsed.state?.hasAcceptedDisclaimer`

### Components

- Use `cva` (class-variance-authority) for variant-based components
- Forward refs where needed
- Use `cn()` utility from `@/lib/utils` for class merging
- Dark mode: use `dark:` prefix classes, not conditional logic

### Business Logic

- Keep calculations pure (no side effects)
- Input types in `types.ts`, implementations in named files
- Test business logic thoroughly (see `src/lib/calculations/*.test.ts`)
- Use `DomainWarning` pattern for validation feedback

### State Management

- Zustand stores in `src/store/`
- Use `persist` middleware for localStorage
- Handle SSR safely: `typeof window === 'undefined'` checks

### Testing

- Vitest with jsdom environment
- Tests alongside source files: `*.test.ts`
- E2E tests in `tests/e2e/` (Playwright)
- Use `@testing-library/react` for component tests
- Mock external libs (html2canvas, localStorage)

## Key Patterns

### View Transitions API

```typescript
// Type augmentation exists in src/types/view-transitions.d.ts
if (document.startViewTransition) {
  const transition = document.startViewTransition(() => {
    flushSync(() => toggleThemeMode());
  });
  transition.finished.finally(() => {
    /* cleanup */
  });
}
```

### Currency Formatting

```typescript
import { formatCurrency } from '@/lib/format';
formatCurrency(value, 0); // "€1.234"
```

### Warning Pattern

```typescript
type DomainWarning = { code: WarningCode; severity: 'warning' | 'critical' };
// Use warningCopy from '@/lib/public-copy' for UI text
```

## Performance Notes

- HMR disabled in AI Studio (DISABLE_HMR env var)
- Lazy load pages in App.tsx
- html2canvas is dynamically imported only when needed

## Italian Language

- All UI copy is in Italian
- Comments should be in English for code clarity
