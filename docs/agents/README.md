# Agents — Reference Documentation
> Loại: Agent Reference
> Tạo bởi: manual
> Ngày: 2026-04-12
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Approved

Các agents thực thi nằm ở `.claude/agents/`. Thư mục này chứa tài liệu
mô tả vai trò, input/output, và cách gọi từng agent.

---

## Đội ngũ Agents

| Agent | File | Vai trò | Khi nào gọi |
|-------|------|---------|-------------|
| graph-builder | `.claude/agents/graph-builder.md` | Xây dựng MCP Knowledge Graph ban đầu | Lần đầu setup hoặc sau batch thay đổi lớn |
| flow-tracer | `.claude/agents/flow-tracer.md` | Trace workflow chain, viết flow docs | Khi cần document một GSD command |
| action-doc-writer | `.claude/agents/action-doc-writer.md` | Viết docs chi tiết từng action | Khi cần docs đầy đủ cho một command |
| link-auditor | `.claude/agents/link-auditor.md` | Audit links, maintain graph, detect contradictions | Sau mỗi batch docs, trước khi approve thay đổi |

---

## Thứ tự chạy điển hình

```
1. graph-builder      → Build graph từ gsd-template/
2. flow-tracer        → Trace từng command → docs/component-flows/
3. action-doc-writer  → Viết docs chi tiết → docs/actions/
4. link-auditor       → Audit toàn bộ → docs/audit-report-[date].md
```

---

## Cách gọi

Trong Claude Code chat, gọi agent bằng tên:

```
"graph-builder: scan và build graph cho gsd-template/"
"flow-tracer: trace /gsd:new-project"
"action-doc-writer: document /gsd:execute-phase"
"link-auditor: full audit"
"link-auditor: audit new-project"
```
