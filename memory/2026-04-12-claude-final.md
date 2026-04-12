---
name: 2026-04-12 — CLAUDE.md Final Version
description: Viết lại CLAUDE.md cuối cùng kết hợp từ 3 bản đề xuất
type: project
---

## Việc đã làm

Viết lại CLAUDE.md cho review_gsd thành bản cuối cùng, kết hợp:

- Triết lý "The Instruction is the Code" + Meta-Teaching (từ bản mới của user)
- Workflow Mirroring theo 5 phases user journey (giữ nguyên)
- 4 Agent roles với trigger + output cụ thể (từ bản đề xuất trước)
- Adversarial Review cho Link Auditor (từ bản mới)
- Peer Review mechanism — Rule 1 (từ bản mới)
- INTERNAL_CHANGELOG.md — Rule 2 (từ bản mới, thêm format + location)
- Atomic Verification — Rule 3 (từ bản mới)
- READ-ONLY rule cho gsd-template/ (đã thiếu ở 2 bản trước, đã thêm)
- Output structure docs/ map (từ bản đề xuất)
- Memory & Git requirements (giữ nguyên)

## Điều đã bỏ ra so với bản user đề xuất

- "Matcha green, Rounded corners" trong Skill Engineer — là sở thích cá nhân
  của Khang, không phải generic standard. Đã lưu vào memory/user-khang-profile.md
- "Operation Commands" section — là examples cho user gõ, không phải
  agent instructions

## Kết quả

CLAUDE.md mới rõ ràng về mục tiêu: viết tài liệu hướng dẫn cho AI agents
của gsd-template, theo đúng thứ tự user journey.

## Why
Cần CLAUDE.md mới để bất kỳ agent nào đọc vào cũng hiểu ngay công việc
thật sự là documentation engineering, không phải app development.

## How to apply
INTERNAL_CHANGELOG.md cần được tạo ở bước tiếp theo khi bắt đầu làm docs.
