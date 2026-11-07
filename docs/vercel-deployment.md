# Vercel UI demo

This project deploys as a Next.js UI demo with browser mock data. The Vercel build command explicitly enables `NEXT_PUBLIC_USE_MOCKS=true`. No backend URL, auth secret, or upload credentials are needed for this demo.

## Deploy from your terminal

From the repository root:

```sh
npx vercel login
npx vercel
```

Select your Vercel account/team and create or link the `edvora-ui` project. The first command deploys a preview. To deploy the production URL:

```sh
npx vercel --prod
```

## Deploy from GitHub

Push `main` to `https://github.com/AdnanMadi417/edvora-ui`, then import that repository at https://vercel.com/new.

- Framework: Next.js
- Root directory: repository root (`./`)
- Install command: `pnpm install --frozen-lockfile`
- Build command: use the checked-in `vercel.json`
- Output directory: framework default (do not set `out` or `.next/standalone`)
- Production branch: `main`

Leave `NEXT_PUBLIC_BASE_PATH` empty. Leave `SIGNOZ_ENDPOINT` and `SIGNOZ_INGESTION_KEY` unset unless telemetry is intentionally configured. Never copy `.env.local` credentials into the public demo.

Mock changes are local to each browser and reset according to the mock store implementation. Actual backend uploads, emails, and payments are not part of this deployment.

Official documentation: https://vercel.com/docs/frameworks/full-stack/nextjs
