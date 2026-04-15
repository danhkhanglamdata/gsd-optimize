# /gsd:plan-phase
> Loại: Action Doc
> Tạo bởi: action-doc-writer
> Ngày: 2026-04-14
> Phiên bản gsd-template: 1.25.1
> Trạng thái: Draft
> Nguồn command: `gsd-template/gsd/commands/gsd/plan-phase.md`
> Nguồn workflow: `gsd-template/gsd/get-shit-done/workflows/plan-phase.md`

## Mục đích
Tạo executable phase prompts (PLAN.md files) cho một roadmap phase với integrated research và verification. Đây là bước thứ 3 trong GSD workflow sau `new-project` và `discuss-phase`.

**Default flow:** Research (if needed) → Plan → Verify → Loop until pass (max 3 iterations)

## Khi nào sử dụng
- Khi cần tạo execution plans cho một phase cụ thể
- Khi đã có đủ context từ discuss-phase hoặc PRD
- Khi cần research domain trước khi lập kế hoạch
- **Không nên** chạy khi chưa chạy `/gsd:new-project` (cần roadmap và requirements)

---

## Input

### Arguments & Flags
| Flag | Mặc định | Mô tả | Thay đổi gì so với default |
|------|----------|-------|---------------------------|
| (none) | — | Chạy chế độ mặc định: hỏi user về research, verify plans | — |
| `--auto` | — | Auto-advance sang execute-phase sau khi planning xong | Bỏ qua interactive prompts, tự động chain sang `/gsd:execute-phase --auto --no-transition` |
| `--research` | — | Force re-research ngay cả khi RESEARCH.md đã tồn tại | Chạy research ngay cả khi đã có research trước đó |
| `--skip-research` | — | Bỏ qua research, đi thẳng sang planning | Không spawn gsd-phase-researcher, bỏ qua step 5 |
| `--gaps` | — | Gap closure mode: đọc VERIFICATION.md, bỏ qua research | Đọc verification gaps thay vì chạy research mới |
| `--skip-verify` | — | Bỏ qua verification loop (plan checker) | Bỏ qua spawn gsd-plan-checker, đi thẳng sang step 13 |
| `--prd <file>` | — | Dùng PRD/acceptance criteria file thay vì discuss-phase | Parse requirements từ PRD, tự động tạo CONTEXT.md, bypass step 4 |

### Điều kiện tiên quyết
- [ ] Đã chạy `/gsd:new-project` (planning_exists = true)
- [ ] Phase phải tồn tại trong ROADMAP.md

### Files phải có trước khi chạy
| File | Mô tả | Tạo bởi |
|------|-------|---------|
| `.planning/STATE.md` | Project state và history | `/gsd:new-project` |
| `.planning/ROADMAP.md` | Project roadmap với các phases | `/gsd:new-project` |
| `.planning/REQUIREMENTS.md` | Project requirements | `/gsd:new-project` |
| `.planning/phases/{padded_phase}/CONTEXT.md` | User decisions (optional, recommended) | `/gsd:discuss-phase` hoặc `--prd` |

---

## Quy trình (Step-by-Step)

### Bước 1: Initialize
**Mục đích:** Load tất cả context cần thiết để bắt đầu workflow

**Hành động cụ thể:**
- Chạy bash: `node "gsd-tools.cjs" init plan-phase "$PHASE"`
- Parse JSON trả về: `researcher_model`, `planner_model`, `checker_model`, `research_enabled`, `plan_checker_enabled`, `nyquist_validation_enabled`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `plan_count`, `planning_exists`, `roadmap_exists`, `phase_req_ids`
- Trích xuất file paths: `state_path`, `roadmap_path`, `requirements_path`, `context_path`, `research_path`, `verification_path`, `uat_path`

**Gate:**
- Pass: `planning_exists` = true (đã chạy new-project)
- Fail: `planning_exists` = false → Error: "run /gsd:new-project first"

