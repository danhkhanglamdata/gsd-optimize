<purpose>
Initialize a new project through unified flow: questioning, research (optional), requirements, roadmap. This is the most leveraged moment in any project — deep questioning here means better plans, better execution, better outcomes. One workflow takes you from idea to ready-for-planning.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<auto_mode>
## Auto Mode Detection

Check if `--auto` flag is present in $ARGUMENTS.

**If auto mode:**
- Skip brownfield mapping offer (assume greenfield)
- Skip deep questioning (extract context from provided document)
- Config: YOLO mode is implicit (skip that question), but ask granularity/git/agents FIRST (Step 2a)
- After config: run Steps 6-9 automatically with smart defaults:
  - Research: Always yes
  - Requirements: Include all table stakes + features from provided document
  - Requirements approval: Auto-approve
  - Roadmap approval: Auto-approve

**Document requirement:**
Auto mode requires an idea document — either:
- File reference: `/gsd:new-project --auto @prd.md`
- Pasted/written text in the prompt

If no document content provided, error:

```
Error: --auto requires an idea document.

Usage:
  /gsd:new-project --auto @your-idea.md
  /gsd:new-project --auto [paste or write your idea here]

The document should describe what you want to build.
```
</auto_mode>

<process>

## 1. Setup

**MANDATORY FIRST STEP — Execute these checks before ANY user interaction:**

```bash
INIT=$(node .claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `project_exists`, `has_codebase_map`, `planning_exists`, `has_existing_code`, `has_package_file`, `is_brownfield`, `needs_codebase_map`, `has_git`, `project_path`.

**If `project_exists` is true:** Error — project already initialized. Use `/gsd:progress`.

**If `has_git` is false:** Initialize git:
```bash
git init
```

## 2. Brownfield Offer

**If auto mode:** Skip to Step 4 (assume greenfield, synthesize PROJECT.md from provided document).

**If `needs_codebase_map` is true** (from init — existing code detected but no codebase map):

Use AskUserQuestion:
- header: "Codebase"
- question: "I detected existing code in this directory. Would you like to map the codebase first?"
- options:
  - "Map codebase first" — Run /gsd:map-codebase to understand existing architecture (Recommended)
  - "Skip mapping" — Proceed with project initialization

**If "Map codebase first":**
```
Run `/gsd:map-codebase` first, then return to `/gsd:new-project`
```
Exit command.

**If "Skip mapping" OR `needs_codebase_map` is false:** Continue to Step 3.

## 2a. Auto Mode Config (auto mode only)

**If auto mode:** Collect config settings upfront before processing the idea document.

YOLO mode is implicit (auto = YOLO). Ask remaining config questions:

**Round 1 — Core settings (3 questions, no Mode question):**

```
AskUserQuestion([
  {
    header: "Granularity",
    question: "How finely should scope be sliced into phases?",
    multiSelect: false,
    options: [
      { label: "Coarse (Recommended)", description: "Fewer, broader phases (3-5 phases, 1-3 plans each)" },
      { label: "Standard", description: "Balanced phase size (5-8 phases, 3-5 plans each)" },
      { label: "Fine", description: "Many focused phases (8-12 phases, 5-10 plans each)" }
    ]
  },
  {
    header: "Execution",
    question: "Run plans in parallel?",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "Independent plans run simultaneously" },
      { label: "Sequential", description: "One plan at a time" }
    ]
  },
  {
    header: "Git Tracking",
    question: "Commit planning docs to git?",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Planning docs tracked in version control" },
      { label: "No", description: "Keep .planning/ local-only (add to .gitignore)" }
    ]
  }
])
```

**Round 2 — Workflow agents (same as Step 5):**

```
AskUserQuestion([
  {
    header: "Research",
    question: "Research before planning each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Investigate domain, find patterns, surface gotchas" },
      { label: "No", description: "Plan directly from requirements" }
    ]
  },
  {
    header: "Plan Check",
    question: "Verify plans will achieve their goals? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Catch gaps before execution starts" },
      { label: "No", description: "Execute plans without verification" }
    ]
  },
  {
    header: "Verifier",
    question: "Verify work satisfies requirements after each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Confirm deliverables match phase goals" },
      { label: "No", description: "Trust execution, skip verification" }
    ]
  },
  {
    header: "AI Models",
    question: "Which AI models for planning agents?",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet for most agents — good quality/cost ratio" },
      { label: "Quality", description: "Opus for research/roadmap — higher cost, deeper analysis" },
      { label: "Budget", description: "Haiku where possible — fastest, lowest cost" },
      { label: "Inherit", description: "Use the current session model for all agents (OpenCode /model)" }
    ]
  }
])
```

Create `.planning/config.json` with mode set to "yolo":

```json
{
  "mode": "yolo",
  "granularity": "[selected]",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget|inherit",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick",
    "auto_advance": true
  }
}
```

**If commit_docs = No:** Add `.planning/` to `.gitignore`.

**Commit config.json:**

```bash
mkdir -p .planning
node .claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**Persist auto-advance chain flag to config (survives context compaction):**

```bash
node .claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active true
```

Proceed to Step 4 (skip Steps 3 and 5).

## 3. Deep Questioning

**If auto mode:** Skip (already handled in Step 2a). Extract project context from provided document instead and proceed to Step 4.

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUESTIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Open the conversation:**

Ask inline (freeform, NOT AskUserQuestion):

"What do you want to build?"

Wait for their response. This gives you the context needed to ask intelligent follow-up questions.

**Follow the thread:**

Based on what they said, ask follow-up questions that dig into their response. Use AskUserQuestion with options that probe what they mentioned — interpretations, clarifications, concrete examples.

Keep following threads. Each answer opens new threads to explore. Ask about:
- What excited them
- What problem sparked this
- What they mean by vague terms
- What it would actually look like
- What's already decided

Consult `questioning.md` for techniques:
- Challenge vagueness
- Make abstract concrete
- Surface assumptions
- Find edges
- Reveal motivation

**Check context (background, not out loud):**

As you go, mentally check the context checklist from `questioning.md`. If gaps remain, weave questions naturally. Don't suddenly switch to checklist mode.

**Decision gate:**

