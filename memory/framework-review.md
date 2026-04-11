# Memory: Review GSD Framework

## Ngày tạo: 2026-04-11
## Cập nhật: 2026-04-11 — Đã fix CLAUDE.md

## Tổng quan framework

**GSD (Get Shit Done)** là agentic development framework cho Claude Code, bao gồm:

| Thành phần | Mô tả |
|-----------|-------|
| `CLAUDE.md` | File hướng dẫn gốc, luôn được load đầu tiên |
| `.claude/settings.json` | Hooks cấu hình (SessionStart, PostToolUse, Stop) |
| `.claude/skills/` | Domain-specific rules có thể enforce (beautiful-ui-generator, clean-code-enforcer...) |
| `.claude/agents/` | Specialized subagents (planner, verifier, debugger...) |
| `.claude/commands/` | GSD slash commands |
| `.claude/get-shit-done/` | Core framework code |

## Đã hoàn thành

### CLAUDE.md đã được fix (2026-04-11)

**Trước đây:** Template rỗng với placeholders
```markdown
**Stack:** <!-- e.g. Next.js 15 · TypeScript... -->
**Success criteria:**
- <!-- Define what success looks like -->
```

**Sau khi fix:** Full template với:
- ✅ Project overview với recommended stack
- ✅ SaaS-specific non-negotiables (RLS, migrations, payment idempotency, email queues)
- ✅ Stack recommendations table
- ✅ Supabase patterns
- ✅ Project structure guidance
- ✅ Getting started steps

### Vấn đề đã xử lý

1. **Template rỗng** → Đã có nội dung đầy đủ, không cần user điền gì
2. **Thiếu SaaS rules** → Đã bổ sung RLS, migrations, payment, email
3. **Không có stack** → Đã thêm recommendations table

### Nghiên cứu sâu GSD new-project (2026-04-11)

**Đã nghiên cứu:**
- `/gsd:new-project` command
- Workflow: new-project.md (1500+ lines)
- Templates: project.md, requirements.md
- Agents: gsd-ideator, gsd-project-researcher, gsd-roadmapper

**Kết quả nghiên cứu:**

/gsd:new-project tạo ra 7 files chính:
```
.planning/
├── PROJECT.md      # Vision, core value, requirements status
├── config.json      # Workflow preferences (mode, granularity, agents)
├── REQUIREMENTS.md  # v1/v2 requirements với REQ-IDs
├── ROADMAP.md       # Phase breakdown với success criteria
├── STATE.md         # Project memory
├── research/        # Optional domain research (4 parallel agents)
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   └── SUMMARY.md
└── codebase/
    ├── STRUCTURE.md # Directory layout + placement rules
    └── CONVENTIONS.md # Coding standards
```

**Workflow chi tiết:**
1. Setup → Check git, project exists
2. Brownfield offer → Map codebase nếu có code sẵn
3. Deep Questioning → Hỏi user muốn build gì
4. SaaS Brainstorm (gsd-ideator) → 8 categories framework
5. Write PROJECT.md → Từ brainstorm
6. Workflow Preferences → Mode, granularity, agents
7. Research Decision → Spawn 4 researchers (optional)
8. Define Requirements → Từ research + user input
9. Create Roadmap → gsd-roadmapper agent
10. Codebase Blueprint → STRUCTURE.md + CONVENTIONS.md

**Đánh giá CLAUDE.md hiện tại:**

| Vấn đề | Chi tiết |
|--------|----------|
| **1. Duplicate chức năng** | new-project đã tạo đầy đủ templates. CLAUDE.md lặp lại: Project Structure, Getting Started |
| **2. Conflict với workflow** | CLAUDE.md hướng dẫn user chạy /gsd:new-project nhưng cũng liệt kê steps mà new-project đã làm tự động |
| **3. Không align với thực tế** | CLAUDE.md có "Stack Recommendation" nhưng new-project sẽ research và quyết định stack qua 4 researchers |
| **4. Out of scope cho template** | CLAUDE.md nên là HƯỚNG DẪN CHO AGENT, không phải project setup guide |

**Kết luận:** CLAUDE.md cần viết lại hoàn toàn - không phải project template mà là AGENT INSTRUCTIONS

---

### CLAUDE.md đã viết lại hoàn toàn (2026-04-11)

**Trước:** Project template với stack, structure, getting started (LỖI - duplicate new-project)

**Sau:** Agent instructions tối giản:

```markdown
# CLAUDE.md — Agent Instructions

## Role
You are a GSD-powered AI developer...

## Workflow
/gsd:new-project → discuss-phase → plan-phase → execute-phase → verify-work

## Non-Negotiables
[Code Quality + SaaS + UI/UX rules]

## Supabase Pattern
[Correct client selection]

## Skills
[When to apply each skill]

## Finding Project Context
[Always read .planning/ files first]

## Quick Reference
[GSD commands]
```

### Key changes

| Trước | Sau |
|-------|-----|
| Stack recommendations cứng | Agent đọc từ research |
| Project structure cứng | Agent đọc từ STRUCTURE.md |
| Getting started guide | Agent tuân theo workflow |
| Template placeholders | Agent instructions |

### Vấn đề đã giải quyết

1. ✅ Duplicate với new-project - Đã remove
2. ✅ Conflict structure - Agent đọc STRUCTURE.md động
3. ✅ Không align workflow - Agent tuân thủ GSD workflow
4. ✅ Không phải project template - Đúng là agent instructions

---

*Framework review complete*

