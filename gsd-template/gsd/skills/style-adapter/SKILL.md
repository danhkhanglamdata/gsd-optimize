---
name: style-adapter
description: Convert pasted CSS/HTML from DevTools or inspiration sites to Tailwind v4 + shadcn/ui patterns. Analyze inspiration sites and apply their design language.
---

# style-adapter

Convert external CSS/HTML to EventVibe's Tailwind v4 + shadcn/ui patterns. Analyze inspiration sites and research gamification UI.

## Usage Modes

### Mode 1: Convert from CSS/HTML Paste

When user pastes CSS/HTML from DevTools or inspiration:

1. **Extract key visual properties:**
   - Colors: hex, rgb, gradients
   - Typography: font-family, sizes, weights
   - Spacing: padding, margin, gaps
   - Shadows, borders, radius
   - Animations/transitions

2. **Convert to Tailwind:**
   - Map colors to EventVibe palette or create custom classes
   - Convert flex/grid to Tailwind
   - Convert px to spacing scale (4px base)
   - Map animations to Framer Motion

3. **Make responsive:**
   - Design for 375px mobile first
   - Add md/lg breakpoints

### Mode 2: Analyze Inspiration URL

When user provides a URL to study (e.g., Kahoot, quiz apps, gamification sites):

```
## 🔍 Analyzing [URL] for Design Patterns

### Step 1: Fetch and Analyze
- Fetch the URL content
- Identify visual patterns:
  - Color scheme (dominant, accent, backgrounds)
  - Typography (headings, body, sizes)
  - Layout (grid, flex, spacing)
  - Animations (types, duration, easing)
  - Interactive elements (buttons, cards, gamification UI)

### Step 3: Document Findings
```markdown
## Design Analysis: [Site Name]

### Color Palette
- Primary: [colors found]
- Accent: [colors found]
- Background: [colors found]

### Typography
- Headings: [font, sizes]
- Body: [font, sizes]
- Weights used: [list]

### Layout Patterns
- Hero: [layout approach]
- Cards: [style, shadows, radius]
- Lists: [spacing, alignment]

### Gamification Elements (if applicable)
- Progress indicators: [style]
- Rewards/celebrations: [animations]
- Leaderboards: [design]
- Badges/achievements: [visual style]

### Animations
- Page transitions: [type]
- Micro-interactions: [type]
- Loading states: [type]

### Action Items
- [ ] Apply [specific pattern] to [EventVibe feature]
- [ ] Customize [element] for mobile
- [ ] Add [animation] for [interaction]
```
```

### Mode 3: Gamification UI Research

When building gamification features (wheel, badges, leaderboards, energy bar):

```
## 🎮 Gamification UI Research

### Step 1: Search Latest Trends
- Search "gamification UI design 2025"
- Search "young audience app gamification"
- Search "lucky wheel animation inspiration"
- Search "leaderboard UI gamification"

### Step 2: Study Competitors/Inspiration
- Kahoot: Quiz interface, timer, leaderboard
- Duolingo: Streaks, XP, badges
- TikTok: Engagement, streaks, rewards
- Live event apps: Real-time interactions

### Step 3: Research Specific Patterns

For each gamification element:

**Lucky Wheel:**
- Spin physics (ease-out, friction)
- Segment colors (bright, celebratory)
- Winner announcement (animation, sound cue)
- Mobile touch optimization

**Energy/Progress Bar:**
- Fill animation (smooth, satisfying)
- Glow effects for milestones
- Color transitions at thresholds
- Haptic-like visual feedback

**Leaderboard:**
- Rank change animations
- Top 3 highlighting
- Real-time updates (subtle pulse)
- User's own position prominent

**Achievement Badges:**
- Unlock animation (burst, glow)
- Collection view
- Rarity indicators (colors)
- Share capability

**Streaks:**
- Flame/fire visual
- Day counter
- Recovery mechanics (visual)
- Milestone celebrations

### Step 4: Generate Recommendations
Present 3-4 specific UI patterns to consider:
1. [Pattern name] — [where to use] — [effect]
2. [Pattern name] — [where to use] — [effect]
...
```

## Conversion Rules

### Colors
- Convert hex to Tailwind (e.g., `#6366f1` → `bg-indigo-500`)
- Create custom classes for brand colors: `.bg-brand-primary`
- Map gradients: `bg-gradient-to-r from-[#6366f1] to-[#ec4899]`

### Layout
- Flexbox → `flex`, `flex-col`, `justify-between`
- Grid → `grid`, `grid-cols-2`, `gap-4`
- Absolute → `absolute`, `inset-0`

### Spacing
- 4px → `p-1`, 8px → `p-2`, 16px → `p-4`
- Use scale: xs(4), sm(8), md(16), lg(24), xl(32)

### Typography
- Font sizes → `text-sm`, `text-base`, `text-lg`, `text-xl`
- Weights → `font-normal`, `font-medium`, `font-bold`

### Animations
- CSS transitions → Tailwind `transition-all duration-300`
- Keyframes → Framer Motion `motion.div`
- Hover effects → Tailwind `hover:scale-105`

### Components
Convert to shadcn/ui:
- Buttons → `<Button>`
- Cards → `<Card>`, `<CardContent>`
- Inputs → `<Input>`
- Dialogs → `<Dialog>`

## EventVibe Integration

Always adapt to EventVibe's design system:
- Dark mode base
- Neon accent colors (#6366f1 → #ec4899)
- Mobile-first (375px)
- Framer Motion for animations
- Touch-friendly (44px+ tap targets)

## Output

After analysis/conversion, provide:
1. **Design tokens** to add to tailwind.config
2. **Component patterns** to create or adapt
3. **Animation specs** (duration, easing, triggers)
4. **Mobile considerations** for touch
