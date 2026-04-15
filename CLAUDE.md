# CLAUDE.md — GSD Template Documentation System
Last updated: 2026-04-12

---

## Meta-Engineering Philosophy

Sản phẩm cốt lõi của **review_gsd** là **Hệ thống Chỉ dẫn (Instruction System)**.

- **"The Instruction is the Code"** — Mọi file `.md` và Skill là mã nguồn. Viết chúng với độ chuẩn xác như viết production code.
- **Meta-Teaching** — Chúng ta dạy AI cách dạy các AI khác làm việc hiệu quả. Output của project này là bộ chỉ dẫn đủ tốt để bất kỳ AI agent nào đọc vào cũng thực thi được chính xác.
- **Precision over Generality** — Loại bỏ sự mơ hồ. Mỗi instruction phải dẫn đến một hành động cụ thể, không cần đoán thêm.

---

## Hiểu về gsd-template

`gsd-template/` là một AI workflow framework. Người dùng tương tác qua các
lệnh theo thứ tự cố định:

| User gõ lệnh | Agents trong template thực hiện |
|---|---|
| `/gsd:new-project` | Khởi tạo project, research domain, tạo planning files |
| `/gsd:discuss-phase N` | Đào sâu requirements, thu hẹp vùng xám kỹ thuật |
| `/gsd:plan-phase N` | Research loop, tạo PLAN.md với execution steps |
| `/gsd:execute-phase N` | Wave-based parallel execution, subagent orchestration |
| `/gsd:verify-work N` | Kiểm tra deliverables, phát hiện gaps, tạo fix plans |

**Cấu trúc template sau khi user cài đặt:**

```
project/
├── CLAUDE.md              <- từ TEMPLATE.md (đổi tên khi cài)
├── .claude/               <- từ gsd/ (đổi tên khi cài)
│   ├── agents/            <- Specialized subagents
│   ├── commands/          <- GSD slash commands
│   ├── get-shit-done/     <- Core logic, workflows, templates
│   ├── hooks/             <- Automation hooks
│   └── skills/            <- Enforceable rules
└── .planning/             <- Được tạo ra bởi /gsd:new-project
    ├── PROJECT.md
    ├── ROADMAP.md
    ├── STATE.md
    └── ...
```

---

## Workflow Mirroring

Mọi cải tiến và documentation phải tuân thủ đúng thứ tự sử dụng của user.
Context chảy từ trên xuống — không nhảy bước.

```
Phase 1: /gsd:new-project
  -> Docs: Cách khởi tạo project, agents được gọi, files được tạo ra

Phase 2: /gsd:discuss-phase
  -> Docs: Questioning patterns, requirement drilling, output là gì

Phase 3: /gsd:plan-phase
  -> Docs: Research loop, cách tạo PLAN.md, verification cycle

Phase 4: /gsd:execute-phase
  -> Docs: Wave-based parallelization, subagent orchestration, checkpoints

Phase 5: /gsd:verify-work
  -> Docs: Verification gates, gap closure, audit patterns
```

**Lý do tuân thủ thứ tự này:** `execute-phase` đọc files được tạo bởi
`plan-phase`. `plan-phase` đọc context từ `new-project`. Cải tiến docs
phải đi từ nguồn.

---

## Đội ngũ Agent

### 1. Global Orchestrator

**Khi nào hoạt động:** Đầu mỗi session mới.

**Nhiệm vụ:**
- Đọc `memory/` và `INTERNAL_CHANGELOG.md` để nắm trạng thái hiện tại
- Xác định phase đang làm, phân công agent phù hợp
- Giám sát tính nhất quán toàn cục — nếu thay đổi cấu trúc file ở Phase 1, phải cập nhật logic đọc file cho các Phase sau

**Output:** Kế hoạch làm việc cho session hiện tại.

---

### 2. Skill Engineer

**Khi nào hoạt động:** Khi cần viết hoặc cải thiện một đoạn docs, skill,
hoặc agent instruction.

**Quy trình "GSD-hóa" một skill:**

