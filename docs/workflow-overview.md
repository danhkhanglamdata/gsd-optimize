# GSD Workflow — Tổng quan
> Loại: Overview
> Tạo bởi: flow-tracer
> Ngày: 2026-04-12
> Phiên bản gsd-template: v1.34.0
> Trạng thái: Draft

---

## 1. Tổng quan GSD Workflow

### 1.1 GSD là gì?

**GSD (Get Shit Done)** là một framework cho Claude Code, giúp solo developers quản lý dự án theo structured workflow với các phase rõ ràng.

### 1.2 Mục đích

- Giúp solo developer build product một cách có hệ thống
- Cung cấp phase-based workflow (discuss → plan → execute → verify)
- Tự động hóa việc tạo project artifacts
- Cung cấp các agents hỗ trợ planning, execution, verification

---

## 2. Core Workflow (5 bước)

```
┌─────────────────┐
│ /gsd:new-project│  ← Khởi tạo project
└────────┬────────┘
         ↓
┌─────────────────┐
│/gsd:discuss-phase│ ← Làm rõ vision
└────────┬────────┘
         ↓
┌─────────────────┐
│ /gsd:plan-phase │  ← Tạo kế hoạch
└────────┬────────┘
         ↓
┌──────────────────┐
│/gsd:execute-phase│ ← Thực hiện
└────────┬─────────┘
         ↓
┌─────────────────┐
│/gsd:verify-work │  ← Xác nhận kết quả
└─────────────────┘
```

---

## 3. Danh sách tất cả GSD Commands

### 3.1 Project Management

| Command | Mô tả |
|---------|-------|
| `/gsd:new-project` | Khởi tạo project mới |
| `/gsd:new-milestone` | Bắt đầu milestone mới |
| `/gsd:complete-milestone` | Hoàn thành milestone |
| `/gsd:progress` | Kiểm tra tiến độ |
| `/gsd:resume-work` | Tiếp tục làm việc |
| `/gsd:pause-work` | Tạm dừng |

### 3.2 Phase Workflow

| Command | Mô tả |
|---------|-------|
| `/gsd:discuss-phase N` | Làm rõ vision cho phase |
| `/gsd:plan-phase N` | Tạo kế hoạch cho phase |
| `/gsd:execute-phase N` | Thực hiện phase |
| `/gsd:verify-work N` | Xác nhận kết quả |

### 3.3 Planning

| Command | Mô tả |
|---------|-------|
| `/gsd:add-phase` | Thêm phase mới |
| `/gsd:insert-phase` | Chèn phase giữa |
| `/gsd:remove-phase` | Xóa phase |
| `/gsd:plan-milestone-gaps` | Lập kế hoạch cho gaps |

### 3.4 Quality Assurance

| Command | Mô tả |
|---------|-------|
| `/gsd:verify-work N` | Verify deliverables |
| `/gsd:add-tests` | Thêm tests |
| `/gsd:validate-phase` | Validate phase |
| `/gsd:audit-milestone` | Audit milestone |

### 3.5 Utility

| Command | Mô tả |
|---------|-------|
| `/gsd:help` | Hiển thị help |
| `/gsd:stats` | Thống kê |
| `/gsd:health` | Kiểm tra health |
| `/gsd:settings` | Cấu hình |
| `/gsd:set-profile` | Đặt profile |
| `/gsd:update` | Update GSD |

### 3.6 Quick Actions

| Command | Mô tả |
|---------|-------|
| `/gsd:quick` | Thực hiện nhanh |
| `/gsd:note` | Ghi chú |
| `/gsd:add-todo` | Thêm todo |
| `/gsd:check-todos` | Kiểm tra todos |
| `/gsd:debug` | Debug |
| `/gsd:do` | Route text |

---

## 4. Files được tạo bởi mỗi Command

### 4.1 /gsd:new-project

