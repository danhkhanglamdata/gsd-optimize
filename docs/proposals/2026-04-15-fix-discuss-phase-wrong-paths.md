# Proposal: Fix Wrong Path References in discuss-phase Command

> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

### File bị ảnh hưởng
- `gsd-template/gsd/commands/gsd/discuss-phase.md:36-39`

### Nội dung hiện tại
```markdown
@.claude/get-shit-done/workflows/discuss-phase.md
@.claude/get-shit-done/templates/context.md
@.claude/skills/ux-brainstormer/SKILL.md
@.claude/skills/style-adapter/SKILL.md
@.claude/agents/gsd-requirement-explorer.md
```

### Vấn đề cụ thể

Path references sai:
- Template files nằm trong `gsd-template/gsd/` (sau khi user cài đặt)
- `@.claude/` path giả định files nằm ở project root `.claude/`
- Khi user chạy `/gsd:discuss-phase`, CLI sẽ resolve path sai

**Cấu trúc thực tế sau khi cài đặt:**
```
project/
├── gsd-template/           ← Template installed here
│   └── gsd/
│       ├── commands/gsd/discuss-phase.md
│       ├── workflows/
│       ├── skills/
│       └── agents/
├── .claude/                 ← User's Claude config (khác)
└── .planning/               ← User's planning files
```

---

## Đề xuất sửa

### Option A: Dùng relative path từ gsd-template/

```markdown
@gsd-template/gsd/get-shit-done/workflows/discuss-phase.md
@gsd-template/gsd/get-shit-done/templates/context.md
@gsd-template/gsd/skills/ux-brainstormer/SKILL.md
@gsd-template/gsd/skills/style-adapter/SKILL.md
@gsd-template/gsd/agents/gsd-requirement-explorer.md
```

### Option B: Dùng alias được định nghĩa trong template

Nếu gsd-tools có support cho alias như `@workflows/discuss-phase.md` hoặc `@skills/ux-brainstormer` — dùng cách đó.

### Option C: Thống nhất convention

Kiểm tra tất cả command files — nếu tất cả đều dùng `@.claude/` thì đây là intentional, nhưng cần verify workflow files có tương ứng không.

---

## Lý do

1. **Path resolution sẽ fail** — User run command sẽ không load được required files
2. **Inconsistent với cấu trúc** — .claude/ là user config, không phải template
3. **Verification:** Test run `/gsd:discuss-phase` sẽ show file not found errors

---

## Impact

| File | Thay đổi |
|------|----------|
| `gsd-template/gsd/commands/gsd/discuss-phase.md` | 5 lines |

**Cần verify:** Các command files khác có cùng issue không.

---

## Approved by

[ ] Chờ review