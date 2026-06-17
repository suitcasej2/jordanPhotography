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
| `POSTGRES_PRISMA_URL` | PostgreSQL pooled URL (set automatically by Vercel Postgres) |
| `POSTGRES_URL_NON_POOLING` | Direct URL for migrations (set automatically by Vercel Postgres) |
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
- Vercel auto-adds `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`

### 3. Add Blob storage

- **Storage → Create Store → Blob**
- Vercel auto-adds `BLOB_READ_WRITE_TOKEN`

### 4. Set environment variables

In **Settings → Environment Variables**, add:

```env
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=a-long-random-string
CONTACT_PHONE=(555) 123-4567
```

`POSTGRES_*` and `BLOB_READ_WRITE_TOKEN` are set automatically when you connect storage.

**Important:** Do not add a manual `DATABASE_URL` with placeholder values like `host:5432/dbname` — delete it from Vercel env vars if present.

### 5. Deploy

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