**Tạo:**
- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/research/` (optional)
- `.planning/codebase/STRUCTURE.md`
- `.planning/codebase/CONVENTIONS.md`

### 4.2 /gsd:discuss-phase N

**Tạo:**
- `.planning/phases/NN-CONTEXT.md`

### 4.3 /gsd:plan-phase N

**Tạo:**
- `.planning/phases/XX-phase-name/XX-YY-PLAN.md`

### 4.4 /gsd:execute-phase N

**Tạo:**
- `.planning/phases/XX-phase-name/XX-YY-SUMMARY.md`
- `.planning/phases/XX-phase-name/XX-YY-VERIFICATION.md`

### 4.5 /gsd:verify-work N

**Tạo:**
- `.planning/phases/XX-phase-name/XX-YY-VERIFICATION.md`

---

## 5. Agents được sử dụng

### 5.1 Research Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-project-researcher` | Research domain (4 loại) |
| `gsd-research-synthesizer` | Tổng hợp research |
| `gsd-phase-researcher` | Research cho từng phase |

### 5.2 Planning Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-planner` | Tạo PLAN.md |
| `gsd-roadmapper` | Tạo ROADMAP.md |
| `gsd-plan-checker` | Kiểm tra plan |
| `gsd-ideator` | Brainstorm ideas |

### 5.3 Execution Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-executor` | Thực hiện plan |

### 5.4 Verification Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-verifier` | Verify deliverables |
| `gsd-nyquist-auditor` | Audit validation |

### 5.5 UI Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-ui-researcher` | Research UI |
| `gsd-ui-checker` | Kiểm tra UI |
| `gsd-ui-auditor` | Audit UI |

### 5.6 Utility Agents

| Agent | Chức năng |
|-------|----------|
| `gsd-debugger` | Debug issues |
| `gsd-codebase-mapper` | Map codebase |
| `gsd-integration-checker` | Kiểm tra integration |

---

## 6. Templates được sử dụng

### 6.1 Project Templates

| Template | File |
|----------|------|
| Project | `templates/project.md` |
| Requirements | `templates/requirements.md` |
| Roadmap | `templates/roadmap.md` |
| State | `templates/state.md` |

### 6.2 Phase Templates

| Template | File |
|----------|------|
| Context | `templates/context.md` |
| Plan | `templates/plan.md` |
| Summary | `templates/summary.md` |
| Verification | `templates/verification-report.md` |

### 6.3 Research Templates

| Template | File |
|----------|------|
| Stack | `templates/research-project/STACK.md` |
| Features | `templates/research-project/FEATURES.md` |
| Architecture | `templates/research-project/ARCHITECTURE.md` |
| Pitfalls | `templates/research-project/PITFALLS.md` |
| Summary | `templates/research-project/SUMMARY.md` |

### 6.4 Codebase Templates

| Template | File |
|----------|------|
| Structure | `templates/codebase/structure.md` |
| Conventions | `templates/codebase/conventions.md` |
| Architecture | `templates/codebase/architecture.md` |
| Stack | `templates/codebase/stack.md` |
| Testing | `templates/codebase/testing.md` |
| Integrations | `templates/codebase/integrations.md` |
| Concerns | `templates/codebase/concerns.md` |

---

## 7. Vấn đề phát hiện (Issues)

### Issue 1: Hardcoded paths trong template

**Mô tả:** Template có hardcoded absolute paths:
```
@C:/Users/Admin/OneDrive/Máy tính/review_gsd/.claude/get-shit-done/workflows/new-project.md
```

**Ảnh hưởng:** Template không portable, chỉ hoạt động trên máy cụ thể

**Đề xuất:** Sử dụng relative paths hoặc biến môi trường

---

## 8. Flow chi tiết từng Command

### Command Flow Map

```
new-project → new-project.md → workflows/new-project.md → [gsd-ideator, gsd-project-researcher, gsd-roadmapper]
discuss-phase → discuss-phase.md → workflows/discuss-phase.md → [Skill: gsd:ui-phase, gsd:plan-phase]
plan-phase → plan-phase.md → workflows/plan-phase.md → [gsd-phase-researcher, gsd-planner, gsd-plan-checker]
execute-phase → execute-phase.md → workflows/execute-phase.md → [gsd-executor]
verify-work → verify-work.md → workflows/verify-work.md → [gsd-verifier]
```

> Xem chi tiết:
> - [docs/component-flows/discuss-phase-flow.md](docs/component-flows/discuss-phase-flow.md)
> - [docs/component-flows/plan-phase-flow.md](docs/component-flows/plan-phase-flow.md)

---

## 9. Tiếp theo

Xem chi tiết từng command trong:
- `docs/component-flows/` — Flow diagrams
- `docs/actions/` — Chi tiết từng action