1. **Analyze** — Đọc file gốc trong `gsd-template/`, giải mã logic thực sự
2. **Refactor** — Viết lại theo cấu trúc XML chuẩn (`<action>`, `<verify>`)
3. **Constraint Injection** — Tích hợp tiêu chuẩn chất lượng (không hardcode project-specific values)
4. **Atomic Verification** — Thiết lập ít nhất 3 bước kiểm chứng vật lý

**Output:** File `.md` trong `docs/` mô tả chính xác cách agent/workflow/skill
hoạt động.

**Chuẩn viết:** Imperative mood, XML tags cho structured data, mỗi file chỉ
giải quyết một vấn đề duy nhất.

---

### 3. Link & Doc Auditor

**Khi nào hoạt động:** Sau khi Skill Engineer viết xong một batch docs.

**Tư duy — Adversarial Review:** Đóng vai "AI lười biếng" để tìm lỗ hổng
trong chỉ dẫn. Câu hỏi cốt lõi: *"Nếu tôi là một AI không biết gì về
project này, tôi có thể thực thi instruction này không?"*

**Nhiệm vụ:**
- Kiểm tra cross-references — lệnh nào trỏ đến file nào, agent nào gọi template nào
- Áp dụng "Chain of Density" — tăng mật độ thông tin, giảm từ ngữ thừa
- Chỉ ra ít nhất 2 điểm có thể gây hiểu lầm cho AI Executor
- Đảm bảo không có dead links hoặc chỉ dẫn mâu thuẫn

**Output:** Danh sách issues cụ thể (file, dòng, vấn đề) để Skill Engineer sửa.

---

### 4. Quality Gatekeeper

**Khi nào hoạt động:** Trước khi commit một batch thay đổi lớn.

**Nhiệm vụ:** Đọc lại toàn bộ docs vừa viết và tự hỏi:
*"AI agent đọc cái này có đủ thông tin để thực thi không cần hỏi thêm?"*

**Tiêu chuẩn phê duyệt:**
- Mọi instruction đều có verify step vật lý
- Không có ambiguous pronoun ("it", "this") không có antecedent rõ ràng
- Mọi file reference đều tồn tại và đúng path

**Output:** Pass hoặc Fail kèm lý do cụ thể. Chỉ Orchestrator mới được
phê duyệt merge sau khi Gatekeeper pass.

---

## Operation Rules

### Rule 1: Peer Review trước khi apply

Trước khi một thay đổi được apply chính thức:

1. **Skill Engineer** trình bày bản thảo
2. **Link Auditor** thực hiện Adversarial Review — chỉ ra ít nhất 2 điểm
   có thể gây hiểu lầm
3. Skill Engineer sửa theo feedback
4. **Orchestrator** phê duyệt khi mâu thuẫn đã được giải quyết

### Rule 2: INTERNAL_CHANGELOG.md

Mọi thay đổi phải được ghi nhận vào `INTERNAL_CHANGELOG.md` ở root:

```
| Agent | Phase Affected | Change Detail | Reason |
|-------|---------------|---------------|--------|
| Skill Engineer | Phase 1 | Rewrote new-project docs | Remove EventVib refs |
```

File này là nguồn truy xuất duy nhất — giải thích *tại sao* một rule được
viết theo cách đó, không chỉ là *cái gì* đã thay đổi.

### Rule 3: Atomic Verification

Không có skill nào được coi là hoàn thiện nếu thiếu `<verify>`.

Bước kiểm chứng phải là hành động vật lý:
- Check file existence
- Chạy script/command
- Test endpoint
- Grep cho pattern cụ thể

Không chấp nhận: *"Claude sẽ kiểm tra xem code có đúng không"* — đó không
phải verification, đó là lời hứa.

---

## ⚠️ CRITICAL: gsd-template/ — Approval Gate

Mục tiêu cuối cùng của project là cải tiến các file trong `gsd-template/`.
Tuy nhiên, không được sửa tùy tiện — mọi thay đổi phải qua approval gate.

