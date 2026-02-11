# Pong Game - Cloudflare Workers Sites

## Overview
A classic Pong game built as a static web application, designed for deployment on Cloudflare Workers Sites. The game features a single-player mode against an AI opponent, local high score tracking via localStorage, and a retro arcade aesthetic.

## Architecture
- **Frontend**: React + Vite (static SPA)
- **Game Engine**: HTML5 Canvas with requestAnimationFrame loop
- **Scores**: localStorage (no backend/database needed)
- **Deployment Target**: Cloudflare Workers Sites

## Project Structure
- `client/` - React frontend source
  - `src/components/PongGame.tsx` - Main game canvas and logic
  - `src/components/ArcadeButton.tsx` - Retro styled button component
  - `src/pages/Home.tsx` - Start screen with high scores
  - `src/hooks/use-scores.ts` - localStorage-based score management
- `wrangler.toml` - Cloudflare Workers configuration
- `dist/public/` - Built static files (output of `npx vite build`)

## Deployment to Cloudflare Workers Sites
In Cloudflare dashboard, set the **Build command** to:
```
npx vite build --config vite.config.ts && npx wrangler deploy
```
This builds the static files first, then deploys them.

The `wrangler.toml` uses the modern `[assets]` configuration. Wrangler handles asset serving automatically — no Worker script required.

## Local Development
- Run `npm run dev` to start the development server on port 5000

## Recent Changes
- Converted from Express+PostgreSQL backend to fully static site
- High scores stored in browser localStorage instead of database
- Added wrangler.toml for Cloudflare Workers deployment
- Removed workers-site entry point (not needed with modern [assets] config)
