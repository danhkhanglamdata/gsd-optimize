# Design: Hybrid Discuss-Phase với Spec Parsing

> Loại: Design Document
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: In Progress

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    discuss-phase workflow                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌───────────────────────────────┐   │
│  │ User Input   │────>│ detect_input_type             │   │
│  └──────────────┘     │ (SPEC vs DISCUSS)              │   │
│                       └────────────┬────────────────────┘   │
│                                    │                         │
│                    ┌───────────────┴───────────────┐        │
│                    ▼                               ▼        │
│         ┌──────────────────┐          ┌──────────────────┐   │
│         │ DISCUSS MODE     │          │ SPEC MODE        │   │
│         │ (current flow)   │          │ gsd-requirement- │   │
│         │                  │          │ explorer         │   │
│         └──────────────────┘          └──────────────────┘   │
│                                    │                         │
│                                    ▼                         │
│                         ┌──────────────────┐                  │
│                         │ verify_completeness│                │
│                         └────────┬─────────┘                  │
│                                  │                           │
│                                  ▼                           │
│                         ┌──────────────────┐                  │
│                         │ Write CONTEXT   │                  │
│                         └──────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Input Detection Logic

### 2.1 Spec Detection Algorithm

```yaml
INPUT: user_message (string)

CONDITIONS:
  1. has_markdown_headers: /#{1,3}\s/.test(message)
  2. has_code_blocks: /```[\s\S]*?```/.test(message)
  3. has_structured_format: /(\|.+?\|.*\n)+/.test(message) || /export (const|interface|type)/.test(message)
  4. length > 500

SCORE = count(conditions true)

IF score >= 3: SPEC_MODE
ELSE: DISCUSS_MODE

OUTPUT: { mode: "SPEC" | "DISCUSS", confidence: score/4 }
```

### 2.2 Detection Examples

| Input | Score | Mode |
|-------|-------|------|
| "tôi muốn làm form đăng ký" | 0/4 | DISCUSS |
| "## Register Form\n- name field" | 1/4 | DISCUSS |
| "# RULE: Auth Form\n```tsx\nconst x = 1\n```" | 3/4 | SPEC |
| Full auth spec (500+ lines) | 4/4 | SPEC |

---

## 3. Spec Parser — 6 Sections

### 3.1 File Structure Parser

**Detection:** Lines containing `src/` or ``` blocks with file paths

**Output:**
```typescript
interface FileStructure {
  components: string[]    // e.g., ["RegisterForm.tsx", "LoginForm.tsx"]
  hooks: string[]         // e.g., ["useAuthForm.ts"]
  utils: string[]         // e.g., ["validators.ts", "constants.ts"]
  types: string[]         // e.g., ["auth.types.ts"]
}
```

### 3.2 Constants Parser

**Detection:** Code blocks with `export const` or `### CONSTANTS` section

**Output:**
```typescript
interface Constants {
  [key: string]: number | string
  // e.g., FULL_NAME_MIN: 2, PASSWORD_MIN: 8, MAX_LOGIN_ATTEMPTS: 5
}
```

### 3.3 Validators Parser

**Detection:** Function signatures with `validate` prefix or rules in comments

**Output:**
```typescript
interface Validators {
  name: string           // e.g., "validateFullName"
  params: string[]       // e.g., ["value: string"]
  returnType: string     // e.g., "string | null"
  rules: string[]        // Array of rule descriptions
}[]
```

### 3.4 UX Requirements Parser

**Detection:** Keywords: real-time, toggle, strength meter, countdown, loading, disabled, redirect

**Output:**
```typescript
interface UXRequirements {
  validation: {
    onBlur: boolean
    onChange: boolean
    afterFirstSubmit: boolean
  }
  password: {
    toggle: boolean
    strengthMeter: boolean
    requirements: string[]
  }
  confirmPassword: {
    matchIndicator: boolean
  }
  submit: {
    disabledWhenInvalid: boolean
    loadingState: boolean
    textChanges: boolean
  }
  success: {
    redirect: boolean
    countdown: boolean
    resendButton: boolean
  }
}
```

### 3.5 Error Messages Parser

**Detection:** Strings in code blocks or bullet lists under "Error Messages" sections

**Output:**
```typescript
interface ErrorMessages {
  validation: {
    [fieldName: string]: string[]
  }
  server: {
    [errorType: string]: string
  }
  common: string[]
}
```

### 3.6 Security Notes Parser

