# /gsd:plan-phase — Flow Chain
> Loại: Flow Doc
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Draft
> Nguồn: `gsd-template/gsd/commands/gsd/plan-phase.md`

## Tổng quan

`/gsd:plan-phase` la command tao executable phase plans (PLAN.md) voi integrated research va verification. Day la buoc thu 3 trong GSD workflow sau `new-project` va `discuss-phase`.

**Cong dung:** Research domain -> Plan tasks -> Verify plans -> Loop until pass (max 3 iterations)

**Output chinh:**
- `{phase_num}-RESEARCH.md` (neu research duoc enable)
- `{phase_num}-{N}-PLAN.md` (cac plan files)
- `{phase_num}-VALIDATION.md` (neu Nyquist enabled)
- `{phase_num}-CONTEXT.md` (neu --prd duoc su dung)

---

## Flow Chain

```
commands/gsd/plan-phase.md
    ↓ loads workflow (via execution_context)
workflows/plan-phase.md  [Format B: 14 main sections: 1, 2, 3, 3.5, 4, 5, 5.5, 5.6, 6, 7, 7.5, 8, 9, 10, 11, 12, 13, 14]
    ↓ ## 1: Initialize
        └─ bash: gsd-tools.cjs init plan-phase → tra ve config JSON
        └─ parse: researcher_model, planner_model, checker_model, research_enabled, etc.
    ↓ ## 2: Parse and Normalize Arguments
        └─ extract: phase number, flags (--research, --skip-research, --gaps, --skip-verify, --prd)
    ↓ ## 3: Validate Phase
        └─ bash: gsd-tools.cjs roadmap get-phase → xac nhan phase ton tai
    ↓ ## 3.5: Handle PRD Express Path (neu co --prd)
        └─ Read PRD file → Parse requirements → Generate CONTEXT.md
        └─ bypass step 4 (Load CONTEXT.md)
    ↓ ## 4: Load CONTEXT.md
        └─ Check context_path ton tai? → Neu khong hoi user: Continue or run discuss-phase
    ↓ ## 5: Handle Research
        └─ skip if --gaps or --skip-research
        └─ neu co --research hoac RESEARCH.md missing → Ask user hoac auto (--auto)
        └─ spawn gsd-phase-researcher → tao {phase_num}-RESEARCH.md
    ↓ ## 5.5: Create Validation Strategy
        └─ skip if nyquist_validation disabled
        └─ neu co "## Validation Architecture" trong RESEARCH.md → tao VALIDATION.md
    ↓ ## 5.6: UI Design Contract Gate
        └─ check UI indicators trong phase description
        └─ neu co UI nhung khong co UI-SPEC.md → hoi user: Generate hoac skip
    ↓ ## 6: Check Existing Plans
        └─ ls {phase_dir}/*-PLAN.md → Offer: Add more / View / Replan
    ↓ ## 7: Use Context Paths from INIT
        └─ extract: state_path, roadmap_path, requirements_path, etc.
    ↓ ## 7.5: Verify Nyquist Artifacts
        └─ check VALIDATION.md ton tai → Neu missing hoi user
    ↓ ## 8: Spawn gsd-planner Agent
        └─ Task(gsd-planner) → doc context, requirements, research
        └─ tao {phase_num}-{N}-PLAN.md files
    ↓ ## 9: Handle Planner Return
        └─ ## PLANNING COMPLETE → continue to step 10 (or skip verify if --skip-verify)
        └─ ## CHECKPOINT REACHED → Present to user
        └─ ## PLANNING INCONCLUSIVE → Offer options
    ↓ ## 10: Spawn gsd-plan-checker Agent
        └─ Task(gsd-plan-checker) → verify plans achieve goal
        └─ return: ## VERIFICATION PASSED hoac ## ISSUES FOUND
    ↓ ## 11: Handle Checker Return
        └─ ## VERIFICATION PASSED → proceed to step 13
        └─ ## ISSUES FOUND → proceed to step 12
    ↓ ## 12: Revision Loop (Max 3 Iterations)
        └─ iteration < 3 → send back to planner, then checker again
        └─ iteration >= 3 → Max reached, offer options
    ↓ ## 13: Present Final Status
        └─ Route to <offer_next> hoac auto_advance
    ↓ ## 14: Auto-Advance Check
        └─ neu --auto hoac config auto_advance = true
        └─ Skill(skill="gsd:execute-phase") → auto-chain to execute-phase
```

