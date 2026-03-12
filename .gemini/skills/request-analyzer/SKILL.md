---
name: request-analyzer
description: Deeply analyzes user requests, identifies gaps in vision or technical specs, and asks targeted clarifying questions. Use this skill when a user request is broad, ambiguous, or lacks specific technical constraints, ensuring 100% alignment before implementation.
---

# Request Analyzer

Deeply analyze every request to ensure vision accuracy and technical feasibility. This skill prevents "rework" by identifying missing information early.

## Workflow

### 1. Analyze the Request
Immediately upon receiving a new task or broad request, perform a deep analysis using the **[Request Analysis Framework](references/analysis-framework.md)**.
- **Deconstruct** the input into Goals, Context, Assumptions, and Constraints.
- **Identify** "danger words" (vague terms like "clean" or "fast").
- **Audit** for completeness (is the stack defined? is the audience clear?).

### 2. Present Analysis
Summarize your understanding of the request to the user. This builds trust and confirms you've "heard" them correctly.
- Use a **"How I'm interpreting this"** section.
- Explicitly state the **Assumptions** you are making.

### 3. Ask Clarifying Questions
If gaps exist, do not proceed with implementation. Instead, ask high-impact questions.
- **Limit** to 3-5 questions per turn.
- **Categorize** questions (e.g., ✨ Vision, 🛠️ Technical, 👤 User Experience).
- **Propose Options** where possible to reduce user friction (e.g., "Would you prefer Option A (Standard) or Option B (Custom)?").

## Best Practices

- **Context-Aware Questioning**: Don't ask questions already answered in the codebase. Research the project structure first.
- **Empirical Confirmation**: If a user reports a bug, ask for reproduction steps or specific logs if they aren't provided.
- **Visual Accuracy**: If the user asks for a UI change, ask about existing themes, responsiveness, and interactivity.

## References
- **[analysis-framework.md](references/analysis-framework.md)**: The core methodology for deconstructing and auditing requests.
