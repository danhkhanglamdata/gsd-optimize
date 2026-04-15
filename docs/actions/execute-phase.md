# /gsd:execute-phase
> Loại: Action Doc
> Tạo bởi: action-doc-writer
> Ngày: 2026-04-14
> Phiên bản gsd-template: 1.34.0 (từ flow doc)
> Trạng thái: Draft
> Nguồn command: `gsd-template/gsd/commands/gsd/execute-phase.md`
> Nguồn workflow: `gsd-template/gsd/get-shit-done/workflows/execute-phase.md`

## Mục đích

`/gsd:execute-phase` thực thi tất cả các plans trong một phase sử dụng wave-based parallel execution. Orchestrator điều phối - khám phá plans, phân tích dependencies, group thành waves, spawn subagents, thu thập kết quả. Mỗi subagent load full execute-plan context và xử lý plan của nó.

## Khi nào sử dụng

- **Sau khi chạy `/gsd:plan-phase N`** - de execute tat ca cac plans trong phase do
- **Gap closure cycle** - sau khi `/gsd:verify-work` tao fix plans, dung `--gaps-only` de chi execute gap closure plans
- **Khong nen dung khi** - chua co PLAN.md files trong phase directory, hoac phase chua duoc plan

---

## Input

### Arguments & Flags
| Flag | Mặc định | Mô tả | Thay đổi gì so với default |
|------|----------|-------|---------------------------|
| (none) | — | Chạy chế độ mặc định — execute tat ca incomplete plans trong phase | — |
| --gaps-only | — | Chi execute gap closure plans (plans voi `gap_closure: true` trong frontmatter) | Loc bo tat ca plans khong co gap_closure=true, chi tập trung vao viec close gaps từ VERIFICATION.md |
| --auto | — | Auto-advance to transition after verification passes | Sau khi verify xong (status: passed), tu dong chain sang transition workflow thay vi hỏi user |
| --no-transition | — | Skip transition workflow | Khong thực hiện transition, chi tra ve completion status. Dùng khi execute-phase duoc spawn boi plan-phase auto-advance de tranh double-advance |

### Điều kiện tiên quyết
- [ ] Phase da duoc plan (ton tai PLAN.md files trong `.planning/phases/{phase_dir}/`)
- [ ] Phase number hop le (format: X hoac X.Y)
- [ ] STATE.md va ROADMAP.md ton tai

### Files phải có trước khi chạy
| File | Mô tả | Tạo bởi |
|------|-------|---------|
| `.planning/ROADMAP.md` | Roadmap chinh - chứa phase goal | `/gsd:new-project` hoac `/gsd:plan-phase` |
| `.planning/STATE.md` | State tracking - chứa current phase | `/gsd:new-project` |
| `.planning/phases/{phase}/` | Phase directory chứa PLAN.md files | `/gsd:plan-phase` |

---

## Quy trình (Step-by-Step)

### Bước 1: initialize
**Mục đích:** Load toan bo context cho phase execution trong mot lan goi.

**Hành động cụ thể:**
- Chạy bash: `node gsd-tools.cjs init execute-phase "${PHASE_ARG}"`
- Parse JSON tra ve: `executor_model`, `verifier_model`, `commit_docs`, `parallelization`, `branching_strategy`, `branch_name`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `plans`, `incomplete_plans`, `plan_count`, `incomplete_count`, `state_exists`, `roadmap_exists`, `phase_req_ids`
- Sync chain flag: neu khong co `--auto` → clear `_auto_chain_active`

**Gate:**
- Pass: `phase_found=true` VA `plan_count > 0`
- Fail: `phase_found=false` → "Phase not found" error
- Fail: `plan_count=0` → "No plans found" error

**Output bước này:** JSON context object (in memory)

---

### Bước 2: handle_branching
**Mục đích:** Xu ly git branching strategy duoc cau hinh.

**Hành động cụ thể:**
- Doc `branching_strategy` tu init JSON
- Neu "none" → skip
- Neu "phase" hoac "milestone" → chạy: `git checkout -b "$BRANCH_NAME"` hoac `git checkout "$BRANCH_NAME"`

**Gate:**
- Pass: Branch ton tai hoac duoc tao thanh cong
- Fail: Git command fails → user xu ly

**Output bước này:** Git branch state

---

### Bước 3: validate_phase
**Mục đích:** Bao cao so luong plans duoc tim thay.

