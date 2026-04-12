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
  - mcp__memory__create_entities
  - mcp__memory__create_relations
  - mcp__memory__search_nodes
  - mcp__memory__open_nodes
  - mcp__memory__add_observations
  - mcp__memory__delete_entities
---

<objective>
Khám phá toàn diện gsd-template/ lần đầu tiên.

Chạy 4 agents theo đúng thứ tự để tạo ra bộ tài liệu hoàn chỉnh:
1. graph-builder   → MCP Knowledge Graph
2. flow-tracer     → docs/component-flows/ (5 core commands)
3. action-doc-writer → docs/actions/ (5 core commands)
4. link-auditor    → docs/audit-report-[date].md

**Output cuối cùng:**
- MCP graph đầy đủ với tất cả nodes và edges
- docs/workflow-overview.md
- docs/component-flows/[5 files]
- docs/actions/[5 files]
- docs/audit-report-[date].md
- INTERNAL_CHANGELOG.md (entry đầu tiên)

**Flags:**
- `--graph-only`  — Chỉ chạy graph-builder, dừng lại
- `--trace-only`  — Chỉ chạy flow-tracer cho tất cả commands
- `--audit-only`  — Chỉ chạy link-auditor
</objective>

<execution_context>
@.claude/workflows/explore-template.md
</execution_context>

<process>
Execute the explore-template workflow from @.claude/workflows/explore-template.md end-to-end.
Preserve all phases and gates. Spawn agents in the correct sequence.
Report progress after each phase completes.
</process>
