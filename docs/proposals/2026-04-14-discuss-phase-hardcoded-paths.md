# Proposal: Replace hardcoded paths với relative paths trong discuss-phase workflow
> Loại: Proposal
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Trạng thái: Pending

## Vấn đề

Các file `workflows/discuss-phase.md` và `commands/discuss-phase.md` chứa nhiều hardcoded absolute paths thay vì dùng relative paths hoặc biến môi trường.

**Workflow file:**

Dòng 123:
> `INIT=$(node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")`

Dòng 690:
> `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${padded_phase}): capture phase context" --files "${phase_dir}/${padded_phase}-CONTEXT.md"`

Dòng 700:
> `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session \`

Dòng 708:
> `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(state): record phase ${PHASE} context session" --files .planning/STATE.md`

Dòng 719, 724, 725, 730, 737:
> `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" config-*`

**Command file:**

Dòng 36-39:
> `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/discuss-phase.md`
> `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/context.md`
> `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/ux-brainstormer/SKILL.md`
> `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/skills/style-adapter/SKILL.md`

## Đề xuất sửa

**Trước:**
```bash
INIT=$(node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")
```

**Sau:**
```bash
INIT=$(node .claude/get-shit-done/bin/gsd-tools.cjs init phase-op "${PHASE}")
```

**Trước:**
```markdown
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/discuss-phase.md
```

**Sau:**
```markdown
@.claude/get-shit-done/workflows/discuss-phase.md
```

Áp dụng tương tự cho tất cả các dòng hardcoded paths trong cả hai files.

## Lý do

Hardcoded paths gây ra:
1. Không thể di chuyển template sang thư mục khác
2. Không thể sử dụng bởi user khác với đường dẫn khác
3. Không portable giữa các hệ thống

Thay bằng relative paths từ thư mục project root, template có thể được cài đặt ở bất kỳ đâu.

## Impact

Query từ MCP graph:
- `workflows/discuss-phase.md` — được đọc bởi `commands/discuss-phase.md` (TRIGGERS)
- `commands/discuss-phase.md` — được gọi bởi user command `/gsd:discuss-phase`
- Không ảnh hưởng đến các files khác trong template

Đây là cosmetic change — không thay đổi logic, chỉ thay đổi đường dẫn.

## Approved by

[x] 2026-04-15 — Approved by user — Bắt đầu thực hiện fix