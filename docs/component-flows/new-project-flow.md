# /gsd:new-project — Flow Chain
> Loại: Flow Doc
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Phiên bản gsd-template: latest (npm package)
> Trạng thái: Draft
> Nguồn: `gsd-template/gsd/commands/gsd/new-project.md`

## Tổng quan

`/gsd:new-project` la lenh khoi tao project GSD qua flow thong nhat: questioning → research (tuy chon) → requirements → roadmap. Day la command dau tien trong GSD workflow, tao cac planning files de chuan bi cho execution. Output chinh bao gom PROJECT.md, REQUIREMENTS.md, ROADMAP.md va STATE.md.

## Flow Chain

commands/gsd/new-project.md
    ↓ loads workflow (via execution_context)
workflows/new-project.md  [13 sections: 1, 2, 2a, 3, 3.5, 4, 5, 5.5, 6, 7, 8, 8.5, 9]
    ↓ ## 1: Setup
        └─ bash: gsd-tools.cjs init new-project → tra ve config JSON
        └─ gate: neu project da ton tai → error, dung /gsd:progress
    ↓ ## 2: Brownfield Offer
        └─ neu co code san → offer: chay map-codebase truoc
    ↓ ## 2a: Auto Mode Config (--auto only)
        └─ thu thap granularity, git, agents settings
    ↓ ## 3: Deep Questioning
        └─ hoi user ve du an (8 cau hoi theo questioning.md)
    ↓ ## 3.5: SaaS Brainstorm → spawns gsd-ideator.md
        └─ output: .planning/BRAINSTORM.md (tam thoi)
    ↓ ## 4: Write PROJECT.md → reads templates/project.md
        └─ creates: .planning/PROJECT.md
    ↓ ## 5: Workflow Preferences
        └─ cau hinh YOLO mode, granularity, git, agents
    ↓ ## 5.5: Resolve Model Profile
    ↓ ## 6: Research Decision
        └─ hoi user: co muon research khong?
        └─ neu yes → spawns gsd-project-researcher.md x 4 (parallel)
        └─ spawns gsd-research-synthesizer de tong hop
    ↓ ## 7: Define Requirements
        └─ creates: .planning/REQUIREMENTS.md
    ↓ ## 8: Create Roadmap → spawns gsd-roadmapper.md
        └─ gsd-roadmapper reads: PROJECT.md, REQUIREMENTS.md
        └─ creates: .planning/ROADMAP.md
    ↓ ## 8.5: Codebase Blueprint
        └─ creates: .planning/codebase/STRUCTURE.md
        └─ creates: .planning/codebase/CONVENTIONS.md
    ↓ ## 9: Done
        └─ creates: .planning/STATE.md
        └─ git commit (neu git enabled)

## Steps Chi Tiet

### Step 1: Setup

**Muc dich:** Khoi tao project config bang cach chay gsd-tools.cjs init. Kiem tra project da ton tai chua.

**Hanh dong:**
- Chay bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project`
- Parse JSON tra ve: `researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `project_exists`, `has_codebase_map`, `planning_exists`, `has_existing_code`, `has_package_file`, `is_brownfield`, `needs_codebase_map`, `has_git`, `project_path`
- Neu `has_git` la false → chay `git init`

**Gate:**
- Pass khi: Project chua ton tai (project_exists = false)
- Fail khi: project_exists = true → Error — "project already initialized. Use `/gsd:progress`"

**Output buoc nay:** cap nhat config.json (trong Step 5)

---

### Step 2: Brownfield Offer

**Muc dich:** Neu co codebase san, offer de chay map-codebase truoc de hieu kien truc code.

**Hanh dong:**
- Neu auto mode → Skip to Step 4
- Neu `needs_codebase_map` = true → hoi AskUserQuestion:
  - "Map codebase first" → Run `/gsd:map-codebase` roi quay lai
  - "Skip mapping" → Tiep tuc Step 3
- Neu `needs_codebase_map` = false → Tiep tuc Step 3

**Gate:**
- Pass khi: User chon "Skip mapping" hoac khong can map codebase
- Fail khi: user chon "Map codebase first" → Exit, chay map-codebase roi quay lai

**Output buocnay:** none

---