**Detection:** Lines starting with `// SECURITY:` or "Security Notes" section

**Output:**
```typescript
interface SecurityNotes {
  code: string[]     // e.g., ["// SECURITY: ..."]
  requirements: string[]
}
```

---

## 4. Verification Step

### 4.1 Completeness Check

```yaml
FUNCTION verify_completeness(spec: ParsedSpec): VerificationResult

REQUIRED_SECTIONS = [
  "fileStructure",
  "constants", 
  "validators",
  "uxRequirements",
  "errorMessages",
  "securityNotes"
]

CHECK:
  - fileStructure has at least 1 component/hook/util/type
  - constants has at least 3 constants
  - validators has at least 3 functions
  - uxRequirements has at least 2 features
  - errorMessages has at least validation errors
  - securityNotes has at least 2 items

IF any missing:
  OUTPUT: { complete: false, missing: string[] }
  
ELSE:
  OUTPUT: { complete: true }
```

### 4.2 User Prompt on Incomplete

```
Tôi thấy spec bạn cung cấp có các phần sau:
✓ File structure: [list]
✓ Constants: [list count]

⚠️ Chưa đầy đủ:
- [missing section 1]
- [missing section 2]

Bạn có muốn bổ sung thêm không, hay tiếp tục với phần đã có?
```

---

## 5. Agent: gsd-requirement-explorer

### 5.1 Agent Definition

```yaml
NAME: gsd-requirement-explorer
ROLE: Spec detection, parsing, and verification
PERSONA: Requirement analyst - chuyên viên phân tích yêu cầu

ALLOWED_TOOLS:
  - Read
  - Write
  - Grep
  - Glob

INPUT:
  - phase_number: number
  - user_input: string (the spec)
  - prior_context: Optional[PROJECT.md, REQUIREMENTS.md, STATE.md]

OUTPUT:
  - ParsedSpec
  - VerificationResult
  - Summary for CONTEXT.md

PROCESS:
  1. Detect input type (SPEC vs DISCUSS)
  2. If SPEC:
     a. Parse 6 sections
     b. Verify completeness
     c. If incomplete, prompt user
     d. Generate summary for CONTEXT.md
  3. If DISCUSS: return null (workflow handles it)
```

### 5.2 Persona

```
Bạn là một chuyên viên phân tích yêu cầu (Requirements Analyst).
Nhiệm vụ của bạn:

1. **Đọc và hiểu spec** - Parse mọi loại specification được cung cấp
2. **Trích xuất thông tin** - Lọc ra core requirements từ spec dài
3. **Verify completeness** - Đảm bảo không miss important details
4. **Summarize** - Viết tóm tắt ngắn gọn cho downstream agents

Khi parse spec:
- Giữ nguyên technical details (constants, validators, rules)
- Nhóm thành categories rõ ràng
- Note any ambiguities để clarify với user

Output của bạn phải đủ chi tiết để downstream agents có thể implement 
mà KHÔNG CẦN HỎI THÊM USER.
```

---

## 6. Workflow Integration

### 6.1 Updated discuss-phase Workflow

**File:** `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md`

**New Step: detect_input_type**

```yaml
<step name="detect_input_type">
# NEW STEP - Add after analyze_phase, before present_gray_areas

INPUT: user_message_from_init OR previous_discussion_output

RUN:
  score = detect_spec_score(user_message)
  
IF score >= 3:
  MODE = "SPEC"
  LOAD: gsd-requirement-explorer agent
  CALL: agent with (phase_number, user_message)
  GOTO: verify_completeness
  
ELSE:
  MODE = "DISCUSS"
  GOTO: present_gray_areas (existing flow)
```

### 6.2 Command File Update

**File:** `gsd-template/gsd/commands/gsd/discuss-phase.md`

**Add to execution_context:**
```
@.claude/agents/gsd-requirement-explorer.md
```

---

## 7. CONTEXT.md Output

### 7.1 Full Structure (with Spec)