**Output bước này:** none (chỉ load context vào biến)

---

### Bước 2: Parse and Normalize Arguments
**Mục đích:** Trích xuất phase number và flags từ $ARGUMENTS

**Hành động cụ thể:**
- Extract phase number (integer hoặc decimal như 2.1)
- Extract flags: `--research`, `--skip-research`, `--gaps`, `--skip-verify`, `--prd <filepath>`
- Extract `--prd <filepath>` — nếu có, set PRD_FILE
- Nếu không có phase number → Detect next unplanned phase từ roadmap

**Gate:**
- Pass: Phase number hợp lệ hoặc detect được từ roadmap
- Fail: Phase không tồn tại trong roadmap → Error message

**Output bước này:** Phase number và flags stored in variables

---

### Bước 3: Validate Phase
**Mục đích:** Xác nhận phase tồn tại trong ROADMAP.md

**Hành động cụ thể:**
- Chạy bash: `node "gsd-tools.cjs" roadmap get-phase "${PHASE}"`
- Extract `phase_number`, `phase_name`, `goal` từ JSON
- Nếu `found` = false → Error với available phases

**Gate:**
- Pass: Phase found trong ROADMAP
- Fail: Phase không tồn tại → Error message

**Output bước này:** Phase info stored (name, goal, section)

---

### Bước 3.5: Handle PRD Express Path
**Mục đích:** Xử lý --prd flag để generate CONTEXT.md từ PRD file

**Hành động cụ thể:**
- Skip if: Không có --prd flag
- Nếu `--prd <filepath>` provided:
  1. Read PRD file content
  2. Parse requirements, user stories, acceptance criteria
  3. Map each to locked decision (PRD content = locked)
  4. Identify areas not covered = "Claude's Discretion"
  5. Extract canonical refs từ ROADMAP.md + specs/ADRs trong PRD
  6. Write CONTEXT.md to phase directory với format chuẩn
  7. Commit nếu `commit_docs` = true
  8. Set `context_content` = generated CONTENT, continue to step 5

**Gate:**
- Pass: PRD file tồn tại và parse thành công
- Fail: PRD file not found → Error

**Output bước này:** `{phase_dir}/{padded_phase}-CONTEXT.md` (bypass step 4)

---

### Bước 4: Load CONTEXT.md
**Mục đích:** Load user decisions từ discuss-phase

**Hành động cụ thể:**
- Skip if: PRD express path was used (step 3.5)
- Check `context_path` từ init JSON
- Nếu `context_path` null (không có CONTEXT.md):
  - AskUserQuestion:
    - "Continue without context" → Plan using research + requirements only
    - "Run discuss-phase first" → Display `/gsd:discuss-phase {X}` and exit workflow

**Gate:**
- Pass: CONTEXT.md tồn tại hoặc user chọn continue
- Fail: User chọn "Run discuss-phase first" → Exit workflow

**Output bước này:** `context_content` loaded

---

### Bước 5: Handle Research
**Mục đích:** Research domain trước khi planning (nếu cần)

**Hành động cụ thể:**
- Skip if: `--gaps` flag hoặc `--skip-research` flag
- Nếu `has_research` = true AND không có `--research` flag → Skip to step 6
- Nếu RESEARCH.md missing OR `--research` flag:
  - Nếu không có flag và không `--auto` → AskUserQuestion: Research or Skip
  - Nếu `--auto` và `research_enabled` = false → Skip silently
- Display banner "GSD ► RESEARCHING PHASE {X}"
- Spawn gsd-phase-researcher với prompt chứa:
  - Objective: "What do I need to know to PLAN this phase well?"
  - Files to read: CONTEXT.md, REQUIREMENTS.md, STATE.md
  - Additional context: phase description, phase requirement IDs, project instructions

**Gate:**
- Pass: Research complete → `## RESEARCH COMPLETE`
- Fail: `## RESEARCH BLOCKED` → Offer options

