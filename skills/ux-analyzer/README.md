# UX/UI Analyzer Skill

A question-driven UI/UX analysis skill for comprehensive interface evaluation.

## Overview

This skill analyzes your project's UI/UX by asking clarifying questions rather than prescribing fixes. It helps teams discover the best solutions through thoughtful inquiry about design intent, user impact, and edge cases.

## How to Use

### With Claude Code CLI

Invoke the skill using:
```
/ux-analyzer
```

Or use the Skill tool programmatically within Claude Code sessions.

### What It Does

1. **Maps User Flows**: Identifies key routes and entry points
2. **Analyzes Components**: Examines UI components and design patterns
3. **Evaluates UX Checklist**: Tests against 8 categories of UX best practices
4. **Asks Questions**: Frames findings as clarifying questions for improvement
5. **Prioritizes Issues**: Categorizes findings by impact (Critical → High-Value → Polish)

## Structure

```
ux-analyzer/
├── SKILL.md                    # Main skill definition with workflow
├── README.md                   # This file
├── references/
│   ├── ux-checklist.md        # 8-category UX evaluation checklist
│   └── question-templates.md  # Question frameworks and patterns
├── scripts/                    # (Optional) Automation scripts
└── assets/                     # (Optional) Visual examples
```

## Reference Files

### ux-checklist.md
Comprehensive checklist covering:
1. Visual Consistency & Brand Identity
2. Navigation & Information Architecture
3. Interaction Design & Feedback
4. Forms & Input
5. Accessibility (a11y)
6. Mobile Responsiveness
7. Intuitive vs. Non-intuitive Flows
8. Edge Cases & Boundaries

### question-templates.md
Question frameworks organized by:
- Navigation & Flow
- Interaction & Feedback
- Forms & Input
- Visual Design & Consistency
- Mobile & Responsive
- Accessibility
- Performance & Perception
- Data & Content
- Edge Cases & Boundaries

Plus techniques for effective questioning:
- "What If" Technique
- "How Should" Technique
- "Have You Considered" Technique
- "User Journey" Technique
- "Why" Ladder

## Example Analysis

```
## Login Page Analysis (src/app/login/page.tsx)

### 🔴 Critical UX Issues
- **Loading State** (line 45): Login button lacks loading indicator
  - What should users see during authentication?
  - How do we prevent double-submission?

### 🟡 High-Value Improvements
- **Error Messages** (line 52): Generic "Login failed" error
  - Should we differentiate between "wrong password" vs "account not found"?
  - What's helpful without compromising security?

### 🟢 Polish & Enhancements
- **Password Toggle** (line 38): Password field has no show/hide toggle
  - Would a visibility toggle improve the login experience?
```

## Philosophy

**Ask, Don't Tell**: The best solutions emerge from understanding context, not prescribing fixes.

**Why over What**: Questions reveal intent and constraints that prescriptive advice misses.

**Collaborate, Don't Dictate**: Teams own their UX decisions; this skill helps them think critically.

## Tips

1. Always include file paths and line numbers
2. Ask 3-5 questions per component (not overwhelming)
3. Mix technical, UX, and edge case questions
4. Prioritize critical issues first
5. Use visual language to describe UI based on code
6. Think like a first-time user
7. Consider mobile, accessibility, and edge cases

## Version

Current version: 2.0 (Question-Driven Approach)
Last updated: 2026-03-14