---

## Steps Chi Tiết

### Step 1: Initialize

**Muc dich:** Load all context can thiet de bat dau workflow

**Hanh dong:**
- Chay bash: `node "C:/Users/Admin/.../gsd-tools.cjs" init plan-phase "$PHASE"`
- Parse JSON tra ve: `researcher_model`, `planner_model`, `checker_model`, `research_enabled`, `plan_checker_enabled`, `nyquist_validation_enabled`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `plan_count`, `planning_exists`, `roadmap_exists`, `phase_req_ids`

**Gate:**
- Pass khi: `planning_exists` = true (da chay new-project)
- Fail khi: `planning_exists` = false → Error: "run /gsd:new-project first"

**Output buoc nay:** none (chi load context vao bien)

---

### Step 2: Parse and Normalize Arguments

**Muc dich:** Extract phase number va flags tu $ARGUMENTS

**Hanh dong:**
- Extract phase number (integer hoac decimal nhu 2.1)
- Extract flags: `--research`, `--skip-research`, `--gaps`, `--skip-verify`, `--prd <filepath>`
- Neu khong co phase number → Detect next unplanned phase tu roadmap

**Gate:**
- Pass khi: Phase number hop le hoac detect duoc tu roadmap
- Fail khi: Phase khong ton tai trong roadmap

**Output buoc nay:** Phase number va flags stored in variables

---

### Step 3: Validate Phase

**Muc dich:** Xac nhan phase ton tai trong ROADMAP.md

**Hanh dong:**
- Chay bash: `node "C:/Users/Admin/.../gsd-tools.cjs" roadmap get-phase "${PHASE}"`
- Extract `phase_number`, `phase_name`, `goal` tu JSON
- Neu phaseFound = false → Error voi available phases

**Gate:**
- Pass khi: Phase found trong ROADMAP
- Fail khi: Phase khong ton tai → Error message

**Output buoc nay:** Phase info stored (name, goal, section)

---

### Step 3.5: Handle PRD Express Path

**Muc dich:** Xu li --prd flag de generate CONTEXT.md tu PRD file

**Hanh dong:**
- Skip if khong co --prd flag
- Read PRD file content
- Parse requirements, user stories, acceptance criteria
- Map each to locked decision (PRD content = locked)
- Identify areas not covered = "Claude's Discretion"
- Extract canonical refs tu ROADMAP.md + specs/ADRs trong PRD
- Write CONTEXT.md to phase directory

**Gate:**
- Pass khi: PRD file ton tai va parse thanh cong
- Fail khi: PRD file not found → Error

**Output buoc nay:** `{phase_dir}/{padded_phase}-CONTEXT.md` (bypass step 4)

---

### Step 4: Load CONTEXT.md

**Muc dich:** Load user decisions tu discuss-phase

**Hanh dong:**
- Skip if PRD express path was used (step 3.5)
- Check context_path tu init JSON
- Neu `context_path` null → AskUserQuestion:
  - "Continue without context" → Plan using research + requirements only
  - "Run discuss-phase first" → Display `/gsd:discuss-phase {X}` and exit

**Gate:**
- Pass khi: CONTEXT.md ton tai hoac user chon continue
- Fail khi: User chon "Run discuss-phase first" → Exit workflow

**Output buoc nay:** `context_content` loaded

---

### Step 5: Handle Research

**Muc dich:** Research domain before planning (neu can)

**Hanh dong:**
- Skip if `--gaps` or `--skip-research`
- Neu `has_research` = true AND no `--research` flag → Skip to step 6
- Neu RESEARCH.md missing OR `--research` flag:
  - Neu khong co flag va khong --auto → AskUserQuestion: Research or Skip
  - Neu --auto va research_enabled = false → Skip silently
