---
name: ux-brainstormer
description: Brainstorm creative UI/UX, research gamification patterns for young audience, and analyze inspiration sites
---

# ux-brainstormer

Brainstorm creative, trendy UI/UX for e. Research gamification patterns. Analyze inspiration sites.

## Two Main Capabilities

### 1. Brainstorming (for discuss phases)
- Generate creative UI/UX ideas
- Propose trendy designs
- Enhance product experience

### 2. Research Mode (on-demand)
- Research specific UI patterns
- Analyze inspiration sites (Kahoot, quiz apps, gamification apps)
- Study gamification UI for young audience

---

## Part 1: Brainstorming

### e Core Vibe
- **Energetic** - Live events should feel exciting and dynamic
- **Social** - Encourage interaction between attendees
- **Instant** - No friction, works immediately
- **Fun** - Celebratory, playful moments

### Current Design Tokens
- Primary gradient: `#6366f1 → #ec4899` (indigo to pink)
- Dark mode by default
- Neon accents for CTAs
- Framer Motion for animations
- Mobile-first (375px baseline)

## Brainstorming Framework

### 1. First Impression (0-2 seconds)
What does the user see immediately?
- Hero section? Immediate action?
- Can they understand the value instantly?

### 2. Delight Moments
Where can we surprise and delight?
- Micro-interactions on tap
- Confetti on success
- Smooth transitions between screens
- Haptic-like visual feedback

### 3. Social Proof
How do attendees see each other?
- Real-time presence indicators
- Activity feeds
- Leaderboards with animations
- Shared experiences

### 4. Gamification Hooks
How do we make it addictive?
- Progress bars and streaks
- Achievement badges
- Lucky moments (wheel, random rewards)
- Competition elements

## Trend Research

Before brainstorming, search for latest trends:
- "[feature-domain] design trends 2025 2026"
- "[feature-domain] UI inspiration"
- "gamification UX patterns"
- "realtime social app design"

Use Context7 for:
- shadcn/ui latest components
- Framer Motion patterns
- Tailwind v4 animation utilities

## Creative Prompts

Use these to inspire discussions:

### For Quiz/Game Features
- "What if correct answer triggers a burst animation?"
- "Can we show real-time leaderboard with rank changes animated?"
- "What sound/haptic feedback on wrong answer?"
- "How to make waiting time fun?" (countdown animations)

### For Media/Moment Wall
- "What if new photos slide in with a unique transition?"
- "Can we add reaction animations on tap?"
- "How to handle empty state creatively?"
- "What happens when 100+ photos are uploaded?"

### For Gamification
- "How to make the wheel spin feel satisfying?"
- "What animation for energy bar filling?"
- "How to celebrate when user wins?"
- "What's the visual reward for milestones?"

## Output Format

When brainstorming, propose:

```
## 💡 UI/UX Suggestions for [Feature]

### Visual Hook
[One sentence describing the eye-catching element]

### Interaction Design
- [Specific interaction with animation type]
- [Touch feedback pattern]

### Delight Moment
[Unique twist that makes it memorable]

### Mobile Considerations
- [Touch target sizes]
- [Gesture support]
- [Offline handling]

### References
- [Similar implementations to reference]
```

## Rules

1. **Mobile-first always** - Design for 375px first, then scale up
2. **Performance conscious** - Animations should be 60fps
3. **Accessibility** - High contrast, ARIA labels, keyboard nav
4. **Consistency** - Match existing e design language
5. **Fun but not distracting** - Celebration yes, overwhelming no

---

## Part 2: Research Mode

### How to Trigger

When user says:
- "Research [inspiration site]"
- "Analyze Kahoot style"
- "Find gamification UI for young audience"
- "Research quiz app interfaces"
- Or provides a URL to study

### Research Process

**Step 1: Identify the Focus**
- If URL provided → fetch and analyze
- If general topic → search for patterns

**Step 2: Search & Gather**

```bash
# Search for relevant inspiration
WebSearch: "[feature-domain] interface design"
WebSearch: "gamification UI audience 2025"
WebSearch: "live [feature-domain] gamification patterns"
WebSearch: "quiz game animations inspiration"
```

**Step 3: Analyze & Document**

```markdown
## 🔍 Research: [Topic]

### Inspiration Sources
- [Source 1]: [URL] - [key insights]
- [Source 2]: [URL] - [key insights]

### Design Patterns Found

#### Color Scheme
- [Colors used by leaders in this space]
- [How to adapt for e]

#### Typography
- [Font choices]
- [Sizing hierarchy]

#### Key UI Elements
1. **[Element]**: [description], [animation]
2. **[Element]**: [description], [animation]

#### Gamification Specifics
- [How they handle progress]
- [How they celebrate wins]
- [How they keep young audience engaged]

### Recommendations for e

| Element | Inspiration | Proposal |
|---------|------------|----------|
| [Feature] | [From Kahoot/etc] | [e adaptation] |

### Action Items
- [ ] Apply [pattern] to [feature]
- [ ] Create [component] with [animation]
- [ ] Test with [user group]
```

### Specific Research Topics

#### For Lucky Wheel
- Spin physics (easeOutBack, easeOutBounce)
- Segment design (colors, icons, prizes)
- Winner reveal (animation, sound cue)
- Mobile touch optimization (drag vs tap)

#### For Leaderboard
- Rank change animations
- Top 3 visual hierarchy
- Real-time update handling
- Personal rank emphasis

#### For Energy Bar
- Fill animation (satisfying, smooth)
- Milestone markers
- Glow/pulse at thresholds
- Recovery visual

#### For Quiz Interface
- Timer design (circular, linear, urgent colors)
- Answer feedback (correct = green + confetti, wrong = red + shake)
- Progress indicator
- Score animation

### Output Format

```markdown
## 🎯 Research Summary: [Topic]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### e Recommendations

#### Must-Have
- [Element] — [why] — [implementation]

#### Nice-to-Have
- [Element] — [why] — [implementation]

### Inspiration URLs
- [URL 1]
- [URL 2]

### Next Steps
- [ ] Prototype [element]
- [ ] Get feedback from target audience
- [ ] Iterate on animations
```