**Output bước này:** `{phase_dir}/{phase_num}-RESEARCH.md`

---

### Bước 5.5: Create Validation Strategy
**Mục đích:** Generate VALIDATION.md từ Nyquist Validation Architecture

**Hành động cụ thể:**
- Skip if: `nyquist_validation_enabled` = false OR `research_enabled` = false
- Skip if: research disabled AND has_research = false AND no --research flag
- grep "## Validation Architecture" trong RESEARCH.md
- Nếu found:
  1. Read template VALIDATION.md
  2. Write to `${PHASE_DIR}/${PADDED_PHASE}-VALIDATION.md`
  3. Fill frontmatter: {N}, {phase-slug}, {date}
  4. Verify tạo thành công
  5. Commit nếu `commit_docs` = true
- Nếu not found: Warn and continue

**Gate:**
- Pass: VALIDATION.md created
- Fail: VALIDATION_CREATED=false → STOP, do not proceed to Step 6

**Output bước này:** `{phase_dir}/{padded_phase}-VALIDATION.md`

---

### Bước 5.6: UI Design Contract Gate
**Mục đích:** Kiểm tra UI-SPEC.md cho frontend phases

**Hành động cụ thể:**
- Skip if: `workflow.ui_phase` = false AND `workflow.ui_safety_gate` = false trong config
- Check phase có frontend indicators (grep "UI|interface|frontend|component|layout|page|screen|view|form|dashboard|widget")
- Nếu HAS_UI = 0 (frontend indicators found):
  - Check UI-SPEC.md tồn tại? → Use it
  - Nếu missing AND `UI_GATE_CFG` = true → AskUserQuestion:
    - "Generate UI-SPEC first" → Exit workflow
    - "Continue without UI-SPEC" → Continue
    - "Not a frontend phase" → Continue
- Nếu HAS_UI = 1 → Skip silently

**Gate:**
- Pass: UI-SPEC tồn tại hoặc user chọn skip/continue
- Fail: User chọn "Generate UI-SPEC first" → Exit workflow

**Output bước này:** `UI_SPEC_PATH` set (if exists)

---

### Bước 6: Check Existing Plans
**Mục đích:** Kiểm tra xem phase đã có plans chưa

**Hành động cụ thể:**
- `ls "${PHASE_DIR}"/*-PLAN.md`
- Nếu tồn tại → Offer:
  1. Add more plans
  2. View existing
  3. Replan from scratch

**Gate:**
- Pass: User chọn option
- Fail: (none)

**Output bước này:** none

---

### Bước 7: Use Context Paths from INIT
**Mục đích:** Extract file paths từ init JSON

**Hành động cụ thể:**
- Extract: STATE_PATH, ROADMAP_PATH, REQUIREMENTS_PATH, RESEARCH_PATH, VERIFICATION_PATH, UAT_PATH, CONTEXT_PATH

**Gate:**
- Pass: Paths extracted
- Fail: (none)

**Output bước này:** File paths stored in variables

---

### Bước 7.5: Verify Nyquist Artifacts
**Mục đích:** Đảm bảo VALIDATION.md tồn tại (nếu Nyquist enabled)

**Hành động cụ thể:**
- Skip if: nyquist_validation = false OR research_enabled = false
- Skip if: research disabled AND has_research = false AND no --research flag
- Check VALIDATION.md tồn tại
- Nếu missing → Ask user:
  1. Re-run: `/gsd:plan-phase {PHASE} --research`
  2. Disable Nyquist: `gsd-tools config-set workflow.nyquist_validation false`
  3. Continue anyway (plans fail Dimension 8)

**Gate:**
- Pass: User chọn option 2 hoặc 3
- Fail: (none)

**Output bước này:** none (validation check)

---

### Bước 8: Spawn gsd-planner Agent
**Mục đích:** Create PLAN.md files cho phase

