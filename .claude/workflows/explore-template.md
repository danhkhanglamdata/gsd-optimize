<purpose>
Khám phá toàn diện gsd-template/ lần đầu tiên. Orchestrator điều phối 4 agents
theo thứ tự, thu thập kết quả từng phase, và tổng hợp thành bộ tài liệu hoàn chỉnh.
</purpose>

<core_commands>
5 commands cần document theo thứ tự ưu tiên:
1. new-project      ← khởi nguồn của mọi thứ
2. discuss-phase    ← requirements drilling
3. plan-phase       ← tạo execution plan
4. execute-phase    ← thực thi
5. verify-work      ← kiểm tra kết quả
</core_commands>

<process>

<step name="initialize" priority="first">

## Bước 0 — Khởi tạo

**Kiểm tra trạng thái trước khi bắt đầu:**

```bash
# Kiểm tra graph đã được build chưa
# Kiểm tra docs/ đã có gì
ls docs/
ls docs/component-flows/ 2>/dev/null || echo "empty"
ls docs/actions/ 2>/dev/null || echo "empty"
```

**Kiểm tra flags từ $ARGUMENTS:**
- `--graph-only`  → chạy Phase 1 rồi dừng
- `--trace-only`  → bỏ qua Phase 1, chỉ chạy Phase 2
- `--audit-only`  → bỏ qua Phase 1-3, chỉ chạy Phase 4

**Tạo thư mục output nếu chưa có:**
```bash
mkdir -p docs/component-flows
mkdir -p docs/actions
```

**Thông báo cho user:**
```
Bắt đầu explore-template workflow.
Sẽ chạy [N] phases. Ước tính [N] agents được spawn.
Báo cáo sau mỗi phase hoàn thành.
```

</step>


<step name="phase-1-build-graph">

## Phase 1 — Build Knowledge Graph

**Spawn graph-builder agent:**

```
Task: graph-builder
Instruction: "Scan toàn bộ gsd-template/ và build MCP Knowledge Graph.
Tạo nodes cho tất cả commands, workflows, agents, templates, references, skills.
Tạo edges cho tất cả relationships tìm thấy.
Flag orphan nodes.
Viết báo cáo vào docs/graph-build-report.md."
```

**Gate sau Phase 1:**
- Đọc `docs/graph-build-report.md`
- Kiểm tra: Total nodes > 0
- Kiểm tra: Total edges > 0
- Nếu fail → báo lỗi, dừng workflow

**Báo cáo cho user sau Phase 1:**
```
✓ Phase 1 hoàn thành
  Nodes: [N] | Edges: [N] | Orphans: [N]
  Xem chi tiết: docs/graph-build-report.md
```

**Nếu flag `--graph-only` → dừng tại đây.**

</step>


<step name="phase-2-trace-workflows">

## Phase 2 — Trace Core Workflows

Spawn flow-tracer 5 lần, tuần tự theo thứ tự ưu tiên.
Mỗi lần spawn là một agent độc lập với context fresh.

**Spawn 1:**
```
Task: flow-tracer
Instruction: "Trace /gsd:new-project đầy đủ từ command → workflow → agents →
templates → output. Query MCP graph trước. Viết vào docs/component-flows/new-project-flow.md.
Update graph với findings mới."
```

**Gate:** Kiểm tra `docs/component-flows/new-project-flow.md` tồn tại trước khi spawn tiếp.

**Spawn 2:**
```
Task: flow-tracer
Instruction: "Trace /gsd:discuss-phase đầy đủ. Query MCP graph trước.
Viết vào docs/component-flows/discuss-phase-flow.md."
```

**Spawn 3:**
```
Task: flow-tracer
Instruction: "Trace /gsd:plan-phase đầy đủ bao gồm tất cả flags (--auto,
--research, --skip-research, --gaps, --skip-verify, --prd).
Viết vào docs/component-flows/plan-phase-flow.md."
```

**Spawn 4:**
```
Task: flow-tracer
Instruction: "Trace /gsd:execute-phase đầy đủ bao gồm wave-based parallelization
và --gaps-only flag. Viết vào docs/component-flows/execute-phase-flow.md."
```

**Spawn 5:**
```
Task: flow-tracer
Instruction: "Trace /gsd:verify-work đầy đủ bao gồm gap closure flow.
Viết vào docs/component-flows/verify-work-flow.md."
```

**Gate sau Phase 2:**
- Kiểm tra 5 files tồn tại trong `docs/component-flows/`
- Nếu bất kỳ file nào thiếu → re-spawn flow-tracer cho command đó

**Báo cáo cho user sau Phase 2:**
```
✓ Phase 2 hoàn thành
  5 flow diagrams đã tạo trong docs/component-flows/
  Issues phát hiện: [N] (xem trong từng flow file)
```

**Nếu flag `--trace-only` → dừng tại đây.**

</step>


<step name="phase-3-write-action-docs">

## Phase 3 — Write Action Documentation

Spawn action-doc-writer 5 lần, tuần tự.
Mỗi agent đọc flow doc tương ứng từ Phase 2 làm context bổ sung.

**Spawn 1:**
```
Task: action-doc-writer
Instruction: "Document /gsd:new-project đầy đủ. Query MCP graph trước.
Đọc thêm docs/component-flows/new-project-flow.md để làm context.
Viết vào docs/actions/new-project.md với đầy đủ sections:
mục đích, input/flags, quy trình step-by-step, output, agents, examples, issues."
```

