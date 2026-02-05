# Planning Poker

Simple, collaborative planning poker app for agile teams.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- HTTP Polling for real-time sync
- In-memory storage (POC)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Multi-user sessions with shareable links
- Fibonacci voting scale (0, 1, 2, 3, 5, ?, ☕)
- Hidden votes until reveal
- Automatic statistics and distribution charts
- Mobile-responsive with dark mode