| Giai đoạn | Action | Allowed? |
|---|---|---|
| Đang phân tích, chưa có proposal | Sửa gsd-template/ | ❌ |
| Đã có proposal, chưa được approve | Sửa gsd-template/ | ❌ |
| User đã approve thay đổi cụ thể | Sửa đúng file đó | ✅ |
| Ghi documentation output | ✅ YES | `docs/` only |

**Quy trình bắt buộc trước khi sửa:**
1. Đề xuất cụ thể: file nào, dòng nào, sửa gì, tại sao
2. Ghi vào `docs/` hoặc `INTERNAL_CHANGELOG.md`
3. Chờ user approve
4. Sau khi approve — thực hiện chính xác theo đề xuất, không thêm bớt

---

## MCP Knowledge Graph — Bộ não trung tâm

Graph là shared memory của toàn bộ đội ngũ agent. Mọi agent đều query
graph trước khi làm việc và update graph sau khi hoàn thành.

### Node Types

| Type | Ví dụ |
|---|---|
| `CommandNode` | `/gsd:new-project`, `/gsd:plan-phase` |
| `WorkflowNode` | `workflows/new-project.md`, `workflows/execute-phase.md` |
| `AgentNode` | `gsd-planner.md`, `gsd-verifier.md`, `gsd-ideator.md` |
| `TemplateNode` | `templates/project.md`, `templates/roadmap.md` |
| `ReferenceNode` | `references/questioning.md`, `references/ui-brand.md` |
| `SkillNode` | `clean-code-enforcer`, `beautiful-ui-generator` |

### Edge Types

| Edge | Ý nghĩa |
|---|---|
| `TRIGGERS` | Command → Workflow |
| `SPAWNS` | Workflow → Agent |
| `USES_TEMPLATE` | Workflow/Agent → Template |
| `READS` | Agent → Reference hoặc Template |
| `CREATES` | Workflow → `.planning/[file]` |
| `REQUIRED_BY` | Skill → Phase/Workflow |
| `CONTRADICTS` | Instruction A mâu thuẫn với Instruction B |

### Agent Workflow với Graph

**Orchestrator:**
- Query graph trước khi giao việc: *"Cái gì phụ thuộc vào file này?"*
- Dùng kết quả để xác định impact scope của thay đổi

**Skill Engineer:**
- Query graph để hiểu relationships của file đang viết docs
- Sau khi viết xong, insert/update nodes liên quan

**Link Auditor (Graph Maintainer):**
- Sau mỗi batch thay đổi, update edges trong graph
- Chạy orphan detection: nodes không có incoming edges = chỉ dẫn mồ côi
- Chạy CONTRADICTS check: phát hiện chỉ dẫn mâu thuẫn giữa các files
- Chạy cycle detection trước khi approve batch lớn

**Gatekeeper:**
- Xác nhận graph đã được update trước khi pass

### MCP Tools

```
mcp__memory__create_entities   — tạo node mới
mcp__memory__create_relations  — tạo edge mới
mcp__memory__search_nodes      — query theo keyword
mcp__memory__open_nodes        — lấy thông tin node cụ thể
mcp__memory__delete_entities   — xóa node đã lỗi thời
```

### Quy tắc duy trì Graph

1. **Query trước khi sửa** — không sửa file nào mà chưa biết impact scope
2. **Update sau khi sửa** — mọi thay đổi phải phản ánh vào graph
3. **Graph là source of truth** — nếu graph và file mâu thuẫn, tin vào file, sửa graph

---

## Quy trình Trace một Workflow

Với mỗi command cần document, trace theo chain:

```
gsd-template/gsd/commands/gsd/[command].md
    ↓ references
gsd-template/gsd/get-shit-done/workflows/[command].md
    ↓ spawns
gsd-template/gsd/agents/[agent].md
    ↓ uses templates
gsd-template/gsd/get-shit-done/templates/[template].md
    ↓ creates
.planning/[output].md
```

Ghi nhận trong quá trình trace:
- Files nào được tạo ra?
- Agents nào được gọi, với context gì?
- Điều kiện nào trigger mỗi branch?
- Gate nào có thể fail và xử lý thế nào khi fail?

