This is a full-stack finance manager:

- Frontend: Next.js (`/`)
- Backend: Node.js + Express + MongoDB (`/backend`)

## Getting Started

## Frontend Setup

Create frontend env:

```bash
cp .env.example .env.local
```

Run frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs on [http://localhost:5000](http://localhost:5000).

## Notes

- Frontend now stores and reads transactions/budgets from backend MongoDB APIs.
- Active tab state is still persisted locally in browser storage.
- PWA support is enabled with:
  - `public/manifest.json`
  - `public/sw.js` (service worker cache strategies)
  - `public/offline.html` + `/offline` fallback route
  - Mobile install prompt in-app
- Service worker registers in production by default. To test in development:
  - Set `NEXT_PUBLIC_ENABLE_PWA_IN_DEV=true` in `.env.local`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
