---
name: clean-code-enforcer
description: Machine-enforceable code quality rules for  — TypeScript strict, Next.js 15 App Router, Supabase error handling, no magic strings. Apply when reviewing or generating any source file.
---

# clean-code-enforcer

Machine-enforceable rules for  code quality. Every rule has an ID, condition, requirement, and verify command.

---

## RULE-CC-01: No Unhandled Promises

**APPLY WHEN:** Any Supabase call, fetch, or async operation.

**REQUIRED pattern:**
```tsx
// Always destructure error and check it
const { data, error } = await supabase.from('events').select('*')
if (error) {
  console.error('[] fetch events failed:', error.message)
  // Return early or throw — never silently ignore
  return { error }
}
```

**FORBIDDEN:**
```tsx
// No floating promises
supabase.from('events').select('*')  // ❌ not awaited
await supabase.from('events').select('*')  // ❌ error not checked
fetch('/api/...').then(r => r.json())  // ❌ no .catch()
```

**VERIFY:**
```bash
# Find awaited Supabase calls without error check
grep -rn "await supabase\." src --include="*.ts" --include="*.tsx" -A 1 | grep -v "error\|Error\|catch"
# Review each result — should have error handling on the next line
```

---

## RULE-CC-02: No Magic Strings

**APPLY WHEN:** Any string literal used more than once or representing a domain value.

**REQUIRED:**
```tsx
// Constants file: src/lib/constants.ts
export const SUPABASE_TABLES = {
  EVENTS: 'events',
  MEDIA: 'event_media',
  QUIZ_ANSWERS: 'quiz_answers',
} as const

export const REALTIME_CHANNELS = {
  LEADERBOARD: (eventId: string) => `leaderboard:${eventId}`,
  MEDIA_FEED: (eventId: string) => `media:${eventId}`,
} as const

// Usage
supabase.from(SUPABASE_TABLES.EVENTS)
supabase.channel(REALTIME_CHANNELS.LEADERBOARD(eventId))
```

**FORBIDDEN:**
```tsx
supabase.from('events')          // ❌ magic string
supabase.channel('leaderboard')  // ❌ magic string, also missing eventId scope
router.push('/host/dashboard')   // ❌ hardcoded route string
```

**VERIFY:**
```bash
grep -rn "supabase\.from('" src --include="*.ts" --include="*.tsx"
# Must return empty — all table names via constants
```

---

## RULE-CC-03: TypeScript — No `any`

**APPLY WHEN:** Any TypeScript file.

**REQUIRED:**
```tsx
// Explicit types always
interface QuizAnswer {
  userId: string
  questionId: string
  selectedOption: number
  answeredAt: string
}

// Supabase response typed
const { data, error } = await supabase
  .from(SUPABASE_TABLES.QUIZ_ANSWERS)
  .select('*')
  .returns<QuizAnswer[]>()
```

**FORBIDDEN:**
```tsx
const data: any = ...       // ❌
function process(x: any)    // ❌
as any                      // ❌ except in test mocks with comment explaining why
// @ts-ignore              // ❌ fix the type instead
// @ts-nocheck             // ❌ never
```

**VERIFY:**
```bash
grep -rn ": any\|as any\|@ts-ignore\|@ts-nocheck" src --include="*.ts" --include="*.tsx"
# Must return empty
npx tsc --noEmit 2>&1 | wc -l
# Must return 0
```

---

## RULE-CC-04: Server Component vs Client Component

**APPLY WHEN:** Creating any `.tsx` file in `app/` or `components/`.

**DECISION TREE:**
```
Does it use useState / useEffect / useRef / useContext?  → 'use client'
Does it handle browser events (onClick, onChange)?        → 'use client'
Does it use browser APIs (localStorage, window)?         → 'use client'
Does it use Framer Motion animations?                    → 'use client'
Otherwise:                                               → Server Component (no directive)
```

**REQUIRED for Server Components:**
```tsx
// No directive needed — default is Server Component
// Can use async/await directly
async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id)  // direct DB call
  return <EventView event={event} />
}
```

**FORBIDDEN:**
```tsx
'use client'
// then uses no client features → remove directive, make it SC
```

