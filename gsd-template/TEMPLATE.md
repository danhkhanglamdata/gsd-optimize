# CLAUDE.md — GSD Template for Claude Code

**IMPORTANT:** After downloading this template, you MUST rename these files:

| Original | Rename to | Why |
|----------|-----------|-----|
| `gsd/` | `.claude/` | Claude Code only reads `.claude/` folder |
| `TEMPLATE.md` | `CLAUDE.md` | Claude Code only reads root `CLAUDE.md` |

---

## What is This

This is the **GSD (Get Shit Done)** template — a structured workflow for solo developers building with Claude Code.

**For:** Solo developers who want systematic, phase-based development.

---

## Quick Start

### 1. Rename Files (REQUIRED)

```bash
# After downloading, run:
mv gsd .claude
mv TEMPLATE.md CLAUDE.md
```

### 2. Initialize Project

```bash
/gsd:new-project
```

Follow the prompts to define your project.

### 3. Plan & Execute

```bash
/gsd:plan-phase 1     # Create plan for first phase
/gsd:execute-phase 1  # Execute the plan
/gsd:verify-work 1    # Verify deliverables
```

---

## GSD Workflow

The 5-step workflow:

```
/gsd:new-project      → Initialize project
/gsd:discuss-phase N  → Clarify your vision
/gsd:ui-phase N       → Design UI (optional, frontend only)
/gsd:plan-phase N     → Create execution plan
/gsd:execute-phase N  → Implement
/gsd:verify-work N    → Confirm goal achieved
```

**One session = one phase.** Run `/clear` between phases.

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `/gsd:new-project` | Initialize new project |
| `/gsd:discuss-phase N` | Clarify phase vision |
| `/gsd:plan-phase N` | Create plan |
| `/gsd:execute-phase N` | Execute plan |
| `/gsd:verify-work N` | Verify deliverables |
| `/gsd:progress` | Check project status |
| `/gsd:note <text>` | Save a note |
| `/gsd:add-todo` | Create a todo |
| `/gsd:help` | Show all commands |

---

## Generated Files

When you run `/gsd:new-project`, it creates:

```
.planning/
├── PROJECT.md         # Project vision
├── REQUIREMENTS.md    # Scoped requirements
├── ROADMAP.md         # Phase breakdown
├── STATE.md           # Project memory
├── config.json        # Workflow preferences
├── research/          # Domain research (optional)
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   └── SUMMARY.md
└── codebase/
    ├── STRUCTURE.md   # File organization
    └── CONVENTIONS.md # Coding standards
```

---

## Non-Negotiables

### Code Quality (Always)
- **No unhandled async** — Always check errors: `if (error) return { error }`
- **No magic strings** — Use constants for repeated values
- **No `any` type** — Strict TypeScript

### UI/UX (When Building UI)
- **Mobile-first** — Base styles at 375px
- **Touch targets 44px minimum**
- **Accessibility** — alt text, aria-labels, contrast ratios

---

## Skills Available

Apply these skills when working:

| Skill | When to use |
|-------|-------------|
| `beautiful-ui-generator` | Building UI components |
| `clean-code-enforcer` | Writing source files |
| `style-adapter` | Converting CSS/HTML from inspiration |
| `ux-brainstormer` | Brainstorming creative UI/UX |

---

## Folder Structure

```
your-project/
├── .claude/                 # ← Rename 'gsd' to '.claude'
│   ├── agents/             # Subagents
│   ├── commands/           # GSD slash commands
│   ├── get-shit-done/      # Core workflow logic
│   ├── hooks/              # Automation hooks
│   └── skills/             # Enforceable rules
├── CLAUDE.md               # ← Rename 'TEMPLATE.md' to 'CLAUDE.md'
├── .planning/              # Created by /gsd:new-project
└── [your project files]
```

---

## Support

- Run `/gsd:help` to see all commands
- Run `/gsd:progress` to check project status
