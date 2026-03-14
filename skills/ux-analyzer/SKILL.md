---
name: ux-analyzer
description: Deep UI/UX analysis that evaluates projects through clarifying questions rather than prescriptive fixes. Examines routes, components, and user flows for intuitive design, consistency, and accessibility. Frames findings as discussion prompts to collaboratively discover the best solutions.
---

# UI/UX Deep Analysis (Question-Driven Approach)

This skill provides a structured approach for analyzing the UI and UX of a software project through **clarifying questions**. Instead of prescribing fixes, it helps you discover improvement opportunities by asking thoughtful questions about design intent, user impact, and edge cases.

**Philosophy**: The best UX improvements come from understanding the "why" behind design decisions. By asking questions, we help teams think critically about their choices and discover solutions that fit their specific context.

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

### 4. Ask Clarifying Questions as Feedback
For each analyzed area, structure your feedback as **questions that prompt improvement**:

**Format:**
1. **Context Observation**: Briefly describe what you found
2. **Impact Question**: Ask about the user experience implications
3. **Design Intent Question**: Ask about the intended behavior or design
4. **Improvement Exploration**: Pose questions that lead to solutions

**Example:**
- Context: "I noticed the voting form at `src/components/voting/VotingForm.tsx:45` doesn't show a loading state during submission."
- Questions:
  - "What should users see while their vote is being processed? Should the button be disabled?"
  - "How should we handle cases where voting takes longer than expected?"
  - "Should there be a visual indicator showing the vote was counted successfully?"

Refer to [references/question-templates.md](references/question-templates.md) for more question frameworks.

### 5. Prioritize Findings by Impact
After gathering observations, categorize feedback into:
- **Critical UX Issues**: Blocking user flows, accessibility failures, broken functionality
- **High-Value Improvements**: Confusion points, missing feedback, unclear CTAs
- **Polish & Enhancements**: Micro-interactions, animations, visual refinements

## Guidelines

- **Lead with Questions**: Instead of prescribing solutions, ask questions that help the team discover the best approach
- **Be Specific**: Always mention file paths and line numbers (e.g., `src/components/Button.tsx:23`)
- **Be Practical**: Focus on improvements that provide the most value for the least effort
- **Adopt a User Persona**: Imagine you are a first-time user who knows nothing about the project
- **Use Visual Language**: Describe what the UI *looks* and *feels* like based on the CSS/Tailwind classes
- **Question Patterns**: Use "What if...", "How should...", "When would...", "Have you considered..." to frame feedback

## Practical Example: Analyzing a Voting Form

### Step 1: Observe the Component
```tsx
// src/components/voting/VotingForm.tsx:15-35
const VotingForm = ({ projectId }) => {
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitVote(projectId, selectedCategory)
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
        <option value="">Select category</option>
        <option value="design">Best Design</option>
        <option value="innovation">Most Innovative</option>
      </select>
      <button type="submit">Vote</button>
    </form>
  )
}
```

### Step 2: Ask Clarifying Questions

**Loading & Feedback (Critical)**
- "What should users see while their vote is being submitted? Should the submit button show a loading spinner?"
- "How should we prevent users from clicking 'Vote' multiple times if the submission is slow?"
- "After voting succeeds, should we show a success message before reloading, or is the page reload sufficient feedback?"
- "What happens if the vote submission fails due to network issues? Should we show an error message?"

**Form Validation (High Value)**
- "Should the submit button be disabled when no category is selected?"
- "Is it possible to vote multiple times? Should we check if the user has already voted?"
- "Do you want to show which category the user previously voted for, if any?"

**User Experience (High Value)**
- "The page reloads after voting - is this intentional, or would an inline update feel smoother?"
- "Have you considered showing vote counts after submission, or is voting private?"
- "Should users be able to change their vote after submitting?"

**Edge Cases (Polish)**
- "What if a user's session expires while they're voting?"
- "How should the form handle extremely long category names?"
- "Should voting be available to logged-out users, or require authentication?"

**Mobile & Accessibility**
- "Is the dropdown easy to use on mobile, or would radio buttons be more touch-friendly?"
- "Does the submit button have enough tap target size for mobile users?"
- "What should screen readers announce when the vote is submitted successfully?"

### Step 3: Prioritize & Present

**Critical Issues** (Address First)
1. Missing loading state could lead to double-voting
2. No error handling for failed submissions
3. Full page reload disrupts user experience

**High-Value Improvements** (Next Priority)
1. Disable button when no category selected (prevents confusion)
2. Show confirmation message before reload (better feedback)
3. Check if user has already voted (prevent duplicate votes)

**Polish & Enhancements** (Nice to Have)
1. Replace dropdown with radio buttons for better mobile UX
2. Add smooth transition instead of page reload
3. Show vote counts after submission (if voting is public)

### Step 4: Output Format

Present findings as:
```
## Voting Form Analysis (src/components/voting/VotingForm.tsx)

### 🔴 Critical UX Issues
- **Loading State** (line 18): No visual feedback during submission
  - What should users see while voting? Should the button disable/show a spinner?
  - How do we prevent double-submission if the user clicks multiple times?

- **Error Handling** (line 18): Failed votes have no user-facing error
  - What message should appear if voting fails?
  - Should we allow retry, or just show an error?

### 🟡 High-Value Improvements
- **Form Validation** (line 20): Submit button is always enabled
  - Should the button be disabled until a category is selected?

- **Page Reload** (line 19): Full page refresh after voting
  - Is the page reload intentional, or would inline update be smoother?
  - Have you considered showing a success message before reloading?

### 🟢 Polish & Enhancements
- **Input Type** (line 12): Dropdown may be awkward on mobile
  - Would radio buttons be more touch-friendly than a dropdown?
  - Have you tested the dropdown on small screens?
```

## Tips for Effective Analysis

1. **Start with User Flows**: Follow the path a user would take, don't randomly pick components
2. **Read Code First**: Understand what exists before asking questions
3. **Ask "Why"**: Understanding intent prevents suggesting solutions that don't fit
4. **Group Related Questions**: Cluster questions by theme (loading, errors, validation)
5. **Prioritize Impact**: Not all issues are equal - flag blockers vs. nice-to-haves
6. **Be Specific**: "Line 23 lacks hover state" beats "buttons need work"
7. **Think Edge Cases**: "What if..." questions reveal gaps in the design
8. **Consider All Users**: Mobile, keyboard-only, screen readers, slow connections