**Spawn 2:**
```
Task: action-doc-writer
Instruction: "Document /gsd:discuss-phase đầy đủ.
Đọc thêm docs/component-flows/discuss-phase-flow.md.
Viết vào docs/actions/discuss-phase.md."
```

**Spawn 3:**
```
Task: action-doc-writer
Instruction: "Document /gsd:plan-phase đầy đủ bao gồm tất cả flags.
Đọc thêm docs/component-flows/plan-phase-flow.md.
Viết vào docs/actions/plan-phase.md."
```

**Spawn 4:**
```
Task: action-doc-writer
Instruction: "Document /gsd:execute-phase đầy đủ.
Đọc thêm docs/component-flows/execute-phase-flow.md.
Viết vào docs/actions/execute-phase.md."
```

**Spawn 5:**
```
Task: action-doc-writer
Instruction: "Document /gsd:verify-work đầy đủ.
Đọc thêm docs/component-flows/verify-work-flow.md.
Viết vào docs/actions/verify-work.md."
```

**Gate sau Phase 3:**
- Kiểm tra 5 files tồn tại trong `docs/actions/`
- Kiểm tra mỗi file > 100 lines (file quá ngắn = docs không đủ chi tiết)

**Báo cáo cho user sau Phase 3:**
```
✓ Phase 3 hoàn thành
  5 action docs đã tạo trong docs/actions/
```

</step>


<step name="phase-4-audit">

## Phase 4 — Full Audit

**Spawn link-auditor:**
```
Task: link-auditor
Instruction: "Chạy full audit trên toàn bộ docs/ vừa tạo và gsd-template/.
Kiểm tra: broken references, orphan nodes, contradictions, cycles,
ambiguous instructions, stale graph nodes.
Viết báo cáo vào docs/audit-report-[ngày hôm nay].md.
Cập nhật MCP graph với tất cả findings."
```

**Gate sau Phase 4:**
- Đọc audit report
- Đếm critical issues (Broken References + Contradictions)
- Nếu critical issues > 0 → hiển thị danh sách cho user, hỏi có tiếp tục không

**Nếu flag `--audit-only` → chạy từ đây và dừng.**

</step>


<step name="phase-5-synthesize" priority="last">

## Phase 5 — Tổng hợp Master Docs

**Tạo workflow-overview.md:**

Đọc tất cả 5 flow docs và tổng hợp thành `docs/workflow-overview.md`:

```markdown
# GSD Template — Workflow Overview

## Tổng quan hệ thống

[Mô tả GSD template là gì, dùng để làm gì]

## Hành trình của User

[Diagram thứ tự 5 commands]

new-project → discuss-phase → plan-phase → execute-phase → verify-work

## Commands Summary

| Command | Mục đích | Input chính | Output chính |
|---------|----------|-------------|--------------|
| /gsd:new-project | ... | ... | PROJECT.md, ROADMAP.md, STATE.md |
| /gsd:discuss-phase | ... | ... | ... |
| /gsd:plan-phase | ... | ... | PLAN.md |
| /gsd:execute-phase | ... | ... | Implemented features |
| /gsd:verify-work | ... | ... | VERIFICATION.md |

## File Dependency Chain

[Diagram showing which files flow from which command to the next]

## Issues Tổng hợp

[Gộp tất cả issues từ 5 flow docs + audit report, phân loại theo mức độ]

| Severity | Count | Files |
|----------|-------|-------|
| Critical | N | [list] |
| Warning  | N | [list] |
| Info     | N | [list] |
```

**Tạo entry đầu tiên trong INTERNAL_CHANGELOG.md:**

```markdown
# INTERNAL_CHANGELOG.md

| Agent | Phase Affected | Change Detail | Reason |
|-------|---------------|---------------|--------|
| graph-builder | All | Initial graph build: [N] nodes, [N] edges | First-time exploration |
| flow-tracer | Phase 1-5 | Traced 5 core commands | Initial documentation |
| action-doc-writer | Phase 1-5 | Wrote action docs for 5 commands | Initial documentation |
| link-auditor | All | Full audit: [N] issues found | Initial quality check |
```

**Báo cáo cuối cho user:**

```
╔══════════════════════════════════════════╗
║     explore-template — HOÀN THÀNH       ║
╠══════════════════════════════════════════╣
║ Phase 1: Graph      [N] nodes, [N] edges ║
║ Phase 2: Flows      5 files tạo          ║
║ Phase 3: Actions    5 files tạo          ║
║ Phase 4: Audit      [N] issues tìm thấy  ║
║ Phase 5: Synthesis  workflow-overview.md ║
╠══════════════════════════════════════════╣
║ Output:                                  ║
║   docs/workflow-overview.md              ║
║   docs/graph-build-report.md             ║
║   docs/component-flows/ (5 files)        ║
║   docs/actions/ (5 files)                ║
║   docs/audit-report-[date].md            ║
║   INTERNAL_CHANGELOG.md                  ║
╠══════════════════════════════════════════╣
║ Issues cần xem xét: [N]                  ║
║ Xem: docs/audit-report-[date].md         ║
╚══════════════════════════════════════════╝

Bước tiếp theo: Review issues trong audit report,
sau đó propose changes vào gsd-template/ theo Approval Gate.
```

</step>

</process>
