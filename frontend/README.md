This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

This project is configured to deploy natively on [Netlify](https://www.netlify.com/) using the official **Netlify Next.js Runtime (`@netlify/plugin-nextjs`)**.

### Deployment Steps
1. Connect your GitHub repository to Netlify.
2. In Site Settings, set the following build options (configured automatically via `netlify.toml`):
   - **Base directory**: `frontend` (or `./` if deploying from repository root)
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next` (or `.next` when inside `frontend`)
3. Add your Firebase environment variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) in **Site configuration -> Environment variables**.
4. Click **Deploy Site**!

Check out the [Netlify Next.js documentation](https://docs.netlify.com/integrations/frameworks/next-js/) for more details.
