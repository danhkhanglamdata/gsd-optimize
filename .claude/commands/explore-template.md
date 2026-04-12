---
name: explore-template
description: Full initial exploration of gsd-template/. Builds MCP Knowledge Graph, traces all core workflows, writes comprehensive docs. Run once at project start.
argument-hint: "[--graph-only] [--trace-only] [--audit-only]"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - Task
  - mcp__memory__search_nodes
  - mcp__memory__open_nodes
---

<objective>
Bạn là Orchestrator của explore-template workflow.

Nhiệm vụ: điều phối 4 specialized agents theo đúng thứ tự để tạo ra bộ
tài liệu hoàn chỉnh về gsd-template/.

Bốn agents, mỗi agent có file định nghĩa riêng trong .claude/agents/:
- .claude/agents/graph-builder.md
- .claude/agents/flow-tracer.md
- .claude/agents/action-doc-writer.md
- .claude/agents/link-auditor.md

Flags từ $ARGUMENTS:
- `--graph-only`  → chỉ chạy Phase 1 rồi dừng
- `--trace-only`  → chỉ chạy Phase 2
- `--audit-only`  → chỉ chạy Phase 4
</objective>

<agent_definitions>
Trước khi bắt đầu, đọc 4 agent definition files để hiểu khả năng của từng agent:

Read: .claude/agents/graph-builder.md
Read: .claude/agents/flow-tracer.md
Read: .claude/agents/action-doc-writer.md
Read: .claude/agents/link-auditor.md
</agent_definitions>

<process>

## Bước 0 — Khởi tạo

Chạy các lệnh sau để kiểm tra trạng thái:

```bash
ls docs/ 2>/dev/null || echo "docs/ empty"
ls docs/component-flows/ 2>/dev/null || echo "component-flows/ empty"
ls docs/actions/ 2>/dev/null || echo "actions/ empty"
mkdir -p docs/component-flows docs/actions
```

Thông báo cho user:
```
Bắt đầu explore-template.
Phases sẽ chạy: [dựa vào flags]
Báo cáo sau mỗi phase.
```

---

## Phase 1 — Build Knowledge Graph

Đọc .claude/agents/graph-builder.md để nắm đầy đủ role và process của agent.

Sau đó dùng Task tool để spawn graph-builder với prompt đầy đủ từ agent definition.
Truyền instruction cụ thể:

```
Nhiệm vụ của bạn là graph-builder.
Đọc .claude/agents/graph-builder.md để hiểu đầy đủ role và quy trình.

Thực hiện đầy đủ process trong file đó:
- Discover all files trong gsd-template/
- Tạo MCP nodes cho tất cả commands, workflows, agents, templates, references, skills
- Tạo MCP edges cho tất cả relationships
- Detect và flag orphan nodes
- Viết báo cáo vào docs/graph-build-report.md
```

Sau khi Task hoàn thành, kiểm tra docs/graph-build-report.md tồn tại.
Nếu thiếu → báo lỗi cho user, dừng workflow.

Báo cáo: "Phase 1 hoàn thành. Xem docs/graph-build-report.md"

Nếu flag `--graph-only` → dừng tại đây.

---

## Phase 2 — Trace Core Workflows

Đọc .claude/agents/flow-tracer.md để nắm đầy đủ process.

Spawn 5 Tasks tuần tự. Mỗi Task chờ hoàn thành trước khi spawn Task tiếp theo.

**Task 1 — Trace new-project:**
```
Nhiệm vụ của bạn là flow-tracer.
Đọc .claude/agents/flow-tracer.md để hiểu đầy đủ role và quy trình.

Trace /gsd:new-project theo đúng process trong file đó.
Output: docs/component-flows/new-project-flow.md
```

Kiểm tra docs/component-flows/new-project-flow.md tồn tại trước khi tiếp tục.

**Task 2 — Trace discuss-phase:**
```
Nhiệm vụ của bạn là flow-tracer.
Đọc .claude/agents/flow-tracer.md để hiểu đầy đủ role và quy trình.

Trace /gsd:discuss-phase theo đúng process trong file đó.
Output: docs/component-flows/discuss-phase-flow.md
```

**Task 3 — Trace plan-phase:**
```
Nhiệm vụ của bạn là flow-tracer.
Đọc .claude/agents/flow-tracer.md để hiểu đầy đủ role và quy trình.

Trace /gsd:plan-phase theo đúng process trong file đó.
Bao gồm tất cả flags: --auto, --research, --skip-research, --gaps, --skip-verify, --prd
Output: docs/component-flows/plan-phase-flow.md
```

**Task 4 — Trace execute-phase:**
```
Nhiệm vụ của bạn là flow-tracer.
Đọc .claude/agents/flow-tracer.md để hiểu đầy đủ role và quy trình.

Trace /gsd:execute-phase theo đúng process trong file đó.
Bao gồm wave-based parallelization và --gaps-only flag.
Output: docs/component-flows/execute-phase-flow.md
```