When you could write a clear PROJECT.md, use AskUserQuestion:

- header: "Ready?"
- question: "I think I understand what you're after. Ready to create PROJECT.md?"
- options:
  - "Create PROJECT.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring" — ask what they want to add, or identify gaps and probe naturally.

Loop until "Create PROJECT.md" selected.

## 3.5. SaaS Brainstorm (gsd-ideator)

**If auto mode:** Skip (already handled in Step 2a). Proceed to Step 4.

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► BRAINSTORM (SaaS Framework)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Purpose:** Structure the raw user input from Step 3 using 8-category SaaS framework to ensure nothing is missed.

**Spawn gsd-ideator agent:**

```markdown
You are a GSD project ideator (gsd-ideator).

**Input:** Raw user response from Step 3: "[User's original response]"

**Task:**
1. Explore the 8-category SaaS framework:
   - Target Users (who, roles, personas)
   - Problem Space (pain points, current workarounds)
   - Solution Vision (MVP features, core value)
   - Market Context (competitors, differentiation)
   - Monetization (revenue model, pricing)
   - Technical Implications (architecture, integrations)
   - Onboarding & UX (first value moment, flow)
   - Constraints (budget, timeline, team)

2. Ask follow-up questions if categories are unclear
3. Make vague responses concrete
4. Generate `.planning/BRAINSTORM.md`

**Output:**
- Create `.planning/BRAINSTORM.md` using `templates/brainstorm.md`
- Update `.planning/PROJECT.md` if it exists (add Context, enrich Core Value)
- Include "Mapping to Downstream Files" section in output
- Return structured result to orchestrator

**Cross-reference:**
- See `.planning/codebase/STRUCTURE.md` for file organization
- See `.planning/codebase/CONVENTIONS.md` for coding standards
- See `templates/brainstorm.md` for output format
- See `agents/gsd-ideator.md` for "Mapping to Downstream Files" section

**Important:** After creating BRAINSTORM.md, ensure:
- MVP Features → mapped to REQUIREMENTS format
- Technical Implications → mapped to ARCHITECTURE sections
- Confidence levels → have actionable next steps

**DO NOT commit** — return result to orchestrator for next steps.
```

**Decision gate:**

When gsd-ideator returns, present the brainstorm summary:

```
AskUserQuestion([
  {
    header: "Brainstorm",
    question: "I've structured your idea across 8 categories. Ready to proceed with PROJECT.md?",
    multiSelect: false,
    options: [
      { 
        label: "Proceed (Recommended)", 
        description: "Continue to Step 4: Write PROJECT.md" 
      },
      { 
        label: "Refine brainstorm", 
        description: "Explore some categories more" 
      },
      { 
        label: "Start over", 
        description: "Go back to Step 3 with fresh discussion" 
      }
    ]
  }
])
```

If "Proceed" — continue to Step 4.

If "Refine brainstorm" — ask which category to explore more.

If "Start over" — return to Step 3 with note that brainstorm wasn't sufficient.

## 4. Write PROJECT.md

**If auto mode:** Synthesize from provided document. No "Ready?" gate was shown — proceed directly to commit.

**IMPORTANT:** Read BRAINSTORM.md from Step 3.5 before writing PROJECT.md:

```bash
# Read brainstorm context first
cat .planning/BRAINSTORM.md
```

Synthesize all context into `.planning/PROJECT.md` using the template from `templates/project.md`.

**Use BRAINSTORM.md outputs:**
- Core Value → from "Solution Vision" section
- Context → from "Problem Space" + "Market Context" sections
- Active Requirements → from "MVP Features" (convert to [CATEGORY]-01 format)
- Constraints → from "Technical Implications" + "Constraints & Context" sections

**For greenfield projects:**

Initialize requirements as hypotheses:

```markdown
## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Out of Scope

- [Exclusion 1] — [why]
- [Exclusion 2] — [why]
```

All Active requirements are hypotheses until shipped and validated.

**For brownfield projects (codebase map exists):**

Infer Validated requirements from existing code:

1. Read `.planning/codebase/ARCHITECTURE.md` and `STACK.md`
2. Identify what the codebase already does
3. These become the initial Validated set

```markdown
## Requirements

### Validated

- ✓ [Existing capability 1] — existing
- ✓ [Existing capability 2] — existing
- ✓ [Existing capability 3] — existing

### Active

- [ ] [New requirement 1]
- [ ] [New requirement 2]

### Out of Scope

- [Exclusion 1] — [why]
```

**Key Decisions:**

Initialize with any decisions made during questioning:

```markdown
## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Choice from questioning] | [Why] | — Pending |
```

**Last updated footer:**

```markdown
---
*Last updated: [date] after initialization*
```

Do not compress. Capture everything gathered.

**Commit PROJECT.md:**

```bash
mkdir -p .planning
node .claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: initialize project" --files .planning/PROJECT.md
```

## 5. Workflow Preferences

**If auto mode:** Skip — config was collected in Step 2a. Proceed to Step 5.5.

**Check for global defaults** at `~/.gsd/defaults.json`. If the file exists, offer to use saved defaults:

```
AskUserQuestion([
  {
    question: "Use your saved default settings? (from ~/.gsd/defaults.json)",
    header: "Defaults",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Use saved defaults, skip settings questions" },
      { label: "No", description: "Configure settings manually" }
    ]
  }
])
```

If "Yes": read `~/.gsd/defaults.json`, use those values for config.json, and skip directly to **Commit config.json** below.

If "No" or `~/.gsd/defaults.json` doesn't exist: proceed with the questions below.

**Round 1 — Core workflow settings (4 questions):**

```
questions: [
  {
    header: "Mode",
    question: "How do you want to work?",
    multiSelect: false,
    options: [
      { label: "YOLO (Recommended)", description: "Auto-approve, just execute" },
      { label: "Interactive", description: "Confirm at each step" }
    ]
  },
  {
    header: "Granularity",
    question: "How finely should scope be sliced into phases?",
    multiSelect: false,
    options: [
      { label: "Coarse", description: "Fewer, broader phases (3-5 phases, 1-3 plans each)" },
      { label: "Standard", description: "Balanced phase size (5-8 phases, 3-5 plans each)" },
      { label: "Fine", description: "Many focused phases (8-12 phases, 5-10 plans each)" }
    ]
  },
  {
    header: "Execution",
    question: "Run plans in parallel?",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "Independent plans run simultaneously" },
      { label: "Sequential", description: "One plan at a time" }
    ]
  },
  {
    header: "Git Tracking",
    question: "Commit planning docs to git?",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Planning docs tracked in version control" },
      { label: "No", description: "Keep .planning/ local-only (add to .gitignore)" }
    ]
  }
]
```

