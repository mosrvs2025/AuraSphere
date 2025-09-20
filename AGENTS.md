# Repository Guidelines

## Project Structure & Modules
- App entry: `index.html`, `index.tsx`, `App.tsx`.
- UI: `components/*.tsx` (PascalCase components).
- State: `context/*.ts(x)` (React contexts).
- Services: `services/geminiService.ts` (Gemini integration).
- Styles: `src/index.css` (Tailwind v4 utilities).
- Config/docs: `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `docs/*.md`.
- Import alias: `@/*` maps to repo root (e.g., `import { Header } from '@/components/Header'`).

## Architecture Overview
- `App.tsx` orchestrates routing and owns core UI state (rooms, posts, conversations, overlays, `activeView`).
- Views resolve via a priority stack (profile → conversation → post → creators → fallback by `activeView`).
- Contexts: `UserContext` (identity + follow/unfollow) and `RoomActionsContext` (room controls shim).
- MiniPlayer and overlay modals are mounted globally; header/nav visibility adapts based on active subviews.
- Mock data generators seed a realistic UI without a backend.

## Build, Test, and Development
- `npm run dev`: start Vite dev server.
- `npm run build`: production build to `dist/`.
- `npm run preview`: preview the production build.
- Node 18+ recommended. Install with `npm ci` (CI) or `npm install` (local).

## Coding Style & Naming
- TypeScript + React 19; functional components and hooks.
- Indentation 2 spaces, single quotes, semicolons.
- Components: PascalCase filenames (e.g., `GlobalHeader.tsx`).
- Variables/functions: camelCase; constants in `constants.ts` as named exports.
- Use the `@` import alias; avoid deep relative paths.
- Styling: Tailwind utility classes; keep component styles co-located.

## Testing Guidelines
- No test runner is configured yet. Recommended: Vitest + React Testing Library.
- Name and colocate tests as `Component.test.tsx` or `file.test.ts` next to sources.
- Target ≥80% coverage on new logic (services, reducers, complex hooks) once tests are added.
- Keep tests deterministic; mock network/AI calls from `services/`.

## Commit & Pull Requests
- Conventional Commits (e.g., `feat: add RoomView layout`, `fix: prevent null context crash`).
- PRs include: purpose summary, linked issues, before/after screenshots or video for UI changes, and test notes.
- Keep PRs focused and under ~300 lines of diff when possible; call out breaking changes.

## Security & Configuration
- Do not commit secrets. `services/geminiService.ts` reads `process.env.API_KEY` / `GEMINI_API_KEY` injected at build time by Vite config.
- Use local env files (e.g., `.env.local`) and ensure they’re ignored.
- Never expose private keys in client bundles; pass only safe, public values when needed.

## Local Env Setup
- Create `.env.local` in the repo root (ignored by Git).
- Set one of:
```
API_KEY=your-gemini-key    # or
GEMINI_API_KEY=your-gemini-key
```
- Quickstart:
```
npm install
echo "GEMINI_API_KEY=your-gemini-key" > .env.local
npm run dev
```

## Agent-Specific Instructions
- Keep diffs minimal; align with existing patterns.
- Avoid drive-by refactors; update `docs/` and this file when conventions change.
