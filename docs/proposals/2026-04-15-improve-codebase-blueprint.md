# Proposal: Improve Codebase Blueprint Generation
> Loại: Proposal
> Tạo bởi: Orchestrator
> Ngày: 2026-04-15
> Trạng thái: Approved & Applied

## Vấn đề

### 1. Bug NGHIÊM TRỌNG - React Component Naming SAI

**File:** `gsd-template/gsd/get-shit-done/workflows/new-project.md`

**Line ~1205:**
```markdown
| React component | kebab-case.tsx | quiz-card.tsx |  ← SAI
```

**Vấn đề:** React component phải là PascalCase, không phải kebab-case. Tất cả framework React đều dùng PascalCase.

**Sửa thành:**
```markdown
| React component | PascalCase.tsx | QuizCard.tsx |  ← ĐÚNG
```

---

### 2. THIẾU Templates Cho 4 Files

Hiện tại 4 files được tạo với placeholders trống:

| File | Hiện tại | Cần thêm |
|------|---------|----------|
| `ARCHITECTURE.md` | Chỉ có header | Design/architecture patterns từ `codebase-blueprint.md` |
| `TESTING.md` | `[e.g., Vitest]` placeholders | Stack detection: Vitest/Jest/Playwright |
| `INTEGRATIONS.md` | Chỉ có header | Supabase/Auth/Payment defaults |
| `CONCERNS.md` | Chỉ có header | Security/Performance risks |

---

### 3. KHÔNG CÓ Pre-Creation Validation

Workflow tạo 7 files nhưng không verify:

- Foundation files tồn tại chưa (`src/lib/utils.ts`, `components.json`)
- Package.json còn valid không
- Consistency giữa STACK và các files khác

---

## Đề xuất sửa

### Change 1: Fix React Component Naming

**File:** `gsd-template/gsd/get-shit-done/workflows/new-project.md`

**Trước (line ~1205):**
```markdown
| React component | kebab-case.tsx | quiz-card.tsx |
```

**Sau:**
```markdown
| React component | PascalCase.tsx | QuizCard.tsx |
```

**Áp dụng cho TẤT CẢ templates trong file:**
- Line ~1205: File Naming table
- Line ~1215: Export Naming table
- Bất kỳ chỗ nào nói "kebab-case.tsx" cho React component

---

### Change 2: Enhance ARCHITECTURE.md Template

**Thêm vào section `### Generate \`.planning/codebase/ARCHITECTURE.md\``:**

```markdown
### Generate `.planning/codebase/ARCHITECTURE.md`

Create based on detected stack. Extract key patterns from `references/codebase-blueprint.md`:

**For Next.js + Supabase:**
```markdown
# Architecture

**Pattern:** Next.js App Router + Server Actions + Supabase
**Generated:** [date] during project initialization

## Data Flow

User → Page (Server Component) → Server Action → Supabase → Re-render

## Server Actions Pattern

```typescript
// lib/actions/[domain].ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function createThing(formData: FormData) {
  const supabase = createClient()
  const { data, error } = await supabase.from('things').insert(...)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
```

## Security Rules

- Always validate on server side, never trust client data
- Use Zod for form validation
- RLS policies in Supabase
- No API keys in client code

## State Management

- Server state: Server Actions + revalidatePath
- Client state: Zustand for global UI state
- No Redux needed
```

**For React + Vite (non-Next.js):**
```markdown
# Architecture

**Pattern:** React + Vite + Client-side only
**Generated:** [date] during project initialization

## Data Flow

User → Component → API Client → External API

## API Client Pattern

```typescript
// lib/api.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    // Handle token refresh
  }
  return Promise.reject(error)
})
```
```

---

### Change 3: Enhance TESTING.md Template

**Thêm stack detection:**

```markdown
### Generate `.planning/codebase/TESTING.md`

Detect test framework from package.json dependencies:
```bash
TEST_DEPS=$(cat package.json | grep -E '"vitest"|"jest"|"playwright"|"testing-library"')
```

**If Vitest detected:**
```markdown
# Testing Strategy

**Framework:** Vitest 1.x
**Generated:** [date] during project initialization

## Test Types

| Type | Tool | Pattern |
|------|------|---------|
| Unit | Vitest | *.test.ts next to source file |
| Integration | Vitest | *.integration.test.ts |
| E2E | Playwright | tests/e2e/*.spec.ts |

## Test Location

```
src/
  components/
    quiz-card.tsx       # source
    quiz-card.test.tsx   # test (co-located)
  lib/
    utils.ts           # source
    utils.test.ts      # test
