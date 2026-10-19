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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Writing notes

Edit `content/notes.json`. It is an array of notes:

```json
[
  {
    "date": "2026-09-09",
    "header": "Optional heading",
    "body": "Your short note.\n\nA second paragraph, if you want one.",
    "starred": true
  },
  {
    "date": "2026-09-08",
    "body": "Another thought, without a heading.",
    "starred": false
  }
]
```

- `date`: valid `YYYY-MM-DD` date.
- `header`: optional; omit it for a simple text note.
- `body`: plain text. Use `\n` for a line break. No Markdown or HTML rendering.
- `starred`: `true` shows the note on the homepage; `false` shows it only on `/notes`.
- `/notes` contains the full timeline, including starred notes, newest first. Same-day notes keep their order in the JSON file.
- Save to preview locally; rebuild and deploy to update the live site. No backend or management UI.

The file starts empty so no example writing is published as your own. Invalid fields produce a build error identifying the note to fix.