- Display banner "GSD ► RESEARCHING PHASE {X}"
- Spawn gsd-phase-researcher:
  ```markdown
  Task(
    prompt=research_prompt,
    subagent_type="gsd-phase-researcher",
    model="{researcher_model}",
    description="Research Phase {phase}"
  )
  ```

**Gate:**
- Pass khi: Research complete → ## RESEARCH COMPLETE
- Fail khi: ## RESEARCH BLOCKED → Offer options

**Output buoc nay:** `{phase_dir}/{phase_num}-RESEARCH.md`

---

### Step 5.5: Create Validation Strategy

**Muc dich:** Generate VALIDATION.md tu Nyquist Validation Architecture

**Hanh dong:**
- Skip if `nyquist_validation_enabled` = false OR `research_enabled` = false
- Skip if research disabled AND has_research = false AND no --research flag
- grep "## Validation Architecture" trong RESEARCH.md
- Neu found → Read template VALIDATION.md → Write to phase_dir

**Gate:**
- Pass khi: VALIDATION.md created
- Fail khi: VALIDATION_CREATED=false → STOP, do not proceed

**Output buoc nay:** `{phase_dir}/{padded_phase}-VALIDATION.md`

---

### Step 5.6: UI Design Contract Gate

**Muc dich:** Kiem tra UI-SPEC.md cho frontend phases

**Hanh dong:**
- Skip if `workflow.ui_phase` = false AND `workflow.ui_safety_gate` = false
- Check phase co frontend indicators (grep "UI|interface|frontend|component|layout|page|screen|view|form|dashboard|widget")
- Neu HAS_UI = 0:
  - Check UI-SPEC.md ton tai? → Use it
  - Neu missing AND UI_GATE_CFG = true → AskUserQuestion:
    - "Generate UI-SPEC first" → Exit workflow
    - "Continue without UI-SPEC" → Continue
    - "Not a frontend phase" → Continue

**Gate:**
- Pass khi: UI-SPEC ton tai hoac user chon skip/continue
- Fail khi: User chon "Generate UI-SPEC first" → Exit

**Output buoc nay:** `UI_SPEC_PATH` set (if exists)

---

### Step 6: Check Existing Plans

**Muc dest:** Kiem tra xem phase da co plans chua

**Hanh dong:**
- `ls "${PHASE_DIR}"/*-PLAN.md`
- Neu ton tai → Offer:
  1) Add more plans
  2) View existing
  3) Replan from scratch

**Gate:**
- Pass khi: User chon option
- Fail khi: (none)

**Output buoc nay:** none

---

### Step 7: Use Context Paths from INIT

**Muc dest:** Extract file paths tu init JSON

**Hanh dong:**
- Extract: STATE_PATH, ROADMAP_PATH, REQUIREMENTS_PATH, RESEARCH_PATH, VERIFICATION_PATH, UAT_PATH, CONTEXT_PATH

**Gate:**
- Pass khi: Paths extracted
- Fail khi: (none)

**Output buoc nay:** File paths stored in variables

---

### Step 7.5: Verify Nyquist Artifacts

**Muc dest:** Dam bao VALIDATION.md ton tai (neu Nyquist enabled)

**Hanh dong:**
- Skip if nyquist_validation = false OR research_enabled = false
- Skip if research disabled AND has_research = false AND no --research flag
- Check VALIDATION.md ton tai
- Neu missing → Ask user:
  1) Re-run: `/gsd:plan-phase {PHASE} --research`
  2) Disable Nyquist with config-set
  3) Continue anyway (plans fail Dimension 8)

**Gate:**
- Pass khi: User chon option 2 hoac 3
- Fail khi: (none)

**Output buoc nay:** none (validation check)

---

### Step 8: Spawn gsd-planner Agent

**Muc dest:** Create PLAN.md files cho phase

**Hanh dong:**
- Display banner "GSD ► PLANNING PHASE {X}"
- Spawn gsd-planner voi prompt chua:
  - Files to read: STATE, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, VERIFICATION, UAT, UI-SPEC, STRUCTURE.md, CONVENTIONS.md
  - Phase requirement IDs
  - Deep work rules (anti-shallow execution)
  - Quality gate checklist