**Hành động cụ thể:**
- Doc `phase_dir`, `plan_count`, `incomplete_count` tu init JSON
- Report: "Found {plan_count} plans in {phase_dir} ({incomplete_count} incomplete)"

**Gate:** None — chi reporting

**Output bước này:** Terminal output

---

### Bước 4: discover_and_group_plans
**Mục đích:** Load plan inventory voi wave grouping.

**Hành động cụ thể:**
- Chạy bash: `node gsd-tools.cjs phase-plan-index "${PHASE_NUMBER}"`
- Parse JSON cho: `phase`, `plans[]` (voi id, wave, autonomous, objective, files_modified, task_count, has_summary), `waves` (map wave → plan IDs), `incomplete`, `has_checkpoints`
- **Filtering:**
  - Skip plans voi `has_summary: true`
  - Neu `--gaps-only`: skip non-gap_closure plans
  - Neu tat ca filtered → "No matching incomplete plans" → exit

**Gate:**
- Pass: Co incomplete plans de execute
- Fail: Khong co plans sau filtering

**Output bước này:** JSON voi wave grouping

---

### Bước 5: execute_waves
**Mục đích:** Core execution - spawn executor agents cho moi wave.

**Hành động cụ thể:**

1. **Describe what's being built (truoc khi spawn):**
   - Doc moi plan's `<objective>`
   - Extract what va why dang duoc build
   - Format ASCII block voi mo ta chi tiet

2. **Spawn executor agents (Task tool):**
   - Pass paths only — executors read files themselves voi fresh 200k context
   - Spawn `gsd-executor` voi model tu `executor_model`
   - Files_to_read:
     - `{phase_dir}/{plan_file}` (Plan)
     - `.planning/STATE.md` (State)
     - `.planning/config.json` (Config, neu exists)
     - `./CLAUDE.md` (Project instructions, neu exists)
     - `.claude/skills/` hoac `.agents/skills/` (Project skills, neu exists)

3. **Wait for all agents in wave to complete.**

4. **Report completion — spot-check claims first:**
   - Verify first 2 files tu `key-files.created` exist on disk
   - Check `git log --oneline --all --grep="{phase}-{plan}"` returns ≥1 commit
   - Check for `## Self-Check: FAILED` marker
   - If ANY spot-check fails → report failure, route to failure handler

5. **Handle failures:**
   - Neu error chua `classifyHandoffIfNeeded is not defined` → day la Claude Code bug, khong phai GSD issue. Run spot-checks. If pass → treat as success.
   - For real failures: report which plan failed → ask "Continue?" hoac "Stop?"

6. **Execute checkpoint plans between waves** — xem `checkpoint_handling`

7. **Proceed to next wave.**

**Gate:**
- Pass: Tat ca plans trong wave complete voi spot-checks passing
- Fail: Spot-check fails hoac agent reports real failure → ask user

**Output bước này:** SUMMARY.md files cho moi plan

---

### Bước 6: checkpoint_handling
**Mục đích:** Xu ly checkpoint protocols cho autonomous:false plans.

**Hành động cụ thể:**

**Auto-mode checkpoint handling:**
- Doc auto-advance config:
  ```bash
  AUTO_CHAIN=$(node ... config-get workflow._auto_chain_active)
  AUTO_CFG=$(node ... config-get workflow.auto_advance)
  ```
- When executor returns checkpoint AND (`AUTO_CHAIN`="true" OR `AUTO_CFG`="true"):
  - **human-verify** → Auto-spawn voi `user_response="approved"`
  - **decision** → Auto-spawn voi first option
  - **human-action** → Present to user

**Standard flow:**
1. Spawn agent cho checkpoint plan
2. Agent runs until checkpoint task hoac auth gate
3. Agent return includes: completed tasks table, current task + blocker, checkpoint type/details
4. Present to user
5. User responds: "approved"/"done" | issue description | decision selection
6. Spawn continuation agent (NOT resume) su dung continuation-prompt.md
7. Continuation agent verifies previous commits, continues from resume point
8. Repeat until plan completes hoac user stops

**Gate:**
- Pass: Checkpoint resolved voi user response
- Fail: User stops hoac unresolvable

**Output bước này:** Continuation agent execution

---

### Bước 7: aggregate_results
**Mục đích:** Tong hop ket qua tu tat ca waves sau khi execution hoan tat.

