# GamingAdminPanel

**GamingAdminPanel** is a gaming-features admin panel for operators to configure three modules: **Leaderboard** (rankings and prizes), **Raffle** (ticket-based draws), and **Wheel** (weighted spin segments). The UI is built with React, Material UI, and TanStack Query over a local JSON REST API for easy review and testing.

---

## 1. Project overview

GamingAdminPanel lets staff create, read, update, and delete configurations for leaderboards, raffles, and spin wheels. Each area has list views with sorting, pagination, and filters, full forms with Zod validation, read-only detail pages, and toasts for mutations. A mock API (`json-server`) ships with seed data so the app runs locally without extra services.

---

## 2. Architecture

Features are **vertical slices** under `src/features/<feature>/`: each owns `api/`, `hooks/` (React Query hooks and other custom hooks), `validation/` (Zod), `types/`, `components/`, and `pages/`. **No feature imports another feature**; only `src/shared/` (layout, theme, `apiClient`, route constants) is shared. That keeps modules removable: you can drop a feature folder and its router entries without breaking the others.

We treat **HTTP as a port**: feature `api/*.ts` modules call the shared Axios instance (`apiClient`), so the UI does not care that the adapter is json-server today and could be a real backend tomorrow.

**Hexagonal architecture (Ports and Adapters):** Domain rules and UI sit in the “core”; **ports** are the operations the app needs (e.g. “list leaderboards”, “save wheel”). **Adapters** implement those ports: the Axios + json-server layer is one adapter, React components another. Feature API modules act as thin anti-corruption boundaries so route and query logic stay stable if the backend contract changes. This keeps teams able to swap or mock the API without rewriting forms or tables.

### Folder structure

```text
src/
├── App.tsx                 # QueryClient, theme, global error boundary, router
├── app/routes/AppRouter.tsx
├── shared/
│   ├── api/apiClient.ts    # Shared Axios instance
│   ├── components/       # AppLayout, AppErrorBoundary, tables, skeletons
│   ├── hooks/            # Shared hooks (toast, table sort, color mode)
│   ├── constants/        # ROUTES, feature marketing copy
│   ├── pages/            # Dashboard, NotFound
│   └── theme/
├── features/
│   ├── leaderboard/
│   ├── raffle/           # Listing: RaffleList; form: RaffleForm
│   └── wheel/
└── main.tsx
```

---

## 3. Tech stack

| Layer | Package | Version (approx.) | Role |
|--------|---------|-------------------|------|
| Runtime | `react` / `react-dom` | ^18.3 | UI |
| Language | `typescript` | ~5.9 | Strict mode (`strict`, `noUnusedLocals`, …); no `any` in app source |
| Build | `vite` | ^8 | Dev server and production bundle |
| Routing | `react-router-dom` | ^6.28 | `createBrowserRouter`, data APIs |
| UI | `@mui/material` / icons | ^5.16 | Layout, forms, tables (`sx` styling) |
| Server state | `@tanstack/react-query` | ^5 | Queries/mutations via feature `hooks/` |
| Forms | `react-hook-form` | ^7 | Controlled forms + dirty state |
| Validation | `zod` | ^4 | Schemas; form types via `z.input` / `z.output` |
| HTTP | `axios` | ^1.13 | Shared `apiClient` to mock API |
| Mock API | `json-server` | 1.0 beta | `db.json` REST CRUD |

Styling: **MUI `sx`** everywhere; Emotion is pulled in by MUI only.

---

## 4. Getting started

**Prerequisites:** Node.js 20+ recommended, npm 9+. The npm package name in `package.json` is `gaming-admin-panel` (lowercase, per npm naming rules); the product name is **GamingAdminPanel**.

1. Clone the repository and open the project root.
2. Install dependencies:

   ```bash
   npm install
   ```

3. **Run the app.** For normal use, run **only** the first line (`npm start` does the same). Use the other lines only if you want the **backend** (`server`) or **frontend** (`vite`) in a separate terminal.

   ```bash
   npm run dev      # backend + frontend together
   npm run server   # backend only — json-server at http://localhost:3000 (`db.json`)
   npm run vite     # frontend only — needs backend running elsewhere for API calls
   ```

   From a clean clone: `npm install && npm start`. Vite prints the UI URL (usually `http://localhost:5173`).

4. Open the UI in your browser. The app expects the API on port **3000** (see `src/shared/api/apiClient.ts`).

---

## 5. Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs json-server **and** Vite together (default workflow). |
| `npm start` | Same as `npm run dev`. |
| `npm run server` | **Backend:** json-server mock API on port 3000 watching `db.json`. |
| `npm run vite` | Vite dev server only. |
| `npm run build` | Typecheck + production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint on the repo. |

### Security and dependency audits

After installing or upgrading packages, run:

```bash
npm audit
npm audit fix
```

`npm audit fix` applies non-breaking updates from the advisory database. Re-run `npm run build` and `npm run lint` afterward. If a vulnerability has no fix yet, note it in your PR or issue tracker.