```markdown
Task(
  prompt=filled_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

**Gate:**
- Pass khi: Planner return ## PLANNING COMPLETE
- Fail khi: ## PLANNING INCONCLUSIVE → Offer options

**Output buoc nay:** `{phase_dir}/{phase_num}-{N}-PLAN.md` (multiple files)

---

### Step 9: Handle Planner Return

**Muc dest:** Process planner result va route to next step

**Hanh dong:**
- ## PLANNING COMPLETE → Display plan count → If --skip-verify or plan_checker_enabled=false → skip to step 13, else step 10
- ## CHECKPOINT REACHED → Present to user, get response, spawn continuation (step 12)
- ## PLANNING INCONCLUSIVE → Show attempts, offer: Add context / Retry / Manual

**Gate:**
- Pass khi: Co valid return
- Fail khi: (depends on user choice)

**Output buoc nay:** none (routing decision)

---

### Step 10: Spawn gsd-plan-checker Agent

**Muc dest:** Verify plans achieve phase goal

**Hanh dong:**
- Display banner "GSD ► VERIFYING PLANS"
- Spawn gsd-plan-checker voi prompt:
  - Files to read: PLAN.md files, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, STRUCTURE.md, CONVENTIONS.md
  - Phase requirement IDs
  - Verification dimensions

```markdown
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Verify Phase {phase} plans"
)
```

**Gate:**
- Pass khi: Checker return
- Fail khi: (none - checker always returns)

**Output buoc nay:** Verification results

---

### Step 11: Handle Checker Return

**Muc dest:** Process verification results

**Hanh dong:**
- ## VERIFICATION PASSED → Display confirmation, proceed to step 13
- ## ISSUES FOUND → Display issues, check iteration count, proceed to step 12

**Gate:**
- Pass khi: Verification passed
- Fail khi: Issues found → Continue to revision loop

**Output buoc nay:** none (routing decision)

---

### Step 12: Revision Loop (Max 3 Iterations)

**Muc dest:** Fix plans based on checker feedback

**Hanh dong:**
- Track iteration_count (starts at 1)
- Neu iteration_count < 3:
  - Display: "Sending back to planner for revision... (iteration {N}/3)"
  - Spawn gsd-planner in revision mode
  - After return → spawn checker again (step 10), increment iteration
- Neu iteration_count >= 3:
  - Display: "Max iterations reached. {N} issues remain:"
  - Offer: 1) Force proceed, 2) Provide guidance and retry, 3) Abandon

**Gate:**
- Pass khi: Verification passed hoac user chon force proceed
- Fail khi: User chon Abandon

**Output buoc nay:** Updated PLAN.md files (if revision happened)

---

### Step 13: Present Final Status

**Muc dest:** Display completion status va route to next action

**Hanh dong:**
- Route to `<offer_next>` OR `auto_advance` depending on flags/config
- Display offer_next markdown:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {X} PLANNED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

**Gate:**
- Pass khi: Status presented
- Fail khi: (none)

**Output buoc nay:** none (display only)

---

### Step 14: Auto-Advance Check

**Muc dest:** Auto-chain to execute-phase if enabled

**Hanh dong:**
- Parse --auto flag
- Clear ephemeral chain flag if manually invoked (no --auto)
- Read both chain flag and user preference
- Neu --auto OR AUTO_CHAIN = true OR AUTO_CFG = true:
  - Display banner "GSD ► AUTO-ADVANCING TO EXECUTE"
  - Launch execute-phase: `Skill(skill="gsd:execute-phase", args="${PHASE} --auto --no-transition")`
- Else: Route to <offer_next>

**Gate:**
- Pass khi: Auto-advance triggered or not
- Fail khi: (none)

**Output buoc nay:** none (triggers next command if enabled)

---

## Agents Duoc Goi

| Agent | Dieu kien goi | Files doc vao | Files tao ra |
|-------|---------------|---------------|--------------|
| `gsd-phase-researcher.md` | Step 5 (research enabled, no existing RESEARCH.md) | CONTEXT.md, REQUIREMENTS.md, STATE.md, PROJECT.md | `{phase_num}-RESEARCH.md` |
| `gsd-planner.md` | Step 8 (always) | STATE, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, VERIFICATION, UAT, UI-SPEC, STRUCTURE.md, CONVENTIONS.md | `{phase_num}-{N}-PLAN.md` |
| `gsd-plan-checker.md` | Step 10 (if plan_checker enabled) | PLAN.md files, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, STRUCTURE.md, CONVENTIONS.md | Verification results |

## Files Duoc Tao Ra

| File | Noi dung | Template dung | Tao o Step |
|------|----------|---------------|------------|
| `{phase_num}-CONTEXT.md` | User decisions from discuss-phase hoac parsed from PRD | `templates/context.md` | Step 3.5 (PRD) or Step 4 (discuss-phase) |
| `{phase_num}-RESEARCH.md` | Domain research findings | Agent-generated | Step 5 |
| `{phase_num}-VALIDATION.md` | Nyquist validation strategy | `templates/VALIDATION.md` | Step 5.5 |
| `{phase_num}-{N}-PLAN.md` | Execution plans with tasks | Agent-generated | Step 8 |

## Dependencies

**Can chay truoc:** `/gsd:new-project` (bat buoc), `/gsd:discuss-phase N` (optional nhung recommended)

**Output duoc dung boi:** `/gsd:execute-phase N` (reads PLAN.md files)

## Issues Phat Hien

[workflows/plan-phase.md:8] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/references/ui-brand.md` — thay bang relative path hoac variable