**Round 2 — Workflow agents:**

These spawn additional agents during planning/execution. They add tokens and time but improve quality.

| Agent | When it runs | What it does |
|-------|--------------|--------------|
| **Researcher** | Before planning each phase | Investigates domain, finds patterns, surfaces gotchas |
| **Plan Checker** | After plan is created | Verifies plan actually achieves the phase goal |
| **Verifier** | After phase execution | Confirms must-haves were delivered |

All recommended for important projects. Skip for quick experiments.

```
questions: [
  {
    header: "Research",
    question: "Research before planning each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Investigate domain, find patterns, surface gotchas" },
      { label: "No", description: "Plan directly from requirements" }
    ]
  },
  {
    header: "Plan Check",
    question: "Verify plans will achieve their goals? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Catch gaps before execution starts" },
      { label: "No", description: "Execute plans without verification" }
    ]
  },
  {
    header: "Verifier",
    question: "Verify work satisfies requirements after each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Confirm deliverables match phase goals" },
      { label: "No", description: "Trust execution, skip verification" }
    ]
  },
  {
    header: "AI Models",
    question: "Which AI models for planning agents?",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet for most agents — good quality/cost ratio" },
      { label: "Quality", description: "Opus for research/roadmap — higher cost, deeper analysis" },
      { label: "Budget", description: "Haiku where possible — fastest, lowest cost" },
      { label: "Inherit", description: "Use the current session model for all agents (OpenCode /model)" }
    ]
  }
]
```

Create `.planning/config.json` with all settings:

```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget|inherit",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick"
  }
}
```

**If commit_docs = No:**
- Set `commit_docs: false` in config.json
- Add `.planning/` to `.gitignore` (create if needed)

**If commit_docs = Yes:**
- No additional gitignore entries needed

**Commit config.json:**

```bash
node .claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**Note:** Run `/gsd:settings` anytime to update these preferences.

## 5.5. Resolve Model Profile

Use models from init: `researcher_model`, `synthesizer_model`, `roadmapper_model`.

## 6. Research Decision

**If auto mode:** Default to "Research first" without asking.

Use AskUserQuestion:
- header: "Research"
- question: "Research the domain ecosystem before defining requirements?"
- options:
  - "Research first (Recommended)" — Discover standard stacks, expected features, architecture patterns
  - "Skip research" — I know this domain well, go straight to requirements

**If "Research first":**

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RESEARCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Researching [domain] ecosystem...
```

Create research directory:
```bash
mkdir -p .planning/research
```

**Determine milestone context:**

Check if this is greenfield or subsequent milestone:
- If no "Validated" requirements in PROJECT.md → Greenfield (building from scratch)
- If "Validated" requirements exist → Subsequent milestone (adding to existing app)

Display spawning indicator:
```
◆ Spawning 4 researchers in parallel...
  → Stack research
  → Features research
  → Architecture research
  → Pitfalls research
```

Spawn 4 parallel gsd-project-researcher agents with path references:

```
Task(prompt="<research_type>
Project Research — Stack dimension for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: Research the standard stack for building [domain] from scratch.
Subsequent: Research what's needed to add [target features] to an existing [domain] app. Don't re-research the existing system.
</milestone_context>

<question>
What's the standard 2025 stack for [domain]?
</question>

<files_to_read>
- {project_path} (Project context and goals)
</files_to_read>

<downstream_consumer>
Your STACK.md feeds into roadmap creation. Be prescriptive:
- Specific libraries with versions
- Clear rationale for each choice
- What NOT to use and why
</downstream_consumer>

<quality_gate>
- [ ] Versions are current (verify with Context7/official docs, not training data)
- [ ] Rationale explains WHY, not just WHAT
- [ ] Confidence levels assigned to each recommendation
</quality_gate>

<output>
Write to: .planning/research/STACK.md
Use template: .claude/get-shit-done/templates/research-project/STACK.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Stack research")

Task(prompt="<research_type>
Project Research — Features dimension for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: What features do [domain] products have? What's table stakes vs differentiating?
Subsequent: How do [target features] typically work? What's expected behavior?
</milestone_context>

<question>
What features do [domain] products have? What's table stakes vs differentiating?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your FEATURES.md feeds into requirements definition. Categorize clearly:
- Table stakes (must have or users leave)
- Differentiators (competitive advantage)
- Anti-features (things to deliberately NOT build)
</downstream_consumer>

<quality_gate>
- [ ] Categories are clear (table stakes vs differentiators vs anti-features)
- [ ] Complexity noted for each feature
- [ ] Dependencies between features identified
</quality_gate>

<output>
Write to: .planning/research/FEATURES.md
Use template: .claude/get-shit-done/templates/research-project/FEATURES.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Features research")

Task(prompt="<research_type>
Project Research — Architecture dimension for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: How are [domain] systems typically structured? What are major components?
Subsequent: How do [target features] integrate with existing [domain] architecture?
</milestone_context>

<question>
How are [domain] systems typically structured? What are major components?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your ARCHITECTURE.md informs phase structure in roadmap. Include:
- Component boundaries (what talks to what)
- Data flow (how information moves)
- Suggested build order (dependencies between components)
</downstream_consumer>

<quality_gate>
- [ ] Components clearly defined with boundaries
- [ ] Data flow direction explicit
- [ ] Build order implications noted
</quality_gate>

<output>
Write to: .planning/research/ARCHITECTURE.md
Use template: .claude/get-shit-done/templates/research-project/ARCHITECTURE.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Architecture research")

Task(prompt="<research_type>
Project Research — Pitfalls dimension for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: What do [domain] projects commonly get wrong? Critical mistakes?
Subsequent: What are common mistakes when adding [target features] to [domain]?
</milestone_context>

<question>
What do [domain] projects commonly get wrong? Critical mistakes?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your PITFALLS.md prevents mistakes in roadmap/planning. For each pitfall:
- Warning signs (how to detect early)
- Prevention strategy (how to avoid)
- Which phase should address it
</downstream_consumer>

<quality_gate>
- [ ] Pitfalls are specific to this domain (not generic advice)
- [ ] Prevention strategies are actionable
- [ ] Phase mapping included where relevant
</quality_gate>

<output>
Write to: .planning/research/PITFALLS.md
Use template: .claude/get-shit-done/templates/research-project/PITFALLS.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Pitfalls research")
```

