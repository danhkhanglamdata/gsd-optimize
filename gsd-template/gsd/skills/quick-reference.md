# Quick Reference: How to Use Skills

## Available Skills

| Skill | When to Use | How to Trigger |
|-------|-------------|----------------|
| `ux-brainstormer` | Brainstorm UI/UX, research gamification, analyze inspiration sites | Auto-loaded in discuss-phase / manual |
| `beautiful-ui-generator` | Generate quiz cards, media feeds, leaderboards | Auto-loaded in execute-phase |
| `style-adapter` | Convert CSS/HTML, analyze URL, research patterns | Use when pasting CSS or providing URL |
| `clean-code-enforcer` | Code review, refactoring | Auto-loaded in execute-phase |
| `realtime-component-builder` | Supabase realtime logic | Auto-loaded for realtime features |

## Quick Commands

### Research Gamification UI
```
Research gamification UI for young audience
```
→ AI will search, analyze Kahoot/quiz apps, recommend patterns

### Analyze Inspiration Site
```
Analyze https://kahoot.com and apply to quiz feature
```
→ AI will fetch, document design patterns, suggest EventVibe adaptations

### Get Creative Suggestions
```
Suggest creative UI for lucky wheel feature
```
→ AI will brainstorm delight moments, animations, interactions

### Convert Pasted CSS
Paste CSS/HTML from DevTools
→ AI will convert to Tailwind + Framer Motion

## Skills in GSD Flow

| Phase | Skills Auto-Loaded |
|-------|-------------------|
| discuss-phase | ux-brainstormer (for brainstorming) |
| ui-phase | ux-brainstormer (for creative enhancements) |
| execute-phase | beautiful-ui-generator, clean-code-enforcer, realtime-component-builder |
| All phases | style-adapter (on-demand) |

## Example Prompts

### Research Mode
```
/ux-brainstormer research quiz app interfaces like Kahoot
/ux-brainstormer find gamification patterns for live events
```

### Analysis Mode
```
/style-adapter analyze https://getliner.com and apply to leaderboard
```

### Creative Mode
```
/ux-brainstormer brainstorm delight moments for correct answer
```
