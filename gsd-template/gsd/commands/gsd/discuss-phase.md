---
name: gsd:discuss-phase
description: Gather phase context through adaptive questioning before planning. Use --auto to skip interactive questions (Claude picks recommended defaults).
argument-hint: "<phase> [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
  - WebSearch
  - WebFetch
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
---

<objective>
Extract implementation decisions that downstream agents need — researcher and planner will use CONTEXT.md to know what to investigate and what choices are locked.

**How it works:**
1. Load prior context (PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files)
2. Scout codebase for reusable assets and patterns
3. **Load project skills** — Read .claude/skills/ for UX brainstorming and research capabilities
4. **Research UI/UX trends** — Search for latest gamification and design patterns
5. Analyze phase — skip gray areas already decided in prior phases
6. Present remaining gray areas + creative UX suggestions — user selects which to discuss
7. Deep-dive each selected area until satisfied
8. Create CONTEXT.md with decisions that guide research and planning

**Output:** `{phase_num}-CONTEXT.md` — decisions clear enough that downstream agents can act without asking the user again
</objective>

<execution_context>
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/discuss-phase.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/context.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/ux-brainstormer/SKILL.md
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/style-adapter/SKILL.md
</execution_context>

<project_skills>
**MUST LOAD at start:**

1. **ux-brainstormer** — For brainstorming creative UI/UX and researching gamification patterns
   ```
   Read: .claude/skills/ux-brainstormer/SKILL.md
   ```

2. **style-adapter** — For analyzing inspiration sites and converting designs
   ```
   Read: .claude/skills/style-adapter/SKILL.md
   ```

**During discuss, ALWAYS do:**
- Search for latest trends: "gamification UI 2025", "event app design trends"
- Generate creative UX suggestions using ux-brainstormer
- If user mentions inspiration site → use style-adapter to analyze
- Present creative enhancements as options for user to choose
</project_skills>

<context>
Phase number: $ARGUMENTS (required)

Context files are resolved in-workflow using `init phase-op` and roadmap/state tool calls.
</context>

<process>
1. Validate phase number (error if missing or not in roadmap)
2. **LOAD PROJECT SKILLS FIRST** — Read ux-brainstormer/SKILL.md and style-adapter/SKILL.md
3. Check if CONTEXT.md exists (offer update/view/skip if yes)
4. **Load prior context** — Read PROJECT.md, REQUIREMENTS.md, STATE.md, and all prior CONTEXT.md files
5. **Scout codebase** — Find reusable assets, patterns, and integration points
6. **Research UI/UX trends** — Search for latest gamification, design patterns for the phase domain
7. **Analyze phase** — Check prior decisions, skip already-decided areas, generate remaining gray areas
8. **Generate creative suggestions** — Use ux-brainstormer to propose delight moments
9. **Present gray areas + creative options** — Multi-select: which to discuss? Annotate with prior decisions + code context
10. **Deep-dive each area** — 4 questions per area, code-informed options, Context7 for library choices
11. **Write CONTEXT.md** — Sections: decisions, creative_enhancements, code_context, deferred_ideas
12. Offer next steps (ui-phase or plan-phase)

**CRITICAL: Scope guardrail**
- Phase boundary from ROADMAP.md is FIXED
- Discussion clarifies HOW to implement, not WHETHER to add more
- If user suggests new capabilities: "That's its own phase. I'll note it for later."
- Capture deferred ideas — don't lose them, don't act on them

**Domain-aware gray areas + Creative Enhancements:**
Gray areas depend on what's being built. Analyze the phase goal:
- Something users SEE → layout, density, interactions, states + creative delight moments
- Something users CALL → responses, errors, auth, versioning
- Something users RUN → output format, flags, modes, error handling
- Something users READ → structure, tone, depth, flow
- Something being ORGANIZED → criteria, grouping, naming, exceptions

Generate 3-4 **phase-specific** gray areas, NOT generic categories.

**ALWAYS include creative suggestions:**
- Use ux-brainstormer to generate 2-3 delight moments
- Present as optional enhancements user can choose
- Examples: confetti on win, animated leaderboard, satisfying wheel spin

**Probing depth:**
- Ask 4 questions per area before checking
- "More questions about [area], or move to next? (Remaining: [list unvisited areas])"
- Show remaining unvisited areas so user knows what's still ahead
- If more → ask 4 more, check again
- After all areas → "Ready to create context?"

**Do NOT ask about (Claude handles these):**
- Technical implementation
- Architecture choices
- Performance concerns
- Scope expansion
</process>

<success_criteria>
- Project skills loaded (ux-brainstormer, style-adapter)
- UI/UX trends researched and applied
- Creative enhancements generated and presented
- Prior context loaded and applied (no re-asking decided questions)
- Gray areas identified through intelligent analysis
- User chose which areas to discuss
- Each selected area explored until satisfied
- Scope creep redirected to deferred ideas
- CONTEXT.md captures decisions + creative enhancements
- User knows next steps
</success_criteria>
