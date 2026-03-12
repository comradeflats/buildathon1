---
name: link-nav
description: Discovers redundancies, roundabouts, and security gaps in application routing and logic. Use when evaluating a codebase for UX flow improvements, identifying legacy or unprotected paths, and consolidating redundant features into clarifying questions.
---

# Link Nav

## Overview
This skill identifies "roundabouts" (alternative, often less-secure paths) and "redundancies" (duplicate logic or UI) in application routing and data flows. It focuses on ensuring consistent protection mechanisms and consolidating fragmented components.

## Workflow

### 1. Route Discovery
Map out all frontend and backend routes to understand the application's entry points.
- Use `scripts/map_routes.cjs` to list routes in Next.js/React projects.
- Manually check for dynamic routes (e.g., `[slug]`) that might have duplicate logic.

### 2. Comparative Analysis
Identify actions that can be performed via multiple paths and compare their enforcement logic.
- **Permission Check**: Does the backend rule (e.g., Firestore rules, middleware) match the frontend's claim (e.g., "code required")?
- **Logic Sync**: Is the same validation logic (e.g., event status checks) applied across all routes leading to the same result?
- Refer to `references/ux_vulnerabilities.md` for specific patterns to look for.

### 3. Redundancy Identification
Look for fragmented state management and duplicate UI components.
- Check if multiple hooks/contexts are managing the same collection.
- Look for identical or near-identical page structures that could be unified.

### 4. Synthesize Findings
Generate a report in the form of **clarifying questions** for the user. Do not implement changes immediately; propose improvements first.
- Example: "I've found that `/submit` and `/e/[slug]/submit` use different validation for the same action. Should we consolidate them into a shared component?"

## Example Task
"Perform a link-nav analysis on the project to find why some users can submit without a code."

1. **Discover Routes**: Run `scripts/map_routes.cjs`.
2. **Audit Components**: Compare `src/app/submit/page.tsx` and `src/app/e/[slug]/submit/page.tsx`.
3. **Audit Rules**: Check `firestore.rules` for `/teams` collection create permission.
4. **Report**: "I've found that while the frontend form requires a code, the Firestore rules allow any authenticated user to create a team without verifying the code. Should we enforce this at the database level?"
