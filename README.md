# DevWiz

DevWiz is a multi-tool developer utility app built with Next.js App Router. It includes format transformers, API/debug utilities, image/meta tooling, and interactive editors in a single workspace.

## Features

- Data transforms: JSON/YAML/TOML/XML/Markdown/CSS/URL conversion
- Utility tools: JWT debugger, timestamp converter, cron helper, curl converter, diff viewer
- Visual tools: SVG viewer/optimizer, JSON tree/graph, OG image playground, whiteboard
- AI-assisted tools through Hugging Face-compatible models
- README generator with drag-and-drop sections
- PWA/service worker support via Serwist

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Biome (lint + format)

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Run development mode:

```bash
pnpm dev
```

The app runs at `http://localhost:3000`.

## Scripts

- `pnpm dev`: Next.js dev server + Serwist watcher
- `pnpm build`: build service worker + Next.js production build
- `pnpm start`: start production server
- `pnpm lint`: run Biome linter
- `pnpm lint:fix`: run Biome lint fixes
- `pnpm check`: run full Biome checks
- `pnpm format`: format files with Biome

## Environment Variables

Set canonical SEO URL:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Used for:

- `sitemap.xml`
- `robots.txt` host/sitemap
- global metadata base and OG URLs

For AI tools, configure tokens/models in the in-app settings UI.

## Notes

- This repo uses `pnpm`, so dependency content is stored mainly under `node_modules/.pnpm`.
- If you are checking disk usage, inspect `node_modules/.pnpm` rather than top-level symlinks.
