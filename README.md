# Jordan Photo Share

A fast, polished client gallery app for documentary photographers. Share password-protected catalogs with clients for 30 days — with smooth transitions, masonry layouts, lightbox viewing, and full-resolution downloads.

## Stack

- **Next.js 16** (App Router) — server components, optimized routing
- **Framer Motion** — fluid page and gallery transitions
- **Tailwind CSS** — editorial dark theme
- **Prisma + SQLite** — catalog and photo metadata (swap to PostgreSQL for production)
- **bcrypt** — password hashing

## Features

- Password-protected galleries per catalog
- Automatic 30-day expiry
- Masonry photo grid with skeleton loading
- Full-screen lightbox with keyboard navigation
- Individual photo download + download all as ZIP
- Admin studio to create galleries and upload photos

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

- `ADMIN_PASSWORD` — your studio login password
- `SESSION_SECRET` — long random string for signed cookies

3. **Initialize the database**

```bash
npm run db:push
```

4. **Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Studio (Admin)

1. Go to `/admin` and sign in with your `ADMIN_PASSWORD`
2. Create a gallery with title, optional client name, and gallery password
3. Open **Manage** to upload photos (drag & drop supported)
4. Copy the gallery link and share it with your client along with the password

### Client Experience

1. Client visits `/gallery/your-slug`
2. Enters the gallery password
3. Browses photos in a masonry grid, opens lightbox, downloads individually or all at once
4. Gallery expires automatically after 30 days

## Project Structure

```
src/
  app/              # Pages and API routes
  components/       # Gallery, admin, and UI components
  lib/              # Database, sessions, catalog helpers
  generated/prisma/ # Prisma client (generated)
uploads/            # Photo files (gitignored)
```

## Production Notes

- Switch `DATABASE_URL` to PostgreSQL for production hosting
- Store uploads on S3 or similar object storage for scale
- Set strong `ADMIN_PASSWORD` and `SESSION_SECRET`
- Deploy on Vercel, Railway, or any Node.js host
# jordanPhotography
