# /gsd:discuss-phase
> Loại: Action Doc
> Tạo bởi: action-doc-writer
> Ngày: 2026-04-14
> Phiên bản gsd_template: 2.0.0
> Trạng thái: Draft
> Nguồn command: `gsd-template/gsd/commands/gsd/discuss-phase.md`
> Nguồn workflow: `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md`

## Mục đích
Command này thu thập các quyết định triển khai (implementation decisions) mà downstream agents (researcher, planner) cần để hoàn thành phase. Output: `{padded_phase}-CONTEXT.md` chứa các quyết định rõ ràng để downstream agents có thể hành động không cần hỏi user thêm.

## Khi nào sử dụng

**Nên sử dụng khi:**
- Phase mới cần xác định rõ implementation details trước khi research và planning
- User muốn capture preferences về UI/UX, behavior, interactions cho phase hiện tại
- Cần carry forward decisions từ các phase trước để tránh hỏi lại

**Không nên sử dụng khi:**
- User đã có PRD hoặc spec đầy đủ -> dùng `/gsd:plan-phase --prd` để skip discuss
- Phase là pure infrastructure không cần user input
- User muốn để researcher và planner tự quyết định ( acceptable nhưng sẽ có fewer constraints)

---

## Input

### Arguments & Flags
| Flag | Mặc định | Mô tả | Thay đổi gì so với default |
|------|----------|-------|---------------------------|
| (none) | — | Chạy interactive mode - hỏi từng câu một | — |
| --auto | — | Auto mode - Claude chọn recommended options cho tất cả câu hỏi, không hỏi user | Bỏ qua interactive questioning, auto-select ALL gray areas, chọn recommended option cho mỗi câu hỏi, sau đó auto-advance sang ui-phase hoặc plan-phase |
| --batch=N | — | Batch mode - gộp 2-5 câu hỏi thành 1 batch thay vì hỏi từng câu | Thay đổi pacing: hỏi batch 2-5 câu cùng lúc trong 1 turn |
| --no-transition | — | Used in auto-advance chain - ngăn ui-phase trigger thêm auto-advance | Ngăn double-advance khi chain từ ui-phase sang plan-phase |

### Điều kiện tiên quyết
- [ ] Phase phải tồn tại trong ROADMAP.md
- [ ] PROJECT.md, REQUIREMENTS.md, STATE.md phải tồn tại (từ /gsd:new-project)
- [ ] Phase number argument bắt buộc

### Files phải có trước khi chạy
| File | Mô tả | Tạo bởi |
|------|-------|---------|
| `.planning/PROJECT.md` | Project vision và principles | `/gsd:new-project` |
| `.planning/REQUIREMENTS.md` | Acceptance criteria, constraints | `/gsd:new-project` |
| `.planning/ROADMAP.md` | Phase definitions | `/gsd:new-project` |
| `.planning/STATE.md` | Current progress state | `/gsd:new-project` |

---

## Quy trình (Step-by-Step)

### Bước 1: initialize
**Mục đích:** Khởi tạo phase, parse metadata từ roadmap.

