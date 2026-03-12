# UX Redundancy & Flow Analysis Heuristics

This reference guide helps identify common "roundabouts" and "redundancies" in application flows.

## 1. Permission Gaps (The "Roundabout" Security)
Look for actions that can be performed through multiple paths where some are less secure than others.

- **Frontend-only enforcement**: Validation logic (like event codes) exists in a component but is missing from the database rules (e.g., Firestore) or API endpoints.
- **Alternative Routes**: A primary route `/submit` requires a code, but a legacy route `/legacy-submit` or a slug-based route `/e/[slug]/submit` bypasses it.
- **Role Inconsistency**: One path allows any authenticated user (including anonymous) to perform an action that should be restricted to a specific role.

## 2. Redundancy & Duplication
Look for identical or near-identical logic/UI that should be consolidated.

- **Duplicate Pages**: Separate pages for `/submit` and `/e/[slug]/submit` that contain identical form logic instead of a shared component.
- **Fragmented Context**: Multiple context providers or hooks managing the same state (e.g., `useTeams` and `useVoting` both fetching the same collection).
- **Inconsistent Validation**: Different validation rules for the same data model in different parts of the application.

## 3. Merging Improvements
When you find redundancies, consider these merging strategies:

- **Component Unification**: Move complex form logic into a single, highly configurable component.
- **Middleware Consolidation**: Use application-level middleware to enforce authentication and common validation (like event status) instead of per-route checks.
- **State Centralization**: Consolidate overlapping hooks into a single source of truth.

## 4. Discovery Questions
Before implementing a fix, ask clarifying questions:

- "I've identified that `/submit` enforces a verification code but the Firestore rules do not. Should the rule be updated to check for a code stored in the event document?"
- "Both `/submit` and `/e/[slug]/submit` render the same form logic. Would it be better to merge these into a single dynamic route or share a common submission component?"
- "The `useTeams` hook and `useVoting` context both manage team data. Is there a specific architectural reason for this separation, or should we consolidate them?"
