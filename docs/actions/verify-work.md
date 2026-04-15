# /gsd:verify-work
> Loại: Action Doc
> Tạo bởi: action-doc-writer
> Ngày: 2026-04-14
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Draft
> Nguồn command: `gsd-template/gsd/commands/gsd/verify-work.md`
> Nguồn workflow: `gsd-template/gsd/commands/gsd/verify-work.md`

## Mục đích
Xác nhận feature xây dựng trong execute-phase hoạt động đúng từ góc nhìn của user. Command chạy UAT (User Acceptance Testing) tương tác — trình bày từng test, chờ user xác nhận hoặc mô tả vấn đề. Nếu có lỗi, tự động chẩn đoán nguyên nhân và tạo fix plans sẵn sàng cho execute-phase --gaps-only.

## Khi nào sử dụng
- Sau khi `/gsd:execute-phase N` hoàn thành, xác nhận features hoạt động đúng mong đợi
- Khi cần kiểm tra user-facing functionality (không phải unit tests)
- Khi muốn session kiểm tra tồn tại qua /clear và có thể resume
- Khi muốn tự động chẩn đoán và lên kế hoạch sửa lỗi mà không cần tự debug thủ công

**Không nên dùng khi:**
- Chỉ cần automated verification (dùng `/gsd:execute-phase` với built-in verifier)
- Phase chưa có SUMMARY.md (chưa execute)
- Cần kiểm tra nhanh code có compile không

---

## Input

### Arguments & Flags
| Flag | Mặc định | Mô tả | Thay đổi gì so với default |
|------|----------|-------|---------------------------|
| (none) | — | Chạy chế độ mặc định, hỏi phase number nếu chưa có | — |
| $ARGUMENTS | — | Phase number (ví dụ: "4", "05-auth") | Nếu cung cap: chạy UAT cho phase do; Neu khong: hoi hoac hien thi active sessions |

### Điều kiện tiên quyết
- [ ] Phase da duoc execute (co SUMMARY.md files trong `.planning/phases/XX-name/`)
- [ ] `.planning/STATE.md` ton tai (tao boi new-project)

### Files phải có trước khi chạy
| File | Mô tả | Tạo bởi |
|------|-------|---------|
| `.planning/STATE.md` | Project state | `/gsd:new-project` |
| `.planning/ROADMAP.md` | Project roadmap | `/gsd:new-project` |
| `.planning/phases/XX-name/*-SUMMARY.md` | Deliverables tu execute-phase | `/gsd:execute-phase` |

---

## Quy trình (Step-by-Step)

### Bước 1: initialize
**Mục đích:** Khoi tao context cho verify-work, lay phase number tu arguments

**Hành động cụ thể:**
Chay `gsd-tools.cjs init verify-work` de lay JSON chua: `planner_model`, `checker_model`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `has_verification`.

**Gate:**
- Pass: Phase arguments hop le, phase ton tai trong .planning
- Fail: Phase khong ton tai → bao loi, yeu cau nhap lai

**Output bước này:** JSON config stored in memory

---

### Bước 2: check_active_session
**Mục đích:** Kiem tra co UAT session dang active khong, cho phep resume hoac tao moi

**Hành động cụ thể:**
Tim tat ca `.planning/phases/-name "*-UAT.md"`. Doc frontmatter (status, phase) va Current Test section. Hien thi table active sessions neu co.

**Gate:**
- Pass: Co session + co $ARGUMENTS → kiem tra session cho phase do
- Fail: Khong co session + khong co $ARGUMENTS → yeu cau nhap phase number

**Output bước này:** Hien thi table cac sessions hoac prompt

---

### Bước 3: find_summaries
**Mục đích:** Tim cac SUMMARY.md files cua phase de extract deliverables

**Hành động cụ thể:**
`ls "$phase_dir"/*-SUMMARY.md` de tim tap tin. Doc moi SUMMARY.md de extract testable deliverables.

**Gate:**
- Pass: Tim thay SUMMARY files
- Fail: Khong tim thay → bao loi, chi ra phase khong co deliverables

**Output bước này:** Files loaded for extraction

---

### Bước 4: extract_tests
**Mục đích:** Parse deliverables tu SUMMARY.md thanh cac testable items