```

## Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run test:ui       # UI mode
npm run test:coverage # Coverage report
```

## Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTest.ts'],
  },
})
```
```

**If Jest detected:** (similar format with Jest commands)

**If no test framework:** Show message to install one
```

---

### Change 4: Enhance INTEGRATIONS.md Template

**Thêm common SaaS patterns:**

```markdown
### Generate `.planning/codebase/INTEGRATIONS.md`

Detect external services from package.json and environment:

**If Supabase detected:**
```markdown
# External Integrations

**Generated:** [date] during project initialization

## Supabase

| Component | File | Purpose |
|----------|------|---------|
| Client (browser) | lib/supabase/client.ts | Public client |
| Client (server) | lib/supabase/server.ts | Server actions |
| Types | lib/supabase/types.ts | Generated types |

**Environment Variables:**
- SUPABASE_URL
- SUPABASE_ANON_KEY

## Auth

- RLS enabled on all tables
- Service role never exposed to client
- Magic link / OAuth via Supabase Auth
```

**If Stripe detected:** Add Stripe integration section

**If Auth0 detected:** Add Auth0 section
```

---

### Change 5: Enhance CONCERNS.md Template

```markdown
### Generate `.planning/codebase/CONCERNS.md`

**Common SaaS concerns to include:**

```markdown
# Risks & Concerns

**Generated:** [date] during project initialization

## Security

| Concern | Mitigation |
|--------|-----------|
| SQL Injection | Use parameterized queries, never string concatenation |
| XSS | React escapes by default |
| API Keys | Never client-side, use server actions |
| CSRF | Next.js CSRF token |

## Performance

| Concern | Mitigation |
|--------|-----------|
| Large bundles | Dynamic imports |
| Slow DB queries | Indexes, query planning |
| Too many re-renders | React.memo, useMemo |

## Cost

- Supabase: Monitor query counts
- Vercel: Watch bandwidth
- Stripe: Monitor API calls
```

---

### Change 6: Add Pre-Creation Validation

**Thêm BEFORE tạo các file, sau Step 8:**

```markdown
## Pre-Creation Validation (NEW)

Before generating codebase files:

### Check Foundation Files
```bash
# If Next.js project
[ -f "src/lib/utils.ts" ] || echo "MISSING: cn() utility"
[ -f "tailwind.config.ts" ] || echo "MISSING: Tailwind config"
[ -f "components.json" ] && echo "shadcn/ui detected" || echo "No shadcn/ui"
```

### Check Stack Consistency
```bash
# Verify package.json exists and is valid
[ -f "package.json" ] || echo "ERROR: No package.json"
grep -q '"next"' package.json && echo "Next.js detected"
grep -q '"supabase"' package.json && echo "Supabase detected"
```

### Output validation results to log
- Log which stack detected
- Log which files will be generated
- Log any warnings
```

---

## Impact

**Files affected:**
- `gsd-template/gsd/get-shit-done/workflows/new-project.md` (~350 lines changes)

**Agents affected:**
- None (this is workflow self-generation, no agent)

**Downstream effects:**
- `.planning/codebase/ARCHITECTURE.md` will have real content
- `.planning/codebase/TESTING.md` will have framework-specific content
- `.planning/codebase/INTEGRATIONS.md` will have service-specific content
- `.planning/codebase/CONCERNS.md` will have risk patterns
- Pre-creation checks will catch missing foundations early

---

## Verification Plan

After implementing:

1. **Grep check for kebab-case.tsx:**
   ```bash
   grep -n "kebab-case.tsx" gsd-template/gsd/get-shit-done/workflows/new-project.md
   ```
   Must return: 0 occurrences for React component rows

2. **Verify ARCHITECTURE.md template:**
   - Must contain "Data Flow" section
   - Must contain "Server Actions Pattern" for Next.js

3. **Verify TESTING.md template:**
   - Must detect Vitest
   - Must detect Jest
   - Must show commands

4. **Verify INTEGRATIONS.md template:**
   - Must detect Supabase
   - Must show client/server separation

5. **Verify new-project flow:**
   - Must have pre-creation validation section

---

## Approved by

[ ] Chờ review