**Hành động cụ thể:**
- Display banner "GSD ► PLANNING PHASE {X}"
- Spawn gsd-planner với prompt chứa:
  - Files to read: STATE, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, VERIFICATION (nếu --gaps), UAT (nếu --gaps), UI-SPEC, STRUCTURE.md, CONVENTIONS.md
  - Phase requirement IDs (mỗi ID phải xuất hiện trong plan's `requirements` field)
  - Deep work rules (anti-shallow execution):
    - Mọi task phải có `<read_first>`: files cần đọc trước
    - Mọi task phải có `<acceptance_criteria>`: điều kiện verify được bằng grep/command
    - Mọi task phải có `<action>`: giá trị cụ thể, không mơ hồ
  - Quality gate checklist
  - Downstream consumer info (execute-phase cần gì)

**Gate:**
- Pass: Planner return `## PLANNING COMPLETE`
- Fail: `## PLANNING INCONCLUSIVE` → Offer options

**Output bước này:** `{phase_dir}/{phase_num}-{N}-PLAN.md` (multiple files)

---

### Bước 9: Handle Planner Return
**Mục đích:** Process planner result và route to next step

**Hành động cụ thể:**
- `## PLANNING COMPLETE` → Display plan count → If `--skip-verify` or `plan_checker_enabled`=false → skip to step 13, else step 10
- `## CHECKPOINT REACHED` → Present to user, get response, spawn continuation (step 12)
- `## PLANNING INCONCLUSIVE` → Show attempts, offer: Add context / Retry / Manual

**Gate:**
- Pass: Có valid return
- Fail: (depends on user choice)

**Output bước này:** none (routing decision)

---

### Bước 10: Spawn gsd-plan-checker Agent
**Mục đích:** Verify plans achieve phase goal

**Hành động cụ thể:**
- Display banner "GSD ► VERIFYING PLANS"
- Spawn gsd-plan-checker với prompt:
  - Files to read: PLAN.md files, ROADMAP, REQUIREMENTS, CONTEXT, RESEARCH, STRUCTURE.md, CONVENTIONS.md
  - Phase requirement IDs (phải được cover all)
  - Project instructions (verify plans honor project guidelines)

**Gate:**
- Pass: Checker return (always returns)
- Fail: (none - checker always returns)

**Output bước này:** Verification results

---

### Bước 11: Handle Checker Return
**Mục đích:** Process verification results

**Hành động cụ thể:**
- `## VERIFICATION PASSED` → Display confirmation, proceed to step 13
- `## ISSUES FOUND` → Display issues, check iteration count, proceed to step 12

**Gate:**
- Pass: Verification passed
- Fail: Issues found → Continue to revision loop

**Output bước này:** none (routing decision)

---

### Bước 12: Revision Loop (Max 3 Iterations)
**Mục đích:** Fix plans based on checker feedback

**Hành động cụ thể:**
- Track `iteration_count` (starts at 1)
- Nếu iteration_count < 3:
  - Display: "Sending back to planner for revision... (iteration {N}/3)"
  - Spawn gsd-planner in revision mode với checker issues
  - After return → spawn checker again (step 10), increment iteration
- Nếu iteration_count >= 3:
  - Display: "Max iterations reached. {N} issues remain:"
  - Offer: 1) Force proceed, 2) Provide guidance and retry, 3) Abandon

**Gate:**
- Pass: Verification passed hoặc user chọn force proceed
- Fail: User chọn Abandon

**Output bước này:** Updated PLAN.md files (if revision happened)

---

### Bước 13: Present Final Status
**Mục đích:** Display completion status và route to next action

