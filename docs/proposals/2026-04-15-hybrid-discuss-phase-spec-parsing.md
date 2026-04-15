# Proposal: Hybrid Discuss-Phase với Spec Parsing

> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Approved

## Vấn đề

### 1. Discuss-phase hiện tại quá generic

- Không có dedicated agent xử lý requirement gathering
- Không có structured output
- Questions quá generic, không đi sâu vào chi tiết

### 2. Không tiếp nhận specification được cung cấp

- Khi user paste spec chi tiết (như Auth spec), system không biết cách parse
- Không extract được: file structure, validators, UX requirements, error messages, checklist
- Không có verification step để ensure completeness

### 3. Thiếu verification

- Không có bước kiểm tra xem đã capture đủ requirements chưa
- Downstream agents có thể miss important details

---

## Đề xuất giải pháp

### 1. Tạo dedicated agent: `gsd-requirement-explorer`

**File:** `gsd-template/gsd/agents/gsd-requirement-explorer.md`

**Role:** Spec detection + parsing + verification

**Trigger:** Khi user input có đặc điểm:
- Markdown headers (# RULE, ##)
- Code blocks (```)
- Structured format (tables, TypeScript)
- Độ dài > 500 chars

---

### 2. Spec Parser — Extract 6 Sections

| Section | Detection Pattern | Output |
|---------|-------------------|--------|
| File Structure | ``` path hoặc `src/` | Array: components, hooks, utils, types |
| Constants | `export const` hoặc `### CONSTANTS` | Named constants với values |
| Validators | `validate*` functions | Function signatures + rules |
| UX Requirements | Real-time, toggle, strength meter | Checklist items |
| Error Messages | "..." trong code blocks | Categorized |
| Checklist | [ ], ✅, ☑ | Categorized |

---

### 3. Verification Step (BẮT BUỘC)

Sau khi parse, PHẢI verify:

```
✓ File structure captured?
✓ Constants extracted (with values)?
✓ Validators rules captured?
✓ UX requirements as checklist?
✓ Error messages categorized?
✓ Security notes captured?
✓ Original spec preserved?
```

Nếu missing → Ask user bổ sung.

---

### 4. Update discuss-phase workflow

**File:** `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md`

**Thêm step:** `detect_input_type`
- Nếu detect là SPEC → call gsd-requirement-explorer
- Nếu detect là DISCUSS → tiếp tục current flow

---

### 5. CONTEXT.md Output Format

```markdown
<decisions>
### From Spec Provided
- **File Structure:** src/components/auth/, hooks/, utils/, types/
- **Constants:** FULL_NAME_MIN=2, PASSWORD_MIN=8, MAX_LOGIN_ATTEMPTS=5
- **Validators:** fullName, username, email, password, confirmPassword, phone, OTP
- **UX Requirements:** real-time validation, password toggle, strength meter, countdown
- **Error Messages:** [categorized per form]
- **Security Notes:** [captured as comments]
</decisions>

<spec_reference>
## Original Specification
Full spec preserved at: `.planning/phases/XX-spec-original.md`
Parser: gsd-requirement-explorer
</spec_reference>
```

---

## Impact

| Component | Thay đổi |
|-----------|----------|
| `gsd-template/gsd/agents/gsd-requirement-explorer.md` | NEW |
| `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md` | Add detect_input_type step |
| `gsd-template/gsd/commands/gsd/discuss-phase.md` | Update execution_context |

---

## Implementation Plan

1. **Phase 1:** Tạo gsd-requirement-explorer agent với spec detection + parsing
2. **Phase 2:** Thêm verification logic
3. **Phase 3:** Update discuss-phase workflow để call agent
4. **Phase 4:** Test với auth spec example

---

## Verification Plan

1. Test spec detection: paste auth spec → detect as SPEC mode
2. Test parsing: verify all 6 sections extracted
3. Test verification: ensure completeness check runs
4. Test output: CONTEXT.md contains structured spec data
5. Test discuss mode: normal discussion still works

---

## Approved by

[x] Approved: 2026-04-15 - Hybrid approach with dedicated agent