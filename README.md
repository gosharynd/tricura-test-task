# Policy Review Dashboard

A policy review dashboard for Tricura Insurance Group — browse, filter, create, edit, and delete insurance policies with an expandable detail view.

## Setup

```bash
pnpm install
pnpm dev
```

App runs at http://localhost:5173

## Environment

Copy `.env.example` to `.env` and adjust if needed:

```
VITE_API_BASE_URL=http://localhost:4000
```

Vite loads `.env` natively — no extra dependencies required.

## Tech Stack

- React 19 + TypeScript + Vite
- React Router v7 (URL-driven filter/pagination state)
- TanStack Query v5 (server state, caching, mutations)
- shadcn/ui + Tailwind CSS v4
- react-hook-form + Zod v4 (form validation)
- sonner (toast notifications)
- lucide-react (icons)

## Features

- **Policy list** — paginated table with configurable page size (5/10/20)
- **Search** — debounced (300ms) search by account name
- **Advanced filters** — modal with region checkboxes, date range, premium/claims/risk range sliders; filters combined with AND; active filter count shown on button; removable filter chips
- **Expandable rows** — click a row to fetch and display full policy details (renewal, financials, compliance)
- **CRUD** — create/edit policy via form modal with Zod validation; delete with confirmation dialog
- **Risk levels** — computed on frontend: High (>=0.70), Medium (>=0.40), Low (<0.40) with color-coded badges
- **Error/empty/loading states** — skeleton loaders, error panels with retry, empty state with actions
- **Toast notifications** — success/error feedback on mutations

## Architecture

Feature-based structure under `src/features/policies/`:

```
api/
  api.ts          — fetch functions (list, get, create, update, delete)
  queries.ts      — TanStack Query hooks with query key factory
filters/
  schema.ts       — Zod filter schema + active filter counting
  serialization.ts — URL search param serialization/deserialization
  hook.ts         — usePolicyFilters hook (reads/writes URL params)
components/
  PoliciesPage.tsx    — page layout, search bar, filter/form modal orchestration
  PoliciesTable.tsx   — table with pagination, row expansion, delete confirm
  PolicyRow.tsx       — single table row
  PolicyDetail.tsx    — expandable detail panel (3-column: renewal, financials, compliance)
  FiltersModal.tsx    — advanced filters with draft state
  PolicyFormModal.tsx — create/edit form
  FilterChips.tsx     — active filter pills with remove
  RiskBadge.tsx       — color-coded risk level badge
```

Shared components in `src/components/`:
- `ui/` — shadcn primitives (button, dialog, table, select, slider, etc.)
- `common/` — reusable app components (ConfirmDialog, DateInput, RangeSlider, ErrorState, EmptyState, TableSkeleton)

### Key patterns

- **Filters live in URL** — all filter/pagination state serialized to search params via custom hook, enabling shareable URLs and browser back/forward
- **Draft filter state** — FiltersModal keeps local draft, applies on confirm to avoid intermediate API calls
- **Client-side region filtering** — API accepts single region; when multiple regions selected, filtering happens client-side
- **Query key factory** — structured cache keys for granular invalidation on mutations
- **API client** — thin `apiFetch` wrapper with typed `ApiError` class, auto Content-Type for JSON bodies

## API Integration

The app expects a REST API at `VITE_API_BASE_URL` with these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/policies` | List policies (paginated, filterable) |
| GET | `/policies/:id` | Get policy details |
| POST | `/policies` | Create policy |
| PATCH | `/policies/:id` | Update policy |
| DELETE | `/policies/:id` | Delete policy |

To regenerate TypeScript types from the backend OpenAPI schema:

```bash
pnpm codegen:api
```

## Tradeoffs

- No virtualization — max 20 rows per page, not needed
- No global state management — TanStack Query + URL params cover all cases
- Table sorting is client-side on current page data (API doesn't support sort params)
- Days until renewal is user-editable (could be computed from effective date)

## What I'd improve with more time

- Server-side sorting via API enhancement
- Unit tests for filter serialization layer
- E2E tests for full CRUD workflow
- Better mobile responsiveness
- Optimistic updates for mutations
