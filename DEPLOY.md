# Deploying OFI — VS Code → GitHub → Vercel

A complete, step-by-step guide to take this project from a zip on your machine to a live `*.vercel.app` URL.

---

## 0. Prerequisites

| Tool | Why | Install check |
| --- | --- | --- |
| **VS Code** | Editing the project | `code --version` |
| **Node.js 20+** | Next.js runtime | `node --version` |
| **Git** | Pushing to GitHub | `git --version` |
| **A GitHub account** | Vercel deploys from GitHub | github.com |
| **A Vercel account** (free, sign in **with GitHub**) | Hosting | vercel.com |

Optional but recommended: **Bun** (`curl -fsSL https://bun.sh/install | bash`) — this repo uses `bun.lock`.

---

## 1. Open the project in VS Code

```bash
# unzip the source, then:
cd OFI-website-source
code .
```

Install dependencies (this also auto-generates the Prisma client via the `postinstall` script):

```bash
bun install        # or: npm install
```

Create your local env file — **copy** `.env.example` to `.env` and set:

```bash
DATABASE_URL=file:./db/custom.db
# GEMINI_API_KEY=   (optional — FLARE AI falls back to retrieval-only mode without it)
```

Verify it runs locally:

```bash
bun run db:generate   # prisma generate (also runs automatically on install)
bun run dev           # → http://localhost:3000
```

---

## 2. Push to GitHub from VS Code

### Option A — VS Code UI (easiest)

1. Open the **Source Control** panel (left sidebar, branch icon).
2. Click **"Initialize Repository"** (if not already a repo).
3. **Important:** check that `.gitignore` covers `node_modules`, `.next`, `dev.log`, `.env` — the repo ships with this; never commit `.env`.
4. Stage all files ( **`+`** icon), type a message like `Initial commit — OFI platform`, click **✔ Commit**.
5. Click **"Publish Branch"** → choose **"Publish to GitHub public repository"** (public is fine for a challenge project; private also works — Vercel free tier supports private repos).
6. Sign in to GitHub when VS Code asks; the repo appears under your account.

### Option B — Terminal

```bash
git init
git add .
git commit -m "Initial commit — OFI platform"
# create an empty repo named e.g. "ofi" on github.com first (no README), then:
git remote add origin https://github.com/<your-username>/ofi.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy on Vercel

1. Go to **vercel.com** → **Add New… → Project**.
2. **Import** the `ofi` repository you just pushed.
3. Vercel auto-detects **Next.js**. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | `file:./db/custom.db` |
   | `GEMINI_API_KEY` | *(optional — only if you want live LLM answers in FLARE AI)* |

4. Click **Deploy**. Build takes ~2–3 minutes.
5. You get a live URL like `https://ofi-<your-name>.vercel.app`.

> **Why the SQLite setup works on Vercel:** serverless functions have a read-only filesystem, so `src/lib/db.ts` copies the bundled `db/custom.db` (included via `outputFileTracingIncludes` in `next.config.ts`) to `/tmp` on each cold start. The production app only *reads* the database, so a per-instance copy is fully sufficient. `vercel.json` pins the build command to plain `next build`.

---

## 4. After the first deploy

- **Every `git push` to `main` now auto-deploys.** Edit in VS Code → commit → push → live in ~2 minutes.
- **Preview deployments:** pushing to any other branch creates a temporary preview URL — safe for testing.
- **Update the data later:** edit `scripts/seed.ts` → run `bun run db:push && bunx tsx scripts/seed.ts` locally → commit the refreshed `db/custom.db` → push. The new data ships with the next deploy.

### Optional upgrades

- **Custom domain:** Vercel project → Settings → Domains → add yours; Vercel issues HTTPS automatically.
- **Real writable database:** if you later need *writes* (e.g. saved reports per user), switch to Postgres — create a free database on [Neon](https://neon.tech) or [Supabase](https://supabase.com), change `provider = "postgresql"` in `prisma/schema.prisma`, set the connection string as `DATABASE_URL` in Vercel, then run `bun run db:push` against it. No other code changes needed.

---

## 5. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build error: `prisma generate` missing | Make sure `postinstall` script exists (it does in this repo) and `prisma` is in `dependencies`/`devDependencies` |
| `/api/*` returns 500 on Vercel but works locally | Check `DATABASE_URL` is set in **Vercel → Settings → Environment Variables**, then **Redeploy** |
| `Unable to open the database file` | Confirm `db/custom.db` is committed to git (`git ls-files db/` should list it) |
| FLARE AI answers feel generic | Add `GEMINI_API_KEY` env var — without it the AI runs in deterministic retrieval-only mode |
| 404 on refresh at a subpage | Not applicable here — the app uses hash routing (`/#/explorer`), which needs no server rewrites |

---

## Quick reference — the whole flow in 6 commands

```bash
cd OFI-website-source && code .
bun install
cp .env.example .env         # then set DATABASE_URL=file:./db/custom.db
git init && git add . && git commit -m "Initial commit — OFI platform"
git remote add origin https://github.com/<you>/ofi.git && git push -u origin main
# then: vercel.com → Import repo → add DATABASE_URL → Deploy 🚀
```
