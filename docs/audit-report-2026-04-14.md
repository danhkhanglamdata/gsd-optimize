# Audit Report — 2026-04-14
> Loại: Audit Report
> Tạo bởi: link-auditor
> Ngày: 2026-04-14
> Phiên bản gsd-template: 1.34.0 (từ README.md)
> Trạng thái: Draft
> Phạm vi: Full Audit

## Tóm tắt

| Loại Kiểm tra | Số Issues |
|--------------|-----------|
| Broken References | 0 |
| Nodes Mồ Côi | N/A (MCP tools unavailable) |
| Mâu thuẫn (CONTRADICTS) | 0 |
| Vòng lặp (Cycles) | 0 |
| PROJECT_SPECIFIC Content | 10 |
| Hardcoded Paths trong gsd-template | 100+ |
| Chỉ dẫn Mơ hồ | 2 |
| Graph Nodes Stale | N/A (MCP tools unavailable) |
| **Tổng cộng** | **112+** |

---

## Broken References

Không phát hiện broken references. Tất cả file paths trong docs/ reference đến các files tồn tại trong gsd-template/.

---

## Nodes Mồ Côi

MCP tools không available trong session này, không thể query graph. Đánh dấu: Cần chạy lại khi MCP tools enabled.

---

## Mâu thuẫn (CONTRADICTS)

Không phát hiện contradictions giữa các docs.

---

## Vòng lặp (Cycles)

Không phát hiện cycles.

---

## PROJECT_SPECIFIC Content

Phát hiện nội dung project-specific trong gsd-template/ - đây là vấn đề nghiêm trọng vì template phải generic.

### Skills có EventVib references:

**[gsd-template/gsd/skills/clean-code-enforcer/SKILL.md]**
- Line 3: "Machine-enforceable code quality rules for EventVib"
- Line 8: "Machine-enforceable rules for EventVib code quality"
- Line 21, 206, 207: Hardcoded "EventVib" trong examples

**[gsd-template/gsd/skills/beautiful-ui-generator/SKILL.md]**
- Line 3: "Machine-enforceable UI rules for EventVib"
- Line 8: "Machine-enforceable rules for EventVib UI"

**[gsd-template/gsd/skills/ux-brainstormer/SKILL.md]**
- Line 8: "Brainstorm creative, trendy UI/UX for EventVibe"
- Line 26: "### EventVibe Core Vibe"
- Line 133, 178, 193, 197, 241: Multiple EventVibe references

**[gsd-template/gsd/skills/style-adapter/SKILL.md]**
- Line 8: "Convert external CSS/HTML to EventVibe's Tailwind v4"
- Line 24, 80, 178, 180: Multiple EventVibe references

**[gsd-template/gsd/skills/realtime-component-builder/SKILL.md]**
- Line 8: "Build reliable realtime features with Supabase for EventVibe"

**[gsd-template/gsd/skills/quick-reference.md]**
- Line 25: "→ AI will fetch, document design patterns, suggest EventVibe adaptations"

### Workflows có project-specific content:

**[gsd-template/gsd/get-shit-done/workflows/discuss-phase.md:312]**
```
- Search for latest trends: "mobile app design trends 2025", "event app gamification"
```
Nên dùng generic search terms: `"[feature-domain] design trends [year]", "[domain] gamification patterns"`

---

## Hardcoded Paths trong gsd-template

Tất cả workflow files trong `gsd-template/gsd/get-shit-done/workflows/` chứa hardcoded paths:

### Format phổ biến:
```bash
node "C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/bin/gsd-tools.cjs" [command]
```

### Files bị ảnh hưởng (100+ occurrences):
- new-project.md
- discuss-phase.md
- plan-phase.md
- execute-phase.md
- verify-work.md
- add-phase.md
- add-tests.md
- add-todo.md
- audit-milestone.md
- complete-milestone.md
- debug.md
- health.md
- insert-phase.md
- list-phase-assumptions.md
- map-codebase.md
- new-milestone.md
- pause-work.md
- plan-milestone-gaps.md
- progress.md
- remove-phase.md
- research-phase.md
- resume-work.md
- settings.md
- ui-phase.md
- ui-review.md
- validate-phase.md
- Và nhiều files khác...

### Agent files cũng bị ảnh hưởng:
- gsd-executor.md
- gsd-verifier.md

**Đề xuất:** Tất cả paths nên dùng relative paths hoặc environment variables. Đã có proposal: `docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md`

---

## Chỉ dẫn Mơ hồ

### Issue 1: docs/actions/plan-phase.md:Step 8

**Gốc:**
> "Spawn gsd-planner với prompt chứa: Files to read: STATE, ROADMAP, REQUIREMENTS..."

**Vấn đề:** "Files to read" không chỉ rõ relative paths. Agent không biết đọc từ đâu.

**Đề xuất:**
> "Spawn gsd-planner với prompt chứa: files_to_read: `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `{phase_dir}/{padded_phase}-CONTEXT.md`..."

---

### Issue 2: docs/actions/execute-phase.md:Step 5

**Gốc:**
> "Spawn `gsd-executor` với model từ `executor_model`"

**Vấn đề:** `executor_model` được define ở đâu? Không rõ source.

**Đề xuất:**
> "Spawn `gsd-executor` với model từ init JSON field `executor_model` (đã parse ở Step 1)"

---

## Graph Nodes Stale

MCP tools không available trong session này, không thể kiểm tra stale nodes.

---

## Proposals Được Tạo

- → Xem: [docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md](docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md)

---

## Đã được Phê duyệt?

[ ] YES — tất cả critical issues đã được tạo proposal
[ ] NO — còn issues chưa có proposal:
- EventVib references trong skills (10+ files)
- Hardcoded paths trong workflows (100+ occurrences)
- Project-specific search terms trong discuss-phase.md

---

## Ghi chú

1. **MCP Tools Unavailable**: Session này không có MCP tools, nên không thể query graph để kiểm tra orphan nodes, CONTRADICTS edges, hoặc stale nodes.

2. **Hardcoded Paths**: Đây là vấn đề trong source files của gsd-template/, không phải trong docs/. Docs đã document các issues này đúng.

3. **EventVib Content**: Template chứa references đến project cụ thể "EventVib" - đây là violation của quy tắc "Generic" trong CLAUDE.md. Cần tạo proposals riêng cho từng skill.

4. **Docs Completeness**: Các docs đã được viết rất chi tiết với đầy đủ:
   - Flags count match
   - Steps count match
   - Gates với Pass/Fail
   - Output files với 4 cột
   - 2+ examples
   - Self-test checklist

5. **Action Required**: Link-auditor KHÔNG được sửa gsd-template/ trực tiếp. Các issues cần được:
   - Document trong audit report (DONE)
   - Tạo proposals riêng cho từng loại issue
   - Chờ user approve trước khi implement