**Hành động cụ thể:**
- Route to `<offer_next>` OR `auto_advance` depending on flags/config
- Display offer_next markdown:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GSD ► PHASE {X} PLANNED ✓
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  **Phase {X}: {Name}** — {N} plan(s) in {M} wave(s)
  ...
  ```

**Gate:**
- Pass: Status presented
- Fail: (none)

**Output bước này:** none (display only)

---

### Bước 14: Auto-Advance Check
**Mục đích:** Auto-chain to execute-phase if enabled

**Hành động cụ thể:**
- Parse `--auto` flag
- Clear ephemeral chain flag if manually invoked (no --auto)
- Read both chain flag and user preference
- Nếu `--auto` OR `AUTO_CHAIN` = true OR `AUTO_CFG` = true:
  - Display banner "GSD ► AUTO-ADVANCING TO EXECUTE"
  - Launch execute-phase: `Skill(skill="gsd:execute-phase", args="${PHASE} --auto --no-transition")`
  - Handle execute-phase return (PHASE COMPLETE hoặc GAPS FOUND)
- Else: Route to `<offer_next>`

**Gate:**
- Pass: Auto-advance triggered or not
- Fail: (none)

**Output bước này:** none (triggers next command if enabled)

---

## Output

### Files được tạo mới
| File | Mô tả | Template dùng | Format |
|------|-------|---------------|--------|
| `.planning/phases/{padded_phase}/{padded_phase}-CONTEXT.md` | User decisions from discuss-phase hoặc parsed from PRD | `templates/context.md` | Markdown với `<domain>`, `<decisions>`, `<canonical_refs>`, `<specifics>`, `<deferred>` sections |
| `.planning/phases/{padded_phase}/{phase_num}-RESEARCH.md` | Domain research findings | Agent-generated | Markdown với research findings |
| `.planning/phases/{padded_phase}/{padded_phase}-VALIDATION.md` | Nyquist validation strategy | `templates/VALIDATION.md` | Markdown với validation requirements |
| `.planning/phases/{padded_phase}/{phase_num}-{N}-PLAN.md` | Execution plans with tasks | Agent-generated | Markdown với frontmatter (wave, depends_on, files_modified, autonomous) và XML tasks |

### Files được cập nhật
| File | Thay đổi gì |
|------|------------|
| `.planning/STATE.md` | Cập nhật phase status sang "planned" nếu cần |

### Side Effects
- Git commit tự động: có (nếu `commit_docs` = true), commit message dạng `docs({padded_phase}): generate context from PRD` hoặc `docs(phase-{N}): add validation strategy`
- Config changes: có thể thay đổi `workflow._auto_chain_active` flag

---

## Agents Được Gọi

| Agent | Khi nào | Làm gì | Output |
|-------|---------|--------|--------|
| `gsd-phase-researcher` | Step 5 (research enabled, no existing RESEARCH.md hoặc --research flag) | Research domain, trả lời "What do I need to know to PLAN this phase well?" | `{phase_num}-RESEARCH.md` |
| `gsd-planner` | Step 8 (always) | Tạo PLAN.md files với tasks, waves, dependencies | `{phase_num}-{N}-PLAN.md` |
| `gsd-plan-checker` | Step 10 (if plan_checker enabled và không --skip-verify) | Verify plans achieve phase goal, check all requirements covered | Verification results |

---

## Liên kết với các Commands khác

**Phải chạy trước:**
- `/gsd:new-project` (bắt buộc — tạo roadmap và requirements)
- `/gsd:discuss-phase N` (optional nhưng recommended — tạo CONTEXT.md)

**Thường chạy sau:**
- `/gsd:execute-phase N` (đọc PLAN.md files để thực thi)
- `/gsd:verify-work N` (verify deliverables sau execute)

**Liên quan:**
- `/gsd:research-phase` — standalone research command (plan-phase đã tích hợp research)
- `/gsd:ui-phase N` — tạo UI-SPEC.md trước khi planning

---

## Ví dụ Thực tế

### Ví dụ 1: Default flow (có context từ discuss-phase)
```
Scenario: User đã chạy discuss-phase cho Phase 1, đã có CONTEXT.md, cần tạo plans