---

## Tổ chức Docs — Cấu trúc & Quy tắc

### Cấu trúc thư mục bắt buộc

```
docs/
├── agents/                      # Tài liệu mô tả từng agent (ai đọc, không ai chạy)
│   ├── README.md                # Index + cách gọi từng agent
│   ├── graph-builder.md
│   ├── flow-tracer.md
│   ├── action-doc-writer.md
│   └── link-auditor.md
│
├── component-flows/             # Flow chain của từng GSD command
│   ├── new-project-flow.md
│   ├── discuss-phase-flow.md
│   ├── plan-phase-flow.md
│   ├── execute-phase-flow.md
│   └── verify-work-flow.md
│
├── actions/                     # Docs chi tiết từng GSD command
│   ├── new-project.md
│   ├── discuss-phase.md
│   ├── plan-phase.md
│   ├── execute-phase.md
│   └── verify-work.md
│
├── proposals/                   # Đề xuất thay đổi gsd-template/ chờ approve
│   └── [YYYY-MM-DD]-[tên].md
│
├── workflow-overview.md         # Tổng quan toàn bộ GSD workflow
├── file-relationships.md        # Ma trận quan hệ files trong gsd-template/
├── graph-build-report.md        # Báo cáo build MCP graph (do graph-builder tạo)
└── audit-report-[YYYY-MM-DD].md # Báo cáo audit (do link-auditor tạo)

INTERNAL_CHANGELOG.md            # Ở root — log mọi thay đổi theo thời gian
```

---

### Quy tắc đặt tên file

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Flow docs | `[command-name]-flow.md` | `new-project-flow.md` |
| Action docs | `[command-name].md` | `plan-phase.md` |
| Proposals | `[YYYY-MM-DD]-[slug].md` | `2026-04-12-fix-hardcoded-paths.md` |
| Audit reports | `audit-report-[YYYY-MM-DD].md` | `audit-report-2026-04-12.md` |
| Agent docs | `[agent-name].md` | `flow-tracer.md` |

**Tất cả tên file:** kebab-case, chữ thường, không dấu, không space.

---

### Quy tắc nội dung — áp dụng cho MỌI file trong docs/

**1. Header bắt buộc**

Mỗi file phải bắt đầu bằng:

```markdown
# [Tên tài liệu]
> Loại: [Flow Doc | Action Doc | Proposal | Audit Report | Agent Reference]
> Tạo bởi: [agent-name]
> Ngày: [YYYY-MM-DD]
> Phiên bản gsd-template: [đọc từ package.json hoặc README version]
> Trạng thái: [Draft | Review | Approved | Stale]
```

**2. Ngôn ngữ**

| Phần | Ngôn ngữ |
|------|---------|
| Nội dung giải thích, mô tả | Tiếng Việt |
| Tên file, đường dẫn, commands | English/gốc |
| Code blocks, bash commands | English/gốc |
| Tên agents, nodes, edges | English/gốc |
| Issues, proposals | Tiếng Việt (mô tả) + English (file:line) |

**3. Cross-reference format**

Khi reference đến file khác trong docs/:
```markdown
→ Xem: [docs/actions/plan-phase.md](docs/actions/plan-phase.md)
```

Khi reference đến file trong gsd-template/:
```markdown
→ Nguồn: `gsd-template/gsd/commands/gsd/plan-phase.md`
```

Không dùng absolute paths. Không dùng `../` relative paths.

**4. Trạng thái tài liệu**

Mỗi doc phải có trạng thái rõ ràng trong header:

| Trạng thái | Ý nghĩa |
|-----------|---------|
| `Draft` | Agent đang viết, chưa review |
| `Review` | Hoàn thành, chờ link-auditor review |
| `Approved` | Đã qua audit, có thể dùng làm reference |
| `Stale` | gsd-template đã thay đổi, doc này cần cập nhật |

---

### Quy tắc riêng từng loại doc

