# Codebase Blueprint

Rules for how source code is physically organized, named, and created. Read by gsd-executor, gsd-planner, and gsd-plan-checker before any file creation task.

<purpose>
Define WHERE files go, HOW they are named, and WHAT foundation must exist — so every agent creates files consistently regardless of which phase they execute.

This file describes the rules. The actual project blueprint lives at `.planning/codebase/STRUCTURE.md` and `.planning/codebase/CONVENTIONS.md`. Those files are created during `/gsd:new-project` and are the ground truth for a specific project.
</purpose>

---

## Stack Detection

When generating a project blueprint, detect the stack from `.planning/research/STACK.md` or `package.json`.

| Stack signature | Blueprint to apply |
|---|---|
| `next` + `tailwindcss` + `@radix-ui` or `shadcn` | Next.js 15 App Router + Tailwind + shadcn/ui (see below) |
| `next` + `tailwindcss` (no radix) | Next.js 15 App Router + Tailwind (minimal) |
| `vite` + `react` + `tailwindcss` | React + Vite + Tailwind |
| Other | Generic — ask user to define structure |

---

## Blueprint: Next.js 15 App Router + Tailwind + shadcn/ui

### Directory Structure

```
[project-root]/
├── src/                          # ALL source code lives here
│   ├── app/                      # Next.js App Router — pages and layouts only
│   │   ├── (marketing)/          # Public pages route group
│   │   ├── (app)/                # Authenticated app route group
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global CSS + @layer definitions
│   │   └── page.tsx              # Root page
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui base components (NEVER custom logic here)
│   │   ├── layout/               # App-wide layout: header, footer, sidebar, nav
│   │   └── [feature]/            # Feature-scoped components (host/, attendee/, landing/, etc.)
│   ├── hooks/                    # Custom React hooks (use-*.ts)
│   ├── lib/                      # Pure utilities, helpers, clients
│   │   ├── utils.ts              # cn() function — MUST EXIST
│   │   ├── supabase/             # Supabase client factory (client.ts, server.ts)
│   │   ├── actions/              # Server Actions
│   │   ├── validations/          # Zod schemas
│   │   ├── types/                # TypeScript type definitions
│   │   └── [domain]/             # Domain-specific logic (scoring/, quiz/, media/, etc.)
│   ├── store/                    # Global client state (Zustand or Context)
│   └── middleware.ts             # Next.js middleware
├── public/                       # Static assets (images, fonts, icons)
├── supabase/                     # Supabase migrations and seed files
├── tests/                        # Test files
├── tailwind.config.ts            # Tailwind theme + design tokens — MUST EXIST
├── components.json               # shadcn/ui config — MUST EXIST
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                    # Never committed
```

### Foundation Files (MUST exist before first execute-phase)

These files are non-negotiable. If they don't exist, create them before executing any UI task:

**1. `src/lib/utils.ts` — cn() utility**
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
- Required dependencies: `clsx`, `tailwind-merge`
- Import path alias: `@/lib/utils`

**2. `tailwind.config.ts` — Design tokens via CSS variables**

All colors must use CSS variables, not hardcoded Tailwind palette names:
```typescript
// ✅ CORRECT — token-based
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ... project brand colors
}

// ❌ WRONG — hardcoded
// Never use: text-teal-600, bg-coral-500, text-zinc-100 scattered everywhere
```

**3. `src/app/globals.css` — Layered CSS**
```css
@layer base {
  :root { /* HSL variable definitions — light mode */ }
  .dark { /* HSL variable definitions — dark mode */ }
}
@layer components {
  /* Reusable class patterns: .gradient-text, .glass-effect, .card-hover */
  /* Repeated class combos (3+ uses) become named classes here */
}
@layer utilities {
  /* Animation delays, one-off helpers */
}
```