After all 4 agents complete, spawn synthesizer to create SUMMARY.md:

```
Task(prompt="
<task>
Synthesize research outputs into SUMMARY.md.
</task>

<files_to_read>
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</files_to_read>

<output>
Write to: .planning/research/SUMMARY.md
Use template: .claude/get-shit-done/templates/research-project/SUMMARY.md
Commit after writing.
</output>
", subagent_type="gsd-research-synthesizer", model="{synthesizer_model}", description="Synthesize research")
```

Display research complete banner and key findings:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RESEARCH COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Key Findings

**Stack:** [from SUMMARY.md]
**Table Stakes:** [from SUMMARY.md]
**Watch Out For:** [from SUMMARY.md]

Files: `.planning/research/`
```

**If "Skip research":** Continue to Step 7.

## 7. Define Requirements

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► DEFINING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Load context:**

Read PROJECT.md and extract:
- Core value (the ONE thing that must work)
- Stated constraints (budget, timeline, tech limitations)
- Any explicit scope boundaries

**If research exists:** Read research/FEATURES.md and extract feature categories.

**If auto mode:**
- Auto-include all table stakes features (users expect these)
- Include features explicitly mentioned in provided document
- Auto-defer differentiators not mentioned in document
- Skip per-category AskUserQuestion loops
- Skip "Any additions?" question
- Skip requirements approval gate
- Generate REQUIREMENTS.md and commit directly

**Present features by category (interactive mode only):**

```
Here are the features for [domain]:

## Authentication
**Table stakes:**
- Sign up with email/password
- Email verification
- Password reset
- Session management

**Differentiators:**
- Magic link login
- OAuth (Google, GitHub)
- 2FA

**Research notes:** [any relevant notes]

---

## [Next Category]
...
```

**If no research:** Gather requirements through conversation instead.

Ask: "What are the main things users need to be able to do?"

For each capability mentioned:
- Ask clarifying questions to make it specific
- Probe for related capabilities
- Group into categories

**Scope each category:**

For each category, use AskUserQuestion:

- header: "[Category]" (max 12 chars)
- question: "Which [category] features are in v1?"
- multiSelect: true
- options:
  - "[Feature 1]" — [brief description]
  - "[Feature 2]" — [brief description]
  - "[Feature 3]" — [brief description]
  - "None for v1" — Defer entire category

Track responses:
- Selected features → v1 requirements
- Unselected table stakes → v2 (users expect these)
- Unselected differentiators → out of scope

**Identify gaps:**

Use AskUserQuestion:
- header: "Additions"
- question: "Any requirements research missed? (Features specific to your vision)"
- options:
  - "No, research covered it" — Proceed
  - "Yes, let me add some" — Capture additions

**Validate core value:**

Cross-check requirements against Core Value from PROJECT.md. If gaps detected, surface them.

**Generate REQUIREMENTS.md:**

Create `.planning/REQUIREMENTS.md` with:
- v1 Requirements grouped by category (checkboxes, REQ-IDs)
- v2 Requirements (deferred)
- Out of Scope (explicit exclusions with reasoning)
- Traceability section (empty, filled by roadmap)

**REQ-ID format:** `[CATEGORY]-[NUMBER]` (AUTH-01, CONTENT-02)

**Requirement quality criteria:**

Good requirements are:
- **Specific and testable:** "User can reset password via email link" (not "Handle password reset")
- **User-centric:** "User can X" (not "System does Y")
- **Atomic:** One capability per requirement (not "User can login and manage profile")
- **Independent:** Minimal dependencies on other requirements

Reject vague requirements. Push for specificity:
- "Handle authentication" → "User can log in with email/password and stay logged in across sessions"
- "Support sharing" → "User can share post via link that opens in recipient's browser"

**Present full requirements list (interactive mode only):**

Show every requirement (not counts) for user confirmation:

```
## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can create account with email/password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page

### Content
- [ ] **CONT-01**: User can create posts with text
- [ ] **CONT-02**: User can edit their own posts

[... full list ...]

---

Does this capture what you're building? (yes / adjust)
```

If "adjust": Return to scoping.

**Commit requirements:**

```bash
node .claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md
```

## 8. Create Roadmap

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► CREATING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning roadmapper...
```

Spawn gsd-roadmapper agent with path references:

```
Task(prompt="
<planning_context>

<files_to_read>
- .planning/PROJECT.md (Project context)
- .planning/REQUIREMENTS.md (v1 Requirements)
- .planning/research/SUMMARY.md (Research findings - if exists)
- .planning/config.json (Granularity and mode settings)
</files_to_read>

</planning_context>

<instructions>
Create roadmap:
1. Derive phases from requirements (don't impose structure)
2. Map every v1 requirement to exactly one phase
3. Derive 2-5 success criteria per phase (observable user behaviors)
4. Validate 100% coverage
5. Write files immediately (ROADMAP.md, STATE.md, update REQUIREMENTS.md traceability)
6. Return ROADMAP CREATED with summary

Write files first, then return. This ensures artifacts persist even if context is lost.
</instructions>
", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="Create roadmap")
```

**Handle roadmapper return:**

**If `## ROADMAP BLOCKED`:**
- Present blocker information
- Work with user to resolve
- Re-spawn when resolved

**If `## ROADMAP CREATED`:**

Read the created ROADMAP.md and present it nicely inline:

