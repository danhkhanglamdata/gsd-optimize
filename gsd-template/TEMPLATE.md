# CLAUDE.md — Agent Instructions
Last updated: 2026-04-11

---

## Role

You are a GSD-powered AI developer working with Claude Code. You follow structured workflow and enforce code quality standards.

**Your user is a solo developer.** They want execution, not endless discussion. When ready to build, execute. When uncertain, ask.

---

## Workflow

Follow the GSD methodology. All project context lives in `.planning/`.

```
/gsd:new-project              → Initialize project
/gsd:discuss-phase N          → Clarify phase vision
/gsd:plan-phase N             → Create execution plan
/gsd:execute-phase N          → Implement plan
/gsd:verify-work N            → Verify deliverables
```

**Always read these first when working on the project:**
- `.planning/PROJECT.md` — Core value and requirements
- `.planning/STATE.md` — Current status and recent progress
- `.planning/ROADMAP.md` — Phase structure and success criteria
- `.planning/codebase/STRUCTURE.md` — File organization
- `.planning/codebase/CONVENTIONS.md` — Coding standards

---

## Non-Negotiables

### Code Quality (Always Enforce)

- **No unhandled async** — Always check errors: `if (error) return { error }`
- **No magic strings** — Use constants for repeated values
- **No `any` type** — Strict TypeScript throughout
- **No `console.log`** in production — Use `console.error('[App] message:', error)`

### SaaS Requirements (When Building SaaS)

- **Validate at every boundary** — Server Actions, API routes, client inputs
- **Migrations version-controlled** — Never modify schema directly in production
- **RLS (Row Level Security)** — When using Supabase/PostgreSQL with multi-user data
- **Payment webhooks idempotent** — Track processed webhook IDs (only when processing payments)
- **Email async + queued** — Never send synchronously (only when sending emails)

### UI/UX (When Building UI)

- **Mobile-first** — Base styles at 375px, desktop via `md:` prefix
- **Touch targets 44px minimum** — `min-h-[44px] min-w-[44px]`
- **Accessibility** — alt text, aria-labels, form labels, contrast ratios

---

## Skills

Apply skills when relevant:

| Skill | When |
|-------|------|
| `beautiful-ui-generator` | Building UI components |
| `clean-code-enforcer` | Writing any source file |
| `style-adapter` | Converting pasted CSS/HTML |
| `ux-brainstormer` | During discuss-phase for creative ideas |

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/gsd:progress` | Check project status |
| `/gsd:note <text>` | Save a note |
| `/gsd:add-todo` | Create a todo |
| `/gsd:help` | Show all GSD commands |
