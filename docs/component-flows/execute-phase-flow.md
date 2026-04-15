# /gsd:execute-phase — Flow Chain

> Loại: Flow Doc
> Tạo bởi: flow-tracer
> Ngày: 2026-04-14
> Phiên bản gsd-template: 1.34.0 (từ README.md)
> Trạng thái: Draft

## Tổng quan

`/gsd:execute-phase` thực thi tất cả các plans trong một phase sử dụng wave-based parallel execution. Orchestrator điều phối — khám phá plans, phân tích dependencies, group thành waves, spawn subagents, thu thập kết quả. Mỗi subagent load full execute-plan context và xử lý plan của nó.

**Khi nào dùng:** Sau khi chạy `/gsd:plan-phase` — để execute tất cả các plans trong phase đó.

**Output chính:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

## Flow Chain

```
gsd-template/gsd/commands/gsd/execute-phase.md
    ↓ loads workflow (via execution_context)
workflows/execute-phase.md  [Format A: <step> XML blocks, có 10 bước]
    ↓ Step 1: initialize
        └─ bash: gsd-tools.cjs init execute-phase → trả về config JSON
        └─ gate: phase_found=false → error, plan_count=0 → error
    ↓ Step 2: handle_branching
        └─ git checkout -b cho "phase" hoặc "milestone" strategy
    ↓ Step 3: validate_phase
        └─ report số lượng plans
    ↓ Step 4: discover_and_group_plans
        └─ bash: gsd-tools.cjs phase-plan-index → trả về wave grouping
        └─ filtering: --gaps-only flag, has_summary skip
    ↓ Step 5: execute_waves ← CORE LOGIC
        └─ Task(spawns): gsd-executor.md × N plans trong mỗi wave
        └─ parallel execution theo wave (PARALLELIZATION config)
        └─ spot-check: verify SUMMARY.md claims
        └─ gate: failure → ask user "Continue?" hoặc "Stop?"
    ↓ Step 6: checkpoint_handling
        └─ checkpoint protocol cho autonomous:false plans
        └─ auto-approve nếu AUTO_CHAIN hoặc AUTO_CFG = true
        └─ present checkpoint cho user nếu human-action type
    ↓ Step 7: aggregate_results
        └─ tổng hợp kết quả từ tất cả waves
    ↓ Step 8: close_parent_artifacts
        └─ chỉ cho decimal phases (X.Y pattern)
        └─ update parent UAT gap statuses
    ↓ Step 9: verify_phase_goal
        └─ Task(spawns): gsd-verifier.md để verify goal achievement
        └─ gate: status = passed | human_needed | gaps_found
    ↓ Step 10: update_roadmap
        └─ bash: gsd-tools.cjs phase complete → update ROADMAP.md, STATE.md
    ↓ Step 11: offer_next
        └─ routing: --auto flag → auto-advance to transition
        └─ routing: gaps_found → present gap closure path
        └─ routing: manual → present user options
```

## Steps Chi Tiết

### Step 1: initialize

**Mục đích:** Load toàn bộ context cho phase execution trong một lần gọi.

**Hành động:**
- Chạy bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE_ARG}"`
- Parse JSON cho: `executor_model`, `verifier_model`, `commit_docs`, `parallelization`, `branching_strategy`, `branch_name`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `plans`, `incomplete_plans`, `plan_count`, `incomplete_count`, `state_exists`, `roadmap_exists`, `phase_req_ids`
- Sync chain flag: nếu không có `--auto` → clear `_auto_chain_active`

**Gate:**
- Pass khi: `phase_found=true` VÀ `plan_count > 0`
- Fail khi: `phase_found=false` → "Phase not found" error
- Fail khi: `plan_count=0` → "No plans found" error

**Output bước này:** JSON context object (in memory)

---

### Step 2: handle_branching

**Mục đích:** Xử lý git branching strategy được cấu hình.

**Hành động:**
- Đọc `branching_strategy` từ init JSON
- Nếu "none" → skip
- Nếu "phase" hoặc "milestone" → chạy: `git checkout -b "$BRANCH_NAME"` hoặc `git checkout "$BRANCH_NAME"`

**Gate:**
- Pass khi: Branch tồn tại hoặc được tạo thành công
- Fail khi: Git command fails → user xử lý

**Output bước này:** Git branch state

---

### Step 3: validate_phase

