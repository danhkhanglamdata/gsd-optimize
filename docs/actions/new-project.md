# /gsd:new-project
> Loại: Action Doc
> Tạo bởi: action-doc-writer
> Ngày: 2026-04-14
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Draft
> Nguồn command: `gsd-template/gsd/commands/gsd/new-project.md`
> Nguồn workflow: `gsd-template/gsd/get-shit-done/workflows/new-project.md`

## Mục đích
`/gsd:new-project` là lệnh khởi tạo project GSD đầu tiên trong workflow. Nó thực hiện quy trình thống nhất: questioning (hiểu ý tưởng) → research (tùy chọn, nghiên cứu domain) → requirements (định nghĩa yêu cầu) → roadmap (lên kế hoạch phase). Đây là thời điểm có ảnh hưởng lớn nhất — deep questioning tạo nền tảng cho các bước sau.

## Khi nào sử dụng
- **Khởi tạo project mới**: Khi bạn có ý tưởng và muốn bắt đầu một dự án GSD từ đầu.
- **Tạo milestone mới**: Dùng `/gsd:new-milestone` cho các phiên bản tiếp theo của project đã có.
- **Không nên dùng khi**: Project đã được khởi tạo — dùng `/gsd:progress` để kiểm tra trạng thái.

---

## Input

### Arguments & Flags
| Flag | Mặc định | Mô tả | Thay đổi gì so với default |
|------|----------|-------|---------------------------|
| (none) | — | Chạy chế độ tương tác (interactive). Hỏi user từng câu hỏi về ý tưởng, cấu hình workflow, và xin approve trước khi chuyển bước. | — |
| `--auto` | — | Chế độ tự động. Sau khi thu thập cấu hình (granularity, git, agents), chạy research → requirements → roadmap mà không cần tương tác thêm. Yêu cầu cung cấp document ý tưởng qua @ reference hoặc paste trực tiếp. | Bỏ qua deep questioning (Step 3). Bỏ qua SaaS brainstorm (Step 3.5). Bỏ qua interactive approval gates. Auto-select "Research first". Auto-approve requirements và roadmap. Sau khi xong, tự động chain sang `/gsd:discuss-phase 1 --auto`. |

### Điều kiện tiên quyết
- [ ] Thư mục hiện tại chưa có project GSD (project_exists = false)
- [ ] Nếu `--auto`: Phải cung cấp document mô tả ý tưởng (file reference hoặc text trong prompt)
- [ ] Git phải được cài đặt (để init repository nếu chưa có)

### Files phải có trước khi chạy
| File | Mô tả | Tạo bởi |
|------|-------|---------|
| (không có) | Đây là command đầu tiên — không yêu cầu files trước | — |

---

## Quy trình (Step-by-Step)

