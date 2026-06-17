# Jordan Photo Share

Private client galleries for documentary photographers — password protected, 30-day expiry, grid or slideshow views, and full-resolution downloads.

## Stack

- **Next.js 16** (App Router)
- **PostgreSQL** + **Prisma** — gallery metadata
- **Vercel Blob** — photo storage in production
- **Framer Motion** — smooth gallery transitions
- **Tailwind CSS** + **VTCDuBoisTrial**

## Local development

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `DB_POSTGRES_URL` | Direct Postgres URL (auto-set by Vercel) |
| `DB_PRISMA_DATABASE_URL` | Pooled URL for the app (auto-set by Vercel) |
| `ADMIN_PASSWORD` | Studio login at `/admin` |
| `SESSION_SECRET` | Signed session cookies |
| `BLOB_READ_WRITE_TOKEN` | Optional locally — without it, photos save to `uploads/` |
| `CONTACT_PHONE` | Footer booking phone number |

3. **Run migrations**

```bash
npm run db:migrate
```

4. **Start dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### 1. Push to GitHub

Connect the repo in the [Vercel Dashboard](https://vercel.com/new).

### 2. Add PostgreSQL

In your Vercel project:

- **Storage → Create Database → Postgres** (or connect [Neon](https://neon.tech))
- Vercel auto-adds `DB_POSTGRES_URL` and `DB_PRISMA_DATABASE_URL` — no manual copy needed

### 3. Set app env vars

In **Settings → Environment Variables**, add:

```env
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=a-long-random-string
CONTACT_PHONE=(555) 123-4567
```

### 5. Add Blob storage

- **Storage → Create Store → Blob**
- Vercel auto-adds `BLOB_READ_WRITE_TOKEN`

**Delete** any old `DATABASE_URL` with placeholder values — the app no longer uses it.

### 6. Deploy

The build runs:

```bash
prisma generate && prisma migrate deploy && next build
```

Migrations create the `Catalog` and `Photo` tables on first deploy.

### How storage works on Vercel

| Data | Where |
|------|--------|
| Gallery titles, passwords, expiry, photo metadata | **PostgreSQL** |
| Full-resolution image files | **Vercel Blob** (private — served through authenticated API routes) |

Locally without `BLOB_READ_WRITE_TOKEN`, photos fall back to the `uploads/` folder so you can develop without Blob.

## Usage

### Studio (`/admin`)

1. Sign in with `ADMIN_PASSWORD`
2. Create a gallery (title, client name, password)
3. **Manage** → upload photos (drag & drop)
4. Copy the gallery link and share with your client

### Client gallery (`/gallery/{slug}`)

1. Enter gallery password
2. Browse in grid or slideshow view
3. Download individual photos or all as ZIP
4. Gallery expires after 30 days

## Project structure

```
src/
  app/              Pages and API routes
  components/       Gallery, admin, UI
  lib/              db, storage, auth, config
prisma/
  migrations/       PostgreSQL schema migrations
uploads/            Local dev photo fallback (gitignored)
```
