# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking (no emit)
- `npm test` - Run Vitest tests
- `npm run dead:exports` - Find unused exports with ts-prune
- `npm run dead:files` - Find dead files with knip
- `npm run dead:report` - Combined dead code report

### Local Development with Supabase
- Requires Supabase CLI for local development
- Database runs on port 54322, API on 54321, Studio on 54323
- Edge functions for AI processing at `supabase/functions/`

## Architecture Overview

### Core Application Flow
This is a React-based AI resume builder with a 7-phase optimization system:
```
Landing → Auth → Resume Builder → AI Generation → Cover Letter → Recruiter Highlights → Interview Toolkit → Export
```

### State Management Architecture
- **Zustand stores** with persistence middleware
- **appData.ts**: Resume content, generation settings, and outputs
- **subscriptionStore.ts**: Stripe subscription management  
- **authStore.ts**: Authentication state
- **persistenceStore.ts**: Data synchronization

### Key Services
- **resumeService.ts**: 7-phase AI resume generation orchestration
- **qualityCheck.ts**: Greatness Check scoring system (1-5 scale)
- **export.ts**: Multi-format output generation (PDF/Word/JSON)

### Component Architecture
- **Pages** in `src/pages/` correspond to routes
- **Feature-based components** in `src/components/[feature]/`
- **shadcn/ui components** in `src/components/ui/`
- **Subscription gating** via `<FeatureGuard>` wrapper

### Supabase Integration
- **Edge Functions**: AI processing, Stripe webhooks, subscription checks
- **Database**: User profiles, resumes, resume versions
- **Auth**: User authentication and session management
- **Row Level Security**: Enabled for all user data

## Important Patterns

### Import Aliases
- Use `@/` for all src imports (configured in vite.config.ts and tsconfig.json)
- Example: `import { Button } from "@/components/ui/button"`

### State Access
- Use store selectors for derived data: `selectGeneratedResume()`
- App data: `useAppDataStore()` for resume content and settings
- Subscription: `useSubscriptionStore()` for billing features

### Feature Gating
Always wrap Pro features in `<FeatureGuard>`:
```tsx
<FeatureGuard feature="interview_toolkit">
  <InterviewContent />
</FeatureGuard>
```

### AI Generation Flow
The 7-phase system runs through:
1. Core Competency Extraction
2. Company Signal Analysis  
3. Resume Rewriting & Optimization
4. Rapid Review Loop (1-5 scoring)
5. Final Output Generation
6. Deliverables Creation
7. Grammar & Readability Check

### Error Handling
- Use `logger.ts` for debugging
- Show upgrade modals for subscription limits
- Graceful degradation for failed AI generations

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with `noImplicitAny`, `noUnusedLocals`, `strictNullChecks`
- Path mapping configured for `@/*` imports
- Project uses composite TypeScript config (app + node)

### Testing Setup
- Vitest with jsdom environment
- Testing Library React for component tests
- Playwright for E2E tests in `tests/` directory
- Mock setup includes clipboard, print, and URL APIs

### Subscription Tiers
- **Free**: 1 resume, basic generation, no exports
- **Pro ($20/month)**: Unlimited resumes, version history, Interview Toolkit, PDF/Word exports

### Performance Considerations
- Zustand persistence for offline capability
- Component lazy loading where appropriate
- Optimized bundle with Vite + SWC
- Image optimization in `public/` directory

## Code Conventions

### File Organization
- Pages in `src/pages/` (route components)
- Business logic in `src/lib/` and `src/services/`
- Shared types in `src/shared/types.ts`
- Test files co-located in `src/__tests__/`

### Component Patterns
- Use shadcn/ui components for consistency
- Leverage Radix UI primitives for accessibility
- Implement proper ARIA labels and keyboard navigation
- Mobile-first responsive design with Tailwind CSS

### API Integration
- All AI processing through Supabase Edge Functions
- No direct external API calls from frontend
- Proper error boundaries for failed generations
- Subscription checks before expensive operations