**4. `components.json` — shadcn/ui config**
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  }
}
```

---

## File Placement Rules

### What goes in `components/ui/`
- **ONLY** shadcn/ui base components (Button, Card, Badge, Input, Dialog, etc.)
- Never contains business logic
- Never imports from `lib/actions/` or `lib/supabase/`
- If a component needs business logic → it belongs in `components/[feature]/`

### What goes in `components/[feature]/`
- Components used by a specific domain (host, attendee, landing, dashboard)
- May import from `hooks/`, `lib/`, `store/`
- Named after the domain: `components/host/`, `components/attendee/`

### What goes in `components/layout/`
- App-wide structural components: `site-header.tsx`, `site-footer.tsx`, `sidebar.tsx`
- Components used across multiple features

### What goes in `lib/`
- Pure functions, no React (no JSX, no hooks)
- Exception: `lib/components/` does NOT exist — React components belong in `components/`
- Supabase clients: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- Server Actions: `lib/actions/[domain].ts`
- Types: `lib/types/[domain].ts`
- Validations: `lib/validations/[domain].ts`

### What goes in `hooks/`
- Custom React hooks: `use-[name].ts`
- May use Supabase, React Query, Zustand
- No JSX — hooks only

### What goes in `app/`
- `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx` — Next.js route files ONLY
- No business logic in page files — extract to components
- Route groups use parentheses: `(marketing)/`, `(app)/`, `(host)/`
- Co-located `_components/` allowed for page-specific components
- No component folders directly under `app/` without route context

---

## Naming Conventions

### Files
| Type | Convention | Example |
|---|---|---|
| React component | kebab-case `.tsx` | `quiz-card.tsx`, `event-tabs.tsx` |
| Custom hook | `use-` prefix, kebab-case `.ts` | `use-realtime-quiz.ts` |
| Server Action | kebab-case `.ts` | `quiz-actions.ts` |
| Utility | kebab-case `.ts` | `compute-points.ts` |
| Type definition | kebab-case `.ts` | `quiz-types.ts` |
| Page/Layout | `page.tsx`, `layout.tsx` | (Next.js standard) |

### Exports
| Type | Convention | Example |
|---|---|---|
| React component | PascalCase | `export function QuizCard()` |
| Hook | camelCase with `use` prefix | `export function useRealtimeQuiz()` |
| Utility function | camelCase | `export function computePoints()` |
| Type/Interface | PascalCase | `export interface QuizQuestion` |
| Constant | UPPER_SNAKE_CASE | `export const MAX_QUIZ_TIMER = 30` |

### Folders
- Feature folders: `kebab-case` — `photo-challenge/`, `quiz-engine/`
- Route groups: `(name)` — `(host)/`, `(app)/`
- Private route components: `_components/` prefix

---

## CSS Rules

### The cn() Rule
**Always use `cn()` for conditional or composed class strings. Never use template literals.**

```typescript
// ✅ CORRECT
import { cn } from '@/lib/utils'
className={cn('base-class', isActive && 'active-class', variant === 'primary' && 'primary-class')}

// ❌ WRONG
className={`base-class ${isActive ? 'active-class' : ''}`}
```

### The Design Token Rule
**Never use raw Tailwind palette colors for brand/theme values.**

```typescript
// ✅ CORRECT — uses token
className="bg-primary text-primary-foreground"
className="bg-brand-gradient"  // defined in @layer components

// ❌ WRONG — hardcoded palette
className="bg-teal-600 text-zinc-100"
// Fix: define --primary as teal-600 in CSS vars, use bg-primary
```

### The Repeated Class Rule
**If the same class combination appears 3+ times → extract to `@layer components` in globals.css.**

```css
/* globals.css — @layer components */
.btn-primary {
  @apply rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground
         transition-all hover:opacity-90 disabled:opacity-50;
}
```

### The cva() Rule
**For components with multiple variants, use `cva()` not conditional cn() chains.**

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('base-classes', {
  variants: {
    variant: { primary: '...', secondary: '...', ghost: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
```

---

## Pre-Creation Checks (MANDATORY for gsd-executor)

Before creating ANY new file, run these checks:

### 1. Route Duplicate Check
```bash
# Before creating app/X/Y/page.tsx
find src/app -name "page.tsx" | sed 's|/page.tsx||' | sort
# Verify no equivalent route exists under a different path or route group
```

### 2. Component Duplicate Check
```bash
# Before creating components/feature/component-name.tsx
find src/components -name "component-name.tsx" 2>/dev/null
find src/app -name "component-name.tsx" 2>/dev/null
# If found → extend existing, don't create duplicate
```

### 3. Path Compliance Check
Before creating a file, verify its path is consistent with the placement rules above:
- React component with JSX? → must be in `src/components/` or `src/app/`
- Pure utility function? → must be in `src/lib/`
- Custom hook? → must be in `src/hooks/`
- If path doesn't fit → checkpoint, don't auto-create

### 4. Foundation Check (before first UI task in a phase)
```bash
# Verify foundation files exist
[ -f "src/lib/utils.ts" ] || echo "MISSING: create src/lib/utils.ts with cn()"
[ -f "components.json" ] || echo "MISSING: create components.json for shadcn/ui"
grep -q "css-variables\|cssVariables" "components.json" 2>/dev/null || echo "WARNING: cssVariables not enabled"
grep -q "hsl(var(" "tailwind.config.ts" 2>/dev/null || echo "WARNING: design tokens not using CSS variables"
```

---

## Git Hygiene Rules

After any task that involves running scripts, Playwright, or external tools, check for and **DELETE** (not commit, not gitignore) these artifact types from the project root:

```bash
# Artifacts that must NEVER be committed
*.png, *.jpg, *.jpeg in project root  # Test/UAT screenshots → delete
*.log in project root                  # Debug logs (console.log, network.log) → delete
test-*.*, *-test.png in project root   # Binary test files → delete
```

Only commit:
- Source files (`.ts`, `.tsx`, `.css`, `.json`, `.md`)
- Config files at root level
- Public assets in `public/` folder

Stage files individually. Never `git add .` or `git add -A`.