### Step 2a: Auto Mode Config (--auto only)

**Muc dich:** Thu thap cau hinh workflow ngay khi auto mode duoc bat.

**Hanh dong:**
- Chi khi --auto flag duoc bat
- AskUserQuestion(3 cau hoi Round 1): Granularity, Execution, Git Tracking
- AskUserQuestion(3 cau hoi Round 2): Research, Plan Check, Verifier

**Gate:**
- Pass khi: Done thu thap cau hinh
- Fail khi: —

**Output buoc nay:** -config.json duoc luu truoc

---

### Step 3: Deep Questioning

**Muc dich:** Hoi user ve y tuong project qua chuoi cau hoi chuyen sau de hieu ro yeu cau.

**Hanh dong:**
- Neu auto mode → Skip (da xu ly trong Step 2a)
- Hoi inline: "What do you want to build?"
- Follow the thread: hoi cau hoi tiep theo theo user response
- Consult `questioning.md` cho ky thuat: Challenge vagueness, Make abstract concrete, Surface assumptions
- Kiem tra context checklist tu questioning.md

**Gate:**
- Pass khi: User chon "Create PROJECT.md"
- Fail khi: User chon "Keep exploring" → Lap lai cau hoi

**Output buoc nay:** Raw user response (input cho Step 3.5)

---

### Step 3.5: SaaS Brainstorm (gsd-ideator)

**Muc dich:** Cau truc y tuong thu sang theo 8-category SaaS framework.

**Hanh dong:**
- Neu auto mode → Skip to Step 4
- Spawn gsd-ideator agent voi Task tool:
  ```
  Task(prompt="You are gsd-ideator...
  Input: Raw user response from Step 3
  Task: Explore 8-category SaaS framework
  Output: Create .planning/BRAINSTORM.md")
  ```

**Gate:**
- Pass khi: gsd-ideator hoan thanh
- Fail khi: —

**Output buoc nay:** `.planning/BRAINSTORM.md` (tam thoi)

---

### Step 4: Write PROJECT.md

**Muc dich:** Viet PROJECT.md tu brainstorm context su dung template.

**Hanh dong:**
- Neu auto mode → Synthesize tu provided document
- Doc BRAINSTORM.md tu Step 3.5
- Synthesis vao `.planning/PROJECT.md` su dung template tu `templates/project.md`
- Add REQUIREMENTS section (greenfield: hypotheses; brownfield: inferred from codebase)
- Commit: `gsd-tools.cjs commit "docs: initialize project" --files .planning/PROJECT.md`

**Gate:**
- Pass khi: PROJECT.md da duoc commit
- Fail khi: —

**Output buoc nay:** `.planning/PROJECT.md`

---

### Step 5: Workflow Preferences

**Muc dich:** Thu thap cau hinh workflow (YOLO mode, granularity, git, agents).

**Hanh dong:**
- Neu auto mode → Skip (da xu ly trong Step 2a)
- Kiem tra ~/.gsd/defaults.json → offer use saved defaults
- Round 1: Mode, Granularity, Execution, Git Tracking (4 cau hoi)
- Round 2: Research, Plan Check, Verifier (3 cau hoi)
- Luu vao `.planning/config.json`
- Commit: `gsd-tools.cjs commit "chore: add project config" --files .planning/config.json`

**Gate:**
- Pass khi: Done cau hinh
- Fail khi: —

**Output buoc nay:** `.planning/config.json`

---

### Step 5.5: Resolve Model Profile

**Muc dich:** Su dung cac model duoc dinh nghia tu init (researcher_model, synthesizer_model, roadmapper_model).

**Hanh dong:**
- Doc tu init JSON: `researcher_model`, `synthesizer_model`, `roadmapper_model`

**Gate:**
- Pass khi: Resolution complete
- Fail khi: —

**Output buoc nay:** none

---

### Step 6: Research Decision

**Muc dich:** Hoi user co muon research domain ecosystem truoc khi dinh nghia requirements.

**Hanh dong:**
- Neu auto mode → Default "Research first"
- AskUserQuestion: "Research the domain ecosystem before defining requirements?"
- Neu "Research first":
  - mkdir -p .planning/research
  - Spawn 4 parallel gsd-project-researcher agents (Stack, Features, Architecture, Pitfalls)
  - Spawn gsd-research-synthesizer de tong hop
