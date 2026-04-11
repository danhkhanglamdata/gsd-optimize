# CLAUDE.md — Working Context for Template Development
Last updated: 2026-04-11

---

## Project: GSD Template for Claude Code

**Mục tiêu:** Build và hoàn thiện template GSD (Get Shit Done) để publish lên GitHub — template generic dùng cho mọi dự án Claude Code.

---

## Công việc hiện tại

Bạn đang làm việc trên **template development**, không phải building a product. Nhiệm vụ:

1. **Đọc và hiểu** các files trong `gsd-template/`
2. **Review và cải tiến** agents, commands, workflows, templates
3. **Đảm bảo template generic** — không có project-specific assumptions
4. **Loại bỏ context cũ** (EventVib, specific references)

---

## ⚠️ QUAN TRỌNG: Memory & Git Requirements

### Memory Requirements

**MỌI LẦN thực hiện thay đổi đều phải ghi lại:**

1. **Trước khi bắt đầu làm việc mới:**
   - Đọc tất cả files trong `memory/` 
   - Hiểu đã làm gì trước đó
   - Tránh trùng lặp hoặc bỏ sót

2. **Sau mỗi lần thay đổi:**
   - Tạo file memory mới trong `memory/`
   - Format: `YYYY-MM-DD-action.md` (ví dụ: `2026-04-11-fix-template.md`)
   - Nội dung: Câu hỏi → Câu trả lời → Thay đổi đã thực hiện → Kết quả

3. **Nội dung memory phải có:**
   - Câu hỏi của user
   - Câu trả lời/phân tích của bạn
   - File đã sửa đổi
   - Lý do thay đổi

### Git Requirements

**MỌI LẦN thay đổi đều phải commit:**

1. **Khởi tạo Git (một lần):**
   ```bash
   git init
   git add .
   git commit -m "Initial: GSD template structure"
   ```

2. **Commit mỗi lần thay đổi:**
   - Tạo repo trên GitHub trước
   - Commit message phải theo conventional commits:
     ```
     <type>(<scope>): <description>

     [optional body]

     [optional footer]
     ```

3. **Types được phép:**
   - `feat`: Thêm feature mới
   - `fix`: Sửa bug
   - `refactor`: Cải thiện code/template
   - `docs`: Thay đổi documentation
   - `chore`: Cấu hình, setup
   - `style`: Format, không thay đổi logic

4. **Ví dụ commit messages:**
   ```
   docs(TEMPLATE): update agent instructions for generic use
   
   refactor(skills): remove EventVib-specific brand colors
   
   fix(settings): disable hooks for template-only mode
   
   feat(CLAUDE.md): add memory and git requirements
   ```

5. **Push sau mỗi commit:**
   ```bash
   git push origin main
   ```

---

## Cấu trúc Template

```
gsd-template/
├── gsd/                    # Framework files
│   ├── agents/             # Subagents
│   ├── commands/           # GSD slash commands
│   ├── get-shit-done/      # Core workflow logic
│   ├── hooks/              # Automation hooks
│   └── skills/             # Enforceable rules
├── TEMPLATE.md             # Agent instructions cho user
├── gsd-file-manifest.json
├── settings.json
└── settings.local.json
```

---

## Công việc cần làm

| Priority | Task | Status |
|----------|------|--------|
| 1 | Review TEMPLATE.md | Pending |
| 2 | Clean up gsd/skills/ | Pending |
| 3 | Review gsd/agents/ | Pending |
| 4 | Review gsd/commands/ | Pending |
| 5 | Verify gsd/get-shit-done/ | Pending |

---

## Non-Negotiables cho Template

- **Generic** — Không assumptions về stack, domain
- **Complete** — Đủ để template chạy standalone
- **Documented** — Clear usage instructions
- **No project-specific** — Remove EventVib references

---

## Cách làm việc

1. **Đọc memory cũ** → `memory/*.md`
2. **Đọc file cần làm** → Hiểu nội dung
3. **Identify issues** → Vấn đề cần fix
4. **Fix trực tiếp** → Edit files trong gsd-template/
5. **Tạo memory mới** → Ghi lại thay đổi
6. **Commit + Push** → Git history sạch

---

## Quick Reference

| Task | Action |
|------|--------|
| Read memory | `ls memory/` → đọc tất cả |
| Create memory | `memory/YYYY-MM-DD-action.md` |
| Git commit | `git commit -m "type(scope): description"` |
| Review skills | `gsd/skills/*/SKILL.md` |
| Review agents | `gsd/agents/*.md` |
