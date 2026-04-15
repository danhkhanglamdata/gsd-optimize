# INTERNAL_CHANGELOG
> Loại: Internal Changelog
> Ngày: 2026-04-14

---

## 2026-04-14 — explore-template Session

### Tổng kết

| Agent | Phase | Change Detail | Reason |
|-------|-------|---------------|--------|
| graph-builder | Phase 1 | Built MCP Knowledge Graph (148 nodes, 180+ edges) | Initial exploration |
| flow-tracer | Phase 2 | Traced 5 core workflows | Documentation |
| action-doc-writer | Phase 3 | Wrote 5 action docs | Full command documentation |
| link-auditor | Phase 4 | Full audit + report | Quality assurance |

### Files Created

| Loại | Files |
|------|-------|
| Graph | docs/graph-build-report.md |
| Flow Docs | docs/component-flows/*.md (5 files) |
| Action Docs | docs/actions/*.md (5 files) |
| Audit | docs/audit-report-2026-04-14.md |

### Issues Phát Hiện

| Issue | Số lượng | Files affected |
|-------|---------|----------------|
| HARDCODED_PATH | 100+ | workflows/ (all) |
| PROJECT_SPECIFIC | 10 | skills/ (EventVib refs) |
| Ambiguous Instructions | 2 | plan-phase.md, execute-phase.md |

### Proposals Created

- docs/proposals/2026-04-14-discuss-phase-hardcoded-paths.md

### Next Steps

- User review và approve proposals
- Fix HARDCODED_PATH (priority: high)
- Fix PROJECT_SPECIFIC content (priority: high)

---

## 2026-04-15 — Hardcoded Paths Fix

### Tổng kết

| Agent | Phase | Change Detail | Reason |
|-------|-------|---------------|--------|
| Orchestrator | - | Approved proposal | User approval |
| Executor | - | Fixed 12 hardcoded paths | Make template portable |

### Files Changed

| File | Số thay đổi |
|------|-------------|
| `gsd-template/gsd/commands/gsd/discuss-phase.md` | 4 refs |
| `gsd-template/gsd/get-shit-done/workflows/discuss-phase.md` | 8 refs |

### Verification

- ✅ Grep `C:/Users` in discuss-phase.md → 0 results
- ✅ All hardcoded paths replaced with relative paths

### Remaining Issues

- 90+ hardcoded paths still exist in other workflows

---

## 2026-04-15 — Fix All Hardcoded Paths (COMPLETED)

### Tổng kết

| Agent | Phase | Change Detail | Reason |
|-------|-------|---------------|--------|
| Orchestrator | - | Approved proposal | User approval |
| Executor | - | Fixed 352 hardcoded paths | Make template portable |

### Files Changed

| Loại | Số files |
|------|----------|
| workflows/ | ~40 |
| commands/ | ~33 |
| agents/ | ~16 |
| references/ | ~10 |
| templates/ | ~2 |
| **Tổng** | **91 files** |

### Verification

- ✅ Grep `C:/Users` in gsd-template/ → 0 results
- ✅ All hardcoded paths replaced with relative paths

### Impact

- ✅ Template now portable
- ✅ Can publish to npm
- ✅ Users can install from any folder

### Next Steps

- Fix PROJECT_SPECIFIC content (EventVib references) - priority: high
- Create new proposals for other improvements

---

## 2026-04-15 — Fix EventVib References (COMPLETED)

### Tổng kết

| Agent | Phase | Change Detail | Reason |
|-------|-------|---------------|--------|
| Executor | - | Removed 23 EventVib refs | Make template generic |

### Files Changed

| File | Số refs removed |
|------|-----------------|
| ux-brainstormer/SKILL.md | 7 |
| clean-code-enforcer/SKILL.md | 5 |
| style-adapter/SKILL.md | 5 |
| beautiful-ui-generator/SKILL.md | 2 |
| gsd-ui-researcher.md | 1 |
| gsd-ui-checker.md | 1 |
| quick-reference.md | 1 |
| realtime-component-builder/SKILL.md | 1 |
| **Tổng** | **23** |

### Verification

- ✅ Grep "EventVib" in gsd-template/ → 0 results

### Impact

- ✅ Template is now generic
- ✅ No project-specific content