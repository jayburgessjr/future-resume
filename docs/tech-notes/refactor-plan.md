# Refactor Plan

## Discovery
- Toolchain: Vite + React (vite 5) with SWC.
- TypeScript: base configuration with path alias `@/*`, non-strict (will enable strict later).
- Router: react-router-dom.
- UI kit: shadcn UI built on Radix and Tailwind CSS.
- State management: Zustand already present.
- Testing: Vitest configured.
- Preflight: `npm run build`, `npm test`, and `npx tsc --noEmit` all pass.

## Decisions
- Introduce canonical types for settings, inputs, outputs, status.
- Consolidate state into a single `useAppDataStore` with resilient selector and guarded generation.
- Migrate all store imports and preview logic to selector pattern.
- Rebuild résumé builder UI to use local preview and selector output.
- Add ts-prune and knip to clean dead code and packages.
- Enable strict TypeScript, ESLint, Prettier.
- Add tests (unit + Playwright) and CI pipeline.
- Guard debug probe in production builds.

## Acceptance
- Generate button updates preview immediately via local state.
- Preview clears on refresh (no persistence implemented).
- Concurrent generates keep only the latest result.
- Export bar uses the same generated text.
- No components read `outputs.resume` directly; selector & local state used.
- `npm run typecheck` and `npm run build` succeed.
