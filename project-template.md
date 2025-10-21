Build a Vite + React + TypeScript mini-project “TypeSafe Dashboard” — a modern, strongly-typed frontend demo that teaches strict typing patterns in React, context-driven state management, component composition, and end-to-end TypeScript ergonomics across UI + state + API surface.

Objectives (deliverables)

Project goal

Create a small dashboard app (e.g., user list, metrics cards, and a chart stub) demonstrating strict props typing, context-based state management, typed API integration, and developer-friendly DX (autocomplete, compile-time errors).

Type safety

Use --strict TypeScript settings.

Enforce strict prop types for all components (no any).

Use discriminated unions, Omit/Pick, mapped types and generics where appropriate.

Provide typed hooks (useAuth(), useDashboardState()) and context providers with fully typed state + actions.

Show type-safe data fetching via typed service layer (e.g., apiClient.get<T>('/users')) and propagate types through components.

State management

Implement app-level state using React Context + useReducer or a lightweight typed store (custom or Zustand with TS types). The chosen approach must demonstrate how to keep state types safe and evolve without breaking consumers.

Include an example of derived state selectors and memoization with correct types.

Routing & forms (optional but recommended)

Use react-router (typed routes) for at least two pages (dashboard, details).

Include a typed form component (e.g., edit user) demonstrating controlled inputs with zod or yup for runtime validation mapped to TS types.

Accessibility & UI

Use a simple component library (Tailwind, Chakra, or plain CSS modules) — keep dependencies minimal.

Ensure basic accessibility (a11y) for interactive controls.

Testing

Unit + integration tests using Testing Library + Jest (or Vitest).

Test typed hooks, reducer logic, and components.

Add at least one end-to-end-ish integration test with mocked API responses (msw or fetch mocks).

Aim for ≥ 85% coverage and include npm run coverage to generate reports.

Tooling & DX

Use Vite for dev server and build.

Provide tsconfig.json with strict: true.

ESLint + Prettier configured for React + TypeScript.

package.json scripts: dev, build, preview, test, coverage, lint.

CI

Add a GitHub Actions workflow .github/workflows/ci.yml to run: install, type-check, lint, build, tests, and upload coverage.

Logging & telemetry

Provide a simple typed logger (console-based) and demonstrate usage in services and error boundaries.

Documentation suite

README.md — quickstart, scripts, architecture summary, and examples of type-safety (code snippets showing compile-time errors vs correct usage).

LEARNING.md — approachable explanation of the TypeScript features used (strict props typing, discriminated unions, generics, React.Context, typed reducers, typed async functions) with small code examples and diagrams (ASCII allowed).

GUIDES/ — short, focused guides:

typed-components.md — patterns for typing props, children, HOCs, render props.

typed-context.md — context patterns, useReducer + TS, provider patterns.

typed-fetching.md — typing API clients, handling null/undefined, Awaited<T>.

forms-and-validation.md — mapping runtime validation to TS types.

testing-types.md — how to write tests that respect types and test typed hooks/reducers.

INTERVIEW_QUESTIONS.md — curated interview questions (with short answers/pointers) about React + TypeScript topics used in the app.

ARCHITECTURE.md — combined HLD + LLD: app layers, component hierarchy, state flow, type diagrams, reducer/action shapes, and rationale for chosen patterns.

Example data & demo

Provide sample typed entities (User, Metric, DashboardState) and mocked API responses (local JSON or msw setup).

Provide a demo script or examples/ showing intentionally-incorrect typing that fails to compile (to illustrate type safety).

Project layout (suggested)
type-safe-dashboard/
├─ public/
│  └─ index.html
├─ src/
│  ├─ main.tsx
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ routes.tsx
│  ├─ components/
│  │  ├─ ui/
│  │  │  └─ Card.tsx
│  │  ├─ users/
│  │  │  ├─ UserList.tsx
│  │  │  └─ UserRow.tsx
│  │  └─ charts/
│  │     └─ MetricChart.tsx
│  ├─ context/
│  │  ├─ DashboardProvider.tsx
│  │  └─ useDashboard.ts
│  ├─ hooks/
│  │  └─ useApi.ts
│  ├─ services/
│  │  └─ apiClient.ts
│  ├─ types/
│  │  └─ index.ts
│  ├─ styles/
│  └─ utils/
│     └─ logger.ts
├─ tests/
│  ├─ components/
│  ├─ hooks/
│  └─ integration/
├─ docs/
│  ├─ README.md
│  ├─ LEARNING.md
│  ├─ GUIDES/
│  ├─ INTERVIEW_QUESTIONS.md
│  └─ ARCHITECTURE.md
├─ .github/
│  └─ workflows/ci.yml
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ jest.config.ts (or vitest config)
├─ .eslintrc.cjs
└─ .prettierrc

Tooling & scripts (example package.json scripts)
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint 'src/**/*.{ts,tsx}' --fix",
  "test": "jest",
  "coverage": "jest --coverage"
}

Acceptance criteria

Project builds with Vite and TypeScript strict mode enabled (tsc --noEmit passes).

All components, hooks, and context providers are strongly typed with no any.

Tests run and coverage reported (≥ 85%).

CI workflow runs type-check, lint, build, and tests on pushes/PRs.

README contains detailed setup and run commands and concise examples showing type-safety and also the ci badges showing ci and deployment stated with GH pages.

Documentation suite present: LEARNING.md, GUIDES/, INTERVIEW_QUESTIONS.md, and ARCHITECTURE.md.

Example demonstrating compile-time failure for incorrect prop usage present.