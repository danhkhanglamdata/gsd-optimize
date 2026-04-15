# Proposal: Update discuss-phase docs search terms to match fixed template
> Loại: Proposal
> Tạo bởi: link-auditor
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

Docs đang hiển thị nội dung project-specific cũ trong khi template source đã được fix.

**[docs/actions/discuss-phase.md:132]** nói:
> "- Search trends: "mobile app design trends 2025", "event app gamification""

**[gsd-template/gsd/get-shit-done/workflows/discuss-phase.md:312]** (source đã fix):
> "- Search for latest trends: "[feature-domain] design trends 2025", "[feature-domain] UX patterns", "engagement UI patterns""

## Đề xuất sửa

### File 1: docs/actions/discuss-phase.md

**Dòng 132 thay đổi:**

Cũ:
```
- Search trends: "mobile app design trends 2025", "event app gamification"
```

Mới:
```
- Search trends: "[feature-domain] design trends 2025", "[feature-domain] UX patterns", "engagement UI patterns"
```

### File 2: docs/component-flows/discuss-phase-flow.md

**Dòng 129 thay đổi:**

Cũ:
```
- Search trends: "mobile app design trends 2025", "event app gamification"
```

Mới:
```
- Search for latest trends: "[feature-domain] design trends 2025", "[feature-domain] UX patterns", "engagement UI patterns"
```

## Lý do

Template source đã được fix (theo audit trước), docs phải reflect nội dung đúng để agent đọc docs thay vì source sẽ thấy thông tin chính xác.

## Impact

- docs/actions/discuss-phase.md - 1 line change
- docs/component-flows/discuss-phase-flow.md - 1 line change

## Approved by

[ ] Chờ review