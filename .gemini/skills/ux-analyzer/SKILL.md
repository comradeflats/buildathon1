---
name: ux-analyzer
description: Deep UI/UX analysis for project routes, components, and user flows. Use when Gemini CLI needs to evaluate the project's interface for intuitive design, consistency, and accessibility.
---

# UI/UX Deep Analysis

This skill provides a structured approach for analyzing the UI and UX of a software project. It helps Gemini CLI navigate the codebase, identify key routes and components, and evaluate them against common UI/UX standards.

## Workflow

### 1. Identify Key Routes & Entry Points
Start by mapping out the primary pages and routes.
- Search for `page.tsx`, `route.ts`, or equivalent router files.
- Identify the "Happy Path" for a new user (e.g., landing -> sign up -> core action).

### 2. Analyze Component Structure
Read the source code for key UI components.
- Check `src/components/ui/` or similar for design system primitives (Button, Card, Input).
- Look at the `layout.tsx` files to understand global navigation and framing.

### 3. Evaluate Against UX Checklist
Refer to [references/ux-checklist.md](references/ux-checklist.md) for a comprehensive set of evaluation criteria, including:
- **Consistency**: Visual rhythm, color usage, and typography.
- **Navigation**: Clarity of flows and breadcrumbs.
- **Feedback**: Loading states, empty states, and error handling.
- **Accessibility**: Semantic HTML and ARIA labels.
- **Mobile Responsiveness**: Tailwind classes for responsive design.

### 4. Provide Feedback & Questions
For each analyzed area, provide:
- **Observation**: What is currently implemented? (e.g., "The 'Submit' button lacks a loading state.")
- **Impact**: How does this affect the user? (e.g., "Users may click multiple times if the action is slow.")
- **Recommendation**: How can it be improved? (e.g., "Add a `Loader2` icon and disable the button during submission.")
- **Clarifying Questions**: Questions for the user to understand the intended UX better (e.g., "Should the submission flow allow guest users or require authentication?").

## Guidelines

- **Be Specific**: Mention file paths and specific lines of code.
- **Be Practical**: Focus on improvements that provide the most value for the least effort.
- **Adopt a User Persona**: Imagine you are a first-time user who knows nothing about the project.
- **Use Visual Language**: Describe what the UI *looks* and *feels* like based on the CSS/Tailwind classes.
