# CLAUDE.md — Working Context for GSD Template Development
Last updated: 2026-04-12

---

## Project Overview

**This is the GSD Template project** — we are building a generic, production-ready template for Claude Code to publish on GitHub.

**gsd-template/ is the PRODUCT** — like source code of an app. Everything we do centers on improving this folder.

---

## Workflow: Overall → Detailed

We work from **top-level to specific** — examining each GSD workflow component by component:

### Phase 1: Understand Current Structure
1. **GSD new-project workflow** — What does it do? Which agents? What files created?
2. **Relationships** — How do files connect to each other?
3. **Dependencies** — What depends on what?

### Phase 2: Review & Improve Each Component
1. **TEMPLATE.md** — Agent instructions for template users
2. **gsd/skills/** — Enforceable rules (remove EventVib)
3. **gsd/agents/** — Subagents (verify context loading)
4. **gsd/commands/** — Slash commands
5. **gsd/get-shit-done/** — Core logic + templates

### Phase 3: Propose Improvements
- Add new rules
- Fix generic issues
- Improve documentation
- Ensure links remain intact

---

## Detailed Investigation Process

For EACH GSD component, you must:

### Step 1: Identify the Component
Example: `/gsd:new-project` command

### Step 2: Trace the Workflow
- Read command file: `gsd/commands/gsd/new-project.md`
- Read workflow file: `gsd/get-shit-done/workflows/new-project.md`
- Identify agents spawned

### Step 3: Map File Relationships
- What files does this create?
- What templates does it use?
- What agents does it call?

### Step 4: Review for Generic Issues
- Any project-specific references (EventVib, specific tables)?
- Any hardcoded values that should be generic?
- Any missing documentation?

### Step 5: Propose Improvements
- Note issues found
- Suggest fixes
- Document what should change

---

## Memory & Git Requirements

### Memory (MUST)

**Before starting work:**
- Read ALL files in `memory/` folder
- Understand what was done before
- Avoid duplication

**After each change:**
- Create new memory file: `memory/YYYY-MM-DD-action.md`
- Include:
  - User's question/request
  - Your analysis
  - Changes made
  - Results
  - Next steps

### Git (MUST)

**After each change:**
```bash
git add .
git commit -m "type(scope): description"
git push origin main
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Improve code/template
- `docs`: Documentation
- `chore`: Configuration

---

## Priority Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Review TEMPLATE.md | Pending |
| 2 | Trace /gsd:new-project workflow | Pending |
| 3 | Clean up gsd/skills/ | Pending |
| 4 | Review gsd/agents/ | Pending |
| 5 | Review gsd/commands/ | Pending |
| 6 | Review gsd/get-shit-done/ | Pending |

---

## ⚠️ IMPORTANT: Template Folder Structure

When user **downloads** and **installs** this template:

| In gsd-template/ | After download → Rename to |
|------------------|---------------------------|
| `gsd/` | `.claude/` |
| `TEMPLATE.md` | `CLAUDE.md` |

**This is critical because:**
- Claude Code ONLY reads `.claude/` folder
- Claude Code ONLY reads root `CLAUDE.md`

Current folder structure (needs rename after download):

```
gsd-template/                         # COPY this folder
├── gsd/                            # RENAME TO .claude/
│   ├── agents/                    # Subagents
│   ├── commands/                  # GSD slash commands
│   ├── get-shit-done/             # Core workflow logic
│   ├── hooks/                     # Automation hooks
│   └── skills/                    # Enforceable rules
├── TEMPLATE.md                     # RENAME TO CLAUDE.md
├── gsd-file-manifest.json
├── settings.json
└── settings.local.json
```

---

## How to Trace a Workflow

Example: `/gsd:new-project`

```
gsd/commands/gsd/new-project.md
    ↓ reads
gsd/get-shit-done/workflows/new-project.md
    ↓ spawns
gsd/agents/gsd-project-researcher.md (x4)
gsd/agents/gsd-roadmapper.md
gsd/agents/gsd-ideator.md
    ↓ creates
.planning/PROJECT.md (from template)
.planning/REQUIREMENTS.md
.planning/ROADMAP.md
.planning/STATE.md
.planning/codebase/STRUCTURE.md
.planning/codebase/CONVENTIONS.md
```

**Your job:** Trace each workflow, understand the chain, identify issues, propose improvements.

---

## Non-Negotiables

- **Generic** — No project-specific assumptions
- **Complete** — Template must work standalone
- **Documented** — Clear instructions for AI agents
- **Links intact** — When modifying, ensure relationships remain

---

## Quick Reference

| Task | Action |
|------|--------|
| Read memory | `ls memory/` → read all |
| Create memory | `memory/YYYY-MM-DD-action.md` |
| Trace workflow | Read command → workflow → agents → templates |
| Git commit | `git commit -m "type(scope): description"` |
