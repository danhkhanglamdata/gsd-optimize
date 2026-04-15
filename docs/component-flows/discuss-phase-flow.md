# /gsd:discuss-phase — Flow Chain

> Loại: Flow Doc
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Phiên bản gsd-template: 2.0.0
> Trạng thái: Draft
> Nguồn: `gsd-template/gsd/commands/gsd/discuss-phase.md`

## Tổng quan

Lệnh `/gsd:discuss-phase` thu thập các quyết định triển khai mà các downstream agents (researcher, planner) cần để hoàn thành phase. Flow hoạt động bằng cách phân tích phase goal, xác định các vùng xám (gray areas), cho phép user chọn các areas để thảo luận, sau đó đào sâu từng area cho đến khi user hài lòng. Output: `{phase_num}-CONTEXT.md` chứa các quyết định rõ ràng để downstream agents có thể hành động không cần hỏi user thêm.

## Flow Chain

```
commands/gsd/discuss-phase.md
    ↓ execution_context (loads)
workflows/discuss-phase.md  [12 steps: <step> XML format]
    ↓ Step 1: initialize
        └─ bash: gsd-tools.cjs init phase-op → trả về phase metadata JSON
        └─ gate: nếu phase không tồn tại trong roadmap → error, exit
    ↓ Step 2: check_existing
        └─ kiểm tra CONTEXT.md đã tồn tại chưa
        └─ gate: nếu có → offer update/view/skip; nếu không → tiếp tục
    ↓ Step 3: load_prior_context
        └─ đọc PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files
        └─ xây dựng nội bộ <prior_decisions> context
    ↓ Step 4: scout_codebase
        └─ grep tìm reusable assets, patterns, integration points
        └─ xây dựng nội bộ <codebase_context>
    ↓ Step 5: analyze_phase
        └─ phân tích phase goal, xác định gray areas
        └─ gọi ux-brainstormer skill để generate creative enhancements
    ↓ Step 6: present_gray_areas
        └─ trình bày domain boundary + prior decisions + gray areas
        └─ AskUserQuestion: user chọn areas để thảo luận
    ↓ Step 7: discuss_areas
        └─ vòng lặp discussion cho mỗi area đã chọn
        └─ hỏi 4 câu hỏi cho mỗi area hoặc batch mode
    ↓ Step 8: write_context
        └─ tạo {phase_dir}/{padded_phase}-CONTEXT.md
        └─ sections: decisions, canonical_refs, code_context, specifics, deferred
    ↓ Step 9: confirm_creation
        └─ AskUserQuestion: next steps (ui-phase / plan-phase / view / edit)
    ↓ Step 10: git_commit
        └─ bash: gsd-tools.cjs commit → commit CONTEXT.md
    ↓ Step 11: update_state
        └─ bash: gsd-tools.cjs state record-session → cập nhật STATE.md
    ↓ Step 12: auto_advance
        └─ Skill tool: chain sang ui-phase hoặc plan-phase nếu --auto
```

## Steps Chi Tiết

### Step 1: initialize

**Mục đích:** Khởi tạo phase, parse metadata từ roadmap.

