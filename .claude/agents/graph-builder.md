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

For each file discovered, create an entity in MCP:

```
Entity name:   filename without path (e.g. "new-project.md")
Entity type:   CommandNode | WorkflowNode | AgentNode | TemplateNode | ReferenceNode | SkillNode
Observations:  ["path: gsd-template/gsd/commands/gsd/new-project.md", "creates: PROJECT.md, ROADMAP.md, STATE.md"]
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

Create `docs/graph-build-report.md` with:

```markdown
# Knowledge Graph Build Report
Date: [date]

## Nodes Created
| Type | Count |
|------|-------|
| CommandNode | N |
| WorkflowNode | N |
| AgentNode | N |
| TemplateNode | N |
| ReferenceNode | N |
| SkillNode | N |
| **Total** | **N** |

## Edges Created
| Type | Count |
|------|-------|
| TRIGGERS | N |
| SPAWNS | N |
| USES_TEMPLATE | N |
| READS | N |
| CREATES | N |
| REQUIRED_BY | N |

## Orphan Nodes Found
- [list of files with no incoming edges]

## Issues Detected
- [any broken references or missing files]
```

---

## Critical Rules

- Read `gsd-template/` — never write to it
- All output (reports) go to `docs/`
- If a referenced file does not exist → log as issue in report, do not create a node for it
- Do not delete existing graph nodes unless explicitly asked — use `add_observations` to update