```
---

## Proposed Roadmap

**[N] phases** | **[X] requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | [Name] | [Goal] | [REQ-IDs] | [count] |
| 2 | [Name] | [Goal] | [REQ-IDs] | [count] |
| 3 | [Name] | [Goal] | [REQ-IDs] | [count] |
...

### Phase Details

**Phase 1: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]
3. [criterion]

**Phase 2: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]

[... continue for all phases ...]

---
```

**If auto mode:** Skip approval gate — auto-approve and commit directly.

**CRITICAL: Ask for approval before committing (interactive mode only):**

Use AskUserQuestion:
- header: "Roadmap"
- question: "Does this roadmap structure work for you?"
- options:
  - "Approve" — Commit and continue
  - "Adjust phases" — Tell me what to change
  - "Review full file" — Show raw ROADMAP.md

**If "Approve":** Continue to commit.

**If "Adjust phases":**
- Get user's adjustment notes
- Re-spawn roadmapper with revision context:
  ```
  Task(prompt="
  <revision>
  User feedback on roadmap:
  [user's notes]

  <files_to_read>
  - .planning/ROADMAP.md (Current roadmap to revise)
  </files_to_read>

  Update the roadmap based on feedback. Edit files in place.
  Return ROADMAP REVISED with changes made.
  </revision>
  ", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="Revise roadmap")
  ```
- Present revised roadmap
- Loop until user approves

**If "Review full file":** Display raw `cat .planning/ROADMAP.md`, then re-ask.

**Commit roadmap (after approval or auto mode):**

```bash
node .claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: create roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 8.5 Codebase Blueprint

**Purpose:** Create the structural ground truth that all downstream agents (gsd-planner, gsd-executor, gsd-plan-checker) MUST read before creating any file. This prevents route duplication, misplaced components, and inconsistent naming across phases.

This step runs after roadmap is committed. Tech stack is already known from `STACK.md`.

### Detect stack

```bash
STACK=$(cat .planning/research/STACK.md 2>/dev/null || cat package.json 2>/dev/null)
```

Identify primary framework from stack:
- Contains `next` → Next.js App Router blueprint
- Contains `vite` + `react` → React + Vite blueprint
- Other → Generic blueprint

### Generate `.planning/codebase/STRUCTURE.md`

Create based on detected stack. For **Next.js + Tailwind + shadcn/ui** (most common):

```markdown
# Codebase Structure

**Stack:** Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
**Generated:** [date] during project initialization

## Directory Layout

[project-root]/
├── src/                    # ALL source code
│   ├── app/                # Next.js routes only (page.tsx, layout.tsx, error.tsx)
│   ├── components/
│   │   ├── ui/             # shadcn/ui base components — no business logic
│   │   ├── layout/         # App-wide: header, footer, sidebar, nav
│   │   └── [feature]/      # Domain-scoped components (host/, attendee/, landing/)
│   ├── hooks/              # Custom hooks (use-*.ts) — no JSX
│   ├── lib/
│   │   ├── utils.ts        # cn() utility — ALWAYS present
│   │   ├── supabase/       # client.ts, server.ts, middleware.ts
│   │   ├── actions/        # Server Actions by domain
│   │   ├── validations/    # Zod schemas
│   │   ├── types/          # TypeScript types
│   │   └── [domain]/       # Domain logic (scoring/, quiz/, media/)
│   ├── store/              # Global state (Zustand / Context)
│   └── middleware.ts
├── public/                 # Static assets only
├── supabase/               # DB migrations
├── tests/                  # Test files
├── tailwind.config.ts      # Design tokens (CSS variables — not hardcoded colors)
├── components.json         # shadcn/ui config
└── [config files]

## Placement Rules

- React component (has JSX) → src/components/ or src/app/ — NEVER in src/lib/
- Pure utility (no JSX, no hooks) → src/lib/
- Custom hook → src/hooks/
- Route/page → src/app/[route]/page.tsx
- Route-private component → src/app/[route]/_components/

## Foundation Files (must exist before first UI phase)

- src/lib/utils.ts — exports cn() using clsx + tailwind-merge
- tailwind.config.ts — colors use hsl(var(--token)) not raw palette names
- src/app/globals.css — @layer base / components / utilities structure
- components.json — cssVariables: true
```

Adjust directory names to match the actual project root (may be `app/` at root instead of `src/app/` if no `src/` was chosen).

### Generate `.planning/codebase/CONVENTIONS.md`

```markdown
# Coding Conventions

**Generated:** [date] during project initialization

## File Naming

| Type | Pattern | Example |
|---|---|---|
| React component | PascalCase.tsx | QuizCard.tsx |
| Custom hook | use-name.ts | use-realtime-quiz.ts |
| Server Action | domain-actions.ts | quiz-actions.ts |
| Utility | kebab-case.ts | compute-points.ts |
| Type file | domain-types.ts | quiz-types.ts |

## Export Naming

| Type | Pattern | Example |
|---|---|---|
| Component | PascalCase | export function QuizCard() |
| Hook | camelCase (use prefix) | export function useRealtimeQuiz() |
| Utility | camelCase | export function computePoints() |
| Type/Interface | PascalCase | export interface QuizQuestion |
| Constant | UPPER_SNAKE_CASE | export const MAX_TIMER = 30 |

## CSS Rules

1. **Always cn()** — never template literals for conditional classes
   ```typescript
   import { cn } from '@/lib/utils'
   className={cn('base', isActive && 'active')}  // ✅
   className={`base ${isActive ? 'active' : ''}`} // ❌
   ```

2. **Always design tokens** — never raw Tailwind palette for theme colors
   ```typescript
   className="bg-primary text-primary-foreground"  // ✅
   className="bg-teal-600 text-zinc-100"           // ❌
   ```

3. **Extract repeated patterns** — 3+ uses of same class combo → @layer components

4. **cva() for variants** — use Class Variance Authority for multi-variant components

## Stack Execution Rules

Rules the planner MUST embed into every task `<action>`. Executor follows these — never decides them.

### Server vs Client Component

Default: **Server Component** (no directive needed).

Add `'use client'` ONLY when the component uses:
- `useState`, `useEffect`, `useReducer`, `useRef`, `useContext`
- Event handlers: `onClick`, `onChange`, `onSubmit`
- Browser APIs: `window`, `document`, `localStorage`
- Realtime subscriptions (Supabase channel)
- Framer Motion `motion.div` with interactive variants

