# Brainstorm Output Template

Template for `.planning/BRAINSTORM.md` — structured project understanding from ideation.

<template>

```markdown
# Brainstorm: [Project Name]

**Created:** [YYYY-MM-DD]
**Source:** User input from /gsd:new-project Step 3.5 (gsd-ideator)

## Executive Summary

[3-4 sentences capturing the essence of what we're building]
[What problem it solves, who it's for, the core solution]

## Target Users

**Primary Users:** [Who pays and who uses]
**User Personas:**

| Persona | Role | Primary Need | Key Pain Point |
|---------|------|--------------|----------------|
| [Name] | [Role] | [Need] | [Pain] |
| [Name] | [Role] | [Need] | [Pain] |

**Estimated Users:** [Initial: X, Scale: Y]

## Problem Space

**Core Problem:** [One sentence describing the main problem]

**Pain Points:**

| Pain Point | Severity | Frequency | Current Workaround |
|------------|----------|-----------|-------------------|
| [Pain 1] | High/Med/Low | Always/Sometimes | [How they cope] |
| [Pain 2] | High/Med/Low | Always/Sometimes | [How they cope] |
| [Pain 3] | High/Med/Low | Always/Sometimes | [How they cope] |

## Solution Vision

**Product Description:** [2-3 sentences on what the product does]

**Core Value Proposition:** [ONE sentence — if everything else fails, this must work]

**MVP Features (top 3 essential):**

1. **[Feature 1]** — [Why essential, what problem it solves]
2. **[Feature 2]** — [Why essential, what problem it solves]
3. **[Feature 3]** — [Why essential, what problem it solves]

**Success Metrics:**
- User acquisition: [Target]
- Engagement: [Metric]
- Revenue: [Target]

## Market Context

**Competitors/Alternatives:**

| Competitor | Strengths | Weaknesses | Why User Might Choose Us |
|------------|-----------|------------|-------------------------|
| [Name] | [What they do well] | [Gaps] | [Our advantage] |
| [Name] | [What they do well] | [Gaps] | [Our advantage] |

**Differentiation:**
- [How we're different 1]
- [How we're different 2]
- [How we're different 3]

**Market Gaps:** [What existing solutions miss]

## Monetization

**Revenue Model:** [Subscription/One-time/Freemium/Usage-based/Enterprise]

**Pricing Tiers:**

| Tier | Price | Target | Key Features |
|------|-------|--------|--------------|
| Free | $0 | [Who] | [Limits] |
| [Tier 1] | $[X]/mo | [Who] | [Features] |
| [Tier 2] | $[Y]/mo | [Who] | [Features] |

**Unit Economics Targets:**
- CAC (Customer Acquisition Cost): $[Amount]
- LTV (Lifetime Value): $[Amount]
- Payback Period: [X] months

## Technical Implications

**Architecture:** [Multi-tenant / Single-tenant / Hybrid]

**Tech Stack Preferences:** [If any mentioned by user]

**Key Integrations:**

| Integration | Purpose | Priority |
|-------------|---------|----------|
| [Service] | [Why] | High/Med/Low |
| [Service] | [Why] | High/Med/Low |

**Data & Compliance:** [Privacy, sovereignty, compliance requirements]

**Scale Estimates:**
- Initial users: [X]
- 6-month target: [Y]
- 1-year target: [Z]

## Onboarding & UX

**First Value Moment:** [What user achieves in first session]

**Time to First Value:** [Estimate: minutes/hours/days]

**Onboarding Flow:**

1. **[Step 1]** — [Action]
2. **[Step 2]** — [Action]
3. **[Step 3]** — [Action]

**Key UX Requirements:**
- [Requirement 1]
- [Requirement 2]

## Constraints & Context

**Project Constraints:**

| Constraint | Type | Description |
|------------|------|-------------|
| [Name] | Tech/Timeline/Budget/Team | [Details] |

**Known Context:**
- [Background from user]
- [Prior experience]
- [Existing tools]

**Explicitly Out of Scope:**
- [Feature] — [Why excluded]
- [Feature] — [Why excluded]

## Questions for Clarification

Questions that need user input (not resolved during brainstorm):

1. **[Question]**
   - Category: [Which of 8 categories]
   - Why it matters: [Impact on project]
   - Suggested approach: [Recommendation]

## Confidence Assessment

| Category | Confidence | Notes |
|----------|------------|-------|
| Target Users | HIGH/MED/LOW | [Brief reason] |
| Problem Space | HIGH/MED/LOW | [Brief reason] |
| Solution Vision | HIGH/MED/LOW | [Brief reason] |
| Market Context | HIGH/MED/LOW | [Brief reason] |
| Monetization | HIGH/MED/LOW | [Brief reason] |
| Technical | HIGH/MED/LOW | [Brief reason] |
| Onboarding | HIGH/MED/LOW | [Brief reason] |
| Constraints | HIGH/MED/LOW | [Brief reason] |

---

*This file feeds into:*
- `.planning/PROJECT.md` — Core value, Context, Constraints
- `.planning/REQUIREMENTS.md` — Feature requirements
- `.planning/codebase/ARCHITECTURE.md` — Technical decisions
- `.planning/ROADMAP.md` — Phase priorities

*Cross-reference:*
- See `.planning/codebase/STRUCTURE.md` for file organization
- See `.planning/codebase/CONVENTIONS.md` for coding standards

*Brainstorm created by: gsd-ideator agent*
*Last updated: [date]*
```