**component-flows/ — Flow docs**
- Phải có Flow Chain diagram dạng ASCII
- Số "Steps Chi Tiết" = số `<step>` blocks trong workflow file nguồn
- Phải có section "Issues Phát Hiện" — nếu không có issues, ghi rõ "Không phát hiện issues"
- Không được để `[placeholder]` chưa điền trong output cuối

**actions/ — Action docs**
- Số flags trong bảng Arguments = số flags tìm được bằng grep trong source
- Mỗi step có đủ: Mục đích + Hành động cụ thể + Gate (Pass/Fail) + Output
- Phải có ít nhất 2 Ví dụ Thực tế: 1 default flow, 1 với flag
- Phải có Completeness Checklist đã tick đủ ở cuối file (do action-doc-writer tự check)

**proposals/ — Đề xuất thay đổi gsd-template/**
- Đây là file duy nhất liên quan đến việc SỬA gsd-template/
- Format bắt buộc:

```markdown
# Proposal: [Tên thay đổi]
> Loại: Proposal
> Tạo bởi: [agent]
> Ngày: [YYYY-MM-DD]
> Trạng thái: [Pending | Approved | Rejected]

## Vấn đề
[File nào, dòng nào, vấn đề gì — có quote trực tiếp từ file]

## Đề xuất sửa
[Nội dung cũ → Nội dung mới — cụ thể, không chung chung]

## Lý do
[Tại sao cần sửa]

## Impact
[Sửa file này ảnh hưởng đến những file nào khác — query từ MCP graph]

## Approved by
[ ] Chờ review
```

**audit-report — Audit reports**
- Không được xóa audit reports cũ — chúng là lịch sử
- Nếu issue đã được fix, thêm note vào report cũ: `~~[issue]~~ Fixed: [date] - [proposal file]`

---

### Quy tắc freshness — Khi nào docs bị Stale

Một doc chuyển sang `Stale` khi:
1. File nguồn trong gsd-template/ được sửa (sau khi proposal approved)
2. Một agent mới được thêm vào làm thay đổi flow
3. Ngày tạo doc > 30 ngày (flag để review, không tự động Stale)

Link Auditor có trách nhiệm detect và đánh dấu `Stale` trong header.

---

## Memory & Git

### Conversation Memory (MUST)

**QUAN TRỌNG: KHÔNG XÓA, CHỈ THÊM và APPEND**

**Mỗi lần bắt đầu chat mới hoặc bắt đầu làm việc:**
1. Đọc tất cả files trong `memory/` trước → Nắm toàn bộ lịch sử
2. Xác định session trước đó đang ở đâu, task gì chưa xong
3. Tiếp tục từ điểm dừng - KHÔNG bắt đầu lại từ đầu

**Sau mỗi batch làm việc HOẶC trước khi session kết thúc:**
- Đọc file session hiện tại (nếu có)
- APPEND thêm phần mới - KHÔNG overwrite

**Format để APPEND vào session file:**

```markdown
---

## Session Update: YYYY-MM-DD HH:MM
> Task: [tóm task]
> Status: [in-progress | completed | blocked]

### What Done This Session
- [Một dòng mỗi task đã hoàn thành]

### Next Steps
- [Cái cần làm tiếp]

### Open Questions  
- [Cái chưa rõ]
```

**ĐỌC TRƯỚC KHI VIẾT:**
- Luôn đọc `memory/` trước khi hỏi user
- Luôn đọc session file hiện tại trước khi append
- Để biết đã làm gì ở các session trước

### Git (MUST)

```bash
git add .
git commit -m "type(scope): description"
git push origin main
```

Commit types: `docs` | `feat` | `fix` | `refactor` | `chore`

---

## Non-Negotiables

- **Generic** — Không có project-specific references (không EventVib, không tên dự án, không màu sắc cá nhân)
- **Actionable** — Mỗi instruction đủ để AI thực thi không cần hỏi thêm
- **Traceable** — Mọi doc trace được ngược về file gốc trong gsd-template/
- **Verified** — Không có skill nào hoàn thiện nếu thiếu verify step vật lý
- **Links intact** — Cross-references giữa docs phải chính xác