**Hành động cụ thể:**
Parse moi SUMMARY.md:
- **Accomplishments** → features/functionality added
- **User-facing changes** → UI, workflows, interactions
Tao test voi: name, expected (observable behavior).

**Cold-start smoke test injection:**
Sau khi extract, scan paths trong SUMMARY. Neu co match voi `server.ts`, `server.js`, `app.ts`, `app.js`, `index.ts`, `index.js`, `main.ts`, `main.js`, `database/*`, `db/*`, `seed/*`, `seeds/*`, `migrations/*`, `startup*`, `docker-compose*`, `Dockerfile*` → prepend test "Cold Start Smoke Test" vao list.

**Gate:**
- Pass: Co it nhat 1 deliverable
- Fail: Khong co deliverables → bao loi

**Output bước này:** Test list in memory

---

### Bước 5: create_uat_file
**Mục đích:** Tao file UAT voi tat ca tests

**Hành động cụ thể:**
`mkdir -p "$PHASE_DIR"`. Tao file `.planning/phases/XX-name/{phase_num}-UAT.md` theo template UAT.md. Content: Frontmatter (status: testing), Current Test, Tests section, Summary, Gaps.

**Gate:**
- Pass: Directory tao thanh cong
- Fail: Write error → retry

**Output bước này:** `.planning/phases/{phase}/{phase_num}-UAT.md`

---

### Bước 6: present_test
**Mục đích:** Hien thi test hien tai cho user va yeu cau xac nhan

**Hành động cụ thể:**
Doc Current Test section tu UAT file. Hien thi checkpoint box:
```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Verification Required                           ║
╚══════════════════════════════════════════════════════════════╝

**Test {number}: {name}**

{expected}

───────────────────────────────────────────────────────────────
→ Type "pass" or describe what's wrong
───────────────────────────────────────────────────────────────
```
Cho user nhap phan hoi (plain text).

**Gate:**
- Pass: User response duoc nhan
- Fail: Timeout → retry

**Output bước này:** None

---

### Bước 7: process_response
**Mục đích:** Xu ly phan hoi cua user va cap nhat UAT file

**Hành động cụ thể:**
- **Pass responses:** "yes", "y", "ok", "pass", "next", "approved", "✓", empty → Update `result: pass`
- **Skip responses:** "skip", "can't test", "n/a" → Update `result: skipped`, add reason
- **Issue responses:** Bat ki thu khac → Update `result: issue`, add `reported` (verbatim user response), infer severity:
  - blocker: crash, error, exception, fails, broken, unusable
  - major: doesn't work, wrong, missing, can't
  - minor: slow, weird, off, minor, small
  - cosmetic: color, font, spacing, alignment, visual
  - Default: major

Append to Gaps section (YAML format). Update Summary counts, frontmatter.updated.

**Gate:**
- Pass: Xu ly thanh cong
- Fail: Parse error → default to major

**Output bước này:** Updated UAT file

---

### Bước 8: resume_from_file (conditional)
**Mục đích:** Resume testing tu UAT file cu (sau /clear)

**Hành động cụ thể:**
Doc full UAT file. Find first test voi `result: [pending]`. Announce progress. Update Current Test section.

**Gate:**
- Pass: Tim duoc pending test → proceed to present_test
- Fail: Khong co pending → go to complete_session

**Output bước này:** Updated Current Test

---

### Bước 9: complete_session
**Mục đích:** Hoan thanh testing session, commit UAT file

**Hành động cụ thể:**
Update frontmatter: `status: complete`, `updated`. Clear Current Test → "[testing complete]". Commit: `gsd-tools.cjs commit` voi message "test({phase_num}): complete UAT - {passed} passed, {issues} issues". Display summary table.

**Gate:**
- Pass: Commit thanh cong
- Fail: Commit error → retry

**Output bước này:** Committed UAT file
- If issues > 0: Proceed to diagnose_issues
- If issues == 0: Display completion summary

---

### Bước 10: diagnose_issues (conditional - chi khi issues > 0)
**Mục đích:** Chan do nguyen nhan cua cac loi tim thay

**Hành động cụ thể:**
Load diagnose-issues workflow. Spawn parallel debug agents (gsd-debugger) for each issue. Collect root causes. Update UAT.md Gaps section with `root_cause`, `artifacts`, `missing`, `debug_session`.

