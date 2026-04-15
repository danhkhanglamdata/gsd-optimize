# Proposal: Fix All Hardcoded Paths in gsd-template
> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

Audit phát hiện **352 hardcoded paths** trên **91 files** trong gsd-template/.

Pattern tìm thấy: `C:/Users/Admin/OneDrive/Máy tính/review_gsd/`

### File bị ảnh hưởng nhiều nhất

| File | Số occurrences |
|------|----------------|
| execute-plan.md | 17 |
| execute-phase.md | 16 |
| gsd-executor.md | 14 |
| new-project.md | 12 |
| plan-phase.md | 13 |
| autonomous.md | 10 |
| gsd-planner.md | 8 |
| ... | ... |

### Tổng kết theo loại

| Loại | Số files | Tổng occurrences |
|------|----------|------------------|
| workflows/ | ~40 | ~200 |
| commands/ | ~33 | ~80 |
| agents/ | ~16 | ~50 |
| references/ | ~10 | ~20 |
| templates/ | ~2 | ~13 |

## Đề xuất sửa

### Approach 1: Replace All (Recommended)

Dùng sed/replace_all để thay thế tất cả một lượt:

```bash
# Search pattern
C:/Users/Admin/OneDrive/Máy tính/review_gsd/

# Replace với (tùy context)
- @ references → @.claude/
- bash commands → .claude/
```

### Approach 2: Từng file

Fix từng workflow chính một:
1. new-project
2. plan-phase
3. execute-phase
4. verify-work

### Đề xuất: Approach 1 - Replace All

Ưu điểm:
- Nhanh hơn (1 lần thay thế)
- Đảm bảo consistency
- Không bỏ sót

Nhược điểm:
- Cần verify kỹ sau đó

## Impact

- ✅ Template sẽ portable
- ✅ Có thể publish lên npm
- ✅ User khác có thể sử dụng

## Verification Plan

1. Grep `C:/Users` sau khi fix → phải = 0
2. Test chạy 1 command đơn giản
3. Update INTERNAL_CHANGELOG.md

## Approved by

[x] 2026-04-15 — Approved by user — Đang thực hiện fix