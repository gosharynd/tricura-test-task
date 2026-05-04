# Policy Review Dashboard

Frontend assessment for Tricura Insurance Group — a policy review dashboard built with React + TypeScript.

## Setup

```bash
# Start backend (from project root)
cd backend && npm install && npm run dev

# Start frontend (from project root)
cd frontend && pnpm install && pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Swagger docs: http://localhost:4000/docs

## Tech Stack

- React 18 + TypeScript + Vite
- React Router v6 (URL-driven filter state)
- TanStack Query v5 (server state + caching)
- shadcn/ui + Tailwind CSS v4
- react-hook-form + Zod (form validation)
- openapi-typescript (API type generation)

## Architecture

Feature-based structure under `src/features/policies/`:

- **api/** — fetch functions + TanStack Query hooks
- **filters/** — 3-layer filter architecture (schema → serialization → URL hook)
- **components/** — page, table, modals, detail panel

Filters and pagination live in URL search params. UI-only state (expanded row, modal visibility) lives in React state.

## Assumptions

- API `region` filter accepts single value — multi-region selection uses client-side filtering
- Risk level computed on frontend: High (>=0.70), Medium (>=0.40), Low (<0.40)
- Table sorting is client-side on current page data (API doesn't support sort)
- Days until renewal is user-editable in the form (could be computed from effective date)

## Tradeoffs

- No virtualization — max 20 rows visible, not needed
- No global state management — TanStack Query + URL params cover all cases
- Filters modal uses draft state to avoid intermediate API calls while adjusting sliders
- Single region sent to API when only one selected; multi-region filtered client-side

## What I'd improve with more time

- Server-side sorting via API enhancement
- Debounced search input (currently fires on every keystroke)
- Unit tests for filter serialization layer
- E2E tests for full CRUD workflow
- Better mobile responsiveness
- Optimistic updates for mutations
