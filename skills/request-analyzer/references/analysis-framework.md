# Request Analysis Framework

Use this framework to perform a deep analysis of any user request before taking action.

## 1. Deconstruction
Break the request into these four pillars:
- **Core Goal**: The primary objective. "I want X so that Y."
- **Current State/Context**: What exists now. Codebase patterns, existing tools, project history.
- **Implicit Assumptions**: What the user assumes but hasn't stated. (e.g., "Use React", "Mobile first").
- **Technical Constraints**: Specific libraries, versions, OS, or environment limitations.

## 2. Completeness Check
Evaluate if the information is sufficient:
- **Visual/Aesthetic**: Is the look and feel defined?
- **Behavioral/Functional**: Are edge cases and interactions clear?
- **Data/State**: How is data handled, stored, or passed?
- **Scope**: Is the boundary of the task well-defined?

## 3. Ambiguity Identification
Look for "danger words" that need definition:
- "Simple", "Modern", "Clean", "Professional" (Subjective aesthetics)
- "Fast", "Performant", "Scalable" (Technical benchmarks)
- "Robust", "Secure" (Implementation standards)
- "Similar to X" (Requires specific comparison points)

## 4. Questioning Strategy
When asking questions:
- **Group by Category**: Don't mix technical questions with vision questions.
- **Provide Options**: Instead of "What color?", ask "Should it be emerald-themed like the landing page or a neutral dark theme?"
- **State the 'Why'**: Explain how their answer affects the implementation.
- **Limit Quantity**: Ask 3-5 high-impact questions per turn.
