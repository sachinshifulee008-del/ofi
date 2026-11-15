# ORBITAL FLAME INTELLIGENCE (OFI)

**An independent scientific research intelligence platform for NASA microgravity combustion research.**

Built for the **NASA Space Apps Challenge 2026 — *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data.***

- **Product:** ORBITAL FLAME INTELLIGENCE (OFI)
- **AI Engine:** FLARE AI — *Fire & Laboratory Analysis Research Engine*
- **Mission:** help users explore, visualize, compare, summarize and interpret NASA microgravity combustion research with evidence-grounded AI.

---

## Feature overview

| Workspace section | What it does |
| --- | --- |
| **Landing page** | Cinematic hero with procedural flame visual, five science sections, scroll reveals |
| **Overview** | Live corpus metrics (computed from real data), research search, recently explored (per-device), FLARE AI entry |
| **NASA Research Explorer** | Searchable/filterable/sortable/paginated catalogue of 14 verified investigations with rich detail views |
| **Combustion Intelligence** | Structural analytics: research-area coverage, gravity environments, quality dimensions |
| **Visualization Lab** | Recharts workspace with dataset/chart-type selectors, data table, CSV export. Charts are computed live from corpus metadata — **no invented measurements** |
| **Experiment Comparison** | Compatibility-aware side-by-side comparison; explains honestly when a comparison is scientifically invalid |
| **FLARE AI** | Retrieval-grounded assistant: retrieves verified records first, cites them inline, separates facts from interpretation, admits insufficient evidence. Rate-limited, server-side keys only |
| **Research Rankings** | OFI-defined Research Relevance Score (data quality / relevance / completeness / metadata) with full methodology disclosure |
| **Reports** | Compose downloadable research summary reports (Markdown) and full catalogue export (CSV) |
| **Science Library** | Combined corpus bibliography, verified DOIs, glossary |
| **Methodology** | Data provenance, scoring formula, AI grounding rules, honest limitations |

## Data integrity policy

- Every investigation record is curated from **public, verifiable sources** (NASA mission pages, NASA NTRS reports, peer-reviewed papers, ISS National Laboratory).
- Launch years and DOIs appear **only when verified** against a source; unverified fields are shown as “Not dated in source”.
- **No numeric measurements are fabricated.** Measurement time-series are honestly shown as unavailable until verified datasets are imported.
- The OFI score is a metadata heuristic — **not** NASA-approved and **not** a fire-risk prediction.
- OFI is an independent project and is not affiliated with or endorsed by NASA.

## Tech stack

- **Next.js 16 (App Router)** + **TypeScript 5**
- **Tailwind CSS 4** + shadcn/ui (New York) + Lucide icons
- **Prisma ORM** + SQLite (local) — schema in `prisma/schema.prisma`
- **Recharts** for scientific charts, **Framer Motion** for restrained animation
- **z-ai-web-dev-sdk** (server-side only) for the FLARE AI LLM layer, with a deterministic retrieval fallback

## Getting started

### 1. Install

```bash
bun install   # or npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string (local default: `file:./db/custom.db`) |
| `GEMINI_API_KEY` | No | Optional external LLM key. When absent, FLARE AI uses the bundled server-side SDK and falls back to retrieval-only mode if the LLM is unavailable |

API keys are read **server-side only** and are never exposed to the browser.

### 3. Set up the database

```bash
bun run db:push      # create/push the Prisma schema
bun run scripts/seed.ts   # seed the verified OFI research corpus (14 investigations)
```

### 4. Run

```bash
bun run dev          # development server on port 3000
```

Then open the app. The landing page is at `/`; workspace views are hash-routed (`#/overview`, `#/explorer`, `#/flare-ai`, …).

## Deployment (Vercel)

1. Push the repository to GitHub — confirm `.env` is **not** committed (see `.gitignore`).
2. Import the project into Vercel.
3. Add environment variables (`DATABASE_URL`, optionally `GEMINI_API_KEY`) in the Vercel project settings. For production, use a managed database (e.g. Vercel Postgres / Supabase) and switch `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma`, then run `prisma migrate`.
4. Seed the corpus once against the production database (run the seed script locally with the production `DATABASE_URL`).
5. Deploy and verify every route, the API endpoints (`/api/investigations`, `/api/investigations/[code]`, `/api/stats`, `/api/datasets`, `/api/flare`) and the FLARE AI citation behaviour.

> Note: deployment has not been executed from this workspace — no deployment success is claimed. Verify the checklist above on your own Vercel project.

## Data import (bringing real measurement data in)

OFI deliberately ships no fabricated measurement series. To enable measurement visualization:

1. Obtain a verified dataset from NASA (e.g. NTRS, the NASA Open Data Portal, or a publication's supplementary data).
2. Extend `prisma/schema.prisma` with a measurement model (dataset id, investigation code, variable, unit, timestamp/index, value) and push the schema.
3. Import rows via a script similar to `scripts/seed.ts`.
4. Add a dataset definition in `src/app/api/datasets/route.ts` following the existing `CorpusDataset` shape — the Visualization Lab, data table and CSV export pick it up automatically.

## Project structure

```
src/
  app/
    page.tsx                      # single-page entry (hash-routed workspace)
    api/investigations/…          # catalogue API (validated with Zod)
    api/stats/                    # overview metrics
    api/datasets/                 # corpus-derived visualization datasets
    api/flare/                    # FLARE AI (retrieval + LLM + rate limit)
  components/ofi/
    OFIApp.tsx                    # hash router
    landing/LandingPage.tsx       # premium landing
    shell/AppShell.tsx            # sidebar / topbar / mobile drawer
    views/…                       # one file per workspace section
  lib/ofi/
    types.ts · scoring.ts · serialize.ts · api.ts
scripts/seed.ts                   # verified corpus seed
prisma/schema.prisma
```

## Known limitations

- The corpus is a **curated selection** (14 investigations), not a comprehensive catalogue of NASA microgravity combustion research.
- Session context (recently explored, activity) is stored **per device** in localStorage, not on a server.
- FLARE AI answers cover only the curated corpus; it is not a general chatbot and will say so when evidence is insufficient.
- No measurement time-series are bundled; numeric comparison in Experiment Comparison is intentionally withheld until verified data is imported.
- Production build/deployment steps are documented but were not executed in this workspace.

## Verification performed

- `eslint` — clean (0 errors, 0 warnings)
- `tsc --noEmit` — project code compiles with zero errors
- Browser end-to-end: landing, all 10 workspace views, search + filters, investigation detail, both compatible (FLEX/FLEX-2) and incompatible (FLEX/SAFFIRE-I) comparisons, FLARE AI grounded answer with citations, mobile 375 px layout and drawer navigation — all pass with no console errors and no horizontal overflow.