**Mục đích:** Báo cáo số lượng plans được tìm thấy.

**Hành động:**
- Đọc `phase_dir`, `plan_count`, `incomplete_count` từ init JSON
- Report: "Found {plan_count} plans in {phase_dir} ({incomplete_count} incomplete)"

**Gate:** None — chỉ reporting

**Output bước này:** Terminal output

---

### Step 4: discover_and_group_plans

**Mục đích:** Load plan inventory với wave grouping.

**Hành động:**
- Chạy bash: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" phase-plan-index "${PHASE_NUMBER}"`
- Parse JSON cho: `phase`, `plans[]` (với id, wave, autonomous, objective, files_modified, task_count, has_summary), `waves` (map wave → plan IDs), `incomplete`, `has_checkpoints`
- **Filtering:**
  - Skip plans với `has_summary: true`
  - Nếu `--gaps-only`: skip non-gap_closure plans
  - Nếu tất cả filtered → "No matching incomplete plans" → exit

**Gate:**
- Pass khi: Có incomplete plans để execute
- Fail khi: Không có plans sau filtering

**Output bước này:** JSON với wave grouping

---

### Step 5: execute_waves

**Mục đích:** Core execution — spawn executor agents cho mỗi wave.

**Hành động:**

1. **Describe what's being built (trước khi spawn):**
   - Đọc mỗi plan's `<objective>`
   - Extract what và why đang được build
   - Format ASCII block với mô tả chi tiết

2. **Spawn executor agents (Task tool):**
   - Pass paths only — executors read files themselves với fresh 200k context
   - Spawn `gsd-executor` với model từ `executor_model`
   - Files_to_read:
     - `{phase_dir}/{plan_file}` (Plan)
     - `.planning/STATE.md` (State)
     - `.planning/config.json` (Config, nếu exists)
     - `./CLAUDE.md` (Project instructions, nếu exists)
     - `.claude/skills/` hoặc `.agents/skills/` (Project skills, nếu exists)

3. **Wait for all agents in wave to complete.**

4. **Report completion — spot-check claims first:**
   - Verify first 2 files từ `key-files.created` exist on disk
   - Check `git log --oneline --all --grep="{phase}-{plan}"` returns ≥1 commit
   - Check for `## Self-Check: FAILED` marker
   - If ANY spot-check fails → report failure, route to failure handler

5. **Handle failures:**
   - Nếu error chứa `classifyHandoffIfNeeded is not defined` → đây là Claude Code bug, không phải GSD issue. Run spot-checks. If pass → treat as success.
   - For real failures: report which plan failed → ask "Continue?" hoặc "Stop?"

6. **Execute checkpoint plans between waves** — xem `<checkpoint_handling>`

7. **Proceed to next wave.**

**Gate:**
- Pass khi: Tất cả plans trong wave complete với spot-checks passing
- Fail khi: Spot-check fails hoặc agent reports real failure → ask user

**Output bước này:** SUMMARY.md files cho mỗi plan

---

### Step 6: checkpoint_handling

**Mục đích:** Xử lý checkpoint protocols cho autonomous:false plans.

**Hành động:**

**Auto-mode checkpoint handling:**
- Đọc auto-advance config:
  ```bash
  AUTO_CHAIN=$(node "..." config-get workflow._auto_chain_active)
  AUTO_CFG=$(node "..." config-get workflow.auto_advance)
  ```
- When executor returns checkpoint AND (`AUTO_CHAIN`="true" OR `AUTO_CFG`="true"):
  - **human-verify** → Auto-spawn với `user_response="approved"`
  - **decision** → Auto-spawn với first option
  - **human-action** → Present to user

**Standard flow:**
1. Spawn agent cho checkpoint plan
2. Agent runs until checkpoint task hoặc auth gate
3. Agent return includes: completed tasks table, current task + blocker, checkpoint type/details
4. Present to user
5. User responds: "approved"/"done" | issue description | decision selection
6. Spawn continuation agent (NOT resume) sử dụng continuation-prompt.md
7. Continuation agent verifies previous commits, continues from resume point
8. Repeat until plan completes hoặc user stops

**Gate:**
- Pass khi: Checkpoint resolved với user response
- Fail khi: User stops hoặc unresolvable

**Output bước này:** Continuation agent execution

---

### Step 7: aggregate_results

**Mục đích:** Tổng hợp kết quả từ tất cả waves sau khi execution hoàn tất.

