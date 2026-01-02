# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI PRD Generator** - An AI-powered service that generates Product Requirements Documents (PRD) through a 3-stage questionnaire system.

**Target Users**: Product managers, developers, and solo entrepreneurs who want to quickly document their ideas.

**Tech Stack**:

- Frontend: Next.js 15 (App Router), React 19, TypeScript
- Styling: Tailwind CSS with custom design system
- State: Zustand with local storage persistence
- Forms: React Hook Form + Zod validation
- Planned: Google OAuth (Supabase), Gemini API, PDF generation

## Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

### State Management Architecture

**Zustand Store Pattern** (`src/lib/store/useQuestionnaireStore.ts`):

- Single global store for all questionnaire data
- Automatic persistence to localStorage via Zustand middleware
- Three distinct stage data structures (Stage1Data, Stage2Data, Stage3Data)
- Store tracks current stage and completion state
- Actions follow functional programming patterns (immutable updates)

Key pattern:

```typescript
// Store automatically persists to localStorage
const store = useQuestionnaireStore();
store.updateStage1({ serviceName: "value" }); // Partial updates
```

### Component Architecture

**Three-Layer Structure**:

1. **Layout Components** (`src/components/layout/`):

   - `Header`: Sticky navigation with auth placeholder
   - `ResponsiveContainer`: Consistent max-width container (`.container-responsive` utility)
   - `FloatingActions`: Fixed bottom-right buttons (PRD generation, reset)

2. **UI Components** (`src/components/ui/`):

   - Reusable primitives: Button, Card, Input, Textarea, Select, Modal
   - Variant-based styling using TypeScript discriminated unions
   - All use `cn()` utility for className composition (clsx + tailwind-merge)
   - ForwardRef pattern for proper ref handling

3. **Feature Components** (planned in `src/components/questionnaire/`, `src/components/prd/`):
   - Stage-specific questionnaire forms
   - PRD generation and display components

### Design System

**Design Tokens** (`tokens.json`):

The project uses a comprehensive design token system for consistency:

- **Colors**:
  - `brand`: Cyan/Sky blue scale for primary actions and brand identity
  - `accent`: Magenta/Fuchsia scale for highlights and interactive elements
  - `neutral`: Zinc grayscale for UI elements
  - `success/warning/error`: Semantic colors for feedback
  - `gradients`: Pre-defined gradients for modern UI effects

- **Shadows**:
  - Standard: `xs` to `2xl` for elevation hierarchy
  - `glow`: Animated glow effects for interactive states
  - `interactive`: Special shadows for hover/focus states

- **Animations**:
  - Entry animations: `fadeIn`, `slideInUp/Down/Left/Right`, `scaleIn`
  - Interactive: `pulse`, `bounce`, `shimmer`
  - Progressive reveal: Questions should animate in sequentially

- **Transitions**:
  - Duration: `instant` (50ms) to `slowest` (700ms)
  - Easing: `spring` for playful interactions, `bounce` for attention-grabbing effects
  - Use `spring` easing for input field appearances

**Interactive Design Patterns**:

1. **Progressive Question Reveal**:
   ```typescript
   // Questions should appear one at a time as user completes previous input
   // Use slideInUp + fadeIn animations with staggered delays
   // Example: Q1 visible → User fills Q1 → Q2 animates in
   ```

2. **Input Focus States**:
   - Apply `glow` shadow on focus
   - Subtle scale transform (1.02) for active inputs
   - Use `spring` easing for smooth transitions

3. **Stage Transitions**:
   - Use `slideInRight` when moving to next stage
   - Apply gradient backgrounds for stage headers
   - Animate stage completion with `scaleIn` + success color

**Tailwind Configuration** (`tailwind.config.ts`):

Custom configuration extends default Tailwind with token values:
- Import and apply values from `tokens.json`
- Custom shadow utilities: `shadow-glow-sm`, `shadow-interactive-md`
- Animation utilities: `animate-slideInUp`, `animate-fadeIn`
- Gradient utilities from tokens

**Global Utility** (`.container-responsive`):

