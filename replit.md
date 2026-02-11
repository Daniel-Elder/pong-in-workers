# Pong Game - Cloudflare Workers Sites

## Overview
A classic Pong game built as a web application, designed for deployment on Cloudflare Workers Sites with D1 database for high score storage. The game features a single-player mode against an AI opponent, global high score tracking, and a retro arcade aesthetic.

## Architecture
- **Frontend**: React + Vite (static SPA)
- **Game Engine**: HTML5 Canvas with requestAnimationFrame loop
- **Production Backend**: Cloudflare Worker (`worker/index.ts`) with D1 database
- **Local Dev Backend**: Express server (`server/`) with PostgreSQL
- **Scores**: Stored in Cloudflare D1 (production) / PostgreSQL (local dev)
- **API**: `/api/scores` (GET for listing, POST for creating)

## Project Structure
- `client/` - React frontend source
  - `src/components/PongGame.tsx` - Main game canvas and logic
  - `src/components/ArcadeButton.tsx` - Retro styled button component
  - `src/pages/Home.tsx` - Start screen with high scores
  - `src/hooks/use-scores.ts` - Score hooks using API calls
- `worker/index.ts` - Cloudflare Worker entry point (handles API + serves static files)
- `migrations/0001_create_scores.sql` - D1 database migration
- `wrangler.toml` - Cloudflare Workers + D1 configuration
- `server/` - Express backend for local development
- `shared/` - Shared types and schemas
- `dist/public/` - Built static files (output of `npx vite build`)

## Deployment to Cloudflare Workers Sites

### Prerequisites
1. Create a D1 database in Cloudflare dashboard: `npx wrangler d1 create pong-scores`
2. Update the `database_id` in `wrangler.toml` with the ID from step 1
3. Run the migration: `npx wrangler d1 migrations apply pong-scores`

### Build Command (set in Cloudflare dashboard)
```
npx vite build --config vite.config.ts && npx wrangler deploy
```
This builds the static files first, then deploys the Worker + assets.

## Local Development
- Run `npm run dev` to start the development server on port 5000
- Uses Express backend with PostgreSQL for score storage
- Same `/api/scores` endpoints as production

## Recent Changes
- Added Cloudflare Worker (`worker/index.ts`) for D1-backed score API
- Created D1 migration for scores table
- Updated frontend to use API calls instead of localStorage
- Dual backend: Express+PostgreSQL for dev, Worker+D1 for production
