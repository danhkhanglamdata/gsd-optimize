# Proposals — Đề xuất thay đổi gsd-template/
> Loại: Agent Reference
> Tạo bởi: manual
> Ngày: 2026-04-12
> Trạng thái: Approved

Thư mục này chứa các đề xuất thay đổi file trong `gsd-template/` chờ user review và approve.

---

## Quy trình

```
Agent phát hiện vấn đề trong gsd-template/
    ↓
Tạo file: docs/proposals/[YYYY-MM-DD]-[tên-vấn-đề].md
    ↓
User review proposal
    ↓
Approved → Agent thực hiện thay đổi chính xác theo proposal
Rejected → Ghi lý do, đóng proposal
```

## Template bắt buộc

Mọi proposal phải dùng đúng format sau:

```markdown
# Proposal: [Tên thay đổi ngắn gọn]
> Loại: Proposal
> Tạo bởi: [agent-name]
> Ngày: [YYYY-MM-DD]
> Trạng thái: Pending | Approved | Rejected

## Vấn đề
[File nào, dòng nào, vấn đề gì]
Quote trực tiếp từ file:
> "[nội dung gốc]"

## Đề xuất sửa
**Trước:**
[nội dung cũ]

**Sau:**
[nội dung mới]

## Lý do
[Tại sao cần sửa — liên kết đến issue trong audit-report nếu có]

## Impact
[Sửa file này ảnh hưởng đến những file nào khác — từ MCP graph query]

## Approved by
[ ] Chờ review
```

## Lưu ý

- Một proposal = một thay đổi cụ thể trong một file
- Nếu cần sửa nhiều files → tạo nhiều proposals riêng biệt
- Không xóa proposals đã Rejected — chúng là lịch sử quyết định
- Proposals đã Approved và thực hiện xong → cập nhật Trạng thái thành `Done`