**Hành động cụ thể:**
- Tao markdown table voi waves, plans, status
- Liet ke plan details tu SUMMARY.md
- Aggregate issues encountered

**Gate:** None — chi tong hop

**Output bước này:** Markdown aggregation output

---

### Bước 8: close_parent_artifacts
**Mục đích:** Resolve parent UAT va debug artifacts cho decimal phases (X.Y pattern).

**Hành động cụ thể:**
1. **Detect decimal phase:** Check neu `PHASE_NUMBER` chua decimal
2. **Find parent UAT:** `node gsd-tools.cjs find-phase "${PARENT_PHASE}" --raw`
3. **Update UAT gap statuses:** Doc parent UAT's `## Gaps` section, update `status: failed` → `status: resolved`
4. **Update UAT frontmatter:** Neu all gaps resolved → update status va timestamp
5. **Resolve debug sessions:** Update frontmatter, move to `.planning/debug/resolved/`
6. **Commit updated artifacts:** `gsd-tools.cjs commit "docs(phase-${PARENT_PHASE}): resolve UAT gaps..."`

**Gate:**
- Pass: Phase number khong co decimal → skip step nay
- Pass: Parent UAT found va updated
- Fail: Parent UAT not found → skip (gap-closure co the tu VERIFICATION.md)

**Output bước này:** Updated UAT files, committed to git

---

### Bước 9: verify_phase_goal
**Mục đích:** Verify phase achieved its GOAL, khong chi completed tasks.

**Hành động cụ thể:**
- Spawn `gsd-verifier` agent voi model tu `verifier_model`
- Verify context: phase directory, phase goal tu ROADMAP.md, requirement IDs
- Create VERIFICATION.md

**Doc status:**
```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

| Status | Action |
|--------|--------|
| `passed` | → update_roadmap |
| `human_needed` | Present items for human testing |
| `gaps_found` | Present gap summary, offer `/gsd:plan-phase {phase} --gaps` |

**Gate:**
- Pass: `status: passed`
- Fail: `status: gaps_found` → present gap closure path

**Output bước này:** `{phase_num}-VERIFICATION.md`

---

### Bước 10: update_roadmap
**Mục đích:** Mark phase complete va update tat ca tracking files.

**Hành động cụ thể:**
- Chạy: `node gsd-tools.cjs phase complete "${PHASE_NUMBER}"`
- CLI handles:
  - Mark phase checkbox `[x]` voi completion date
  - Update Progress table (Status → Complete, date)
  - Update plan count to final
  - Advance STATE.md to next phase
  - Update REQUIREMENTS.md traceability
- Extract: `next_phase`, `next_phase_name`, `is_last_phase`
- Commit: `gsd-tools.cjs commit "docs(phase-{X}): complete phase execution"`

**Gate:** None — always completes

**Output bước này:** Updated ROADMAP.md, STATE.md, REQUIREMENTS.md

---

### Bước 11: offer_next
**Mục đích:** Route den buoc tiep theo hoac present options cho user.

**Hành động cụ thể:**

**Exception:** Neu `gaps_found`, verify_phase_goal da present gap-closure path. Skip auto-advance.

**No-transition check:**
- Parse `--no-transition` flag tu $ARGUMENTS
- Neu present: Do NOT run transition.md. Return completion status. STOP.

**Auto-advance detection:**
1. Parse `--auto` flag
2. Doc chain flag va user preference:
   ```bash
   AUTO_CHAIN=$(node ... config-get workflow._auto_chain_active)
   AUTO_CFG=$(node ... config-get workflow.auto_advance)
   ```

**If `--auto` present OR `AUTO_CHAIN` is true OR `AUTO_CFG` is true (AND verification passed with no gaps):**
- Display: "AUTO-ADVANCING → TRANSITION"
- Execute transition workflow inline voi `--auto` flag
- Doc va follow transition.md workflow

**If none of above is true:**
- STOP. Do not auto-advance. Present user options:
  ```
  ## ✓ Phase {X}: {Name} Complete

  /gsd:progress — see updated roadmap
  /gsd:transition — plan next phase transition
  /gsd:execute-phase {next} — execute next phase
  ```

**Gate:**
- Pass: User responds voi next action
- Fail: User khong respond → wait

**Output bước này:** Routing decision + transition execution (neu auto)

---

## Output

### Files được tạo mới
| File | Mô tả | Template dùng | Format |
|------|-------|---------------|--------|
| `.planning/phases/{dir}/{phase}-{plan}-SUMMARY.md` | Plan execution summary voi deviations, metrics | `templates/summary.md` | Markdown voi frontmatter |
| `.planning/phases/{dir}/{phase_num}-VERIFICATION.md` | Phase goal verification report | `templates/verification-report.md` | Markdown voi status field |

### Files được cập nhật
| File | Thay đổi gì |
|------|------------|
| `.planning/ROADMAP.md` | Mark phase checkbox [x] voi completion date, update Progress table |
| `.planning/STATE.md` | Advance current phase to next phase |
| `.planning/REQUIREMENTS.md` | Update traceability |

### Side Effects
- Git commits: Tat ca plans commit during execution; phase complete commit; UAT gap resolution commit (neu decimal phase)
- Khong auto-commit mac dinh — commit_docs config chi dinh khi nao commit

---

## Agents Được Gọi

| Agent | Khi nào | Làm gì | Output |
|-------|---------|--------|--------|
| `gsd-executor.md` | Step 5: execute_waves — moi plan trong wave | Load PLAN.md, STATE.md, execute plan tasks, create files, commit | `{phase}-{plan}-SUMMARY.md` |
| `gsd-verifier.md` | Step 9: verify_phase_goal | Doc ROADMAP.md goal, PLAN.md requirements, verify all tasks completed | `{phase_num}-VERIFICATION.md` |

---

## Liên kết với các Commands khác

**Phải chạy trước:** `/gsd:plan-phase N` — can cac PLAN.md files trong phase directory
**Thường chạy sau:** `/gsd:verify-work N` — doc VERIFICATION.md; `/gsd:transition` — plan next phase transition
**Liên quan:** `/gsd:plan-phase N --gaps` — tao gap closure plans; `/gsd:execute-phase N --gaps-only` — chi execute gap plans

---

## Ví dụ Thực tế

### Ví dụ 1: Default execution
```
Scenario: User da chay plan-phase 1 xong, muon execute tat ca plans trong phase 1

