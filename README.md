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

Set environment variables in `.env` (a starter file is already provided) and run `npx prisma migrate dev` whenever you change the schema.