**Task 5 — Trace verify-work:**
```
Nhiệm vụ của bạn là flow-tracer.
Đọc .claude/agents/flow-tracer.md để hiểu đầy đủ role và quy trình.

Trace /gsd:verify-work theo đúng process trong file đó.
Bao gồm gap closure flow.
Output: docs/component-flows/verify-work-flow.md
```

Sau 5 Tasks: kiểm tra 5 files tồn tại. Báo cáo cho user.

Nếu flag `--trace-only` → dừng tại đây.

---

## Phase 3 — Write Action Documentation

Đọc .claude/agents/action-doc-writer.md để nắm đầy đủ process và output format.

Spawn 5 Tasks tuần tự. Mỗi Task nhận thêm flow doc từ Phase 2 làm context.

**Task 1 — Document new-project:**
```
Nhiệm vụ của bạn là action-doc-writer.
Đọc .claude/agents/action-doc-writer.md để hiểu đầy đủ role và quy trình.

Document /gsd:new-project theo đúng process và output format trong file đó.
Context bổ sung: đọc docs/component-flows/new-project-flow.md trước.
Output: docs/actions/new-project.md
```

**Task 2 — Document discuss-phase:**
```
Nhiệm vụ của bạn là action-doc-writer.
Đọc .claude/agents/action-doc-writer.md để hiểu đầy đủ role và quy trình.

Document /gsd:discuss-phase.
Context bổ sung: đọc docs/component-flows/discuss-phase-flow.md trước.
Output: docs/actions/discuss-phase.md
```

**Task 3 — Document plan-phase:**
```
Nhiệm vụ của bạn là action-doc-writer.
Đọc .claude/agents/action-doc-writer.md để hiểu đầy đủ role và quy trình.

Document /gsd:plan-phase bao gồm tất cả flags.
Context bổ sung: đọc docs/component-flows/plan-phase-flow.md trước.
Output: docs/actions/plan-phase.md
```

**Task 4 — Document execute-phase:**
```
Nhiệm vụ của bạn là action-doc-writer.
Đọc .claude/agents/action-doc-writer.md để hiểu đầy đủ role và quy trình.

Document /gsd:execute-phase.
Context bổ sung: đọc docs/component-flows/execute-phase-flow.md trước.
Output: docs/actions/execute-phase.md
```

**Task 5 — Document verify-work:**
```
Nhiệm vụ của bạn là action-doc-writer.
Đọc .claude/agents/action-doc-writer.md để hiểu đầy đủ role và quy trình.

Document /gsd:verify-work.
Context bổ sung: đọc docs/component-flows/verify-work-flow.md trước.
Output: docs/actions/verify-work.md
```

Sau 5 Tasks: kiểm tra 5 files tồn tại và mỗi file > 100 dòng.
Báo cáo cho user.

---

## Phase 4 — Full Audit

Đọc .claude/agents/link-auditor.md để nắm đầy đủ checks cần chạy.

Spawn 1 Task:

```
Nhiệm vụ của bạn là link-auditor.
Đọc .claude/agents/link-auditor.md để hiểu đầy đủ role và tất cả checks.

Chạy full audit (Mode A) trên:
- Toàn bộ docs/ vừa tạo
- gsd-template/ để kiểm tra cross-references

Chạy đầy đủ 6 checks: broken references, orphan nodes, contradictions,
cycles, ambiguous instructions, stale graph nodes.

Output: docs/audit-report-[ngày hôm nay].md
Cập nhật MCP graph với tất cả findings.
```

Sau khi Task hoàn thành: đọc audit report, đếm critical issues.
Nếu critical issues > 0 → hiển thị danh sách cho user.

Nếu flag `--audit-only` → chạy phase này rồi dừng.

---

## Phase 5 — Tổng hợp

Sau khi 4 phases hoàn thành, Orchestrator tự tổng hợp (không spawn thêm agent):

1. Đọc 5 flow docs và 5 action docs
2. Tạo docs/workflow-overview.md với:
   - Tổng quan hệ thống
   - Bảng summary 5 commands
   - File dependency chain diagram
   - Tổng hợp issues theo severity
3. Tạo INTERNAL_CHANGELOG.md với entry đầu tiên ghi lại toàn bộ session này

Báo cáo cuối:
```
explore-template hoàn thành.

Output:
  docs/graph-build-report.md
  docs/workflow-overview.md
  docs/component-flows/ — 5 files
  docs/actions/         — 5 files
  docs/audit-report-[date].md
  INTERNAL_CHANGELOG.md

Issues cần xem xét: [N]
Xem: docs/audit-report-[date].md
```

</process>
