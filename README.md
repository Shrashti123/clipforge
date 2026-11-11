# ClipForge

A multi-user media toolkit built with Next.js. Sign in, upload videos that are compressed automatically, preview them, and generate social-media-ready image crops (Instagram, Twitter, Facebook) with content-aware cropping.

**Live demo:** _add your Vercel URL here_ · **Screenshots:** _add 2–3 images to `/docs` and link them here_

## Features

- **Authentication** with Clerk; only the landing and auth pages are public.
- **Per-user video library.** Every video belongs to its uploader. Users only see, download and delete their own.
- **Direct-to-Cloudinary signed uploads.** The browser gets a short-lived signature from the server and uploads straight to Cloudinary, so large files never hit the serverless request-body limit. Upload progress is shown.
- **Automatic compression** at upload time, with original vs. compressed size and the percentage saved shown on each card.
- **AI-assisted media processing via Cloudinary:** content-aware cropping (`gravity: auto`) for thumbnails and social formats, and AI-generated short video previews on hover.
- **Social Share tool** for resizing images to platform-specific aspect ratios.
- **Delete with ownership checks**, which also removes the asset from Cloudinary.
- **CI** with lint and type-check on every push.

## Tech stack

Next.js 14 (App Router) · TypeScript · Clerk · Prisma · PostgreSQL (Neon) · Cloudinary · Tailwind CSS + daisyUI

## Security and design decisions

| Concern | Approach |
| --- | --- |
| Unauthenticated API access | Middleware returns `401` JSON for any `/api/*` call without a session |
| Reading other users' data | All queries are scoped by `userId` from the Clerk session, never from the request body |
| Forged uploads | Upload signature is generated server-side; saving a video verifies the asset lives in the caller's own Cloudinary folder |
| Trusting client metadata | File size and duration are re-read from Cloudinary, not accepted from the client |
| Probing video IDs | Delete returns the same `404` for "missing" and "not yours" |
| DB connections on serverless | A single shared Prisma client (`lib/prisma.ts`) |

## Getting started

```bash
git clone https://github.com/<your-username>/clipforge.git
cd clipforge
npm install
cp env.sample .env      # fill in the values
npx prisma migrate deploy
npm run dev
```

You need free accounts at [Clerk](https://clerk.com), [Neon](https://neon.tech) and [Cloudinary](https://cloudinary.com).

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run typecheck` | Run the TypeScript compiler without emitting |
| `npm run lint` | Run ESLint |
| `npm run db:deploy` | Apply Prisma migrations |

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel.
2. Add every variable from `env.sample` in **Project → Settings → Environment Variables**.
3. Run `npm run db:deploy` once against your Neon database (locally, with `DATABASE_URL` set).
4. In the Clerk dashboard, add your Vercel domain to the allowed origins.

## Roadmap

- [ ] Plans and usage limits with Stripe (test mode)
- [ ] LLM-generated titles, descriptions and tags for uploaded videos
- [ ] Tests for the API routes (auth and ownership rules)

## Credits

This project started from the Cloudinary SaaS tutorial in the Chai aur Code Next.js course. The per-user data model, signed direct uploads, API authorization, ownership checks, delete flow, error handling, bug fixes and CI were added on top of it.