```css
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Type System Structure

**Questionnaire Types** (`src/lib/types/questionnaire.ts`):

The 3-stage data model mirrors the PRD requirements:

1. **Stage1Data**: Service overview (name, features, screens, user journey, tone)
2. **Stage2Data**: Design elements (themes, colors, typography, UI details)
3. **Stage3Data**: Technical constraints (tech stack, APIs, auth, edge cases)

All types are strictly typed interfaces - use these when implementing forms to ensure type safety.

### PRD Generation Flow (Planned)

1. User fills 3-stage questionnaire → Zustand store (auto-persisted)
2. Click "PRD 생성" button → FloatingActions triggers modal
3. Modal confirms inputs → POST to `/api/prd/generate`
4. API formats data → Gemini API prompt → Streams markdown response
5. Display preview → Allow download (.md or .pdf)
6. Optionally save to Supabase (if authenticated)

### Styling Patterns

**Component Styling Convention**:

```typescript
// Use cn() for all className composition
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-interactive-sm hover:shadow-interactive-md transition-all duration-normal",
  outline: "border-2 border-neutral-300 bg-transparent hover:border-brand-500 hover:bg-brand-50 transition-all duration-normal",
  ghost: "bg-transparent hover:bg-neutral-100 active:scale-98 transition-all duration-fast"
};

// Interactive states should include animations
const interactiveClasses = "hover:scale-102 active:scale-98 transition-transform duration-normal ease-spring";

<div className={cn(baseStyles, variants[variant], interactiveClasses, className)} />;
```

**Animation Implementation**:

```typescript
// Progressive reveal pattern for questions
const QuestionItem = ({ index, children }) => (
  <div
    className="animate-slideInUp opacity-0"
    style={{
      animationDelay: `${index * 150}ms`,
      animationFillMode: 'forwards'
    }}
  >
    {children}
  </div>
);

// Focus state with glow effect
<input
  className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
/>
```

**Responsive Design**:

- Mobile-first approach (default → sm → md → lg breakpoints)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- All layouts must support 320px to 1920px+ viewports
- Adjust animation complexity based on screen size (reduce motion on mobile if needed)

### Future Integration Points

**Google OAuth** (via Supabase):

- Optional for PRD generation (non-authenticated users allowed)
- Required for history/saving features
- Auth state should be managed in a separate store or context

**Gemini API**:

- Endpoint: `app/api/generate/route.ts` (to be created)
- Use Vercel AI SDK's `streamText` for real-time generation
- Include error handling for rate limits and network issues

**Database Schema** (Supabase):

- `users` table: Google OAuth integration
- `prd_documents` table: user_id (nullable), questionnaire_data (JSONB), generated_prd (TEXT)

## Key Files Reference

- `tokens.json`: Complete design token system - colors, typography, spacing, animations, shadows
- `prompt/initial.md`: Original PRD specification with detailed requirements
- `process/checklist.md`: Development task breakdown and progress tracking
- `src/lib/types/questionnaire.ts`: Source of truth for all data structures
- `src/lib/store/useQuestionnaireStore.ts`: Global state management
- `tailwind.config.ts`: Tailwind configuration extending design tokens
- `CLAUDE.md`: This file - architectural guidance and patterns

## Development Notes

**Programming Paradigm**: Prefer functional programming and OOP principles (as specified in initial.md), use clean architecture

**UI/UX Philosophy**:
- **Minimalist & Refined**: Clean layouts with purposeful whitespace, inspired by Lovable and Bolt.new
- **Progressive Disclosure**: Reveal questions sequentially as user progresses - don't overwhelm with all questions at once
- **Delightful Interactions**: Use subtle animations (slide, fade, scale) to create smooth, engaging experience
- **Visual Feedback**: Immediate response to user actions (hover states, focus glows, micro-interactions)
- **Gradients & Depth**: Use gradient backgrounds sparingly for headers/CTAs, shadows for elevation hierarchy
- **Micro-animations**: Button hover states, input focus effects, stage transitions should feel fluid and responsive

**Korean Language**: All UI text, error messages, and user-facing content should be in Korean

**Form Implementation**: Use React Hook Form with Zod for all questionnaire stages - schemas should validate against type definitions

**SSG Strategy**: Homepage (`app/page.tsx`) should be statically generated for SEO optimization
