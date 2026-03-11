# DevWiz

Build faster with one focused developer workspace.

DevWiz is an all-in-one toolkit for everyday engineering tasks: transforms, debugging, visual tooling, API helpers, AI-assisted workflows, and productivity utilities, all in a single modern web app.

## Highlights

- 40+ built-in tools across utilities, converters, JSON workflows, and AI tools
- Visual and interactive tooling for JSON, SVG, OG images, whiteboarding, and curves
- **Global Command Menu**: Quick access to all tools and themes via `Cmd+K`
- **Flex & Grid Playground**: Interactive CSS flexbox / grid “lab” with challenges, hints, and live preview
- **Premium UI**: Sleek theme-aware aesthetic with smooth motion transitions and responsive layouts for mobile and tablet
- 3D model utility with a premium GLTF/GLB viewer and orbit controls
- PWA support with service worker integration via Serwist
- App Router architecture with reusable client components and clean route mapping

## Keyboard Shortcuts

- `⌘ K`: Open Global Command Menu
- `ESC`: Close active menu or modal
- `↑ / ↓`: Navigate tool lists or command menu
- `Enter`: Select or open tool

## Tool Map

### Utilities

- Icon Search
- Whiteboard
- Diff Viewer
- OG Image Generator
- Metascraper
- UUID / NanoID / ULID Studio
- Fake Data Generator
- cURL Converter
- BlurHash Generator
- Hash Generator
- Password Generator
- JWT Debugger
- Timestamp Converter
- Cron Expression Helper
- GLTF/GLB 3D Model Viewer
- Cubic-Bezier Visualizer

### AI Tools

- Regex Explainer (AI)
- Code Commenter (AI)
- Mock Data Generator (AI)
- Commit Message (AI)
- Error Explainer (AI)

### Playground

- Flex & Grid Playground

### Converters

- SVG to JSX
- SVG Viewer
- Color Converter
- String Case Converter

### Data and Format Workflows

- JSON to TypeScript
- URL Encode / Decode
- JSON to Tree View
- JSON to Graph
- CSS to Tailwind
- JSON to YAML
- YAML to JSON
- JS Object to JSON
- CSS to JS Objects
- Markdown to HTML
- XML to JSON
- JSON to JSON Schema
- JSON to TOML
- TOML to JSON
- YAML to TOML
- TOML to YAML

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Command Menu (`cmdk`)
- Animations via `motion/react`
- Biome for linting and formatting
- Serwist for service worker and PWA behavior

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Run in Development

```bash
pnpm dev
```

Open http://localhost:3000.

### Production Build

```bash
pnpm build
pnpm start
```

## Available Scripts

- pnpm dev: start Next.js dev server and Serwist watcher
- pnpm build: build service worker and Next.js production bundle
- pnpm start: run production server
- pnpm lint: run Biome lint checks
- pnpm lint:fix: auto-fix lint issues with Biome
- pnpm check: run Biome checks across project
- pnpm format: format project with Biome

## Configuration

Set canonical site URL for SEO metadata:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

This value is used for:

- sitemap generation
- robots host and sitemap entries
- metadata base and OG URL composition

For AI-powered tools, configure provider/model credentials in the in-app settings panel.

## Project Structure

```text
src/
	app/                # App Router pages and API routes
	components/         # Tool clients and shared UI
	lib/                # Registry, routing, helpers, utilities
	hooks/              # Shared hooks
	workers/            # Web workers (transform pipelines)
```

Core entry points:

- src/lib/registry.ts: tool metadata and catalog
- src/lib/toolRoutes.ts: tool to route mapping
- src/app/transform/[toolId]/page.tsx: dynamic transform tool route

## Quality and Standards

- Type-safe codebase with TypeScript
- Biome-driven formatting and lint checks
- Modular components for easier maintenance and feature growth

## Contribution

1. Fork the repository.
2. Create a feature branch.
3. Make changes with clear commits.
4. Run quality checks:

```bash
pnpm check
pnpm lint
```

5. Open a pull request with screenshots or short videos for UI changes.

## License

This project is licensed under the MIT License. See LICENSE for details.
