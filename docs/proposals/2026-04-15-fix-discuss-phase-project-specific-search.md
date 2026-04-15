# Proposal: Fix Project-Specific Search Terms in discuss-phase

> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

### File bị ảnh hưởng
- `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md:312`

### Nội dung hiện tại
```markdown
- Search for latest trends: "mobile app design trends 2025", "event app gamification"
```

### Vấn đề cụ thể
Template chứa hardcoded search terms của một project cụ thể:
- "mobile app design trends 2025" — project-specific
- "event app gamification" — project-specific (EventVib)

Template phải generic, không được chứa nội dung của bất kỳ project nào.

---

## Đề xuất sửa

### Thay thế nội dung

**Hiện tại:**
```markdown
- Search for latest trends: "mobile app design trends 2025", "event app gamification"
```

**Đề xuất:**
```markdown
- Search for latest trends: "[feature-domain] design trends 2025", "[feature-domain] UX patterns", "[feature-domain] gamification techniques"
```

### Lưu ý
- `[feature-domain]` là placeholder — workflow nên extract từ phase goal trong ROADMAP.md
- Hoặc dùng generic: "design trends 2025", "UX patterns", "user engagement techniques"

---

## Lý do

1. **Generic requirement** — Template phải work cho bất kỳ project nào
2. **CLAUDE.md rule** — "Generic — Không có project-specific references"
3. **Audit report** — Đã flag issue này là PROJECT_SPECIFIC

---

## Impact

| File | Thay đổi |
|------|----------|
| `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md` | 1 line |

---

## Approved by

[ ] Chờ review