**Hành động:**
- Chạy bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}"`
- Parse JSON: `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `has_verification`, `plan_count`, `roadmap_exists`, `planning_exists`

**Gate:**
- Pass khi: `phase_found` = true
- Fail khi: `phase_found` = false → Hiển thị error "Phase [X] not found in roadmap", exit workflow

**Output bước này:** Phase metadata JSON (in-memory)

---

### Step 2: check_existing

**Mục đích:** Kiểm tra xem CONTEXT.md đã tồn tại chưa.

**Hành động:**
- Bash: `ls ${phase_dir}/*-CONTEXT.md 2>/dev/null`
- Nếu tồn tại: Ask "Update it" / "View it" / "Skip"
- Nếu không tồn tại: Kiểm tra `has_plans` → Ask "Continue and replan" / "View plans" / "Cancel"
- Nếu `--auto`: Auto-select "Update" hoặc "Continue"

**Gate:**
- Pass khi: User chọn tiếp tục
- Fail khi: User chọn "Cancel" hoặc "Skip" → Exit workflow

**Output bước này:** None

---

### Step 3: load_prior_context

**Mục đích:** Đọc project-level và prior phase context để tránh hỏi lại các câu đã quyết định.

**Hành động:**
- Đọc file: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Bash: `find .planning/phases -name "*-CONTEXT.md" 2>/dev/null | sort`
- Đọc tất cả prior CONTEXT.md files (phase < current phase)
- Xây dựng internal `<prior_decisions>` structure

**Output bước này:** None (in-memory context)

---

### Step 4: scout_codebase

**Mục đích:** Quét lightweight codebase để inform gray area identification.

**Hành động:**
- Bash: `ls .planning/codebase/*.md 2>/dev/null`
- Nếu tồn tại: Đọc relevant files (CONVENTIONS.md, STRUCTURE.md, STACK.md)
- Nếu không tồn tại: Grep tìm related files theo phase goal terms
- Đọc 3-5 files relevant nhất
- Xây dựng internal `<codebase_context>`

**Output bước này:** None (in-memory context)

---

### Step 5: analyze_phase

**Mục đích:** Phân tích phase để xác định các gray areas worth discussing.

**Hành động:**
- Đọc phase description từ ROADMAP.md
- Khởi tạo `<canonical_refs>` accumulator
- Kiểm tra `<prior_decisions>` cho các quyết định đã có
- Generate 2-4 phase-specific gray areas với code context annotations
- Load ux-brainstormer skill: `.claude/skills/ux-brainstormer/SKILL.md`
- Search trends: "[feature-domain] design trends 2025", "[feature-domain] UX patterns", "engagement UI patterns"
- Generate 2-3 creative enhancement ideas

**Output bước này:** Internal analysis (in-memory)

---

### Step 6: present_gray_areas

**Mục đích:** Trình bày domain boundary, prior decisions, và gray areas để user chọn.

**Hành động:**
- Trình bày phase boundary và applicable prior decisions
- AskUserQuestion (multiSelect: true): "Which areas do you want to discuss?"
- Generate 3-4 phase-specific gray areas với code context annotations
- Present creative enhancements như separate multi-select nếu generated

**Gate:**
- Pass khi: User chọn ít nhất 1 area
- Fail khi: User doesn't select any → prompt again

**Output bước này:** Selected areas list (in-memory)

---

### Step 7: discuss_areas

**Mục đích:** Thảo luận từng selected area cho đến khi user satisfied.

**Hành động:**
- Với mỗi area:
  - Announce area
  - Ask 4 câu hỏi (default) hoặc batch 2-5 questions (nếu --batch)
  - AskUserQuestion cho mỗi câu với concrete options và code context annotations
  - Check: "More questions about [area], or move to next?"
- Sau khi hoàn thành tất cả areas: Ask "Explore more gray areas" / "I'm ready for context"
- Canonical ref accumulation: Khi user reference doc/spec → đọc và add vào accumulator

**Gate:**
- Pass khi: User chọn "I'm ready for context"
- Fail khi: User chọn "Explore more" → quay lại present_gray_areas

**Output bước này:** None (decisions captured in memory)

---

### Step 8: write_context

**Mục đích:** Tạo CONTEXT.md capturing decisions made.

**Hành động:**
- Bash: `mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"` nếu cần
- Tạo file: `${phase_dir}/${padded_phase}-CONTEXT.md`
- Sections: `<domain>`, `<decisions>`, `<canonical_refs>`, `<code_context>`, `<specifics>`, `<deferred>`

**Output bước này:** `.planning/phases/{padded_phase}-{slug}/{padded_phase}-CONTEXT.md`

---

### Step 9: confirm_creation

**Mục đích:** Xác nhận tạo context và hỏi user về next steps.

**Hành động:**
- Hiển thị summary của decisions captured
- AskUserQuestion: "Phase ${PHASE} context is ready. What would you like to do next?"
- Options: "UI design contract" (recommended), "Skip to planning", "View context", "Edit context"
- Handle user choice:
  - "UI design contract": Proceed to git_commit, sau đó Skill tool: `gsd:ui-phase`
  - "Skip to planning": Proceed to git_commit, sau đó Skill tool: `gsd:plan-phase`
  - "View context": Display CONTEXT.md, re-prompt
  - "Edit context": Open editor, save, re-prompt

**Output bước này:** User's next step selection

---

### Step 10: git_commit

**Mục đích:** Commit CONTEXT.md vào git.

**Hành động:**
- Chạy bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${padded_phase}): capture phase context" --files "${phase_dir}/${padded_phase}-CONTEXT.md"`

**Output bước này:** None

---

### Step 11: update_state

**Mục đích:** Cập nhật STATE.md với session info.

**Hành động:**
- Bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session --stopped-at "Phase ${PHASE} context gathered" --resume-file "${phase_dir}/${padded_phase}-CONTEXT.md"`
- Bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(state): record phase ${PHASE} context session" --files .planning/STATE.md`

**Output bước này:** None

---

### Step 12: auto_advance

**Mục đích:** Auto-advance sang ui-phase hoặc plan-phase nếu --auto flag được bật.

**Hành động:**
- Parse `--auto` flag từ $ARGUMENTS
- Đọc config: `_auto_chain_active`, `auto_advance`, `ui_phase_auto`
- Nếu `--auto` hoặc auto_advance enabled:
  - Nếu `ui_phase_auto` = true: Skill tool: `Skill(skill="gsd:ui-phase", args="${PHASE} --auto")`
  - Nếu `ui_phase_auto` = false: Skill tool: `Skill(skill="gsd:plan-phase", args="${PHASE} --auto")`
- Handle ui-phase return: Launch plan-phase với `--no-transition`
- Handle plan-phase return: Display completion status

**Gate:**
- Pass khi: Auto-advance completes hoặc no --auto flag → Route to confirm_creation
- Fail khi: ui-phase hoặc plan-phase fails → Display appropriate error message

**Output bước này:** None (chain advancement)

---

## Agents Được Gọi

| Agent | Điều kiện gọi | Files đọc vào | Files tạo ra |
|-------|--------------|---------------|-------------|
| None | discuss-phase KHÔNG spawn Task agents | N/A | N/A |

**Lưu ý quan trọng:** discuss-phase dùng **Skill tool** để chain sang các phase khác (`gsd:ui-phase`, `gsd:plan-phase`), không dùng Task spawning. Skill tool invocation KHÔNG tạo SPAWNS edge trong graph.

## Files Được Tạo Ra

| File | Nội dung | Template dùng | Tạo ở Step |
|------|----------|---------------|------------|
| `.planning/phases/{padded}-{slug}/{padded}-CONTEXT.md` | Phase context với decisions, canonical refs, code context, deferred ideas | `templates/context.md` | Step 8 |

## Dependencies

**Cần chạy trước:** `/gsd:new-project` (để có PROJECT.md, ROADMAP.md)
**Output được dùng bởi:** `/gsd:plan-phase`, `/gsd:execute-phase` — đọc CONTEXT.md để biết cần research và plan gì

## Skills Được Load

| Skill | Khi nào load | Mục đích |
|-------|------------|----------|
| `ux-brainstormer` | Step 5: analyze_phase | Brainstorm creative UI/UX và research gamification patterns |
| `style-adapter` | Step 5: analyze_phase | Analyze inspiration sites và convert designs |

## Issues Phát Hiện

[workflows/discuss-phase.md:123] — HARDCODED_PATH — node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" — nên dùng relative path hoặc biến môi trường

[workflows/discuss-phase.md:690] — HARDCODED_PATH — gsd-tools.cjs commit --files — nên dùng relative path

[workflows/discuss-phase.md:700] — HARDCODED_PATH — gsd-tools.cjs state record-session — nên dùng relative path

[workflows/discuss-phase.md:708] — HARDCODED_PATH — gsd-tools.cjs commit --files .planning/STATE.md — nên dùng relative path

[workflows/discuss-phase.md:719] — HARDCODED_PATH — gsd-tools.cjs config-set — nên dùng relative path

[workflows/discuss-phase.md:724] — HARDCODED_PATH — gsd-tools.cjs config-get — nên dùng relative path

[workflows/discuss-phase.md:725] — HARDCODED_PATH — gsd-tools.cjs config-get — nên dùng relative path

[workflows/discuss-phase.md:730] — HARDCODED_PATH — gsd-tools.cjs config-set — nên dùng relative path

[workflows/discuss-phase.md:737] — HARDCODED_PATH — gsd-tools.cjs config-get — nên dùng relative path

[commands/discuss-phase.md:36-39] — HARDCODED_PATH — execution_context paths — nên dùng relative paths

## Proposals Được Tạo

→ Xem: [docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md](docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md)