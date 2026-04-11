---
name: gsd:ui-phase
description: Generate UI design contract (UI-SPEC.md) for frontend phases with creative enhancements
argument-hint: "[phase] [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Skill
  - Task
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - mcp__context7__*
---
<objective>
Create a UI design contract (UI-SPEC.md) for a frontend phase.
Orchestrates gsd-ui-researcher and gsd-ui-checker.
Flow: Validate → Research UI → Creative Enhancements → Verify UI-SPEC → Done

**Key difference from basic:** This version ALWAYS includes creative UI/UX brainstorming, trend research, and gamification pattern analysis.
</objective>

<execution_context>
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/ui-phase.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/references/ui-brand.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/ux-brainstormer/SKILL.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/style-adapter/SKILL.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/beautiful-ui-generator/SKILL.md
</execution_context>

<project_skills>
**MUST LOAD at start:**

1. **ux-brainstormer** — For creative UI/UX and gamification research
   ```
   Read: .claude/skills/ux-brainstormer/SKILL.md
   ```

2. **style-adapter** — For analyzing inspiration sites and patterns
   ```
   Read: .claude/skills/style-adapter/SKILL.md
   ```

3. **beautiful-ui-generator** — For component patterns and animations
   ```
   Read: .claude/skills/beautiful-ui-generator/SKILL.md
   ```

**STEP 0 — Before spawning gsd-ui-researcher:**

Invoke the `frontend-design` plugin skill to establish aesthetic direction:
```
Skill(skill="frontend-design:frontend-design")
```

Use it to define and lock:
- **Tone** — energetic, playful, brutalist, luxury, retro-futuristic?
- **Typography** — distinctive font choices (NOT Inter/Roboto/Arial)
- **Color system** — dominant color + accent via CSS variables (align with ui-brand.md)
- **Motion style** — high-impact animations vs subtle transitions
- **Spatial composition** — asymmetry, overlap, diagonal flow, or clean grid?
- **Memorable differentiator** — what makes this phase's UI instantly recognizable?

Capture these decisions as `<aesthetic_direction>` block.
Pass `<aesthetic_direction>` to gsd-ui-researcher in its spawn prompt so the researcher bakes them into UI-SPEC.md — not as suggestions, but as locked decisions.

**In ui-phase, ALWAYS do:**
- Establish aesthetic direction via frontend-design skill BEFORE researcher runs
- Research latest UI/UX trends for the phase domain
- Generate creative enhancements (delight moments, animations)
- If user mentioned inspiration → analyze with style-adapter
- Include creative elements section in UI-SPEC.md
- Use beautiful-ui-generator for component suggestions
</project_skills>

<context>
Phase number: $ARGUMENTS — optional, auto-detects next unplanned phase if omitted.

**Auto mode:** If --auto flag present, auto-select recommended options for all questions.
</context>

<process>
1. **LOAD PROJECT SKILLS FIRST** — Read ux-brainstormer, style-adapter, beautiful-ui-generator SKILL.md
2. **ESTABLISH AESTHETIC DIRECTION** — Invoke `Skill(skill="frontend-design:frontend-design")` to define tone, typography, color, motion, and spatial composition. Capture as `<aesthetic_direction>` block.
3. Execute @C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/ui-phase.md end-to-end, passing `<aesthetic_direction>` to gsd-ui-researcher spawn prompt.
4. **ENSURE creative enhancements are included:**
   - Research gamification UI trends
   - Generate delight moment suggestions
   - Document in UI-SPEC.md under "## Creative Elements" section
5. Preserve all workflow gates including checker verification.
</process>