Workflow này dùng **Format B** (## N. sections). Có 13 bước chính:

### Bước 1: Setup
**Mục đích:** Khởi tạo project config bằng cách chạy gsd-tools.cjs init. Kiểm tra project đã tồn tại chưa.

**Hành động cụ thể:**
1. Chạy bash: `node gsd-tools.cjs init new-project`
2. Parse JSON trả về để lấy: `researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `project_exists`, `has_codebase_map`, `planning_exists`, `has_existing_code`, `has_package_file`, `is_brownfield`, `needs_codebase_map`, `has_git`, `project_path`
3. Nếu `has_git = false` → chạy `git init`

**Gate:**
- Pass: Project chưa tồn tại (`project_exists = false`)
- Fail: `project_exists = true` → Error — "project already initialized. Use `/gsd:progress`"

**Output bước này:** Config JSON được parse, sẵn sàng cho các bước tiếp theo

---

### Bước 2: Brownfield Offer
**Mục đích:** Nếu có codebase sẵn, offer để chạy map-codebase trước khi tiếp tục.

**Hành động cụ thể:**
1. Nếu auto mode → Skip to Step 4 (giả định greenfield)
2. Nếu `needs_codebase_map = true` → Hiển thị AskUserQuestion:
   - "Map codebase first" — Chạy `/gsd:map-codebase` trước
   - "Skip mapping" — Tiếp tục Step 3
3. Nếu `needs_codebase_map = false` → Tiếp tục Step 3

**Gate:**
- Pass: User chọn "Skip mapping" hoặc không cần map
- Fail: User chọn "Map codebase first" → Exit command, chạy map-codebase rồi quay lại

**Output bước này:** Không có file được tạo

---

### Bước 2a: Auto Mode Config (--auto only)
**Mục đích:** Thu thập cấu hình workflow ngay khi auto mode được bật.

**Hành động cụ thể:**
1. Chỉ chạy khi `--auto` flag được bật
2. YOLO mode là implicit (auto = YOLO). Hỏi các câu hỏi cấu hình:
   - **Round 1** (3 câu): Granularity, Execution (Parallel/Sequential), Git Tracking
   - **Round 2** (3 câu): Research (Yes/No), Plan Check (Yes/No), Verifier (Yes/No), AI Models
3. Tạo `.planning/config.json` với `mode: "yolo"`
4. Commit config.json
5. Set flag `_auto_chain_active` để persist qua context compaction

**Gate:**
- Pass: Hoàn thành thu thập cấu hình
- Fail: —

**Output bước này:** `.planning/config.json` (trước Step 4)

---

### Bước 3: Deep Questioning
**Mục đích:** Hỏi user về ý tưởng project qua chuỗi câu hỏi chuyên sâu để hiểu rõ yêu cầu.

**Hành động cụ thể:**
1. Nếu auto mode → Skip (đã xử lý ở Step 2a)
2. Hiển thị banner "GSD ► QUESTIONING"
3. Hỏi inline: "What do you want to build?"
4. Follow the thread — dựa trên response, hỏi câu hỏi tiếp theo để khai thác sâu hơn
5. Consult `questioning.md` để áp dụng kỹ thuật: Challenge vagueness, Make abstract concrete, Surface assumptions
6. Khi đủ context → Hiển thị AskUserQuestion: "I think I understand what you're after. Ready to create PROJECT.md?"

**Gate:**
- Pass: User chọn "Create PROJECT.md"
- Fail: User chọn "Keep exploring" → Lặp lại câu hỏi

**Output bước này:** Raw user response (input cho Step 3.5)

---

### Bước 3.5: SaaS Brainstorm (gsd-ideator)
**Mục đích:** Cấu trúc hóa ý tưởng thu được theo 8-category SaaS framework để đảm bảo không bỏ sót thông tin quan trọng.

**Hành động cụ thể:**
1. Nếu auto mode → Skip to Step 4
2. Spawn gsd-ideator agent với Task tool:
   - Input: Raw user response từ Step 3
   - Task: Explore 8-category SaaS framework (Target Users, Problem Space, Solution Vision, Market Context, Monetization, Technical Implications, Onboarding & UX, Constraints & Context)
   - Output: Tạo `.planning/BRAINSTORM.md`
3. gsd-ideator hỏi follow-up questions nếu categories chưa rõ
4. Tạo BRAINSTORM.md với confidence levels cho từng category

**Gate:**
- Pass: gsd-ideator hoàn thành và trả về BRAINSTORM.md
- Fail: —

**Output bước này:** `.planning/BRAINSTORM.md`

---

### Bước 4: Write PROJECT.md
**Mục đích:** Tạo PROJECT.md từ context đã thu thập, dùng template chuẩn.

**Hành động cụ thể:**
1. Nếu auto mode → Synthesize từ provided document
2. Đọc BRAINSTORM.md từ Step 3.5
3. Synthesize vào `.planning/PROJECT.md` dùng template từ `templates/project.md`
   - Core Value → từ "Solution Vision"
   - Context → từ "Problem Space" + "Market Context"
   - Active Requirements → từ "MVP Features" (convert sang format [CATEGORY]-01)
   - Constraints → từ "Technical Implications" + "Constraints & Context"
4. Greenfield: Active requirements là hypotheses (chưa validated)
5. Brownfield: Infer "Validated" requirements từ existing codebase
6. Commit: `gsd-tools.cjs commit "docs: initialize project" --files .planning/PROJECT.md`

**Gate:**
- Pass: PROJECT.md đã được commit
- Fail: —

**Output bước này:** `.planning/PROJECT.md`

---

### Bước 5: Workflow Preferences
**Mục đích:** Thu thập cấu hình workflow (YOLO mode, granularity, git, agents).

**Hành động cụ thể:**
1. Nếu auto mode → Skip (đã xử lý ở Step 2a)
2. Kiểm tra `~/.gsd/defaults.json` → offer dùng saved defaults
3. **Round 1** (4 câu): Mode (YOLO/Interactive), Granularity (Coarse/Standard/Fine), Execution (Parallel/Sequential), Git Tracking (Yes/No)
4. **Round 2** (4 câu): Research (Yes/No), Plan Check (Yes/No), Verifier (Yes/No), AI Models
5. Lưu vào `.planning/config.json`
6. Commit: `gsd-tools.cjs commit "chore: add project config" --files .planning/config.json`

**Gate:**
- Pass: Hoàn thành cấu hình và commit
- Fail: —

**Output bước này:** `.planning/config.json`

---

### Bước 5.5: Resolve Model Profile
**Mục đích:** Sử dụng các model được định nghĩa từ init (researcher_model, synthesizer_model, roadmapper_model).

**Hành động cụ thể:**
- Đọc từ init JSON: `researcher_model`, `synthesizer_model`, `roadmapper_model`

**Gate:**
- Pass: Resolution complete
- Fail: —

**Output bước này:** Không có file mới

---

### Bước 6: Research Decision
**Mục đích:** Hỏi user có muốn research domain ecosystem trước khi định nghĩa requirements không.

**Hành động cụ thể:**
1. Nếu auto mode → Default "Research first" (không hỏi)
2. Hiển thị AskUserQuestion: "Research the domain ecosystem before defining requirements?"
3. Nếu "Research first":
   - Tạo `.planning/research/`
   - Spawn 4 parallel gsd-project-researcher agents:
     - Stack research → STACK.md
     - Features research → FEATURES.md
     - Architecture research → ARCHITECTURE.md
     - Pitfalls research → PITFALLS.md
   - Spawn gsd-research-synthesizer để tổng hợp → SUMMARY.md
4. Nếu "Skip research" → Tiếp tục Step 7

**Gate:**
- Pass: Research hoàn thành (4 agents done) hoặc user bỏ qua
- Fail: —

**Output bước này:** `.planning/research/` (4-5 files nếu research được chọn)

---

### Bước 7: Define Requirements
**Mục đích:** Định nghĩa v1 requirements theo categories từ research hoặc cuộc hỏi đáp.

**Hành động cụ thể:**
1. Đọc PROJECT.md để lấy Core value, constraints, scope boundaries
2. Nếu research tồn tại → Đọc research/FEATURES.md
3. Present features theo categories (interactive mode)
4. AskUserQuestion scoped theo category (multiSelect)
5. Generate REQUIREMENTS.md với REQ-ID format `[CATEGORY]-[NUMBER]`
6. Commit: `gsd-tools.cjs commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md`

**Gate:**
- Pass: Requirements đã được approve (interactive) hoặc auto mode
- Fail: User chọn "adjust" → Quay lại scoping

**Output bước này:** `.planning/REQUIREMENTS.md`

---

### Bước 8: Create Roadmap
**Mục đích:** Tạo roadmap phân requirement ra các phases với success criteria.

**Hành động cụ thể:**
1. Spawn gsd-roadmapper agent với files_to_read:
   - `.planning/PROJECT.md`
   - `.planning/REQUIREMENTS.md`
   - `.planning/research/SUMMARY.md` (nếu có)
   - `.planning/config.json`
2. gsd-roadmapper:
   - Derive phases từ requirements
   - Map mỗi v1 requirement vào đúng 1 phase
   - Tạo 2-5 success criteria per phase (observable user behaviors)
   - Validate 100% coverage
3. Hiển thị roadmap cho user
4. Nếu auto mode → Skip approval, auto-approve
5. Nếu interactive → AskUserQuestion: "Does this roadmap structure work for you?"
   - "Approve" → Commit
   - "Adjust phases" → Re-spawn với revision context
   - "Review full file" → Show raw ROADMAP.md
6. Commit: `gsd-tools.cjs commit "docs: create roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md`

**Gate:**
- Pass: User approve hoặc auto mode → commit
- Fail: User chọn "Adjust phases" → Re-spawn với feedback

**Output bước này:** `.planning/ROADMAP.md`, `.planning/STATE.md`

---

### Bước 8.5: Codebase Blueprint
**Mục đích:** Tạo trường hợp (blueprint) cấu trúc codebase cho các agents sau này (planner, executor, plan-checker).

**Hành động cụ thể:**
1. Detect stack từ research/STACK.md hoặc package.json
2. Generate các files trong `.planning/codebase/`:
   - `STRUCTURE.md` — placement rules (quy tắc đặt file)
   - `CONVENTIONS.md` — coding conventions (naming, CSS rules)
   - `ARCHITECTURE.md` — architecture overview
   - `STACK.md` — tech stack details
   - `TESTING.md` — testing strategy
   - `INTEGRATIONS.md` — external services
   - `CONCERNS.md` — risks/constraints
3. Commit tất cả files với gsd-tools.cjs

**Gate:**
- Pass: Tất cả 7 files đã được commit
- Fail: —

**Output bước này:** `.planning/codebase/` (7 files)

---

### Bước 9: Done
**Mục đích:** Hiển thị completion summary và hướng dẫn bước tiếp theo.

**Hành động cụ thể:**
1. Hiển thị completion banner với artifacts đã tạo
2. Nếu auto mode → Auto-chain to `/gsd:discuss-phase 1 --auto`
3. Nếu interactive mode → Hiển thị "Next Up: /gsd:discuss-phase 1"

**Gate:**
- Pass: Command hoàn thành
- Fail: —

**Output bước này:** Không có file mới

---

## Output

### Files được tạo mới
| File | Mô tả | Template dùng | Format |
|------|-------|---------------|--------|
| `.planning/PROJECT.md` | Project context, core value, requirements, constraints | `templates/project.md` | Markdown với sections: Context, Core Value, Requirements (Validated/Active/Out of Scope), Constraints, Key Decisions |
| `.planning/config.json` | Workflow preferences (mode, granularity, parallelization, git, research, plan_check, verifier, model_profile) | — | JSON |
| `.planning/BRAINSTORM.md` | Structured understanding (temporary, used in Step 4) | `templates/brainstorm.md` | Markdown với 8 categories |
| `.planning/REQUIREMENTS.md` | v1 requirements theo categories | `templates/requirements.md` | Markdown với REQ-ID format `[CATEGORY]-[NUMBER]` |
| `.planning/research/STACK.md` | Technology stack research | `templates/research-project/STACK.md` | Markdown table |
| `.planning/research/FEATURES.md` | Feature landscape (table stakes, differentiators, anti-features) | `templates/research-project/FEATURES.md` | Markdown tables |
| `.planning/research/ARCHITECTURE.md` | Architecture patterns | `templates/research-project/ARCHITECTURE.md` | Markdown với diagrams |
| `.planning/research/PITFALLS.md` | Domain pitfalls | `templates/research-project/PITFALLS.md` | Markdown |
| `.planning/research/SUMMARY.md` | Research synthesis | `templates/research-project/SUMMARY.md` | Markdown với roadmap implications |
| `.planning/ROADMAP.md` | Phase structure với requirement mappings và success criteria | `templates/roadmap.md` | Markdown tables |
| `.planning/STATE.md` | Project memory (phase tracking, progress) | `templates/state.md` | Markdown |
| `.planning/codebase/STRUCTURE.md` | File placement rules | — | Markdown |
| `.planning/codebase/CONVENTIONS.md` | Coding conventions | — | Markdown |
| `.planning/codebase/ARCHITECTURE.md` | Architecture overview | — | Markdown |
| `.planning/codebase/STACK.md` | Tech stack details | — | Markdown |
| `.planning/codebase/TESTING.md` | Testing strategy | — | Markdown |
| `.planning/codebase/INTEGRATIONS.md` | External services | — | Markdown |
| `.planning/codebase/CONCERNS.md` | Risks/constraints | — | Markdown |

### Files được cập nhật
| File | Thay đổi gì |
|------|------------|
| `.git/config` | Git repository initialized nếu chưa có |
| `.gitignore` | Thêm `.planning/` nếu user chọn commit_docs = No |

### Side Effects
- **Git commit tự động**: Có — nhiều commits cho từng milestone:
  - "docs: initialize project" — PROJECT.md
  - "chore: add project config" — config.json
  - "docs: define v1 requirements" — REQUIREMENTS.md
  - "docs: create roadmap ([N] phases)" — ROADMAP.md, STATE.md, REQUIREMENTS.md
  - "docs: add codebase blueprint" — 7 files trong codebase/
- **Config changes**: Tạo config.json với workflow preferences
- **Auto-advance chain**: Nếu `--auto`, sau khi xong tự động chạy `/gsd:discuss-phase 1 --auto`

---

## Agents Được Gọi

| Agent | Khi nào | Làm gì | Output |
|-------|---------|--------|--------|
| `gsd-ideator` | Step 3.5, interactive mode | Brainstorm ý tưởng theo 8-category SaaS framework, hỏi follow-up questions, tạo BRAINSTORM.md | `.planning/BRAINSTORM.md` |
| `gsd-project-researcher` x4 | Step 6, Research = Yes | 4 agents chạy song song: Stack, Features, Architecture, Pitfalls research | `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` |
| `gsd-research-synthesizer` | Step 6, sau khi 4 researchers hoàn thành | Tổng hợp research findings, tạo SUMMARY.md | `.planning/research/SUMMARY.md` |
| `gsd-roadmapper` | Step 8 | Tạo roadmap từ requirements, map requirements vào phases, derive success criteria, validate 100% coverage, tạo STATE.md | `.planning/ROADMAP.md`, `.planning/STATE.md` |

---

## Liên kết với các Commands khác

**Phải chạy trước:** Không có — đây là command đầu tiên trong GSD workflow

**Thường chạy sau:**
- `/gsd:discuss-phase 1` — Thu thập context và làm rõ approach cho Phase 1
- `/gsd:plan-phase 1` — Nếu muốn skip discussion, lên kế hoạch trực tiếp

**Liên quan:**
- `/gsd:new-milestone` — Dùng để bắt đầu version mới của project đã có
- `/gsd:map-codebase` — Dùng trước new-project nếu có codebase sẵn (brownfield)

---

## Ví dụ Thực tế

### Ví dụ 1: Interactive Mode (default)
```
Scenario: User muốn khởi tạo project mới từ đầu, muốn trả lời từng câu hỏi để hiểu rõ ý tưởng.

Lệnh: /gsd:new-project

Quá trình:
1. Setup → Kiểm tra project chưa tồn tại
2. Brownfield Offer → Không có code sẵn, skip
3. Deep Questioning:
   - "What do you want to build?"
   - User trả lời: "I want to build a task management app"
   - Follow-up: "Who are the users?" "What problems do they have?"
4. SaaS Brainstorm → gsd-ideator tạo BRAINSTORM.md
5. Workflow Preferences → Chọn YOLO mode, Standard granularity, Parallel execution
6. Research Decision → Chọn "Research first"
7. Define Requirements → User scoped features
8. Create Roadmap → gsd-roadmapper tạo phases
9. Done → Hiển thị summary

Kết quả:
- Tạo ra: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md, STATE.md, research/ (5 files), codebase/ (7 files)
- Git commits đã tạo
- Sẵn sàng chạy /gsd:discuss-phase 1
```

### Ví dụ 2: Auto Mode với --auto
```
Scenario: User đã có PRD document, muốn chạy nhanh không cần tương tác.

Lệnh: /gsd:new-project --auto @my-prd.md

Giả định: my-prd.md chứa mô tả project (một SaaS app)

Quá trình:
1. Setup → Kiểm tra project chưa tồn tại
2. Auto Mode Config → Hỏi 6 câu cấu hình (granularity, execution, git, research, plan_check, verifier)
3. Skip Step 3 (Deep Questioning) và Step 3.5 (Brainstorm) — extract từ @my-prd.md
4. Write PROJECT.md → Synthesize từ document
5. Skip Step 5 — config đã thu thập ở Step 2a
6. Research Decision → Default "Research first" (auto)
7. Define Requirements → Auto-include all features từ document
8. Create Roadmap → Auto-approve, không hỏi user
9. Done → Auto-chain to /gsd:discuss-phase 1 --auto

Kết quả:
- Tạo ra: Tất cả files như ví dụ 1
- Không có interactive approvals
- Tự động chuyển sang discuss-phase 1 với --auto flag
```

---

## Issues Phát Hiện

[workflows/new-project.md:49] — HARDCODED_PATH — Hardcoded path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" — Nên dùng relative path hoặc biến môi trường
[workflows/new-project.md:194] — HARDCODED_PATH — Hardcoded path trong commit command — Nên dùng relative path hoặc biến
[workflows/new-project.md:200] — HARDCODED_PATH — Hardcoded path trong config-set command — Nên dùng relative path hoặc biến
[workflows/new-project.md:447] — HARDCODED_PATH — Hardcoded path trong commit command — Nên dùng relative path hoặc biến
[workflows/new-project.md:601] — HARDCODED_PATH — Hardcoded path trong commit command — Nên dùng relative path hoặc biến
[workflows/new-project.md:689] — HARDCODED_PATH — Template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/STACK.md" — Nên dùng relative path hoặc biến
[workflows/new-project.md:727] — HARDCODED_PATH — Template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/FEATURES.md" — Nên dùng relative path hoặc biến
[workflows/new-project.md:765] — HARDCODED_PATH — Template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/ARCHITECTURE.md" — Nên dùng relative path hoặc biến
[workflows/new-project.md:803] — HARDCODED_PATH — Template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/PITFALLS.md" — Nên dùng relative path hoặc biến
[workflows/new-project.md:825] — HARDCODED_PATH — Template path "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/research-project/SUMMARY.md" — Nên dùng relative path hoặc biến
[workflows/new-project.md:990] — HARDCODED_PATH — Hardcoded path trong commit command — Nên dùng relative path hoặc biến
[workflows/new-project.md:1120] — HARDCODED_PATH — Hardcoded path trong commit command — Nên dùng relative path hoặc biến

## Proposals Được Tạo

Không có proposals trong session này.

---

## Ghi chú Kỹ thuật

**Workflow format:** Dùng ## N. sections (Format B), không phải `<step>` XML blocks

**Auto mode requirements:** Phải cung cấp idea document — hoặc `@file.md` reference hoặc paste trực tiếp trong prompt. Nếu không có document, sẽ error.

**Auto chain:** Khi `--auto` được sử dụng, command tự động chain sang `/gsd:discuss-phase 1 --auto` sau khi hoàn thành. Flag `_auto_chain_active` được set trong config để persist qua context compaction.

**Brownfield detection:** Nếu directory có code sẵn (phát hiện qua `has_existing_code` và `has_package_file`), workflow sẽ offer map-codebase trước.

**Model profiles:** Được resolve từ init JSON (`researcher_model`, `synthesizer_model`, `roadmapper_model`) và có thể override bởi user trong Step 2a (auto) hoặc Step 5 (interactive).

**Git commits:** Tất cả artifacts được commit riêng biệt. Nếu user chọn `commit_docs: No`, `.planning/` sẽ được thêm vào `.gitignore`.

---

## Completeness Checklist

- [x] FLAGS: Đếm flags trong source = 1 (`--auto`). Đếm flags đã document = 1. Hai số bằng nhau.
- [x] STEPS: Format B (## N. sections). Đếm bước trong source = 13 (1, 2, 2a, 3, 3.5, 4, 5, 5.5, 6, 7, 8, 8.5, 9). Đếm "Bước" sections trong output = 13. Hai số bằng nhau.
- [x] GATES: Mỗi bước có gate với Pass condition và Fail behavior được mô tả.
- [x] OUTPUT FILES: Mỗi file được tạo ra có đủ 4 cột: path, mô tả nội dung, template dùng, format.
- [x] EXAMPLES: Có 2 ví dụ — 1 default (interactive), 1 với flag (--auto). Mỗi ví dụ có scenario context, lệnh chạy, kết quả cụ thể.
- [x] ISSUES: Mỗi issue có format: [file:dòng] — [loại] — [mô tả] — [đề xuất]. 12 issues được liệt kê.
- [x] SELF-TEST: Doc đầy đủ thông tin để AI agent chạy command mà không cần mở gsd-template/.