Lệnh: /gsd:execute-phase 1

Kết quả:
- Discover tat ca incomplete plans trong phase 1
- Group into waves theo dependencies
- Spawn gsd-executor cho moi plan (song song theo wave)
- Create SUMMARY.md cho moi plan
- Spawn gsd-verifier de verify phase goal
- Create 1-VERIFICATION.md
- Update ROADMAP.md, STATE.md
- Present user options: /gsd:progress, /gsd:transition, /gsd:execute-phase 2
```

### Ví dụ 2: Gap closure execution
```
Scenario: User da chay verify-work 1, phat hien gaps, da chay plan-phase 1 --gaps de tao gap closure plans

Lệnh: /gsd:execute-phase 1 --gaps-only

Kết quả:
- Chi discover plans voi gap_closure: true trong frontmatter
- Skip tat ca regular plans
- Execute gap plans theo wave
- Verify goal (neu tat ca gaps resolved → status: passed)
- Auto-present gap closure status
```

### Ví dụ 3: Auto-advance chain
```
Scenario: User dang trong auto-advance chain tu new-project, da complete discuss-phase va plan-phase

Lệnh: /gsd:execute-phase 1 --auto

Kết quả:
- Execute phase nhu binh thuong
- Sau khi verify (status: passed), kiem tra auto_advance config
- Neu AUTO_CHAIN=true hoac AUTO_CFG=true → auto-advance to transition
- Chay transition workflow voi --auto flag
- Transition auto-chains sang discuss-phase 2 --auto
```

---

## Issues Phát Hiện

[workflows/execute-phase.md:19] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bang relative path hoac environment variable

[workflows/execute-phase.md:35] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bang relative path

[workflows/execute-phase.md:63] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bang relative path

[workflows/execute-phase.md:122-125] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/execute-plan.md` va cac references — thay bang relative paths

[workflows/execute-phase.md:193-194] — HARDCODED_PATH — config-get commands — thay bang relative path

[workflows/execute-phase.md:269] — HARDCODED_PATH — find-phase command — thay bang relative path

[workflows/execute-phase.md:300] — HARDCODED_PATH — commit command — thay bang relative path