Lệnh: /gsd:plan-phase 1

Kết quả:
- Kiểm tra RESEARCH.md tồn tại? → Hỏi user có muốn research không
- Spawn gsd-planner → Tạo 01-PLAN.md, 02-PLAN.md (nếu cần)
- Spawn gsd-plan-checker → Verify plans
- Hiển thị: Phase 1 Planned ✓ với next steps
- Tạo ra: .planning/phases/01-name/01-PLAN.md, 02-PLAN.md
```

### Ví dụ 2: Với --prd flag (skip discuss-phase)
```
Scenario: User có PRD file, muốn nhanh chóng tạo plans mà không cần discuss-phase

Lệnh: /gsd:plan-phase 2 --prd ./PRD.md

Kết quả:
- Đọc PRD.md → Parse requirements → Tạo CONTEXT.md tự động
- Bypass step 4 (Load CONTEXT) vì đã tạo ở đây
- Spawn gsd-planner với PRD-derived context
- Continue normal flow (research, verify, etc.)
- Tạo ra: .planning/phases/02-name/02-CONTEXT.md (từ PRD), PLAN.md files
```

### Ví dụ 3: Với --auto (auto-chain to execute)
```
Scenario: User đã có đủ context và research, muốn chạy pipeline không cần tương tác

Lệnh: /gsd:plan-phase 1 --auto

Kết quả:
- Normal flow: research (nếu cần), plan, verify
- Sau khi verify passed → Auto-advance sang execute-phase
- Execute-phase chạy với --auto --no-transition flags
- Kết quả cuối: Phase 1 Complete ✓ (không cần user interaction)
```

### Ví dụ 4: Với --gaps (gap closure)
```
Scenario: User đã chạy execute-phase và verify-work, cần replan để fill gaps

Lệnh: /gsd:plan-phase 2 --gaps

Kết quả:
- Skip research (--gaps bỏ qua step 5)
- Đọc VERIFICATION.md để biết gaps cần fix
- Spawn gsd-planner với verification gaps context
- Plans tập trung vào fixing gaps thay vì full planning
- Tạo ra: Updated PLAN.md files với gap-fixing tasks
```

---

## Issues Phát Hiện

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:8] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/references/ui-brand.md` — thay bằng relative path hoặc variable

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:18] — HARDCODED_PATH — `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs"` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:46] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" roadmap get-phase` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:148] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" commit` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:216] — HARDCODED_PATH — `node "C:/Users/Admin/.../gsd-tools.cjs" roadmap get-phase` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:278] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/VALIDATION.md` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:295-296] — HARDCODED_PATH — `gsd-tools.cjs config-get` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:304] — HARDCODED_PATH — `gsd-tools.cjs roadmap get-phase` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:370] — HARDCODED_PATH — `gsd-tools.cjs config-set` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:589] — HARDCODED_PATH — `gsd-tools.cjs config-set` — thay bằng relative path

[gsd-template/gsd/get-shit-done/workflows/plan-phase.md:594-595] — HARDCODED_PATH — `gsd-tools.cjs config-get` — thay bằng relative path

## Proposals Được Tạo

Không có proposals trong session này.

---

## Ghi chú Kỹ thuật
- Workflow sử dụng **Format B** (`## N. sections`) với 14 main steps
- Plan-phase có thể auto-chain to execute-phase via Skill tool (không phải Task tool để tránh nested agent freeze)
- Nyquist validation tạo VALIDATION.md chỉ khi research enabled và có "## Validation Architecture" section trong RESEARCH.md
- Revision loop max 3 iterations, sau đó offer options cho user
- PRD express path bypass step 4 (Load CONTEXT) vì đã tạo CONTEXT từ PRD
- Mỗi task trong PLAN.md phải có `<read_first>`, `<acceptance_criteria>`, và `<action>` với concrete values
- Auto-advance dùng `--no-transition` flag để giữ chain flat, tránh deep nesting