- Neu "Skip research" → Tiep luc Step 7

**Gate:**
- Pass khi: Research hoan thanh hoac user bo qua
- Fail khi: —

**Output buoc nay:** `.planning/research/` (4 research files)

---

### Step 7: Define Requirements

**Muc dich:** Dinh nghia v1 requirements theo categories tu research hoac cuoc hoi.

**Hanh dong:**
- Doc PROJECT.md de lay Core value, constraints, scope boundaries
- Neu research ton tai → Doc research/FEATURES.md
- Present features theo categories (interactive mode)
- AskUserQuestion scoped theo category (multiSelect)
- Generate REQUIREMENTS.md voi REQ-ID format `[CATEGORY]-[NUMBER]`
- Commit: `gsd-tools.cjs commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md`

**Gate:**
- Pass khi: Requirements da duoc approve (interactive) hoac auto mode
- Fail khi: User chon "adjust" → Quay lai scoping

**Output buoc nay:** `.planning/REQUIREMENTS.md`

---

### Step 8: Create Roadmap

**Muc dung:** Tao roadmap phan requirement ra cac phases voi success criteria.

**Hanh dong:**
- Spawn gsd-roadmapper agent:
  ```
  Task(prompt="Create roadmap...
  files_to_read: .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/research/SUMMARY.md, .planning/config.json
  Output: Create .planning/ROADMAP.md, .planning/STATE.md")
  ```
- Hien roadmap cho user
- AskUserQuestion: "Does this roadmap structure work for you?"
- Commit: `gsd-tools.cjs commit "docs: create roadmap..." --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md`

**Gate:**
- Pass khi: User approve hoac auto mode
- Fail khi: User chon "Adjust phases" → Re-spawn voi revision context

**Output buoc nay:** `.planning/ROADMAP.md`, `.planning/STATE.md`

---

### Step 8.5: Codebase Blueprint

**Muc dich:** Tao tru nghiem cau truc codebase cho cac agents sau nay (planner, executor, plan-checker).

**Hanh dong:**
- Detect stack tu research/STACK.md hoac package.json
- Generate `.planning/codebase/STRUCTURE.md` (placement rules)
- Generate `.planning/codebase/CONVENTIONS.md` (naming, CSS rules, Server vs Client)
- Generate `.planning/codebase/ARCHITECTURE.md`
- Generate `.planning/codebase/STACK.md`
- Generate `.planning/codebase/TESTING.md`
- Generate `.planning/codebase/INTEGRATIONS.md`
- Generate `.planning/codebase/CONCERNS.md`
- Commit tat ca files voi gsd-tools.cjs

**Gate:**
- Pass khi: Tat ca 7 files da duoc commit
- Fail khi: —

**Output buoc nay:** `.planning/codebase/` (7 files)

---

### Step 9: Done

**Muc dich:** Hien thi completion summary va huong dan buoc tiep theo.

**Hanh dong:**
- Hien thi completion banner voi artifacts da tao
- Neu auto mode → Auto-chain to `/gsd:discuss-phase 1 --auto`
- Neu interactive mode → Hien thi Next Up: `/gsd:discuss-phase 1`

**Gate:**
- Pass khi: Command hoan thanh
- Fail khi: —

**Output buocnay:** none

---

## Agents Duoc Goi

| Agent | Dieu kien goi | Files doc vao | Files tao ra |
|-------|--------------|---------------|-------------|
| `gsd-ideator.md` | Step 3.5, interactive | Raw user response | `.planning/BRAINSTORM.md` |
| `gsd-project-researcher.md` | Step 6, Research: Yes | `.planning/PROJECT.md` | `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` |
| `gsd-research-synthesizer.md` | Step 6, sau research | 4 research files | `.planning/research/SUMMARY.md` |
| `gsd-roadmapper.md` | Step 8 | PROJECT.md, REQUIREMENTS.md, config.json | `.planning/ROADMAP.md`, `.planning/STATE.md` |

## Files Duoc Tao Ra

