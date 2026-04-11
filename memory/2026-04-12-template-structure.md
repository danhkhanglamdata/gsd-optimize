# Session: 2026-04-12 - Template Structure Clarification

## Date: 2026-04-12

## User Question / Request

User asked to clarify in CLAUDE.md:
1. gsd/ actually = .claude/ (Claude Code config folder)
2. TEMPLATE.md actually = CLAUDE.md (Agent instructions)

This is critical because Claude Code only reads `.claude/` folder and root `CLAUDE.md`.

## Analysis / Response

**Analysis:**
- Need to explain the rename process clearly in both places
- TEMPLATE.md (template side) needs clear "how to install" instructions
- CLAUDE.md (working side) needs to explain the product structure

## Changes Made

1. **CLAUDE.md (root):**
   - Added "IMPORTANT: Template Folder Structure" section
   - Added table: gsd/ → .claude/, TEMPLATE.md → CLAUDE.md
   - Explained why rename is needed

2. **gsd-template/TEMPLATE.md:**
   - Completely rewritten as user-facing instructions
   - Added "IMPORTANT: After downloading, you MUST rename these files"
   - Added table showing original → renamed
   - Added Quick Start section
   - Added Folder Structure section
   - Made it truly generic (removed EventVib references)

## Result

TEMPLATE.md now contains:
- Clear rename instructions
- Quick start guide
- How GSD workflow works
- Key commands reference
- What files are generated
- Non-negotiables

CLAUDE.md now explains:
- That gsd-template/ is the product
- The folder rename relationship
- Workflow for investigating templates

## Next Steps

Proceed with Priority Task 1: Review TEMPLATE.md (just updated)
Then: Trace /gsd:new-project workflow
