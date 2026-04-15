# Proposal: Fix SPEC Mode Output Format in write_context

> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Pending

## Vấn đề

### File bị ảnh hưởng
- `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md:584-688` (write_context step)

### Nội dung hiện tại

`write_context` step tạo CONTEXT.md với format:
```markdown
<domain>
## Phase Boundary
[...]

<decisions>
## Implementation Decisions
[...]

<canonical_refs>
## Canonical References
[...]

.code_context
## Existing Code Insights
[...]

<specifics>
## Specific Ideas
[...]

<deferred>
## Deferred Ideas
[...]
```

### Vấn đề cụ thể

1. **Thiếu `<spec_reference>` section** — Design document (2026-04-15-hybrid-discuss-phase-design.md) mô tả SPEC mode output:
```markdown
.spec_reference
## Original Specification

Full spec preserved at: `.planning/phases/${padded_phase}-spec-original.md`
Parser: gsd-requirement-explorer
Parsed: [date]
```

2. **Thiếu "Input Mode" header** — Design document mô tả:
```markdown
**Input Mode:** [SPEC | DISCUSS | HYBRID]
```

3. **SPEC mode content không được handle riêng** — Khi agent parse spec thành công, summary cần được inject vào `<decisions>` với format riêng, không phải generic decisions format.

---

## Đề xuất sửa

### Thêm conditional logic vào write_context step

```yaml
<step name="write_context">
**If SPEC mode detected (from detect_input_type step):**
- Read spec_summary from agent output
- Inject vào <decisions> section với format:
  ```markdown
  ### From Spec Provided
  - **File Structure:** [components], [hooks], [utils], [types]
  - **Constants:** [key=value] pairs
  - **Validators:** [function signatures]
  - **UX Requirements:** [feature list]
  - **Error Messages:** [categorized]
  - **Security Notes:** [list]
  ```
- Add <spec_reference> section:
  ```markdown
  <spec_reference>
  ## Original Specification
  
  Full spec preserved at: `.planning/phases/${padded_phase}-spec-original.md`
  Parser: gsd-requirement-explorer
  Parsed: [date]
  </spec_reference>
  ```
- Add input mode indicator: **Input Mode:** SPEC

**If DISCUSS mode (default):**
- Giữ nguyên current format
```

---

## Lý do

1. **Design document specifies this** — SPEC mode output đã được design, cần implement đầy đủ
2. **Preserve original spec** — Downstream agents có thể cần đọc original, không chỉ parsed summary
3. **Output consistency** — User expect SPEC mode output khác với DISCUSS mode

---

## Impact

| File | Thay đổi |
|------|----------|
| `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md` | ~30 lines — update write_context |

**Cần verify:** Agent output format có match với workflow injection format không.

---

## Approved by

[ ] Chờ review