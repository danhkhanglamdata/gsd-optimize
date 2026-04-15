# Knowledge Graph — Báo cáo Build
> Loại: Graph Build Report
> Tạo bởi: graph-builder
> Ngày: 2026-04-14
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Draft

---

## Tổng kết Nodes

| Loại Node | Số lượng |
|-----------|---------|
| CommandNode | 37 |
| WorkflowNode | 38 |
| AgentNode | 16 |
| TemplateNode | 37 |
| ReferenceNode | 14 |
| SkillNode | 6 |
| **Tổng cộng** | **148** |

---

## Tổng kết Edges

| Loại Edge | Số lượng |
|-----------|---------|
| TRIGGERS | 37 |
| SPAWNS | ~60 (workflow → agent spawns) |
| USES_TEMPLATE | ~40 |
| READS | ~50 |
| CREATES | N/A (output files outside gsd-template/) |
| REQUIRED_BY | 6 |

---

## Nodes Mồ Côi (Orphans)

Không phát hiện nodes mồ côi.

Tất cả command files đều có workflow tương ứng (1:1 mapping). Các agent files được spawn bởi workflows. Templates và references đều được reference.

---

## Issues Phát Hiện

| File nguồn | Vấn đề | Loại |
|-----------|--------|------|
| 33 command files trong `gsd-template/gsd/commands/gsd/` | Hardcoded absolute path: `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/...` | HARDCODED_PATH |
| ~35 workflow files trong `gsd-template/gsd/get-shit-done/workflows/` | Hardcoded absolute path: `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` | HARDCODED_PATH |

**Chi tiết vấn đề:**

Tất cả 33 command files và nhiều workflow files chứa absolute paths cố định đến máy của user:
- Command files: `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/*.md`
- Workflow files: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" ...`

Điều này có nghĩa:
1. File này không thể chạy trên bất kỳ máy nào khác
2. Nếu user di chuyển project đến folder khác, mọi command sẽ break
3. Template không portable — không thể share hoặc cài đặt lên máy mới

**Vấn đề nghiêm trọng:** Đây là template được publish lên npm với hàng nghìn lượt tải mỗi tháng, nhưng lại chứa hardcoded path đến một máy cụ thể.

---

## Proposals Được Tạo

Không có proposals — user chưa approve bất kỳ thay đổi nào.

---

## Ghi chú thêm

### Cấu trúc Graph

Graph này đã được scan hoàn chỉnh từ gsd-template/ nhưng CHƯA được tạo trong MCP memory (vì tool MCP không được enable trong session này). Cần chạy lại graph-builder với MCP tools để tạo actual nodes.

### Hardcoded Path Issue

33 command files + ~35 workflow files cần được sửa để sử dụng relative paths hoặc dynamic path resolution thay vì hardcoded `C:/Users/Admin/...`.

---

**Action items:**
- [ ] Enable MCP memory tools
- [ ] Re-run graph-builder để tạo actual nodes trong MCP
- [ ] Tạo proposal để fix hardcoded paths trong 68 files