# DebugMate AI

DebugMate AI is a responsive developer troubleshooting dashboard built with React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Lucide, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

By default the application uses realistic in-memory sample data and a progressive mock AI response. No API key is needed in the frontend.

To connect a backend, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend's API root. The backend should provide:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/dashboard` | Dashboard statistics, trends, reports, and recommendations |
| GET | `/logs` | Application log events |
| GET | `/analytics` | Analytics chart series |
| GET | `/conversations` | Troubleshooting conversations |
| POST | `/conversations` | Create a conversation |
| PUT | `/conversations/:id` | Update a conversation |
| DELETE | `/conversations/:id` | Delete a conversation |
| POST | `/analysis/stream` | Stream analysis text for a submitted log |

The streaming endpoint accepts JSON `{ "logs": "...", "language": "...", "category": "..." }` and returns a readable response body (SSE-compatible responses are also readable). Keep AI provider credentials and model calls on the backend; this application never contains provider keys.

## Scripts

- `npm run dev` — local development server
- `npm run build` — TypeScript check and production build
- `npm run test` — Vitest and React Testing Library unit tests
- `npm run test:e2e` — Playwright browser tests
- `npm run preview` — serve the production build locally

Install the Playwright browser once before running end-to-end tests with `npx playwright install chromium`.

## Architecture

```text
src/
  components/  Shared layout, accessible UI primitives, and error boundary
  data/        Mock API data used when no backend URL is configured
  hooks/       Reusable hooks (debounced search)
  pages/       Dashboard, analysis, logs, history, analytics, assistant, settings
  services/    Central Axios API client and streaming analysis service
  test/        Vitest setup
  types.ts     API and domain contracts
e2e/           Playwright user-flow tests
```

TanStack Query owns server-state caching and invalidation. The service layer is the only layer that knows whether data comes from the configured backend or local fixtures; pages consume typed service methods rather than making API requests directly. The analysis workspace streams incrementally and cancels in-flight work with `AbortController`.
