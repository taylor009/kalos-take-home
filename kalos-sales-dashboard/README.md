# Kalos Sales Dashboard

Real-time sales analytics dashboard built for the Kalos take-home project.

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers (both frontend and backend)
npm run dev

# Or start individually
npm run dev:backend    # Hono API server
npm run dev:frontend   # Next.js app
```

## Architecture

This project uses a monorepo structure:

- `apps/backend/` - Hono.js API server with WebSocket support
- `apps/frontend/` - Next.js 14 dashboard application  
- `packages/shared/` - Shared TypeScript types and utilities

## Features

- Real-time transaction updates via WebSockets
- Live analytics dashboard
- Transaction search and filtering
- Responsive design
- Type-safe throughout with TypeScript

## Development

The project uses npm workspaces for dependency management. Each app and package has its own `package.json` and can be developed independently.

## Tech Stack

**Backend:**
- Hono.js (fast web framework)
- Socket.io (real-time communication)
- TypeScript

**Frontend:**
- Next.js 14 (React framework)
- Tailwind CSS (styling)
- React Query (state management)
- Socket.io Client

## Time Budget

This project was completed as part of a 4-hour take-home challenge, focusing on clean, maintainable code and core functionality.
