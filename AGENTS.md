# AGENTS.md - OpenRouter App

## Project Structure

```
001-project_Implementing-OpenRouter/
├── openrouter-repo/      # Git main (v4.0.0) - ALWAYS WORK HERE
├── v1-fase1/             # Git worktree - Fase 1
├── v1-fase2/             # Git worktree - Fase 2
├── v2-fase3/             # Git worktree - Fase 3
├── v2-fase4/             # Git worktree - Fase 4
└── v3-fase5/             # Git worktree - Fase 5
```

## Commands

```bash
# ALWAYS run from openrouter-repo directory
cd "001-project_Implementing-OpenRouter/openrouter-repo"

# Dev server (REQUIRED: --webpack flag - turbopack broken on Windows)
npm run dev -- --webpack

# Build
npm run build -- --webpack

# Tests
npm test -- --run

# Lint
npm run lint
```

## Key Details

- **Next.js 16.2.4** with React 19 + TypeScript
- **Edge Runtime** for API routes (`/api/chat`, `/api/models`)
- **SWR** for data fetching with caching
- **Zod** for request validation
- **Vitest** for unit tests (18 tests passing)

## Common Issues

1. **"localhost refused to connect"** - You're running from wrong directory. Must be in `openrouter-repo/`
2. **Build fails with turbopack** - Always use `--webpack` flag on Windows
3. **TypeScript errors** - Run build first to catch type issues

## Git Worktrees

The project uses git worktrees for versioned development. Each folder (`v1-fase1`, etc.) is a separate checkout tied to the main repo in `openrouter-repo/`.