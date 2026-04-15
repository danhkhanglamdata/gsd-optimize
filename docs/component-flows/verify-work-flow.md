# /gsd:verify-work — Flow Chain
> Loại: Flow Doc
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Phiên bản gsd_template: v1.34.0
> Trạng thái: Draft
> Nguồn: `gsd-template/gsd/commands/gsd/verify-work.md`

## Tổng quan

Command `/gsd:verify-work` thực hiện User Acceptance Testing (UAT) qua cuộc hoi thoai. Noi dung chinh:

- **Objective:** Validate built features through conversational testing with persistent state
- **Khi dung:** Sau khi execute-phase hoan thanh, de user xac nhan feature hoat dong dung nhu mong doi
- **Output chinh:** `{phase_num}-UAT.md` tracking test results

## Flow Chain

commands/gsd/verify-work.md
    ↓ loads workflow (via execution_context) - tu .claude/get-shit-done/workflows/verify-work.md
workflows/verify-work.md  [14 steps: Format A - <step> XML blocks]
    ↓ Step 1: initialize
        └─ bash: gsd-tools.cjs init verify-work → config JSON
    ↓ Step 2: check_active_session
        └─ find .planning/phases/*-UAT.md → check for existing sessions
    ↓ Step 3: find_summaries
        └─ ls "$phase_dir"/*-SUMMARY.md → find deliverables
    ↓ Step 4: extract_tests
        └─ parse SUMMARY.md → extract testable deliverables
        └─ inject cold-start smoke test if relevant files changed
    ↓ Step 5: create_uat_file
        └─ creates: {phase_dir}/{phase_num}-UAT.md (template: UAT.md)
    ↓ Step 6: present_test
        └─ present current test to user, wait for response
    ↓ Step 7: process_response
        └─ update UAT file based on user response (pass/issue/skip)
    ↓ Step 8: resume_from_file (conditional)
        └─ resume from existing UAT file if session exists
    ↓ Step 9: complete_session
        └─ commit UAT file, show summary
        └─ if issues > 0 → diagnose_issues
    ↓ Step 10: diagnose_issues (conditional)
        └─ spawns diagnose-issues workflow
        └─ parallel debug agents investigate each issue
    ↓ Step 11: plan_gap_closure (conditional)
        └─ spawns gsd-planner in gap_closure mode
    ↓ Step 12: verify_gap_plans (conditional)
        └─ spawns gsd-plan-checker to verify fix plans
    ↓ Step 13: revision_loop (conditional)
        └─ iterate planner/checker up to 3 times
    ↓ Step 14: present_ready
        └─ display completion summary, next steps
```

## Steps Chi Tiet

### Step 1: initialize

**Muc dich:** Khoi tao context cho verify-work, lay phase number tu arguments

**Hanh dong:**
- Chay bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init verify-work "${PHASE_ARG}"`
- Parse JSON tra ve: `planner_model`, `checker_model`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `has_verification`

**Gate:**
- Pass khi: Phase arguments hop le, phase ton tai trong .planning
- Fail khi: Phase khong ton tai → bao loi, yeu cau nhap lai

**Output buoc nay:** JSON config stored in memory

---

### Step 2: check_active_session

**Muc dich:** Kiem tra xem co UAT session dangactive khong, cho phep resume hoac tao moi

**Hanh dong:**
- Chay bash: `find .planning/phases -name "*-UAT.md" -type f`
- Doc frontmatter cua moi file: status, phase, Current Test
- Hien thi table cac sessions active

**Gate:**
- Pass khi: Neu co session + co $ARGUMENTS → kiem tra session cho phase do
- Fail khi: Khong co session + khong co $ARGUMENTS → yeu cau nhap phase number

**Output buoc nay:** None (in-memory check)

---

### Step 3: find_summaries

**Muc dich:** Tim cac SUMMARY.md files cua phase de extract deliverables

**Hanh dong:**
- Chay bash: `ls "$phase_dir"/*-SUMMARY.md`
- Doc moi SUMMARY.md de extract testable deliverables

**Gate:**
- Pass khi: Tim thay SUMMARY files
- Fail khi: Khong tim thay → bao loi, chi ra phase khong co deliverables

**Output buoc nay:** Files loaded for extraction

---

### Step 4: extract_tests

**Muc dich:** Parse deliverables tu SUMMARY.md thanh cac testable items

**Hanh dong:**
- Parse mo i SUMMARY.md:
  - **Accomplishments** → features/functionality added
  - **User-facing changes** → UI, workflows, interactions
- Tao test voi: name, expected (observable behavior)

**Cold-start smoke test injection:**
- Sau khi extract tests, scan paths trong SUMMARY
- Neu co match voi: `server.ts`, `server.js`, `app.ts`, `app.js`, `index.ts`, `index.js`, `main.ts`, `main.js`, `database/*`, `db/*`, `seed/*`, `seeds/*`, `migrations/*`, `startup*`, `docker-compose*`, `Dockerfile*`
- Prepend test "Cold Start Smoke Test" vao list

**Gate:**
- Pass khi: Co it nhat 1 deliverable
- Fail khi: Khong co deliverables → bao loi

**Output buoc nay:** Test list in memory

---

### Step 5: create_uat_file

**Muc dich:** Tao file UAT voi tat ca tests

**Hanh dong:**
- Chay bash: `mkdir -p "$PHASE_DIR"`
- Create file: `.planning/phases/XX-name/{phase_num}-UAT.md`
- Template: `templates/UAT.md`
- Content: Frontmatter, Current Test, Tests section, Summary, Gaps

**Gate:**
- Pass khi: Directory tao thanh cong
- Fail khi: Write error → retry

**Output buoc nay:** `.planning/phases/{phase}/{phase_num}-UAT.md`

---

### Step 6: present_test

**Muc dich:** Hien thi test hien tai cho user va yeu cau xac nhan

**Hanh dong:**
- Doc Current Test section tu UAT file
- Hien thi su dung checkpoint box format:
  ```
  ╔══════════════════════════════════════════════════════════════╗
  ║  CHECKPOINT: Verification Required                           ║
  ╚══════════════════════════════════════════════════════════════╝
  ```
- Cho user nhap phan hoi (plain text)

**Gate:**
- Pass khi: User response duoc nhan
- Fail khi: Timeout → retry

**Output buoc nay:** None

---

### Step 7: process_response

**Muc dich:** Xu ly phan hoi cua user va cap nhat UAT file

**Hanh dong:**
- **Pass responses:** "yes", "y", "ok", "pass", "next", "approved", "✓", empty
  - Update test result: `pass`
- **Skip responses:** "skip", "can't test", "n/a"
  - Update test result: `skipped`, add reason
- **Issue responses:** Bat ki thu khac
  - Infer severity tu description:
    - blocker: crash, error, exception, fails, broken, unusable
    - major: doesn't work, wrong, missing, can't
    - minor: slow, weird, minor, small
    - cosmetic: color, font, spacing, alignment, visual
  - Update test result: `issue`, add reported + severity
  - Append to Gaps section (YAML format)

**Gate:**
- Pass khi: Xu ly thanh cong
- Fail khi: Parse error → default to major

**Output buoc nay:** Updated UAT file

---

### Step 8: resume_from_file

**Muc dich:** Resume testing tu UAT file cu (sau /clear)

**Hanh dong:**
- Doc full UAT file
- Find first test voi `result: [pending]`
- Announce: "Resuming: Phase {phase} UAT, Progress: {passed+issues+skipped}/{total}"
- Update Current Test section

**Gate:**
- Pass khi: Tim duoc pending test
- Fail khi: Khong co pending → go to complete_session

**Output buoc nay:** Updated Current Test

---

### Step 9: complete_session

**Muc dich:** Hoan thanh testing session, commit UAT file

**Hanh dong:**
- Update frontmatter: `status: complete`
- Clear Current Test section → "[testing complete]"
- Commit: `node gsd-tools.cjs commit "test({phase_num}): complete UAT - {passed} passed, {issues} issues" --files ".planning/phases/XX-name/{phase_num}-UAT.md"`
- Display summary table

**Gate:**
- Pass khi: Commit thanh cong
- Fail khi: Commit error → retry

**Output buocnay:** Committed UAT file, if issues > 0 → diagnose_issues

---

### Step 10: diagnose_issues

**Muc dich:** Chan do nguyen nhan cua cac loi tim thay

**Hanh dong:**
- Load diagnose-issues workflow
- Spawn parallel debug agents (gsd-debugger) for each issue
- Collect root causes
- Update UAT.md Gaps section with root_cause, artifacts, missing, debug_session

**Gate:**
- Pass khi: Diagnosis thanh cong
- Fail khi: Some agents fail → report inconclusive

**Output buoc nay:** Updated UAT file with diagnosis

---

### Step 11: plan_gap_closure

**Muc dich:** Tu dong tao fix plans tu cac gaps da chan doan

**Hanh dong:**
- Spawn gsd-planner in gap_closure mode:
  ```
  Task(
    prompt="<planning_context>...",
    subagent_type="gsd-planner",
    model="{planner_model}",
    description="Plan gap fixes for Phase {phase}"
  )
  ```

**Gate:**
- Pass khi: Planner tao thanh cong plans
- Fail khi: Planner inconclusive → report, offer manual intervention

**Output buoc nay:** Created fix PLAN.md files

---

### Step 12: verify_gap_plans

**Muc dest:** Xac minh fix plans voi checker

**Hanh dong:**
- Spawn gsd-plan-checker:
  ```
  Task(
    prompt="<verification_context>...",
    subagent_type="gsd-plan-checker",
    model="{checker_model}",
    description="Verify Phase {phase} fix plans"
  )
  ```

**Gate:**
- Pass khi: Checker PASSED
- Fail khi: ISSUES FOUND → revision_loop

**Output buoc nay:** Verification result

---

### Step 13: revision_loop

**Muc dest:** Lap lai planner ↔ checker cho den khi plans pass (max 3)

**Hanh dong:**
- iteration_count < 3: Send back to planner with checker issues
- iteration_count >= 3: Stop, offer options:
  1. Force proceed
  2. Provide guidance (retry)
  3. Abandon (user runs /gsd:plan-phase manually)

**Gate:**
- Pass khi: iteration_count >= 3 hoac user chooses force
- Fail khi: 3 iterations without resolution

**Output buoc nay:** Revised or abandoned plans

---

### Step 14: present_ready

**Muc dest:** Hien thi ket qua va buoc tiep theo

**Hanh dong:**
- Display summary:
  - Phase name, gaps diagnosed, fix plans created
  - Table: Gap | Root Cause | Fix Plan
- Next steps:
  - `/clear` then `/gsd:execute-phase {phase} --gaps-only`

**Gate:** None - final step

**Output buoc nay:** Summary display, ready for execution

---

## Agents Duoc Go i

| Agent | Dieu kien goi | Files doc vao | Files tao ra |
|-------|---------------|----------------|------------|
| gsd-planner | Step 11 (plan_gap_closure) | UAT.md, STATE.md, ROADMAP.md | {phase}-N-PLAN.md |
| gsd-plan-checker | Step 12 (verify_gap_plans) | Plan.md files | Verification result |
| gsd-debugger | Step 10 (diagnose_issues) | UAT.md gaps | Root cause analysis |

## Files Duoc Tao Ra

| File | Noi dung | Template dung | Tao o Step |
|------|----------|--------------|------------|
| `.planning/phases/{phase}/{phase_num}-UAT.md` | UAT test tracking | templates/UAT.md | Step 5 |
| `.planning/phases/{phase}/{phase_num}-{N}-PLAN.md` | Gap fix plans | templates/plan.md | Step 11 |

## Dependencies

**Can chay truoc:** `/gsd:execute-phase` (tao SUMMARY.md files)
**Output duoc dung boi:** `/gsd:execute-phase --gaps-only` (doc fix plans)

## Issues Phat Hien

[verify-work.md:18] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/templates/UAT.md` — thay bang relative path hoac doc reference

[verify-work.md:27] — HARDCODED_PATH — `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs"` — thay bang relative path

[verify-work.md:309] — HARDCODED_PATH — `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" commit` — thay bang relative path

[verify-work.md:352] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/diagnose-issues.md` — thay bang relative path hoac doc reference

[verify-work.md:23-24] — HARDCODED_PATH — execution_context chi den `.claude/` (local), khong phai `gsd-template/` — inconsistent voi templates khac su dung absolute paths trong gsd-template

## Proposas Duoc Tao

Khong co proposals.