</template>

<guidelines>

**When BRAINSTORM.md is created:**
- After Step 3.5 (gsd-ideator) completes in new-project workflow
- Input: Raw user response from Step 3
- Output: Structured understanding across 8 categories

**Who reads this:**
- gsd-planner (when creating requirements)
- gsd-roadmapper (when defining phases)
- gsd-executor (for context on user needs)

**Key principle:**
- "Make vague concrete" — don't leave "users want X" as vague
- "One sentence core value" — if everything fails, this must work
- "Top 3 MVP features" — not comprehensive list, just essential

**Quality markers:**
- Each category has specific details, not generic statements
- Confidence levels honest (not everything is HIGH)
- Questions for clarification identified

**Mapping to downstream files:**

| BRAINSTORM Output | Maps To | How |
|------------------|---------|-----|
| MVP Features | REQUIREMENTS.md v1 | Convert to `[CATEGORY]-01` format |
| Pain Points | REQUIREMENTS.md v1 | Add as requirements |
| Technical Implications | ARCHITECTURE.md | Pattern Overview, Layers |
| Core Value | PROJECT.md Core Value | Direct copy |
| Market Context | ROADMAP.md | Phase ordering rationale |
| Constraints | PROJECT.md Constraints | Direct copy |

**Confidence → Action:**

| Confidence | Action |
|------------|--------|
| HIGH | Proceed to requirements/roadmap |
| MEDIUM | Proceed, note assumptions in PROJECT.md |
| LOW | Flag in "Questions for Clarification" - may need research |

</guidelines>

<example>