[workflows/plan-phase.md:18] — HARDCODED_PATH — `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs"` — thay bang relative path

[workflows/plan-phase.md:46] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" roadmap get-phase` — thay bang relative path

[workflows/plan-phase.md:148] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" commit` — thay bang relative path

[workflows/plan-phase.md:216] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" roadmap get-phase` — thay bang relative path

[workflows/plan-phase.md:278] — HARDCODED_PATH — Read template: `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/VALIDATION.md` — thay bang relative path

[workflows/plan-phase.md:295-296] — HARDCODED_PATH — `gsd-tools.cjs config-get` — thay bang relative path

[workflows/plan-phase.md:304] — HARDCODED_PATH — `gsd-tools.cjs roadmap get-phase` — thay bang relative path

[workflows/plan-phase.md:370] — HARDCODED_PATH — `gsd-tools.cjs config-set` — thay bang relative path

[workflows/plan-phase.md:589] — HARDCODED_PATH — `gsd-tools.cjs config-set` — thay bang relative path

[workflows/plan-phase.md:594-595] — HARDCODED_PATH — `gsd-tools.cjs config-get` — thay bang relative path

**Tong so:** 11 hardcoded paths tim thay trong workflow file

## Proposals Duoc Tao

Khong co proposals trong session nay.

## Flags Documented

| Flag | Muc dich | Step xu ly |
|------|----------|------------|
| `--auto` | Auto-advance to execute-phase after planning | Step 14 |
| `--research` | Force re-research even if RESEARCH.md exists | Step 5 |
| `--skip-research` | Skip research, go straight to planning | Step 5 |
| `--gaps` | Gap closure mode - reads VERIFICATION.md, skips research | Step 5 |
| `--skip-verify` | Skip verification loop (plan checker) | Step 9 |
| `--prd <filepath>` | Use PRD file instead of discuss-phase | Step 3.5 |

## Notes

- Workflow uses **Format B** (## N. sections) voi 14 main steps
- Plan-phase co the auto-chain to execute-phase via Skill tool (khong phai Task tool de tranh nested agent freeze)
- Nyquist validation tao VALIDATION.md chi khi research enabled va co "## Validation Architecture" section trong RESEARCH.md
- Revision loop max 3 iterations, sau do offer options cho user
- PRD express path bypass step 4 (Load CONTEXT) vi da tao CONTEXT tu PRD