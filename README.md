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

## Assumptions

- **Risk level** computed on frontend from `reimbursementRisk` (High ≥ 0.70, Medium ≥ 0.40, Low < 0.40) — API doesn't return it
- **Multi-region filtering** is client-side — API accepts a single `region` value, so when multiple are selected the app fetches all and filters locally. Fine at 100 policies, wouldn't scale
- **Days until renewal** is editable in the form but in production should be server-derived from `effectiveDate` + term

## Tradeoffs

- **Filters in URL** — all filter/pagination state serialized to search params for shareable links and back/forward support. Filter modal uses local draft state and only commits on "Apply" to avoid intermediate API calls
- **No sorting** — API has no sort params, and client-side sorting per page is misleading (page 1 sorted ≠ global top-N). Left out intentionally despite mock showing a Risk sort indicator
- **Detail fetch on expand** — each row click fires `GET /policies/:id` because the list endpoint omits compliance/reviews. Prefetching all 20 details would waste requests for data users rarely inspect
- **No optimistic updates** — mutations wait for server response. Optimistic delete/update would be snappier but adds rollback complexity, especially for create (server-generated ID)
- **Frontend-only validation** — Zod validates structure and required fields; domain rules (e.g. "effective date in the future") are left to the backend

## What I'd improve

- **Server-side sorting** with `sortBy`/`sortDir` query params and clickable column headers
- **Responsive table** — hide lower-priority columns at < 1280px, show them in expanded detail
- **Optimistic mutations** — especially delete (remove row instantly, restore on error)
- **Component decomposition** — `PoliciesPage.tsx` (~250 lines) orchestrates too much: search, filters, table, two modals. I'd extract filter toolbar, modal state, and mutation handlers into dedicated hooks (`useModalState`, `usePolicyMutations`). Same for `PoliciesTable.tsx` — pagination, row expansion, keyboard nav, and delete confirmation are distinct concerns that should be separate hooks
- **Tests** — unit tests for filter serialization roundtrip and risk tier boundaries; E2E tests for full CRUD flow
- **Accessibility** — screen reader audit, ARIA live regions for toasts, `beforeunload` warning on unsaved form changes
