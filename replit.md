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
- `workers-site/index.js` - Cloudflare Worker entry point (serves static files)
- `wrangler.toml` - Cloudflare Workers configuration
- `dist/public/` - Built static files (output of `npx vite build`)

## Deployment to Cloudflare Workers Sites
1. Build the frontend: `npx vite build --config vite.config.ts`
2. Deploy using Wrangler: `npx wrangler deploy`

The `wrangler.toml` uses the modern `[assets]` configuration with `serving_mode = "single-page-application"` which handles SPA routing automatically. Wrangler manages the asset manifest and KV binding internally — no manual setup required.

## Local Development
- Run `npm run dev` to start the development server on port 5000

## Recent Changes
- Converted from Express+PostgreSQL backend to fully static site
- High scores stored in browser localStorage instead of database
- Added wrangler.toml and Workers Site entry point for Cloudflare deployment