```markdown
# Phase X: [Name] - Context

**Gathered:** [date]
**Input Mode:** [SPEC | DISCUSS | HYBRID]
**Status:** Ready for planning

<domain>
## Phase Boundary
[Clear statement of what this phase delivers]
</domain>

<decisions>
## Implementation Decisions

### From Spec Provided
- **File Structure:** [components], [hooks], [utils], [types]
- **Constants:** [key=value] pairs
- **Validators:** [function signatures with rules]
- **UX Requirements:** [categorized checklist]
- **Error Messages:** [categorized by form and type]
- **Security Notes:** [list of security requirements]

### From Discussion (if HYBRID mode)
[Additional decisions from discuss mode]
</decisions>

<canonical_refs>
## Canonical References
[Full paths to specs, ADRs, docs referenced]
</canonical_refs>

.spec_reference
## Original Specification

Full spec preserved at: `.planning/phases/${padded_phase}-spec-original.md`
Parser: gsd-requirement-explorer
Parsed: [date]
```

### 7.2 Example Output (Auth Spec)

```markdown
<decisions>
## Implementation Decisions

### From Spec Provided
- **File Structure:** RegisterForm.tsx, LoginForm.tsx, ForgotPasswordForm.tsx, ResetPasswordForm.tsx, useAuthForm.ts, validators.ts, constants.ts, auth.types.ts
- **Constants:** FULL_NAME_MIN=2, FULL_NAME_MAX=50, USERNAME_MIN=3, PASSWORD_MIN=8, MAX_LOGIN_ATTEMPTS=5, LOCKOUT_MINUTES=15
- **Validators:** validateFullName (2-50 chars, Vietnamese letters), validateUsername (3-20 chars, a-z0-9._), validateEmail (RFC 5322), validatePassword (8+ chars, uppercase+lowercase+number+special), validateConfirmPassword, validatePhone (optional), validateOTP
- **UX Requirements:** 
  - Validation: onBlur + onChange after first submit
  - Password: toggle show/hide, strength meter (0-4 score), requirements checklist
  - Confirm: match indicator (✓/✗)
  - Submit: disabled when invalid, loading spinner, text changes
  - Success: redirect countdown, resend button with 60s cooldown
- **Error Messages:** 
  - Validation: per field (fullName, username, email, password, confirmPassword, phone)
  - Server: email exists, username exists, account locked, not verified
  - Common: network error, session expired
- **Security Notes:** 
  - No password logging
  - Token reset single-use, 30min expiry
  - Don't reveal email exists in forgot password
  - Generic error message (don't say which field wrong)
  - Rate limiting on auth endpoints
```

---

## 8. Fallback Behavior

### 8.1 If Spec Detection Fails

If spec detected but parsing fails:
```
Tôi nhận thấy bạn cung cấp specification, nhưng không parse được. 
Bạn có muốn:
A) Paste lại spec theo format khác
B) Discuss trực tiếp thay vì paste spec
C) Tôi sẽ hỏi từng phần
```

### 8.2 If Verification Fails

If spec incomplete but user chooses to continue:
```
Đã note các phần còn thiếu vào <deferred> section để clarify trong planning.
```
```

<deferred>
## Deferred Ideas
- [Section]: [reason why incomplete]
```

---

## 9. Test Cases

### 9.1 Test: Auth Spec Full

**Input:** Full auth spec (500+ lines)  
**Expected:** SPEC mode, all 6 sections parsed, verification passes

### 9.2 Test: Partial Spec

**Input:** "## RegisterForm\n- username\n- password" (short)  
**Expected:** DISCUSS mode (score < 3)

### 9.3 Test: Mixed Input

**Input:** "Tôi muốn làm auth với spec sau..." + partial spec  
**Expected:** HYBRID mode - spec parsed + discuss follow-up

### 9.4 Test: Empty Input

**Input:** ""  
**Expected:** DISCUSS mode

### 9.5 Test: Discuss Only

**Input:** "Làm sao để user đăng nhập?"  
**Expected:** DISCUSS mode, current flow

---

## 10. Implementation Priority

| Phase | Task | Estimated Lines |
|-------|------|-----------------|
| 1 | Create gsd-requirement-explorer agent | ~200 |
| 2 | Implement spec detection logic | ~50 |
| 3 | Implement 6 parsers | ~300 |
| 4 | Implement verification step | ~100 |
| 5 | Update discuss-phase workflow | ~50 |
| 6 | Update command file | ~10 |
| 7 | Test with auth spec | - |

---

## Status

- [ ] Phase 1: Create agent
- [ ] Phase 2: Detection logic
- [ ] Phase 3: Parsers
- [ ] Phase 4: Verification
- [ ] Phase 5: Workflow update
- [ ] Phase 6: Command update
- [ ] Phase 7: Testing

---

*Design approved: 2026-04-15*
*Implementation started: 2026-04-15*