| File | Noi dung | Template dung | Tao o Step |
|------|----------|---------------|------------|
| `.planning/PROJECT.md` | Project context, core value, requirements | `templates/project.md` | Step 4 |
| `.planning/config.json` | Workflow preferences | — | Step 5 |
| `.planning/BRAINSTORM.md` | Structured understanding (temporary) | `templates/brainstorm.md` | Step 3.5 |
| `.planning/REQUIREMENTS.md` | v1 requirements theo categories | `templates/requirements.md` | Step 7 |
| `.planning/research/STACK.md` | Technology stack | `templates/research-project/STACK.md` | Step 6 |
| `.planning/research/FEATURES.md` | Feature research | `templates/research-project/FEATURES.md` | Step 6 |
| `.planning/research/ARCHITECTURE.md` | Architecture patterns | `templates/research-project/ARCHITECTURE.md` | Step 6 |
| `.planning/research/PITFALLS.md` | Pitfalls research | `templates/research-project/PITFALLS.md` | Step 6 |
| `.planning/research/SUMMARY.md` | Research synthesis | `templates/research-project/SUMMARY.md` | Step 6 |
| `.planning/ROADMAP.md` | Phase structure | `templates/roadmap.md` | Step 8 |
| `.planning/STATE.md` | Project memory | `templates/state.md` | Step 8 |
| `.planning/codebase/STRUCTURE.md` | Placement rules | — | Step 8.5 |
| `.planning/codebase/CONVENTIONS.md` | Coding conventions | — | Step 8.5 |
| `.planning/codebase/ARCHITECTURE.md` | Architecture | — | Step 8.5 |
| `.planning/codebase/STACK.md` | Tech stack | — | Step 8.5 |
| `.planning/codebase/TESTING.md` | Testing strategy | — | Step 8.5 |
| `.planning/codebase/INTEGRATIONS.md` | External services | — | Step 8.5 |
| `.planning/codebase/CONCERNS.md` | Risks/constraints | — | Step 8.5 |

## Dependencies

**Can chay truoc:** none — greenfield start
**Output duoc dung boi:**
- `/gsd:discuss-phase N` — doc PROJECT.md, ROADMAP.md, REQUIREMENTS.md
- `/gsd:plan-phase N` — doc ROADMAP.md, REQUIREMENTS.md
- `/gsd:execute-phase N` — doc config.json, codebase/

## Issues Phat Hiện

[workflows/new-project.md:49] — HARDCODED_PATH — node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project — thay bang relative path hoacbien
[workflows/new-project.md:194] — HARDCODED_PATH — gsd-tools.cjs commit "chore: add project config" — thay bang relative path hoacbien
[workflows/new-project.md:200] — HARDCODED_PATH — gsd-tools.cjs config-set workflow._auto_chain_active — thay bang relative path hoacbien
[workflows/new-project.md:447] — HARDCODED_PATH — gsd-tools.cjs commit "docs: initialize project" — thay bang relative path hoacbien
[workflows/new-project.md:601] ��� HARDCODED_PATH — gsd-tools.cjs commit "chore: add project config" — thay bang relative path hoacbien
[workflows/new-project.md:689] — HARDCODED_PATH — template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/STACK.md" — thay bang relative path hoacbien
[workflows/new-project.md:727] — HARDCODED_PATH — template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/FEATURES.md" — thay bang relative path hoacbien
[workflows/new-project.md:765] — HARDCODED_PATH — template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/ARCHITECTURE.md" — thay bang relative path hoacbien
[workflows.new-project.md:803] — HARDCODED_PATH — template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/PITFALLS.md" — thay bang relative path hoacbien
[workflows/new-project.md:825] — HARDCODED_PATH — template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/SUMMARY.md" — thay bang relative path hoacbien
[workflows/new-project.md:990] — HARDCODED_PATH — gsd-tools.cjs commit "docs: define v1 requirements" — thay bang relative path hoacbien
[workflows/new-project.md:1120] — HARDCODED_PATH — gsd-tools.cjs commit "docs: create roadmap" — thay bang relative path hoacbien

## Proposals Duoc Tao

Khong co proposals.

---

**Ghi chu**: Workflow nay dung Format B (## N. sections), co 13 buoc. Day la flow co do phuc tap cao nhat trong GSD system, bao gom questioning, brainstorming, research (tuy chon), requirements, roadmap, va codebase blueprint.