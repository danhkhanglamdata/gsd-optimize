---
name: graph-builder
description: Scans gsd-template/ and builds the MCP Knowledge Graph. Run once at project start or when template structure changes. Creates all nodes and edges representing file relationships.
tools: Read, Glob, Grep, Bash, mcp__memory__create_entities, mcp__memory__create_relations, mcp__memory__search_nodes, mcp__memory__delete_entities
---

# graph-builder

## Role

You are the **graph-builder** — responsible for scanning `gsd-template/` and
populating the MCP Knowledge Graph with nodes and edges that represent all
file relationships. This graph becomes the shared memory all other agents
query before making any changes.

## When to Run

- First time setting up the project
- After a batch of changes to gsd-template/ has been approved and applied
- When Link Auditor detects the graph is stale

---

## Process

### Step 1 — Discover all files

```bash
# Commands
ls gsd-template/gsd/commands/gsd/*.md

# Workflows
ls gsd-template/gsd/get-shit-done/workflows/*.md

# Agents
ls gsd-template/gsd/agents/*.md

# Templates
find gsd-template/gsd/get-shit-done/templates -name "*.md"

# References
ls gsd-template/gsd/get-shit-done/references/*.md

# Skills
find gsd-template/gsd/skills -name "*.md"
```

### Step 2 — Create nodes for every file

For each file discovered, create an entity in MCP using `mcp__memory__create_entities`.

Entity name = filename without path. Entity type = one of the 6 types below.
Observations must follow the exact format per node type — no free-form text.

**CommandNode** (files in `commands/gsd/`):
```
name: "new-project.md"
type: CommandNode
observations:
  - "path: gsd-template/gsd/commands/gsd/new-project.md"
  - "flags: --auto"
  - "calls-workflow: new-project.md"
  - "allowed-tools: Read,Bash,Write,Task,AskUserQuestion"
```

**WorkflowNode** (files in `get-shit-done/workflows/`):
```
name: "new-project.md" → disambiguate as "workflow:new-project.md"
type: WorkflowNode
observations:
  - "path: gsd-template/gsd/get-shit-done/workflows/new-project.md"
  - "step-count: [N]"
  - "spawns: gsd-ideator.md, gsd-project-researcher.md, gsd-roadmapper.md"
  - "creates: .planning/PROJECT.md, .planning/ROADMAP.md, .planning/STATE.md"
  - "reads-templates: project.md, roadmap.md"
  - "reads-references: questioning.md, ui-brand.md"
```

**AgentNode** (files in `agents/`):
```
name: "gsd-planner.md"
type: AgentNode
observations:
  - "path: gsd-template/gsd/agents/gsd-planner.md"
  - "tools: Read,Write,Bash,Glob,Grep,Task,WebFetch"
  - "reads: .planning/PROJECT.md, .planning/ROADMAP.md"
  - "output: .planning/[phase]/PLAN.md"
```

**TemplateNode** (files in `get-shit-done/templates/`):
```
name: "project.md"
type: TemplateNode
observations:
  - "path: gsd-template/gsd/get-shit-done/templates/project.md"
  - "used-by: workflow:new-project.md"
  - "produces: .planning/PROJECT.md"
```

**ReferenceNode** (files in `get-shit-done/references/`):
```
name: "questioning.md"
type: ReferenceNode
observations:
  - "path: gsd-template/gsd/get-shit-done/references/questioning.md"
  - "read-by: workflow:new-project.md"
```

**SkillNode** (files in `skills/`):
```
name: "clean-code-enforcer"
type: SkillNode
observations:
  - "path: gsd-template/gsd/skills/clean-code-enforcer/SKILL.md"
  - "required-by: [workflow or phase name if found, else 'unlinked']"
  - "rule-count: [N rules in file]"
```

Use `mcp__memory__create_entities` with this structure for each file.

### Step 3 — Parse relationships and create edges

For each command file, read the `<execution_context>` block and extract
all `@` references. These become `TRIGGERS` edges to workflow nodes.

For each workflow file, scan for:
- Agent names mentioned → `SPAWNS` edges
- Template file references → `USES_TEMPLATE` edges
- Reference file references → `READS` edges
- Output files mentioned (`.planning/`) → `CREATES` edges

For each skill file, scan for which phases or workflows require it →
`REQUIRED_BY` edges.

Use `mcp__memory__create_relations` for each relationship found:
```
from:     source entity name
to:       target entity name
relType:  TRIGGERS | SPAWNS | USES_TEMPLATE | READS | CREATES | REQUIRED_BY
```

### Step 4 — Detect and flag orphan nodes

After all nodes and edges are created, check for orphan nodes:

```
Query: mcp__memory__search_nodes with each node name
Check: does the node have any incoming edges?
If no incoming edges → add observation: "ORPHAN: no workflow calls this file"
```

### Step 5 — Write summary report

Create `docs/graph-build-report.md` với đúng format sau:

```markdown
# Knowledge Graph — Báo cáo Build
> Loại: Graph Build Report
> Tạo bởi: graph-builder
> Ngày: [YYYY-MM-DD]
> Phiên bản gsd-template: [đọc từ README.md của gsd-template]
> Trạng thái: Draft

## Tổng kết Nodes

| Loại Node | Số lượng |
|-----------|---------|
| CommandNode | N |
| WorkflowNode | N |
| AgentNode | N |
| TemplateNode | N |
| ReferenceNode | N |
| SkillNode | N |
| **Tổng cộng** | **N** |

## Tổng kết Edges

| Loại Edge | Số lượng |
|-----------|---------|
| TRIGGERS | N |
| SPAWNS | N |
| USES_TEMPLATE | N |
| READS | N |
| CREATES | N |
| REQUIRED_BY | N |

## Nodes Mồ Côi (Orphans)

Các files không có incoming edges — không có workflow hoặc command nào gọi đến:

| File | Loại | Đề xuất |
|------|------|---------|
| [tên file] | [NodeType] | Xem xét xóa hoặc tích hợp vào workflow |

Nếu không có orphans: ghi "Không phát hiện nodes mồ côi."

## Issues Phát Hiện

Các vấn đề tìm thấy trong quá trình build graph:

| File nguồn | Vấn đề | Loại |
|-----------|--------|------|
| `[path:dòng]` | [mô tả] | DEAD_REF \| MISSING_FILE \| HARDCODED_PATH |

Nếu không có issues: ghi "Không phát hiện issues."

## Proposals Được Tạo

[Danh sách files đã tạo trong docs/proposals/ từ session này]
- `docs/proposals/[YYYY-MM-DD]-[tên].md` — [vấn đề ngắn gọn]

Nếu không tạo proposal: ghi "Không có proposals."
```

### Step 5b — Tạo Proposals cho Issues Nghiêm trọng

Với mỗi issue loại `DEAD_REF`, `MISSING_FILE`, hoặc `HARDCODED_PATH` tìm thấy ở Step 3-4:

Tạo file `docs/proposals/[YYYY-MM-DD]-[slug].md` theo đúng template trong
`docs/proposals/README.md`.

Ghi rõ:
- File nào bị ảnh hưởng (path + số dòng)
- Quote nội dung gốc bị lỗi
- Đề xuất nội dung thay thế
- Impact: những nodes nào trong graph bị ảnh hưởng nếu sửa

---

## Critical Rules

- Read `gsd-template/` — never write to it
- All output (reports) go to `docs/`
- If a referenced file does not exist → log as issue in report, do not create a node for it
- Do not delete existing graph nodes unless explicitly asked — use `add_observations` to update