[workflows/execute-phase.md:371] — HARDCODED_PATH — phase complete command — thay bang relative path

[workflows/execute-phase.md:384] — HARDCODED_PATH — commit command — thay bang relative path

[workflows/execute-phase.md:420-421] — HARDCODED_PATH — config-get commands — thay bang relative path

[workflows/execute-phase.md:435] — HARDCODED_PATH — transition.md path — thay bang relative path

[agents/gsd-executor.md:80] — HARDCODED_PATH — init execute-phase command — thay bang relative path

[agents/gsd-executor.md:244-245] — HARDCODED_PATH — config-get commands — thay bang relative path

[agents/gsd-executor.md:258] — HARDCODED_PATH — checkpoints.md reference — thay bang relative path

[agents/gsd-executor.md:383] — HARDCODED_PATH — summary.md template reference — thay bang relative path

[agents/gsd-executor.md:436-464] — HARDCODED_PATH — multiple gsd-tools.cjs commands — thay bang relative path

[agents/gsd-executor.md:487] — HARDCODED_PATH — commit command — thay bang relative path

[agents/gsd-verifier.md:81] — HARDCODED_PATH — roadmap get-phase command — thay bang relative path

[agents/gsd-verifier.md:118] — HARDCODED_PATH — roadmap get-phase command — thay bang relative path

[agents/gsd-verifier.md:161] — HARDCODED_PATH — verify artifacts command — thay bang relative path

[agents/gsd-verifier.md:210] — HARDCODED_PATH — verify key-links command — thay bang relative path

[agents/gsd-verifier.md:292] — HARDCODED_PATH — summary-extract command — thay bang relative path

[agents/gsd-verifier.md:297] — HARDCODED_PATH — verify commits command — thay bang relative path

## Proposals Được Tạo

Khong co proposals — tat ca issues la hardcoded paths lien quan den workflow files duoc documented trong component-flow doc.

---

## Ghi chú Kỹ thuật

1. **Wave-based parallelization:** Tat ca plans trong cung mot wave execute song song. Plans trong wave tiep theo chi bat dau sau khi wave hien tai hoan tat.

2. **Spot-check verification:** Sau moi plan complete, execute-phase chay spot-checks tren 2 files dau tien duoc claim la tao ra + git log grep + FAILED marker check. Day la verification mac dinh, khong phai self-check tu executor.

3. **Checkpoint protocol:** Plans voi `autonomous: false` se trigger checkpoint handling. Trong auto-mode (AUTO_CHAIN=true hoac AUTO_CFG=true), checkpoint duoc resolve tu dong; trong manual mode, user duoc hoi.

4. **Decimal phase handling:** Neu phase number co decimal (vd: 1.1), execute-phase se tim parent UAT va update gap statuses. Day ho tro milestone-based development.

5. **Branch naming:** Branch duoc tao theo `branching_strategy` trong config.json - "none" (skip), "phase" (branch per phase), hoac "milestone" (branch per milestone).

---

## Completeness Checklist

```
[ ] FLAGS: Đếm flags trong source = 3. Đếm flags đã document = 3. Hai số phải bằng nhau.

[ ] STEPS: Xác định format workflow: Format A (<step> blocks).
           Đếm bước trong source = 11. Đếm "Bước" sections trong output = 11. Hai số phải bằng nhau.

[ ] GATES: Mỗi bước có gate → mỗi gate có cả Pass condition VÀ Fail behavior.
           Không chấp nhận gate chỉ có "if error → stop" mà không nói xử lý thế nào.

[ ] OUTPUT FILES: Mỗi file được tạo ra có đủ 4 cột: path, mô tả nội dung, template dùng, tạo ở step nào.

[ ] EXAMPLES: Có ít nhất 2 ví dụ — 1 default flow, 1 với flag.
              Mỗi ví dụ có: scenario context, lệnh chạy, kết quả cụ thể.

[ ] ISSUES: Mỗi issue có format: [file:dòng] — [loại] — [mô tả] — [đề xuất].
            Không có issues chung chung như "có vấn đề với paths".

[ ] SELF-TEST: Đọc lại toàn bộ doc với câu hỏi:
    "Nếu tôi là AI agent chưa từng thấy gsd-template/, tôi có thể chạy
     command này chính xác chỉ từ doc này không?"
    Nếu NO → bổ sung thông tin còn thiếu.
```