```markdown
# Brainstorm: QuizMaster - Real-time Quiz Platform

**Created:** 2025-01-20
**Source:** User input from /gsd:new-project Step 3.5

## Executive Summary

QuizMaster is a real-time quiz platform for teams and educators to create, run, and analyze interactive quizzes. Users create quiz sessions, participants join via link, and results display live with leaderboards.

## Target Users

**Primary Users:** Team leads, educators, HR professionals who run quizzes
**User Personas:**

| Persona | Role | Primary Need | Key Pain Point |
|---------|------|--------------|----------------|
| Sarah | Team Lead | Run fun team quizzes | Current tools are boring, hard to set up |
| Mike | Teacher | Quick formative assessments | Takes too long to grade |
| Lisa | HR | Training assessments | No real-time feedback |

**Estimated Users:** Initial: 50, Scale: 1000

## Problem Space

**Core Problem:** Existing quiz tools are either too simple (Google Forms) or too enterprise-heavy (paid LMS), with nothing in between that's fun and easy to use.

**Pain Points:**

| Pain Point | Severity | Frequency | Current Workaround |
|------------|----------|-----------|-------------------|
| Setting up takes too long | High | Sometimes | Use simple tools, sacrifice features |
| No real-time engagement | High | Always | Use multiple tools (slide + poll) |
| Can't see results instantly | Med | Always | Export and analyze manually |
| Boring for participants | Med | Always | Add prizes, make it "fun" externally |

## Solution Vision

**Product Description:** Real-time quiz platform with live leaderboards, instant results, and easy creation. Targeted at teams of 10-100 who want quick, engaging quizzes without enterprise complexity.

**Core Value Proposition:** Teams can run a fun, engaging quiz in 5 minutes with real-time results — no training or technical setup required.

**MVP Features (top 3 essential):**

1. **Create Quiz** — Question types (multiple choice, true/false, ranking), timer settings, custom branding
2. **Live Session** — Join via link, real-time answer display, automatic scoring
3. **Results Dashboard** — Leaderboard, individual scores, export options

**Success Metrics:**
- Quiz completion rate: >80%
- Time to create quiz: <5 minutes
- NPS: >40

## Market Context

**Competitors/Alternatives:**

| Competitor | Strengths | Weaknesses | Why User Might Choose Us |
|------------|-----------|------------|-------------------------|
| Kahoot | Fun, engaging | Too gamey for corporate, account required | Simpler, no login for participants |
| Google Forms | Simple, free | No real-time, boring | Live experience |
| Typeform | Beautiful | No real-time, expensive | Price point for teams |

**Differentiation:**
- Live real-time experience without game-ification
- No participant login required
- Positioned between simple (Forms) and enterprise (LMS)

**Market Gaps:** Nothing handles "quick team quiz" well — too simple or too complex.

## Monetization

**Revenue Model:** Subscription (freemium)

**Pricing Tiers:**

| Tier | Price | Target | Key Features |
|------|-------|--------|--------------|
| Free | $0 | Individuals | 3 quizzes/mo, basic questions |
| Team | $29/mo | Small teams | Unlimited quizzes, branding, analytics |
| Enterprise | Custom | Large orgs | SSO, admin controls, priority support |

**Unit Economics Targets:**
- CAC: $50
- LTV: $350
- Payback: 4 months

## Technical Implications

**Architecture:** Multi-tenant SaaS

**Tech Stack Preferences:** User mentioned Next.js preference

**Key Integrations:**

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Slack | Share quizzes, notifications | Med |
| Calendar | Schedule quizzes | Low |

**Data & Compliance:** No PII beyond email, standard privacy

**Scale Estimates:**
- Initial users: 50
- 6-month target: 500
- 1-year target: 2000

## Onboarding & UX

**First Value Moment:** User creates first quiz and runs it

**Time to First Value:** <10 minutes (create → run)

**Onboarding Flow:**

1. **Sign up** — Email or Google SSO
2. **Create Quiz** — Add questions (guided flow)
3. **Run Session** — Get shareable link
4. **View Results** — See leaderboard

**Key UX Requirements:**
- Mobile-friendly for participants (don't need app)
- Single-screen experience for hosts
- Clear visual feedback on correct/incorrect

## Constraints & Context

**Project Constraints:**

| Constraint | Type | Description |
|------------|------|-------------|
| Timeline | Timeline | MVP in 2 months |
| Team | Team | Solo founder + contractor |

**Explicitly Out of Scope:**
- White-label — Not for now, focus on product
- Custom domains — Focus on core experience first
- Offline mode — Real-time requires connectivity

## Questions for Clarification

Questions that need user input:

1. **Target company size**
   - Category: Target Users
   - Why it matters: Affects pricing and feature priorities ( SMB vs Enterprise have different needs)
   - Suggested: SMB (10-100 employees) as initial target

2. **Real-time implementation approach**
   - Category: Technical
   - Why it matters: WebSocket vs polling affects architecture and hosting
   - Suggested: Supabase Realtime for MVP

## Confidence Assessment

| Category | Confidence | Notes |
|----------|------------|-------|
| Target Users | HIGH | User clearly described personas |
| Problem Space | HIGH | User has direct experience with problem |
| Solution Vision | MED | MVP features clear, but scope could shift |
| Market Context | MED | Knows competitors, differentiation clear |
| Monetization | MED | Model decided, pricing TBD |
| Technical | LOW | Need to verify approach with research |
| Onboarding | HIGH | Flow is straightforward |
| Constraints | HIGH | Clear from user conversation |

---

*This file feeds into:*
- `.planning/PROJECT.md` — Core value, Context, Constraints
- `.planning/REQUIREMENTS.md` — Feature requirements
- `.planning/codebase/ARCHITECTURE.md` — Technical decisions
- `.planning/ROADMAP.md` — Phase priorities

*Cross-reference:*
- See `.planning/codebase/STRUCTURE.md` for file organization
- See `.planning/codebase/CONVENTIONS.md` for coding standards

*Brainstorm created by: gsd-ideator agent*
*Last updated: 2025-01-20*
```

</example>

<evolution>

**After brainstorm is created:**

1. **PROJECT.md updates:**
   - Core Value → from Solution Vision
   - Context → from Problem Space + Market Context
   - Active Requirements → from MVP Features

2. **Next workflow step:**
   - Step 4: Write PROJECT.md (now enriched with brainstorm)
   - Or: Continue to Step 6 if user approved proceed

3. **Confidence drives next steps:**
   - HIGH in most categories → proceed to requirements
   - LOW in some categories → flag for additional research

**When to update BRAINSTORM.md:**
- New user input that changes understanding
- Major pivot in product direction
- Market context changes

</evolution>