---
name: beautiful-ui-generator
description: Machine-enforceable UI rules for  — Tailwind v4, shadcn/ui, Framer Motion, mobile-first. Apply when generating or reviewing any UI component.
---

# beautiful-ui-generator

Machine-enforceable rules for  UI. Every rule has an ID, condition, requirement, and verify command.

---

## RULE-UI-01: Mobile-First Breakpoints

**APPLY WHEN:** Any component with layout or sizing classes.

**REQUIRED:**
- Base styles target 375px (mobile). Desktop styles use `md:` or `lg:` prefix.
- Touch targets: minimum `min-h-[44px] min-w-[44px]` on all interactive elements.

**FORBIDDEN:**
- Desktop-first patterns: `lg:hidden` on primary content, `hidden md:block` as default.

**VERIFY:**
```bash
# Interactive elements must have min touch target
grep -rn "onClick\|onPress" src/components --include="*.tsx" | head -5
# Check each has min-h-[44px] or py-3+ in its className
```

---

## RULE-UI-02: Color System — Teal/Coral Brand

**APPLY WHEN:** Any color declaration in component or CSS file.

**REQUIRED tokens (use these, not hardcoded hex):**
```css
--color-primary: theme(colors.teal.600)     /* #0d9488 */
--color-accent:  theme(colors.orange.500)   /* #f97316 */
--color-surface: theme(colors.gray.900)     /* dark bg */
--color-text:    theme(colors.gray.50)      /* light text on dark */
```

**FORBIDDEN:**
- Hardcoded hex colors in className: `text-[#6366f1]`, `bg-[#ec4899]`
- Purple gradient palette: `from-purple-`, `to-pink-` combinations
- `bg-white` as primary background (dark-first UI)

**VERIFY:**
```bash
grep -rn "from-purple-\|to-pink-\|bg-white" src/components --include="*.tsx"
# Must return empty
```

---

## RULE-UI-03: Typography

**APPLY WHEN:** Any text element.

**REQUIRED:**
- Headings: `font-bold` minimum, `tracking-tight` for h1/h2
- Body readable on dark bg: `text-gray-50` or `text-gray-200`
- Event energy: large headings `text-3xl` minimum on mobile

**FORBIDDEN:**
- `font-family: Inter` declared inline (use Tailwind defaults or next/font)
- `text-gray-900` on dark backgrounds (contrast fail)
- Small text on interactive elements: `text-xs` on buttons

**VERIFY:**
```bash
grep -rn "text-gray-900\|text-black" src/components --include="*.tsx"
# Should be rare — only on light-bg components
```

---

## RULE-UI-04: Animation — Framer Motion

**APPLY WHEN:** Any component with enter/exit transitions or user feedback.

**REQUIRED patterns:**
```tsx
// Page/section entry — always use this variant
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

// List items — stagger children
const container = {
  visible: { transition: { staggerChildren: 0.08 } }
}

// Wrap conditional renders
<AnimatePresence mode="wait">
  {show && <motion.div ...>}
</AnimatePresence>
```

**FORBIDDEN:**
- `transition-all duration-1000` (too slow, janky)
- Animating every element simultaneously (no stagger)
- `animate={{ x: [0, 10, -10, 0] }}` shake on errors (use color feedback instead)
- Heavy animations on scroll without `useReducedMotion()` check

**VERIFY:**
```bash
grep -rn "duration-1000\|duration-700" src/components --include="*.tsx"
# Must return empty — max duration-500
```

---

## RULE-UI-05: Confetti / Celebration

**APPLY WHEN:** Correct quiz answer, achievement unlock, event join success.

**REQUIRED:**
```tsx
// Use canvas-based confetti, NOT heavy libraries
import confetti from 'canvas-confetti'

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#0d9488', '#f97316', '#fbbf24']
  })
}
// Always auto-cleanup: confetti resets after animation naturally
```

**FORBIDDEN:**
- `react-confetti` or similar DOM-heavy packages
- Confetti that runs on page load (only on user action)
- Missing cleanup — confetti canvas left in DOM

**VERIFY:**
```bash
grep -rn "react-confetti" package.json
# Must return empty
```

---

## RULE-UI-06: Component Structure

**APPLY WHEN:** Creating any new component file.

**REQUIRED:**
```tsx
// 1. 'use client' only when needed (interactivity, hooks, browser APIs)
'use client'

// 2. Props interface always typed
interface QuizCardProps {
  question: string
  options: string[]
  onAnswer: (index: number) => void
}

// 3. cn() for conditional classes — never string concatenation
import { cn } from '@/lib/utils'
className={cn('base-class', isActive && 'active-class')}

// 4. shadcn/ui primitives first, custom only when needed
import { Button } from '@/components/ui/button'
```

**FORBIDDEN:**
- `className={'base ' + (isActive ? 'active' : '')}` — use cn()
- Inline styles: `style={{ color: '#fff' }}` — use Tailwind
- `any` type on props
- Missing `'use client'` on components that use useState/useEffect

**VERIFY:**
```bash
grep -rn "style={{" src/components --include="*.tsx" | grep -v "framer\|motion"
# Must return empty — inline styles forbidden except Framer Motion
grep -rn "className={'" src/components --include="*.tsx"
# Must return empty — use cn() instead
```

---

## RULE-UI-07: Accessibility

**APPLY WHEN:** Any interactive or media element.

**REQUIRED:**
- Images: `alt` attribute always present (empty string `alt=""` for decorative)
- Buttons without text: `aria-label` required
- Form inputs: `id` + `<label htmlFor>` pair
- Contrast: text on dark bg must pass 4.5:1 (teal-600 on gray-900 = ✅)

**FORBIDDEN:**
- `<div onClick={...}>` without `role="button"` and `tabIndex={0}`
- `<img>` without `alt`
- `aria-hidden="true"` on focusable elements

**VERIFY:**
```bash
grep -rn "<img" src/components --include="*.tsx" | grep -v "alt="
# Must return empty
grep -rn "onClick" src/components --include="*.tsx" | grep "<div\|<span"
# Review each — must have role="button" tabIndex={0}
```

---

## RULE-UI-08: Supabase Realtime UI Feedback

**APPLY WHEN:** Any component subscribed to Supabase realtime channel.

**REQUIRED:**
```tsx
// Always show connection state
const [connected, setConnected] = useState(false)

channel.on('system', {}, (payload) => {
  setConnected(payload.status === 'ok')
})

// Show loading skeleton while not connected
if (!connected) return <Skeleton className="h-20 w-full" />

// Cleanup on unmount — always
useEffect(() => {
  return () => { supabase.removeChannel(channel) }
}, [])
```

**FORBIDDEN:**
- Realtime component with no loading/connection state
- Missing channel cleanup (memory leak)
- Showing stale data without visual indicator when disconnected

**VERIFY:**
```bash
grep -rn "supabase.channel\|useRealtimeChannel" src --include="*.tsx" | head -10
# Each file should also contain removeChannel or cleanup
```
