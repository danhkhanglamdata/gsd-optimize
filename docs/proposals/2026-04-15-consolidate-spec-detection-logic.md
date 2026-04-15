# Proposal: Consolidate SPEC Detection Logic in discuss-phase

> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

### Files bị ảnh hưởng
- `gsd-template/gsd/commands/gsd/discuss-phase.md:77-79`
- `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md:334-391`

### Nội dung hiện tại

**Trong command file (process section):**
```markdown
8. **DETECT INPUT TYPE** — Determine SPEC vs DISCUSS mode:
   - If user provided detailed spec (score >= 3): Load gsd-requirement-explorer agent → parse spec → verify → write_context
   - If user wants to discuss (score < 3): Continue to step 9
```

**Trong workflow file (detect_input_type step):**
```yaml
<step name="detect_input_type">
**NEW STEP — SPEC vs DISCUSS mode detection**

Detection Algorithm:
- has_markdown_headers
- has_code_blocks
- has_structured_format
- length_over_500

SCORE = count(conditions true)

IF score >= 3: SPEC_MODE
IF score < 3: DISCUSS_MODE
```

### Vấn đề cụ thể

1. **Duplicate logic** — Detection algorithm xuất hiện 2 lần
2. **Maintainability nightmare** — Nếu thay đổi algorithm (thêm condition, đổi threshold) phải nhớ update 2 chỗ
3. **Inconsistent** — Command file mô tả ngắn gọn, workflow file implement chi tiết — ai là source of truth?

---

## Đề xuất sửa

### Chỉ giữ 1 nơi — trong workflow

1. **Command file:** Chỉ reference workflow và agent, không mô tả detection logic:
```markdown
8. **DETECT INPUT TYPE** — Determine SPEC vs DISCUSS mode:
   - Load gsd-requirement-explorer agent to detect and parse spec
   - See workflow step "detect_input_type" for details
```

2. **Workflow file:** Giữ nguyên detect_input_type step với full logic

3. **Agent file:** Có thể giữ detection logic như documentation, nhưng primary logic nằm ở workflow

---

## Lý do

1. **DRY principle** — Don't Repeat Yourself
2. **Workflow is source of truth** — Execute environment reads workflow, not command
3. **Easier to maintain** — Thay đổi 1 chỗ

---

## Impact

| File | Thay đổi |
|------|----------|
| `gsd-template/gsd/commands/gsd/discuss-phase.md` | 3 lines — simplify |
| `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md` | None — giữ nguyên |
| `gsd-template/gsd/agents/gsd-requirement-explorer.md` | Optional — remove duplicate from agent |

---

## Approved by

[ ] Chờ review