**Gate:**
- Pass: Diagnosis thanh cong
- Fail: Some agents fail → report inconclusive

**Output bước này:** Updated UAT file with diagnosis

---

### Bước 11: plan_gap_closure (conditional - chi khi issues > 0)
**Mục đích:** Tu dong tao fix plans tu cac gaps da chan doan

**Hành động cụ thể:**
Spawn gsd-planner in gap_closure mode:
- Doc: UAT.md (with diagnoses), STATE.md, ROADMAP.md
- Mode: gap_closure
- Plan tasks close diagnosed gaps

**Gate:**
- Pass: Planner tao thanh cong plans
- Fail: Planner inconclusive → report, offer manual intervention

**Output bước này:** Created fix PLAN.md files

---

### Bước 12: verify_gap_plans (conditional - chi khi issues > 0)
**Mục đích:** Xac minh fix plans voi checker

**Hành động cụ thể:**
Spawn gsd-plan-checker:
- Doc: *-PLAN.md files
- Verify plans achieve gap closure
- iteration_count = 1

**Gate:**
- Pass: Checker PASSED → proceed to present_ready
- Fail: ISSUES FOUND → revision_loop

**Output bước này:** Verification result

---

### Bước 13: revision_loop (conditional - chi khi verify failed)
**Mục đích:** Lap lai planner ↔ checker cho den khi plans pass (max 3)

**Hành động cụ thể:**
**If iteration_count < 3:**
- Send back to planner with checker issues
- Increment iteration_count → re-verify

**If iteration_count >= 3:**
Offer options:
1. Force proceed (execute despite issues)
2. Provide guidance (retry with direction)
3. Abandon (exit, user runs /gsd:plan-phase manually)

**Gate:**
- Pass: iteration_count >= 3 hoac user chooses force
- Fail: 3 iterations without resolution → stop, offer options

**Output bước này:** Revised or abandoned plans

---

### Bước 14: present_ready
**Mục đích:** Hien thi ket qua va buoc tiep theo

**Hành động cụ thể:**
Display summary: Phase name, gaps diagnosed, fix plans created. Table: Gap | Root Cause | Fix Plan. Next steps: `/clear` then `/gsd:execute-phase {phase} --gaps-only`.

**Gate:** None - final step

**Output bước này:** Summary display

---

## Output

### Files được tạo mới
| File | Mô tả | Template dùng | Format |
|------|-------|---------------|--------|
| `.planning/phases/XX-name/{phase_num}-UAT.md` | UAT test tracking, persistent across sessions | `templates/UAT.md` | MD with frontmatter, Current Test, Tests, Summary, Gaps sections |
| `.planning/phases/XX-name/{phase_num}-{N}-PLAN.md` | Gap fix plans (chi khi co issues) | `templates/plan.md` | MD XML structure |

### Files được cập nhật
| File | Thay đổi gì |
|------|------------|
| `.planning/phases/XX-name/{phase_num}-UAT.md` | Cap nhat status, results, severity, gaps |
| Git commit | Commit UAT file khi session complete |

### Side Effects
- Git commit tu dong: "test({phase_num}): complete UAT - {passed} passed, {issues} issues" cho file `.planning/phases/XX-name/{phase_num}-UAT.md`
- Khi co issues: Spawn gsd-planner, gsd-plan-checker, gsd-debugger (parallel)

---

## Agents Được Gọi

| Agent | Khi nào | Làm gì | Output |
|-------|---------|--------|--------|
| `gsd-debugger` | Step 10 (diagnose_issues) | Song song chan do nguyen nhan moi issue | Root cause analysis trong UAT.md |
| `gsd-planner` | Step 11 (plan_gap_closure) | Tao fix plans tu diagnosed gaps | `{phase}-{N}-PLAN.md` files |
| `gsd-plan-checker` | Step 12 (verify_gap_plans) | Xac minh fix plans | Verification result (PASS/ISSUES FOUND) |

---

## Liên kết với các Commands khác