**VERIFY:**
```bash
# Find 'use client' files — check each actually needs it
grep -rln "'use client'" src --include="*.tsx" | head -20
# For each, verify it uses: useState/useEffect/browser events/Framer Motion
```

---

## RULE-CC-05: Supabase Client Selection

**APPLY WHEN:** Any file importing from Supabase.

**RULE:**
```
Server Component / Route Handler / Server Action → import from '@/lib/supabase/server'
Client Component ('use client')                 → import from '@/lib/supabase/client'
```

**REQUIRED:**
```tsx
// Server Component
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**FORBIDDEN:**
```tsx
// Server-side client in 'use client' file
import { createClient } from '@/lib/supabase/server'  // ❌ in client component

// Raw supabase-js without wrapper
import { createClient } from '@supabase/supabase-js'   // ❌ use project wrappers
```

**VERIFY:**
```bash
# Server clients in client components
grep -rln "from '@/lib/supabase/server'" src --include="*.tsx" | xargs grep -l "'use client'" 2>/dev/null
# Must return empty
```

---

## RULE-CC-06: No console.log in Production Code

**APPLY WHEN:** Any source file being committed.

**REQUIRED:**
```tsx
// Structured logging with prefix
console.error('[] description:', error)
console.warn('[] description:', context)

// Development-only debug (wrap in condition)
if (process.env.NODE_ENV === 'development') {
  console.log('[debug]', data)
}
```

**FORBIDDEN:**
```tsx
console.log(data)           // ❌ raw log, no prefix
console.log('test')         // ❌ debug leftover
console.log(JSON.stringify(response))  // ❌
```

**VERIFY:**
```bash
grep -rn "console\.log(" src --include="*.ts" --include="*.tsx" | grep -v "NODE_ENV\|development\|// "
# Must return empty — only conditional dev logs allowed
```

---

## RULE-CC-07: Realtime Subscription Cleanup

**APPLY WHEN:** Any component that creates a Supabase channel.

**REQUIRED:**
```tsx
useEffect(() => {
  const channel = supabase
    .channel(REALTIME_CHANNELS.LEADERBOARD(eventId))
    .on('postgres_changes', { event: '*', schema: 'public' }, handler)
    .subscribe()

  // MANDATORY cleanup
  return () => {
    supabase.removeChannel(channel)
  }
}, [eventId])
```

**FORBIDDEN:**
```tsx
// Missing cleanup
useEffect(() => {
  supabase.channel('...').subscribe()
  // no return cleanup → memory leak ❌
}, [])
```

**VERIFY:**
```bash
# Find channel subscriptions — each must have removeChannel nearby
grep -rn "\.channel(" src --include="*.tsx" -l | xargs grep -L "removeChannel"
# Must return empty
```

---

## RULE-CC-08: Function Size

**APPLY WHEN:** Writing any function or component.

**REQUIRED:**
- Max 40 lines per function body (excluding types/interfaces)
- Single responsibility: one function does one thing
- Extract when: logic branches > 3, or cognitive complexity high

**FORBIDDEN:**
- Functions > 80 lines without clear reason
- Components returning JSX > 150 lines (extract sub-components)

**VERIFY:**
```bash
# Find long functions (rough heuristic)
awk '/^(export )?(default )?(async )?function|=> \{/{count=0} {count++} count>80{print FILENAME ":" NR " (" count " lines)"}' src/**/*.tsx 2>/dev/null
```

---

## RULE-CC-09: Server Actions

**APPLY WHEN:** Any function handling form submissions or mutations from Client Components.

**REQUIRED:**
```tsx
// File: src/lib/actions/event-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinEvent(eventId: string, nickname: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(SUPABASE_TABLES.EVENTS)...
  if (error) throw new Error(error.message)
  revalidatePath(`/event/${eventId}`)
}
```

**FORBIDDEN:**
```tsx
// API route used when Server Action would work
// POST /api/events/join → replace with Server Action for simple mutations

// 'use server' in component file (should be in separate actions file)
'use client'
async function handleSubmit() {
  'use server'  // ❌ inline server action in client component
}
```

**VERIFY:**
```bash
grep -rln "'use server'" src --include="*.ts" --include="*.tsx" | grep -v "actions"
# Server actions should live in actions/ files
```