**Hành động cụ thể:**
- Chạy bash: `node gsd-tools.cjs init phase-op "${PHASE}"`
- Parse JSON returned: `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `has_verification`, `plan_count`, `roadmap_exists`, `planning_exists`

**Gate:**
- Pass: `phase_found` = true
- Fail: `phase_found` = false -> Hiển thị error "Phase [X] not found in roadmap" -> Exit workflow

**Output bước này:** Phase metadata JSON (in-memory) - các biến dùng cho steps tiếp theo

---

### Bước 2: check_existing
**Mục đích:** Kiểm tra xem CONTEXT.md đã tồn tại chưa.

**Hành động cụ thể:**
- Bash: `ls ${phase_dir}/*-CONTEXT.md 2>/dev/null`
- Nếu tồn tại: Ask "Update it" / "View it" / "Skip"
- Nếu không tồn tại nhưng có plans: Ask "Continue and replan after" / "View existing plans" / "Cancel"
- Nếu `--auto`: Auto-select "Update" hoặc "Continue" không hỏi

**Gate:**
- Pass: User chọn tiếp tục hoặc có --auto flag
- Fail: User chọn "Cancel" hoặc "Skip" -> Exit workflow

**Output bước này:** None

---

### Bước 3: load_prior_context
**Mục đích:** Đọc project-level và prior phase context để tránh hỏi lại các câu đã quyết định.

**Hành động cụ thể:**
- Đọc files: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Bash: `find .planning/phases -name "*-CONTEXT.md" 2>/dev/null | sort`
- Đọc tất cả prior CONTEXT.md files (phase < current phase)
- Extract từ mỗi file sections: `<decisions>`, `<specifics>`
- Build internal `<prior_decisions>` structure

**Gate:**
- Pass: Always - tiếp tục dù có hoặc không có prior context
- Fail: N/A

**Output bước này:** None (in-memory context: `<prior_decisions>`)

---

### Bước 4: scout_codebase
**Mục đích:** Quét lightweight codebase để inform gray area identification.

**Hành động cụ thể:**
- Bash: `ls .planning/codebase/*.md 2>/dev/null`
- Nếu tồn tại: Đọc CONVENTIONS.md, STRUCTURE.md, STACK.md
- Nếu không tồn tại: Grep tìm related files theo phase goal terms
- Đọc 3-5 files relevant nhất
- Build internal `<codebase_context>`: reusable assets, established patterns, integration points

**Gate:**
- Pass: Always - tiếp tục dù có hoặc không có codebase
- Fail: N/A

**Output bước này:** None (in-memory context: `<codebase_context>`)

---

### Bước 5: analyze_phase
**Mục đích:** Phân tích phase để xác định các gray areas worth discussing.

**Hành động cụ thể:**
- Đọc phase description từ ROADMAP.md
- Xác định domain boundary - capability phase deliver
- Khởi tạo `<canonical_refs>` accumulator
- Kiểm tra `<prior_decisions>` cho các quyết định đã có
- Generate 2-4 phase-specific gray areas với code context annotations
- Load ux-brainstormer skill: `.claude/skills/ux-brainstormer/SKILL.md`
- Search trends: "mobile app design trends 2025", "event app gamification"
- Generate 2-3 creative enhancement ideas

**Gate:**
- Pass: Always - luôn generate analysis
- Fail: N/A

**Output bước này:** Internal analysis (in-memory) - gray areas list + creative suggestions

---

### Bước 6: present_gray_areas
**Mục đích:** Trình bày domain boundary, prior decisions, và gray areas để user chọn.

**Hành động cụ thể:**
- Trình bày phase boundary và applicable prior decisions
- Nếu `--auto`: Auto-select ALL gray areas, log: `[auto] Selected all gray areas: [list]`
- Nếu không có --auto: AskUserQuestion (multiSelect: true)
  - Header: "Discuss"
  - Question: "Which areas do you want to discuss for [name]?"
  - Options: 3-4 phase-specific gray areas với code context annotations
  - Highlight recommended choice với brief explanation
- Nếu có creative enhancements từ step 5: Present như separate multi-select option

**Gate:**
- Pass: User chọn ít nhất 1 area
- Fail: User không chọn gì -> prompt again

**Output bước này:** Selected areas list (in-memory)

---

### Bước 7: discuss_areas
**Mục đích:** Thảo luận từng selected area cho đến khi user satisfied.

**Hành động cụ thể:**
- Parse `--batch` flag: nếu có, default 4 questions per batch, clamp to 2-5
- **Default mode (no --batch):** Ask 4 câu using AskUserQuestion cho mỗi area
  - Header: "[Area]" (max 12 chars)
  - Question: Specific decision cho area đó
  - Options: 2-3 concrete choices với recommended option highlighted
  - Annotate với code context khi relevant
  - Include "You decide" option khi reasonable
- **Batch mode:** Ask 2-5 numbered questions trong 1 plain-text turn
- Sau mỗi set: Ask "More questions about [area], or move to next? (Remaining: [list])"
- Sau tất cả areas: Ask "Explore more gray areas" / "I'm ready for context"
- **Auto mode:** Claude chọn recommended option cho mỗi câu, log: `[auto] [Area] — Q: "[question]" → Selected: "[chosen]" (recommended)`

**Gate:**
- Pass: User chọn "I'm ready for context"
- Fail: User chọn "Explore more gray areas" -> quay lại present_gray_areas

**Output bước này:** None (decisions captured in memory)

---

### Bước 8: write_context
**Mục đích:** Tạo CONTEXT.md capturing decisions made.

**Hành động cụ thể:**
- Bash: `mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"` nếu cần
- Tạo file: `${phase_dir}/${padded_phase}-CONTEXT.md`
- Sections:
  - `<domain>` - Phase boundary statement
  - `<decisions>` - Implementation decisions captured (by category)
  - `<canonical_refs>` - Full relative path to ALL refs (ROADMAP.md + user-referenced docs) - MANDATORY
  - `<code_context>` - Reusable assets, patterns, integration points
  - `<specifics>` - Particular references or "I want it like X" moments
  - `<deferred>` - Ideas belong in other phases

**Output bước này:** `.planning/phases/{padded}-{slug}/{padded_phase}-CONTEXT.md`

---

### Bước 9: confirm_creation
**Mục đích:** Xác nhận tạo context và hỏi user về next steps.

**Hành động cụ thể:**
- Hiển thị summary của decisions captured
- AskUserQuestion:
  - Header: "Next"
  - Question: "Phase ${PHASE} context is ready. What would you like to do next?"
  - Options:
    - "UI design contract (recommended for frontend phases)" -> Skill: gsd:ui-phase
    - "Skip to planning" -> Skill: gsd:plan-phase
    - "View context" -> Display CONTEXT.md, re-prompt
    - "Edit context" -> Open editor, save, re-prompt

**Gate:**
- Pass: User chọn a next step
- Fail: N/A

**Output bước này:** User's next step selection

---

### Bước 10: git_commit
**Mục đích:** Commit CONTEXT.md vào git.

**Hành động cụ thể:**
- Bash: `node gsd-tools.cjs commit "docs(${padded_phase}): capture phase context" --files "${phase_dir}/${padded_phase}-CONTEXT.md"`

**Gate:**
- Pass: Commit thành công
- Fail: Commit thất bại -> Display error, vẫn tiếp tục (context đã được tạo)

**Output bước này:** None

---

### Bước 11: update_state
**Mục đích:** Cập nhật STATE.md với session info.

**Hành động cụ thể:**
- Bash: `node gsd-tools.cjs state record-session --stopped-at "Phase ${PHASE} context gathered" --resume-file "${phase_dir}/${padded_phase}-CONTEXT.md"`
- Bash: `node gsd-tools.cjs commit "docs(state): record phase ${PHASE} context session" --files .planning/STATE.md`

**Gate:**
- Pass: Update thành công
- Fail: Update thất bại -> Display warning, vẫn tiếp tục

**Output bước này:** None

---

### Bước 12: auto_advance
**Mục đích:** Auto-advance sang ui-phase hoặc plan-phase nếu --auto flag được bật.

**Hành động cụ thể:**
- Parse `--auto` flag từ $ARGUMENTS
- Đọc config: `_auto_chain_active`, `auto_advance`, `ui_phase_auto`
- Nếu `--auto` hoặc auto_advance enabled:
  - Nếu `ui_phase_auto` = true: Skill tool: `Skill(skill="gsd:ui-phase", args="${PHASE} --auto")`
  - Nếu `ui_phase_auto` = false: Skill tool: `Skill(skill="gsd:plan-phase", args="${PHASE} --auto")`
- Handle ui-phase return: Launch plan-phase với `--no-transition`
- Handle plan-phase return: Display completion status

**Gate:**
- Pass: Auto-advance completes hoặc no --auto flag -> Route to confirm_creation
- Fail: ui-phase hoặc plan-phase fails -> Display error message

**Output bước này:** None (chain advancement)

---

## Output

### Files được tạo mới
| File | Mô tả | Template dùng | Format |
|------|-------|---------------|--------|
| `.planning/phases/{padded}-{slug}/{padded_phase}-CONTEXT.md` | Phase context với decisions, canonical refs, code context, deferred ideas | `templates/context.md` | Sections: domain, decisions, canonical_refs, code_context, specifics, deferred |

### Files được cập nhật
| File | Thay đổi gì |
|------|------------|
| `.planning/STATE.md` | Cập nhật `stopped-at` field và `resume-file` |

### Side Effects
- Git commit tự động: Có - "docs({padded_phase}): capture phase context" cho CONTEXT.md
- Git commit tự động: Có - "docs(state): record phase {PHASE} context session" cho STATE.md
- Config changes: Có - set `workflow._auto_chain_active` flag khi --auto được dùng

---

## Agents Được Gọi

| Agent | Khi nào | Làm gì | Output |
|-------|---------|--------|--------|
| N/A | N/A | discuss-phase KHÔNG spawn Task agents | N/A |

**Lưu ý quan trọng:** discuss-phase dùng **Skill tool** (`Skill(skill="gsd:ui-phase")`, `Skill(skill="gsd:plan-phase")`) để chain sang các phase khác, không dùng Task spawning.

---

## Liên kết với các Commands khác

**Phải chạy trước:** `/gsd:new-project` (để có PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md)
**Thường chạy sau:** `/gsd:ui-phase` (nếu user chọn UI design) hoặc `/gsd:plan-phase` (nếu user skip to planning)
**Liên quan:**
- `/gsd:plan-phase --prd` - Express path, skip discuss nếu đã có PRD
- `/gsd:verify-work` - Dùng context để verify deliverables

---

## Ví dụ Thực tế

### Ví dụ 1: Default interactive flow
```
[Scenario: User đang ở Phase 3 (User Profile), cần discuss implementation decisions]

Lệnh: /gsd:discuss-phase 3

Kết quả:
- Tạo ra: .planning/phases/03-user-profile/03-CONTEXT.md
- Nội dung: Domain boundary "User profile display and editing", 
  decisions về layout, fields, validation,
  canonical refs từ ROADMAP.md,
  code context về reusable components,
  deferred ideas (nếu có)
- User được hỏi chọn next: UI design contract hoặc skip to planning
```

### Ví dụ 2: Auto mode flow
```
[Scenario: User chạy from new-project --auto chain, muốn auto-select all decisions]

Lệnh: /gsd:discuss-phase 1 --auto

Kết quả:
- Auto-select ALL gray areas: [list]
- For each question, select recommended option
- Log: [auto] UI Layout — Q: "Cards vs list?" → Selected: "Cards" (recommended)
- Auto-advance sang ui-phase hoặc plan-phase tùy config
- KHÔNG dừng lại ở confirm_creation
```

### Ví dụ 3: Batch mode flow
```
[Scenario: User muốn trả lời nhiều câu hỏi cùng lúc để nhanh hơn]

Lệnh: /gsd:discuss-phase 2 --batch

Kết quả:
- Thay vì hỏi 4 câu riêng lẻ -> hỏi batch 2-5 câu trong 1 turn
- User trả lời tất cả trong 1 reply
- Sau đó check: "More questions, or move to next?"
```

---

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

---

## Proposals Được Tạo

→ Xem: [docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md](docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md)

---

## Ghi chú Kỹ thuật

**1. Canonical refs là MANDATORY:**
CONTEXT.md phải có `<canonical_refs>` section với full relative paths đến mọi doc/spec/ADR downstream agents cần đọc. Nguồn: ROADMAP.md refs + REQUIREMENTS.md refs + user-referenced docs trong discussion + docs discovered trong codebase scout.

**2. Scope guardrail:**
Phase boundary từ ROADMAP.md là FIXED. Discussion clarify HOW to implement, không WHETHER để add more. Nếu user suggest scope creep: "That's its own phase. I'll note it for later." và capture vào `<deferred>`.

**3. Prior decisions carry forward:**
Không hỏi lại câu đã quyết định ở phase trước. Check `<prior_decisions>` trước khi generate gray areas.

**4. --auto chain flow:**
discuss --auto -> ui-phase --auto -> plan-phase --auto --no-transition -> execute-phase --auto. Dùng `--no-transition` ở plan-phase để ngăn ui-phase trigger thêm auto-advance.

**5. Batch mode:**
--batch không có argument = default 4. --batch=N clamp to 2-5. Batch mode thay đổi từ 4 single-question turns -> 1 grouped turn.