### CI (suggested)

A lightweight check for reviewers and automation:

```bash
npm ci
npm run lint
npm run build
```

Use the same Node version as local development (see **Getting started**). Caching `~/.npm` speeds up `npm ci` in GitHub Actions, GitLab CI, etc.

---

## 6. API reference

Base URL: `http://localhost:3000` (configurable in `apiClient.ts`).

json-server exposes **three collections** (see `db.json`):

### `GET/POST /leaderboards` · `GET/PUT/PATCH/DELETE /leaderboards/:id`

- **Leaderboard:** `id`, `title`, `description`, `startDate`, `endDate`, `status` (`draft` \| `active` \| `completed`), `scoringType` (`points` \| `wins` \| `wagered`), `prizes[]`, `maxParticipants`, `createdAt`, `updatedAt` — in the admin UI, `draft` is shown as **Inactive**; bulk actions use **Mark inactive** / **Mark active** / **Mark completed** (API values stay `draft` / `active` / `completed`).
- **Prize:** `id`, `rank`, `name`, `type` (`coins` \| `freeSpin` \| `bonus`), `amount`, `imageUrl`
- **List query params:** `_page`, `_per_page`, `_sort`, `status`, `title_contains` (search)

### `GET/POST /raffles` · `GET/PUT/DELETE /raffles/:id`

- **Raffle:** `id`, `name`, `description`, `startDate`, `endDate`, `drawDate`, `status` (`draft` \| `active` \| `drawn` \| `cancelled`), `ticketPrice`, `maxTicketsPerUser`, `prizes[]`, `totalTicketLimit` (`number` or `null`), `createdAt`, `updatedAt`
- **Prize:** `id`, `name`, `type`, `amount`, `quantity`, `imageUrl`
- **List query params:** `_page`, `_per_page`, `_sort`, `status`, `name_contains`; date-range filters may fetch a larger page server-side and paginate in the client (see `raffle.api.ts`)

### `GET/POST /wheel` · `GET/PUT/DELETE /wheel/:id`

> Note: the JSON file key is `wheel` (singular), so the REST path is `/wheel`, not `/wheels`.

- **Wheel:** `id`, `name`, `description`, `status` (`draft` \| `active` \| `inactive`), `segments[]`, `maxSpinsPerUser`, `spinCost`, `backgroundColor`, `borderColor`, `createdAt`, `updatedAt`
- **Segment:** `id`, `label`, `color` (hex), `weight` (1–100, sum 100 per wheel), `prizeType` (`coins` \| `freeSpin` \| `bonus` \| `nothing`), `prizeAmount`, `imageUrl`
- **List query params:** `_page`, `_per_page`, `_sort`, `status`, `name_contains`

**Paginated list shape** (json-server v1): `{ "data": [...], "items": <total count> }`.

---

## 7. Design decisions (ქართულად)

**ფუნქციონალზე აგებული არქიტექტურა.** ფუნქციონალზე აგებული არქიტექტურა, ამარტივებს კოდის გარჩევასა და წაკითხვადობას, როგორც ინდივიდი დეველოპერისთვის ასევე გუნდისათვის. 3 გვერდი იყო ასაწყობი, შესაბამისად გვქონდა 3 სხვადასხვა ფუნქციონალი (ლიდერბორდი, რაფლი, ბორბალი), ამიტომ თითოელის ვიზუალი, ბიზნეს ლოგიკა, ტიპები და ვალიდაცია მოქცეულია ფუნქციონალის შესაბამის ფოლდერში, სამუშაოს გამარტივებისათვის. რაც უფრო მძიმე და დახუნძლული გახდება ადმინ პანელი, ეს მიდგომა გვაძლევს საშუალებას, რომ კოდი კვლავ ადვილად მისაგნები და გასარჩევი იყოს. ასევე არის საზიარო ფოლდერი, სადაც მრავალჯერ გამოყენებადი ფაილები ინახება, კოდის დუბლიკაციის თავიდან ასაცილებლად.

**ფუნქციონალი და ვიზუალი** ადმინ პანელი არის ფუნქციონალური, შეიცავს ყველა საჭირო ოპერაციებს, სხვადასხვა პროცესების სამართავად. ასევე არის მინიმალისტური, არა გადატვირთული დიზაინით, ვფიქრობ ყოველდღიურ სამუშაო გარემოში, მარტივი გარემო მნიშვნელოვანია ადმინისტრატორებისთვის.  

---

## Submission checklist (quick reference)

- [x] Three features with CRUD, validation, tables (pagination, sort, filters)
- [x] Per-feature error boundaries + global `AppErrorBoundary`
- [x] Central `apiClient`, route constants, data-fetch hooks in `hooks/` only from pages
- [x] Unsaved-change guards on major forms; toasts on mutations
- [x] 404 route; seed data in `db.json`
- [ ] Optional: unit tests, dark mode, CSV export, drag-and-drop, optimistic updates, animated wheel

---

## License

Private / assessment use unless otherwise stated.
