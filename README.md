# DevWiz

Build faster with one focused developer workspace.

DevWiz is an all-in-one toolkit for everyday engineering tasks: transforms, debugging, visual tooling, API helpers, AI-assisted workflows, and productivity utilities, all in a single modern web app.

## Highlights

- **Flow Board** – Visual node-based workspace for exploring APIs and building data pipelines. Diagram mode turns JSON into flow graphs; workflow mode chains DevWiz tools into pipelines
- **50+ built-in tools** across utilities, converters, JSON workflows, AI tools, and playgrounds
- **Visual and interactive tooling**: JSON, SVG, OG images, whiteboarding, flow diagrams, cubic-bezier curves, Flex & Grid CSS
- **Global Command Menu**: Quick access to all tools and themes via `Cmd+K`
- **Flex & Grid Playground**: Interactive CSS flexbox / grid “lab” with guided challenges, presets, and live preview
- **Date Utilities**: date-fns powered format, parse, compare, add/subtract, and more
- **Unit Converter**: Length, weight, temperature, time, and data size conversions
- **Premium UI**: Sleek theme-aware aesthetic with smooth motion transitions and responsive layouts
- **3D model viewer**: GLTF/GLB viewer with orbit controls
- **PWA support**: Service worker integration via Serwist

## Keyboard Shortcuts

- `⌘ K`: Open Global Command Menu
- `⌘ Enter`: Run AI tool (Regex, Code Commenter, Mock Data, Commit Message, Error Explainer)
- `ESC`: Close active menu or modal
- `↑ / ↓`: Navigate tool lists or command menu
- `Enter`: Select or open tool

## Tool Map

### Utilities

- Icon Search
- Whiteboard
- **Flow Board**: Node-based visual workspace for data structures and workflows. [Full documentation →](docs/flow-board.md)
- Diff Viewer
- Regex Playground
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
- Date Utilities (date-fns)
- Cron Expression Helper
- Unit Converter
- GLTF/GLB 3D Model Viewer
- Cubic-Bezier Visualizer
- VSCode Theme Generator

### AI Tools

- Regex Explainer (AI)
- Code Commenter (AI)
- Mock Data Generator (AI)
- Commit Message (AI)
- Error Explainer (AI)

### Playground

- API Playground (HTTP requests with CORS bypass, SOAP/XML support; optional "Flow Board" toggle to send requests into Flow Board workflow)
- Flex & Grid Playground

### Converters

- SOAP to REST (SOAP XML → cURL, fetch, Axios, Python)
- SVG to JSX
- SVG Viewer
- Color Converter
- String Case Converter

### Data and Format Workflows

- JSON to TypeScript
- URL Encode / Decode
- JSON to Tree View
- CSS to Tailwind
- Tailwind to CSS
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

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- Command Menu (`cmdk`)
- Animations via `motion/react`
- Biome for linting and formatting
- Vitest + React Testing Library for unit tests
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
pnpm install   # if you haven't already
pnpm dev
```

Open http://localhost:3000.

### Production Build

```bash
pnpm build
pnpm start
```

## Available Scripts

- **pnpm dev**: start Next.js dev server (Turbopack) and Serwist watcher
- **pnpm build**: build service worker and Next.js production bundle
- **pnpm start**: run production server
- **pnpm lint**: run Biome lint checks
- **pnpm lint:fix**: auto-fix lint issues with Biome
- **pnpm check**: run Biome checks across project
- **pnpm format**: format project with Biome
- **pnpm test**: run Vitest tests (watch mode)
- **pnpm test:run**: run Vitest tests once (CI)
- **pnpm precommit**: run lint-staged (Biome check on staged files)

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
	test/               # Vitest setup
```

Core entry points:

- src/lib/registry.ts: tool metadata and catalog
- src/lib/toolRoutes.ts: tool to route mapping
- src/app/transform/[toolId]/page.tsx: dynamic transform tool route

## Quality and Standards

- Type-safe codebase with TypeScript
- Biome-driven formatting and lint checks
- Vitest + React Testing Library for unit tests
- Modular components for easier maintenance and feature growth

## Contribution

1. Fork the repository.
2. Create a feature branch.
3. Make changes with clear commits.
4. Run quality checks:

```bash
pnpm check
pnpm lint
pnpm test:run
```

5. Open a pull request with screenshots or short videos for UI changes.

## License

This project is licensed under the MIT License. See LICENSE for details.