Never `'use client'` for:
- Components that only receive props and render JSX
- Components that only call Server Actions
- Data-fetching components (use async Server Component instead)

**Planner must specify in `<action>`:** "Create as Client Component (`'use client'` — has [reason])" or "Create as Server Component (no directive needed)".

### Supabase Client Selection

| Context | Import from |
|---|---|
| Server Component, Server Action, Route Handler, middleware | `lib/supabase/server.ts` |
| Client Component (`'use client'`) | `lib/supabase/client.ts` |

Never import server client in a `'use client'` component. Never import client in a Server Component.

**Planner must specify in `<action>`:** "Import supabase from `lib/supabase/server.ts`" or "Import supabase from `lib/supabase/client.ts`".

### Server Actions

- File must have `'use server'` directive at top
- Only called from Client Components or other Server Actions
- Never called directly from Server Components (use async function instead)
- Always validate input with Zod before processing
- Always return typed result: `{ data, error }` shape

### Data Fetching Pattern

| Location | Pattern |
|---|---|
| Server Component | `async function Page() { const data = await fetchData() }` |
| Client Component | Custom hook with `useEffect` + Supabase client |
| Mutation | Server Action with `'use server'` |
| Realtime | Supabase channel subscription in `useEffect` with cleanup |

## Pre-Creation Checks

Before creating any new file:
1. Check STRUCTURE.md — does the planned path match placement rules?
2. Route duplicate — does an equivalent page.tsx already exist at a different path?
3. Component duplicate — does a component with this name already exist?

See: .claude/get-shit-done/references/codebase-blueprint.md for full rules.
### Pre-Creation Validation

Before generating codebase files, verify foundation:

```bash
echo "=== Codebase Blueprint Generation ==="

# Check package.json exists
if [ ! -f "package.json" ]; then
  echo "WARNING: No package.json found"
fi

# Detect stack
STACK=$(cat package.json 2>/dev/null | grep -E '"next"|"react"|"vite"|"supabase"' || echo "")
echo "Detected stack: $STACK"

# Check for existing foundation files
if [ -f "tailwind.config.ts" ]; then
  echo "✓ Tailwind detected"
fi

if [ -f "components.json" ]; then
  echo "✓ shadcn/ui detected"
fi

if [ -f "src/lib/utils.ts" ] || [ -f "lib/utils.ts" ]; then
  echo "✓ cn() utility found"
else
  echo "NOTE: Need to create cn() utility in UI phase"
fi

echo "Generating codebase blueprint files..."
```

### Commit

```bash
mkdir -p .planning/codebase

# Copy from research if exists, otherwise infer from package.json
if [ -f .planning/research/STACK.md ]; then
  cp .planning/research/STACK.md .planning/codebase/STACK.md
elif [ -f package.json ]; then
  # Extract key info from package.json for STACK.md
  FRAMEWORK=$(node -e "const p=require('./package.json');const d=p.dependencies||{};console.log(Object.keys(d).find(k=>/^(next|react|express|nest|vue|angular)/i.test(k))||'Node.js')")
  cat > .planning/codebase/STACK.md << EOF
# Technology Stack

**Generated:** $(date +%Y-%m-%d) during project initialization
**Inferred from:** package.json

## Primary Framework

- $FRAMEWORK - Core framework

## Dependencies

See package.json for full list.

## Runtime

- Node.js: Check \`engines\` in package.json or use \`node --version\`
EOF
else
  echo "# Technology Stack" > .planning/codebase/STACK.md
  echo "**Generated:** $(date +%Y-%m-%d)" >> .planning/codebase/STACK.md
fi

# Generate ARCHITECTURE.md based on detected stack
# If Next.js detected (has "next" in stack)
if echo "$STACK" | grep -q '"next"'; then
cat > .planning/codebase/ARCHITECTURE.md << 'EOF'
# Architecture

**Pattern:** Next.js 15 App Router + Server Actions + Supabase
**Generated:** [date] during project initialization

## Data Flow

User → Page (Server Component) → Server Action → Supabase → revalidatePath → UI Update

## Server Actions Pattern

```typescript
// lib/actions/[domain].ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createThing(formData: FormData) {
  const supabase = createClient()
  
  // Validate with Zod first
  const validated = createThingSchema.safeParse({
    name: formData.get('name'),
  })
  
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }
  
  const { data, error } = await supabase
    .from('things')
    .insert(validated.data)
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  return { success: true, data }
}
```

## Security Rules

- NEVER trust client data — always validate server-side with Zod
- RLS policies on ALL Supabase tables
- Service role keys NEVER in client code
- Use @supabase/ssr for server components

## State Management

| Type | Solution | When to Use |
|------|----------|-------------|
| Server state | Server Actions + revalidatePath | Data from DB |
| Client state | Zustand | Complex UI state only |
| Form state | React Hook Form + Zod | User input |
| No Redux | - | Never needed |

## Client vs Server Components

| Use Server (default) | Use Client ('use client') |
|-------------------|---------------------|
| Fetching data | useState, useEffect |
| Server Actions | onClick, onChange |
| SEO pages | Browser APIs |
| Redirect | localStorage |
| Supabase call | Cookies |
EOF

# If React + Vite (has "vite" but no "next")
elif echo "$STACK" | grep -q '"vite"'; then
cat > .planning/codebase/ARCHITECTURE.md << 'EOF'
# Architecture

**Pattern:** React + Vite + Client-side only
**Generated:** [date] during project initialization

## Data Flow

User → Component → API Client → External API → State Update

## API Client Pattern

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Request interceptor for auth
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle logout
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

## State Management

| Type | Solution | When to Use |
|------|----------|-------------|
| API state | React Query | Server data |
| UI state | useState | Simple state |
| Global | Zustand | Shared across components |
| Form | React Hook Form | User input |

## Security

- NEVER expose API keys in client code
- Use environment variables with VITE_ prefix
- Validate all input with Zod
EOF

# Generic fallback
else
cat > .planning/codebase/ARCHITECTURE.md << 'EOF'
# Architecture

**Generated:** [date] during project initialization
**Based on:** Detected stack from package.json

## Pattern Overview

**Overall:** [Custom pattern]

**Key Characteristics:**
- TODO: Document key patterns after implementation

## Layers

| Layer | Purpose | Location |
|-------|---------|----------|
| Components | UI | src/components/ |
| Logic | Business logic | src/lib/ |
| Data | Data access | src/lib/ |

## Data Flow

1. User action → Component
2. Component → API/Library
3. API → External service
4. Update state
EOF
fi

# Generate TESTING.md based on stack detection
# Detect test framework from package.json
TEST_STACK=$(cat package.json 2>/dev/null | grep -E '"vitest"|"jest"|"playwright"|"testing-library"' || echo "")

# If Vitest detected
if echo "$TEST_STACK" | grep -q "vitest"; then
cat > .planning/codebase/TESTING.md << 'EOF'
# Testing Strategy

**Framework:** Vitest 1.x + @testing-library/react
**Generated:** [date] during project initialization

## Test Types

| Type | Tool | Pattern |
|------|------|---------|
| Unit | Vitest | *.test.ts next to source file |
| Integration | Vitest | *.integration.test.ts |
| Component | @testing-library/react | *.test.tsx |

## Test Organization

```
src/
  components/
    QuizCard.tsx       ← source
    QuizCard.test.tsx   ← test (co-located)
  lib/
    utils.ts           ← source
    utils.test.ts      ← test