**Hành động:**
- Tạo markdown table với waves, plans, status
- Liệt kê plan details từ SUMMARY.md
- Aggregate issues encountered

**Gate:** None — chỉ tổng hợp

**Output bước này:** Markdown aggregation output

---

### Step 8: close_parent_artifacts

**Mục đích:** Resolve parent UAT và debug artifacts cho decimal phases (X.Y pattern).

**Hành động:**
1. **Detect decimal phase:** Check nếu `PHASE_NUMBER` chứa decimal
2. **Find parent UAT:** `node gsd-tools.cjs find-phase "${PARENT_PHASE}" --raw`
3. **Update UAT gap statuses:** Đọc parent UAT's `## Gaps` section, update `status: failed` → `status: resolved`
4. **Update UAT frontmatter:** Nếu all gaps resolved → update status và timestamp
5. **Resolve debug sessions:** Update frontmatter, move to `.planning/debug/resolved/`
6. **Commit updated artifacts:** `gsd-tools.cjs commit "docs(phase-${PARENT_PHASE}): resolve UAT gaps..."`

**Gate:**
- Pass khi: Phase number không có decimal → skip step này
- Pass khi: Parent UAT found và updated
- Fail khi: Parent UAT not found → skip (gap-closure có thể từ VERIFICATION.md)

**Output bước này:** Updated UAT files, committed to git

---

### Step 9: verify_phase_goal

**Mục đích:** Verify phase achieved its GOAL, không chỉ completed tasks.

**Hành động:**
- Spawn `gsd-verifier` agent với model từ `verifier_model`
- Verify context: phase directory, phase goal từ ROADMAP.md, requirement IDs
- Create VERIFICATION.md

**Read status:**
```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

| Status | Action |
|--------|--------|
| `passed` | → update_roadmap |
| `human_needed` | Present items for human testing |
| `gaps_found` | Present gap summary, offer `/gsd:plan-phase {phase} --gaps` |

**Gate:**
- Pass khi: `status: passed`
- Fail khi: `status: gaps_found` → present gap closure path

**Output bước này:** `{phase_num}-VERIFICATION.md`

---

### Step 10: update_roadmap

**Mục đích:** Mark phase complete và update tất cả tracking files.

**Hành động:**
- Chạy: `node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${PHASE_NUMBER}"`
- CLI handles:
  - Mark phase checkbox `[x]` với completion date
  - Update Progress table (Status → Complete, date)
  - Update plan count to final
  - Advance STATE.md to next phase
  - Update REQUIREMENTS.md traceability
- Extract: `next_phase`, `next_phase_name`, `is_last_phase`
- Commit: `gsd-tools.cjs commit "docs(phase-{X}): complete phase execution"`

**Gate:** None — always completes

**Output bước này:** Updated ROADMAP.md, STATE.md, REQUIREMENTS.md

---

### Step 11: offer_next

**Mục đích:** Route đến bước tiếp theo hoặc present options cho user.

**Hành động:**

**Exception:** Nếu `gaps_found`, verify_phase_goal đã present gap-closure path. Skip auto-advance.

**No-transition check:**
- Parse `--no-transition` flag từ $ARGUMENTS
- Nếu present: Do NOT run transition.md. Return completion status. STOP.

**Auto-advance detection:**
1. Parse `--auto` flag
2. Read chain flag và user preference:
   ```bash
   AUTO_CHAIN=$(node "..." config-get workflow._auto_chain_active)
   AUTO_CFG=$(node "..." config-get workflow.auto_advance)
   ```

**If `--auto` present OR `AUTO_CHAIN` is true OR `AUTO_CFG` is true (AND verification passed with no gaps):**
- Display: "AUTO-ADVANCING → TRANSITION"
- Execute transition workflow inline với `--auto` flag
- Read và follow `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/transition.md`

**If none of above is true:**
- STOP. Do not auto-advance. Present user options:
  ```
  ## ✓ Phase {X}: {Name} Complete

  /gsd:progress — see updated roadmap
  /gsd:transition — plan next phase transition
  /gsd:execute-phase {next} — execute next phase
  ```

**Gate:**
- Pass khi: User responds với next action
- Fail khi: User không respond → wait

**Output bước này:** Routing decision + transition execution (nếu auto)

---

## Agents Được Gọi