**Phải chạy trước:** `/gsd:execute-phase N` (tao SUMMARY.md files chua deliverables)
**Thường chạy sau:** `/gsd:execute-phase N --gaps-only` (chay cac fix plans)
**Liên quan:**
- `/gsd:plan-phase --gaps` (neu user tu chan doan thay ve auto-diagnosis)
- `/gsd:ui-review N` (neu can kiem tra visual quality)

---

## Ví dụ Thực tế

### Ví dụ 1: Testing hoàn thành, không có issues
```
[Scenario: User da chạy execute-phase 4, can xác nhận features hoạt động]

Lệnh: /gsd:verify-work 4

Kết quả:
- Hien thi test 1/6: "Cold Start Smoke Test" → "pass"
- Hien thi test 2/6: "Reply to Comment" → "pass"
- ...
- Test 6/6: "Edit Comment" → "pass"
- [All tests passed]
- Commit: "test(04): complete UAT - 6 passed, 0 issues"
- Ready to continue.
```

### Ví dụ 2: Testing phát hiện issues, auto-diagnosis va fix plans
```
[Scenario: User phát hiện issues trong testing]

Lệnh: /gsd:verify-work 4

Kết quả:
- Test 2/4: "Login Form" → "tôi nhập email nhưng không hiển thị gì, nút login không hoạt động"
- [Issue logged: severity=major, reason="User reported: tôi nhập email..."]
- Continue...
- Session complete: 2 passed, 1 issue, 1 skipped
- [Auto-diagnosis spawns]
- [Gap closure planning]
- [Verification]
- Phase 04: 1 gap(s) diagnosed, 1 fix plan(s) created
| Gap | Root Cause | Fix Plan |
|-----|------------|----------|
| Login form not working | JavaScript event not attached | 04-01 |

Next: `/clear` then `/gsd:execute-phase 4 --gaps-only`
```

---

## Issues Phát Hiện

`[verify-work.md:27] — HARDCODED_PATH — node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" — thay bang relative path hoac doc reference` — dung command lookup hoac PATH environment variable

`[verify-work.md:309] — HARDCODED_PATH — node "...gsd-tools.cjs" commit — thay bang relative path` — commit command cung bi anh huong

`[verify-work.md:352] — HARDCODED_PATH — @...workflows/diagnose-issues.md — thay bang relative path hoac doc reference` — workflow reference

`[verify-work.md:23-24] — HARDCODED_PATH — execution_context chi den .claude/ (local), khong phai gsd-template/ — inconsistent voi templates khac su dung absolute paths trong gsd-template` — deprecation concern

## Proposals Được Tạo

Khong co proposals.

---

## Ghi chú Kỹ thuật

1. **UAT vs Verification:** verify-work la UAT (User Acceptance Testing) - user thu cong. execute-phase co built-in verifier - machine verification. Chi chay verify-work sau execute-phase.

2. **Session Persistence:** File UAT.md duoc commit sau moi test, neu /clear xay ra co the resume tu test cuoi cung.

3. **Cold-start Smoke Test:** Duoc inject tu dong khi co thay doi files khoi start-up (server.ts, database/*, etc). Catch bugs chi xuat hien tren fresh start.

4. **Severity Inference:** Khong hoi user "severity bao nhieu?" - tu infer tu description. User co the override neu can thiet.

5. **Revision Loop:** Planner ↔ Checker lap toi da 3 lan. Neu van khong pass sau 3 lan, offer 3 options: force proceed, provide guidance, hoac abandon.

6. **Gap Closure vs Manual Planning:** Gap closure mode doc tu UAT.md gaps (da chan doan). Neu can manual planning, chay `/gsd:plan-phase --gaps`.

---

## Completeness Checklist

- [ ] FLAGS: Source co 0 flags, document co 0 flags → MATCH
- [ ] STEPS: Source co 14 <step> blocks, document co 14 "Bước" sections → MATCH
- [ ] GATES: Moi buoc co Gate voi Pass condition VÀ Fail behavior → DONE
- [ ] OUTPUT FILES: Tat ca files co du 4 cot (path, mo ta, template, format) → DONE
- [ ] EXAMPLES: Co 2 vi du (1 default flow hoan thanh, 1 voi issues) → DONE
- [ ] ISSUES: Moi issue co format [file:line] — [type] — [mo ta] — [de xuat] → DONE
- [ ] SELF-TEST: AI co the chay command chi tu doc → DONE