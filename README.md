## Lab 1 — Project Setup & Routing

This repo hosts a minimal-yet-opinionated Next.js 16 project that showcases the App Router, shared layouts, and a responsive grid system. Use it as the baseline for future labs where you plug in real content, data fetching, or design system work.

### Tooling

- Next.js 16 with the App Router and React 19
- TypeScript, ESLint 9, Tailwind CSS v4, and Prettier 3
- Husky pre-commit hook that runs `npm run lint` and `npm run format:check`
- Ready-to-extend folders: `app/`, `components/`, `lib/`, `hooks/`, `styles/`, `public/`

### Available Scripts

```bash
npm run dev   # start dev server on http://localhost:3000
npm run lint  # run ESLint across the project
npm run build # create an optimized production build
npm run start # run the production build locally
```

### Layout highlights

- `app/layout.tsx` wires the root layout, header, footer, and content container.
- `components/layout/responsive-grid.tsx` exposes a reusable grid wrapper.
- `components/navigation/nav-link.tsx` keeps navigation stateful through the App Router.
- `hooks/use-client-time.ts` powers the footer clock (sample custom hook).

### Folder overview

```
app/        App Router routes (home, about, projects) and global layout
components/ Header, footer, grid container, and navigation primitives
hooks/      Reusable React hooks (client time example included)
lib/        Site configuration, navigation data, helpers
public/     Static assets (favicons + icons)
styles/     Tokens and design globals pulled into app/globals.css
```

### Next steps

1. Add new route groups under `app/` for upcoming labs or features.
2. Extend the navigation links in `lib/site-config.ts`.
3. Drop shared UI into `components/` and reuse the `ResponsiveGrid` wrapper.

Enjoy experimenting! Let the team know if you need additional scaffolding (API routes, database clients, etc.).

---

## Lab 2 — Authentication & Profiles

Lab 2 layers in secure auth, protected routing, and profile management on top of the original scaffold.

### What’s included

- **NextAuth (credentials provider)** backed by **Prisma** + SQLite for persistent users and posts.
- **Signup/Login/Account** pages with form validation powered by `react-hook-form` + `zod`.
- **Protected routes**: middleware guards `/account`, while client-side gating demonstrates UX states on the home page.
- **Profile system**: update avatar + bio from `/account`, view public author pages under `/profile/[userId]`, and surface authored posts.
- **API routes**: `/api/auth/signup` for onboarding and `/api/account` for authenticated profile updates.
- **Shared tooling**: `generete/` folder for generated artifacts, Prisma migrations, and updated README instructions.

### Quick start

```bash
npm install
npm run dev
```

Create a `.env.local` file with:

```
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="set-a-random-string-here"
```

Run `npx prisma migrate dev` whenever you change the schema.

---

## Lab 3 — Editor & Rich Content

### Highlights

- **Jodit-based rich text editor** with bold/italic/heading/lists/code/link/quote controls and live preview.
- **Image upload flow** that posts to `/api/uploads`, stores files under `public/uploads`, and returns shareable URLs for embeds and covers.
- **Draft + publish flows**: Save client-side drafts in `localStorage`, preview before publishing, and send final content to `/api/posts` backed by Prisma.
- **Protected `/editor` route** with middleware + server checks so only authenticated authors can compose new posts.
- **Post schema enhancements** (`coverImage`, `status`) to support richer publishing states.

### New routes

- `app/editor/page.tsx` — main editor experience.
- `app/api/uploads/route.ts` — handles client → storage uploads.
- `app/api/posts/route.ts` — persists drafts/published posts via Prisma.

Run `npm run dev` and visit `/editor` after signing in to experiment with Lab 3.

---

## Lab 4 — Posts CRUD & Media Handling

### What’s new

- **Post model upgrades**: slugs, status enum, and soft-delete timestamps keep URLs stable and allow archival.
- **Full REST API**
  - `GET /api/posts` (list with filters)
  - `POST /api/posts` (create draft/published posts)
  - `GET/PUT/DELETE /api/posts/[id-or-slug]` (fetch, update, soft-delete)
- **Optimized media surfaces**: `/posts` grid and `/posts/[slug]` detail view both use `next/image` with responsive `sizes`, lazy loading, and graceful fallbacks.
- **Account post manager**: toggle draft/published or archive entries directly from `/account`.
- **SSG-ready detail pages**: `generateStaticParams` prebuilds published slugs while still revalidating every 5 minutes.

### Try it out

1. `npm run dev`
2. Sign in and create a post (upload cover/media) via `/editor`
3. Visit `/posts` to review the optimized listing
4. Open `/posts/[slug]` for the full article view
5. Manage lifecycle (draft/publish/delete) from `/account`

All linting/formatting continues to run via Husky (`npm run lint`, `npm run format:check`).

---

## Lab 5 — Feeds, Tags & Search

### Discovery upgrades

- **Personalized Feed (`/feed`)**: SSR hero sections (latest + recommended) paired with a React Query infinite scroll that surfaces Latest, Recommended, or Following tabs with pagination and debounced load states.
- **Tag system**: Prisma-backed `Tag` + `PostTag` models, `/api/tags`, `/tags` directory, and `/tags/[slug]` detail pages allow filtering posts by topic across the UI (Posts page filters, Post cards, Feed, etc.).
- **Search UI**: `PostSearch` component debounces client-side queries against `/api/posts?q=…` to deliver instant suggestions without leaving the page.

---

## Lab 6 — Comments, Reactions & Social Features

### Social primitives

- **Nested comments** powered by `Comment` model, `/api/posts/[postId]/comments`, and the `CommentsPanel` UI with reply threads, optimistic refresh, and auth-aware states.
- **Reactions bar**: likes + claps via `/api/posts/[postId]/reactions` with optimistic toggles and counts displayed on cards and the article detail page.
- **Follow authors**: `Follow` model, `/api/profile/[userId]/follow` API, `FollowButton` client component, and a "Following" feed tab personalized to authenticated users.

---

## Lab 7 — State Management & Data Fetching

### Data layer

- **React Query provider** wraps the entire app (`components/providers/query-provider.tsx`) to handle caching, mutations, and infinite queries.
- **Context API**: `ThemeProvider` + `ThemeToggle` store global UI state (light/dark) with persistence and CSS variable theming.
- **Custom hooks**: `useDebouncedValue`, `useTheme`, and existing hooks provide lightweight global state without extra libraries.

---

## Lab 8 — TypeScript & Quality

### Type safety & tests

- **Shared types**: `types/content.ts` defines Post/User/Comment/Tag/Reaction shapes reused by APIs and components.
- **Strict tooling**: ESLint 9, Prettier 3, Husky pre-commit, and `npm run test` (Jest + Testing Library) guard regressions.
- **Sample tests**: `__tests__/theme-toggle.test.tsx`, `post-card.test.tsx`, and `projects-page.test.tsx` demonstrate both component and page-level coverage.

---

## Lab 9 — SEO, Performance & SSG/SSR

### Production polish

- **Dynamic metadata**: `/posts/[slug]` exposes per-post Open Graph + Twitter cards referencing `siteMetadata.siteUrl`.
- **ISR & typed routes**: posts, tags, and feeds leverage `generateStaticParams`, `revalidate`, and typed route safety.
- **Media performance**: `next/image` responsive sizes across listings, hero covers, and feed surfaces; `next.config.ts` remotePatterns keep optimization on.
- **Analytics-ready structure**: server-rendered hero sections plus client-side streaming feed offer a balanced SSR/CSR strategy.