| Agent | Điều kiện gọi | Files đọc vào | Files tạo ra |
|-------|--------------|---------------|-------------|
| `gsd-executor.md` | Step 5: execute_waves — mỗi plan trong wave | PLAN.md, STATE.md, CLAUDE.md, project skills | `{phase}-{plan}-SUMMARY.md` |
| `gsd-verifier.md` | Step 9: verify_phase_goal | ROADMAP.md, PLAN.md, REQUIREMENTS.md, SUMMARY.md | `{phase_num}-VERIFICATION.md` |

## Files Được Tạo Ra

| File | Nội dung | Template dùng | Tạo ở Step |
|------|----------|---------------|------------|
| `.planning/phases/{dir}/{phase}-{plan}-SUMMARY.md` | Plan execution summary với deviations, metrics | `templates/summary.md` | Step 5 |
| `.planning/phases/{dir}/{phase_num}-VERIFICATION.md` | Phase goal verification report | `templates/verification-report.md` | Step 9 |

## Flags Được Documented

| Flag | Mô tả | Được sử dụng ở |
|------|-------|-----------------|
| `--gaps-only` | Execute chỉ gap closure plans (plans với `gap_closure: true` trong frontmatter) | Step 4: discover_and_group_plans |
| `--auto` | Auto-advance to transition after verification passes | Step 11: offer_next |
| `--no-transition` | Skip transition workflow (dùng khi execute-phase được spawn bởi plan-phase auto-advance) | Step 11: offer_next |

## Dependencies

**Cần chạy trước:** `/gsd:plan-phase N` — cần các PLAN.md files trong phase directory
**Output được dùng bởi:** `/gsd:verify-work N` — đọc VERIFICATION.md; transition workflow — đọc STATE.md, ROADMAP.md

## Issues Phát Hiện

[workflows/execute-phase.md:19] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bằng relative path hoặc environment variable

[workflows/execute-phase.md:35] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bằng relative path

[workflows/execute-phase.md:63] — HARDCODED_PATH — `C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs` — thay bằng relative path

[workflows/execute-phase.md:122-125] — HARDCODED_PATH — `@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/execute-plan.md` và các references — thay bằng relative paths

[workflows/execute-phase.md:193-194] — HARDCODED_PATH — config-get commands — thay bằng relative path

[workflows/execute-phase.md:269] — HARDCODED_PATH — find-phase command — thay bằng relative path

[workflows/execute-phase.md:300] — HARDCODED_PATH — commit command — thay bằng relative path

[workflows/execute-phase.md:371] — HARDCODED_PATH — phase complete command — thay bằng relative path

[workflows/execute-phase.md:384] — HARDCODED_PATH — commit command — thay bằng relative path

[workflows/execute-phase.md:420-421] — HARDCODED_PATH — config-get commands — thay bằng relative path

[workflows/execute-phase.md:435] — HARDCODED_PATH — transition.md path — thay bằng relative path

[agents/gsd-executor.md:80] — HARDCODED_PATH — init execute-phase command — thay bằng relative path

[agents/gsd-executor.md:244-245] — HARDCODED_PATH — config-get commands — thay bằng relative path

[agents/gsd-executor.md:258] — HARDCODED_PATH — checkpoints.md reference — thay bằng relative path

[agents/gsd-executor.md:383] — HARDCODED_PATH — summary.md template reference — thay bằng relative path

[agents/gsd-executor.md:436-464] — HARDCODED_PATH — multiple gsd-tools.cjs commands — thay bằng relative path

[agents/gsd-executor.md:487] — HARDCODED_PATH — commit command — thay bằng relative path

[agents/gsd-verifier.md:81] — HARDCODED_PATH — roadmap get-phase command — thay bằng relative path

[agents/gsd-verifier.md:118] — HARDCODED_PATH — roadmap get-phase command — thay bằng relative path

[agents/gsd-verifier.md:161] — HARDCODED_PATH — verify artifacts command — thay bằng relative path

[agents/gsd-verifier.md:210] — HARDCODED_PATH — verify key-links command — thay bằng relative path

[agents/gsd-verifier.md:292] — HARDCODED_PATH — summary-extract command — thay bằng relative path

[agents/gsd-verifier.md:297] — HARDCODED_PATH — verify commits command — thay bằng relative path

## Proposals Được Tạo

Chưa có proposals — cần tạo proposal cho hardcoded paths.