```

## Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
```

## Testing Library Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTest.ts'],
  },
})

// src/setupTest.ts
import '@testing-library/jest-dom'
```

## Example Test

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizCard } from './QuizCard'

describe('QuizCard', () => {
  it('renders question text', () => {
    render(<QuizCard question="What is 2+2?" />)
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })
  
  it('calls onAnswer when selected', async () => {
    const onAnswer = vi.fn()
    render(<QuizCard options={['1','2','3','4']} onAnswer={onAnswer} />)
    
    await userEvent.click(screen.getByText('2'))
    expect(onAnswer).toHaveBeenCalledWith('2')
  })
})
```
EOF

# If Jest detected (has jest but no vitest)
elif echo "$TEST_STACK" | grep -q "jest"; then
cat > .planning/codebase/TESTING.md << 'EOF'
# Testing Strategy

**Framework:** Jest + @testing-library/react
**Generated:** [date] during project initialization

## Test Types

| Type | Tool | Pattern |
|------|------|---------|
| Unit | Jest | *.test.ts next to source |
| Component | @testing-library/react | *.test.tsx |
| E2E | Playwright | tests/e2e/*.spec.ts |

## Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run test:coverage # Coverage
npm run test:e2e     # E2E only
```
EOF

# If Playwright detected
elif echo "$TEST_STACK" | grep -q "playwright"; then
cat > .planning/codebase/TESTING.md << 'EOF'
# Testing Strategy

**Framework:** Playwright
**Generated:** [date] during project initialization

## Test Types

| Type | Tool | Pattern |
|------|------|---------|
| E2E | Playwright | tests/*.spec.ts |
| Unit | Vitest or Jest | (add separately) |

## Commands

```bash
npx playwright test           # Run E2E tests
npx playwright test --ui      # UI mode
npx playwright test --headed   #headed mode
```

## Test Organization

```
tests/
  auth.spec.ts       # Authentication flows
  dashboard.spec.ts # Dashboard features
  quiz.spec.ts      # Quiz flows
```

## Example Test

```typescript
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')
  
  await expect(page).toHaveURL('/dashboard')
})
```
EOF

# No test framework detected
else
cat > .planning/codebase/TESTING.md << 'EOF'
# Testing Strategy

**Framework:** Not detected — install to enable tests
**Generated:** [date] during project initialization

## Recommended Setup

For Next.js + TypeScript:
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npx playwright install
```

## Quick Start

```bash
# Unit tests with Vitest
npm test

# E2E tests with Playwright
npx playwright test
```

## Test Types

| Type | Tool | When to Use |
|------|------|-------------|
| Unit | Vitest | Functions, utilities |
| Component | @testing-library/react | React components |
| E2E | Playwright | Full user flows |
EOF
fi

# Generate INTEGRATIONS.md based on detected services
INT_STACK=$(cat package.json 2>/dev/null | grep -E '"supabase"|"@supabase|"stripe"|"auth0"|"sendgrid"|"aws-sdk"' || echo "")

# If Supabase detected
if echo "$INT_STACK" | grep -q "supabase"; then
cat > .planning/codebase/INTEGRATIONS.md << 'EOF'
# External Integrations

**Detected:** Supabase (Auth + Database)
**Generated:** [date] during project initialization

## Supabase

| Component | File | Purpose |
|----------|------|---------|
| Client (browser) | lib/supabase/client.ts | Public client, use in Client Components |
| Client (server) | lib/supabase/server.ts | Server Actions, use in lib/ |
| Middleware | lib/supabase/middleware.ts | Auth for Middleware |

## Environment Variables

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## Security

- RLS policies: Enable on ALL tables
- Never expose service_role key
- Use @supabase/ssr for server components
- Validate all input with Zod BEFORE insert

## Real-time

```typescript
// Subscribe to changes
const channel = supabase
  .channel('table:name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, 
    (payload) => console.log(payload)
  )
  .subscribe()
```
EOF

# If Stripe detected
elif echo "$INT_STACK" | grep -q "stripe"; then
cat > .planning/codebase/INTEGRATIONS.md << 'EOF'
# External Integrations

**Detected:** Stripe (Payments)
**Generated:** [date] during project initialization

## Stripe

| Component | File | Purpose |
|----------|------|---------|
| Server | lib/stripe/server.ts | Create payment intents |
| Webhooks | app/api/webhooks/stripe/route.ts | Handle events |

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Payment Flow

1. User clicks "Checkout"
2. Server creates PaymentIntent
3. Redirect to Stripe Checkout
4. Webhook handles success/failure
EOF

# If multiple services
elif echo "$INT_STACK" | grep -c "supabase\|stripe\|auth0" | grep -q "[2-9]"; then
cat > .planning/codebase/INTEGRATIONS.md << 'EOF'
# External Integrations

**Detected:** Multiple services
**Generated:** [date] during project initialization

## Services

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Auth + Database | [Active] |
| Stripe | Payments | [Active] |
| [Other] | [Purpose] | [Active] |

## API Keys

- All keys in .env.local (NEVER commit)
- Access via import.meta.env.VITE_* for client
- Access via process.env for server

## Security

- Never log API keys
- Rotate keys periodically
- Use webhooks for sensitive operations
EOF

# No services detected
else
cat > .planning/codebase/INTEGRATIONS.md << 'EOF'
# External Integrations

**Detected:** No external services
**Generated:** [date] during project initialization

## Currently Connected

| Service | Purpose | Status |
|---------|---------|--------|
| None | - | - |

## Getting Started

Common integrations to consider:
- **Supabase** (free tier): Auth + Database + Realtime
- **Stripe** (paid): Payments
- **Auth0** (free tier): Authentication

## Environment Variables

```env
# When you add services:
SERVICE_KEY=your-key-here
```
EOF
fi

# Generate CONCERNS.md with SaaS common risks
cat > .planning/codebase/CONCERNS.md << 'EOF'
# Risks & Concerns

**Generated:** [date] during project initialization

## Security

| Concern | Risk | Mitigation |
|--------|------|------------|
| SQL Injection | User input → DB | Use parameterized queries, never string concat |
| XSS | Malicious script | React escapes by default |
| API Keys Leaked | Keys in client | Never, use Server Actions |
| CSRF | Cross-site requests | Next.js CSRF built-in |
| RLS Disabled | Data leak | Enable on ALL tables |

## Performance

| Concern | Risk | Mitigation |
|--------|------|------------|
| Large Bundle | Slow load | Dynamic imports, code split |
| Slow DB Query | Timeout | Add indexes, optimize SELECT |
| Too Many Re-renders | Lag | React.memo, useMemo |
| N+1 Queries | Latency | Use supabase RPC or batch |

## Cost (SaaS)

| Resource | Limit | Monitor |
|----------|-------|---------|
| Supabase | 500MB, 25k rows | Dashboard usage |
| Vercel | 100GB bandwidth | Vercel dashboard |
| API calls | Rate limits | Log counts |
| Storage | File sizes | S3/CDN |

## Technical Constraints

- **SSR**: Always use Server Components by default
- **No API Routes**: Use Server Actions instead
- **No Redux**: Use Zustand for client state only
- **No localStorage for Auth**: Use Supabase Auth session

## Gotchas

- Remember revalidatePath() after data changes
- RLS policies need for EACH table
- Environment variables need restart on change
- .env.local is NOT in git
EOF

node "[gsd-tools path]" commit "docs: define codebase blueprint (structure + conventions + architecture + stack + testing + integrations + concerns)" \
  --files .planning/codebase/STRUCTURE.md .planning/codebase/CONVENTIONS.md .planning/codebase/ARCHITECTURE.md .planning/codebase/STACK.md .planning/codebase/TESTING.md .planning/codebase/INTEGRATIONS.md .planning/codebase/CONCERNS.md
```

**Add to success criteria:**
- [ ] `.planning/codebase/STRUCTURE.md` created and committed
- [ ] `.planning/codebase/CONVENTIONS.md` created and committed
- [ ] `.planning/codebase/ARCHITECTURE.md` created and committed
- [ ] `.planning/codebase/STACK.md` created and committed
- [ ] `.planning/codebase/TESTING.md` created and committed
- [ ] `.planning/codebase/INTEGRATIONS.md` created and committed
- [ ] `.planning/codebase/CONCERNS.md` created and committed
- [ ] Directory layout reflects actual tech stack
- [ ] Placement rules explicitly defined

**Add to completion summary table:**

| Codebase Blueprint | `.planning/codebase/` (7 files) |

---

## 9. Done

Present completion summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PROJECT INITIALIZED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Project Name]**

| Artifact       | Location                    |
|----------------|-----------------------------|
| Project        | `.planning/PROJECT.md`      |
| Config         | `.planning/config.json`     |
| Research       | `.planning/research/`       |
| Requirements   | `.planning/REQUIREMENTS.md` |
| Roadmap        | `.planning/ROADMAP.md`      |

**[N] phases** | **[X] requirements** | Ready to build ✓
```

**If auto mode:**

```
╔══════════════════════════════════════════╗
║  AUTO-ADVANCING → DISCUSS PHASE 1        ║
╚══════════════════════════════════════════╝
```

Exit skill and invoke SlashCommand("/gsd:discuss-phase 1 --auto")

**If interactive mode:**

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase 1: [Phase Name]** — [Goal from ROADMAP.md]

/gsd:discuss-phase 1 — gather context and clarify approach

<sub>/clear first → fresh context window</sub>

---

**Also available:**
- /gsd:plan-phase 1 — skip discussion, plan directly

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/research/` (if research selected)
  - `STACK.md`
  - `FEATURES.md`
  - `ARCHITECTURE.md`
  - `PITFALLS.md`
  - `SUMMARY.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

</output>

<success_criteria>

- [ ] .planning/ directory created
- [ ] Git repo initialized
- [ ] Brownfield detection completed
- [ ] Deep questioning completed (threads followed, not rushed)
- [ ] PROJECT.md captures full context → **committed**
- [ ] config.json has workflow mode, granularity, parallelization → **committed**
- [ ] Research completed (if selected) — 4 parallel agents spawned → **committed**
- [ ] Requirements gathered (from research or conversation)
- [ ] User scoped each category (v1/v2/out of scope)
- [ ] REQUIREMENTS.md created with REQ-IDs → **committed**
- [ ] gsd-roadmapper spawned with context
- [ ] Roadmap files written immediately (not draft)
- [ ] User feedback incorporated (if any)
- [ ] ROADMAP.md created with phases, requirement mappings, success criteria
- [ ] STATE.md initialized
- [ ] REQUIREMENTS.md traceability updated
- [ ] `.planning/codebase/STRUCTURE.md` created and committed
- [ ] `.planning/codebase/CONVENTIONS.md` created and committed
- [ ] User knows next step is `/gsd:discuss-phase 1`

**Atomic commits:** Each phase commits its artifacts immediately. If context is lost, artifacts persist.

</success_criteria>
