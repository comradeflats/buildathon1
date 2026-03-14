# UX Analysis Question Templates

A collection of question frameworks to guide productive UI/UX feedback conversations.

## Navigation & Flow Questions

### Happy Path Discovery
- "What's the #1 action you want first-time users to take when they land on the site?"
- "If a user has only 30 seconds, what should they be able to accomplish?"
- "How many clicks should it take to get from landing page to [core action]?"

### Lost User Scenarios
- "What happens if a user clicks the back button during [process]?"
- "How should users navigate back to [previous state] after completing [action]?"
- "What if a user accidentally clicks away from [important form] - should their progress be saved?"

### Navigation Clarity
- "How will users know which page they're currently on?"
- "Should there be breadcrumbs for [deep nested page]? How would they work?"
- "Is the global navigation always visible, or does it hide on scroll?"

## Interaction & Feedback Questions

### Loading & Async States
- "What should users see while [data] is loading? A skeleton, spinner, or something else?"
- "How long is too long for [operation] to take before showing a 'this is taking longer than expected' message?"
- "Should the entire page wait for [data], or can parts load progressively?"

### Success & Error Handling
- "How should we celebrate when a user successfully [completes action]?"
- "What's the most helpful error message if [operation] fails? Should we show technical details?"
- "If submission fails, should form data be preserved so users don't lose their work?"

### Button & Action States
- "Should the [primary action] button be disabled before all required fields are filled?"
- "What visual feedback indicates a button has been clicked vs. is processing vs. completed?"
- "How do we prevent double-submissions when users click [button] multiple times?"

### Empty & Zero States
- "What should users see when there are no [items] yet? Just a message, or a call-to-action?"
- "How can we make the empty state feel inviting rather than broken?"
- "Should we show example/placeholder content to demonstrate what will appear here?"

## Form & Input Questions

### Validation & Error Prevention
- "Should validation happen on blur, on submit, or real-time as users type?"
- "How specific should error messages be? (e.g., 'Invalid email' vs. 'Email must contain @')"
- "Can we validate [field] before submission to catch errors earlier?"

### Input UX
- "Should [text field] have a character counter if there's a limit?"
- "Would placeholder text be helpful here, or does it add clutter?"
- "Is autocomplete appropriate for [field]? What should it suggest?"

### Multi-Step Forms
- "Should users be able to go back to previous steps and edit their answers?"
- "How do we show progress through the form? Step indicators, progress bar, or something else?"
- "What happens if a user abandons the form halfway through - should we save their progress?"

## Visual Design & Consistency Questions

### Color & Contrast
- "I notice [element] uses [color] - is this part of your color system or a one-off choice?"
- "The text in [component] appears to have low contrast - is this intentional for de-emphasis?"
- "How should we differentiate between [primary], [secondary], and [tertiary] actions visually?"

### Typography & Hierarchy
- "What's the intended visual hierarchy on [page]? What should users read first?"
- "Should headings use [current size] or is there a system we're following?"
- "How do we distinguish between [type A content] and [type B content] typographically?"

### Spacing & Layout
- "I see different spacing values used in similar contexts - is there a spacing scale we should follow?"
- "Should [component] align with [other component], or is the offset intentional?"
- "How should [element] behave when the content is much longer/shorter than expected?"

## Mobile & Responsive Questions

### Breakpoint Behavior
- "How should [complex layout] reorganize on mobile screens?"
- "Should [sidebar] become a drawer/modal on mobile, or hide completely?"
- "What's the mobile equivalent of [hover interaction]?"

### Touch Interactions
- "Are all tap targets at least 44x44px? Should we increase size for [small button]?"
- "How should [swipe gesture] work, if at all?"
- "Should mobile users see a condensed version of [data table], or scroll horizontally?"

### Mobile-First Considerations
- "What if we designed [feature] for mobile first - would that simplify the desktop version too?"
- "Should mobile users have the same capabilities as desktop, or a focused subset?"

## Accessibility Questions

### Screen Reader Experience
- "What should screen readers announce when [dynamic content] updates?"
- "Do all icon-only buttons have descriptive aria-labels?"
- "How will keyboard-only users navigate through [complex component]?"

### Semantic Structure
- "Should [visual heading] actually be an `<h2>` or just styled text?"
- "Is this truly a `<button>` or should it be a link since it navigates somewhere?"
- "What's the logical reading order vs. visual order on this page?"

### Focus Management
- "Where should focus go after closing [modal/dialog]?"
- "Are focus states visible enough for keyboard navigation?"
- "Should we trap focus inside [overlay], or allow tabbing to background content?"

## Performance & Perception Questions

### Perceived Performance
- "What can we show immediately while [heavy content] loads in the background?"
- "Would optimistic UI (showing success before confirmation) improve the feel of [action]?"
- "Should we preload [next page] when users hover over [link]?"

### Content Priority
- "What's the minimum content needed for [page] to feel 'loaded'?"
- "Should images load lazily, or is [hero image] critical to show immediately?"
- "Can we defer loading [below-fold content] to speed up initial render?"

## Data & Content Questions

### Content Strategy
- "Who writes the content for [error message/empty state/tooltip]? Should we draft it now?"
- "How much text is too much for [component]? What if content is 3x longer than designed for?"
- "Should we show all [items] or paginate after N items?"

### Data Freshness
- "How often should [data] refresh? Automatically, on manual refresh, or on page load only?"
- "If [data] is stale, should we show a timestamp or indicator?"
- "What happens if [API] returns empty/null - is that an error or a valid state?"

### User-Generated Content
- "How do we handle inappropriate content in [user input field]?"
- "Should [user content] be escaped/sanitized before display?"
- "What if someone enters 1000 characters in [field designed for 50]?"

## Edge Cases & Boundaries

### Extreme Scenarios
- "What if a user has 0 [items]? 1 item? 1000 items?"
- "How does [layout] handle a username that's 50 characters vs. 3 characters?"
- "What if [image] fails to load? Should we show a fallback/placeholder?"

### Permission & Authentication
- "What should unauthenticated users see on [protected page]?"
- "If a user's session expires during [action], how do we handle it gracefully?"
- "Should we show [feature] to users who don't have permission, but disabled/locked?"

### Network & Offline
- "What happens if [action] is triggered while offline?"
- "Should we show a 'connection lost' indicator, or handle it silently?"
- "Can users continue using [feature] with stale data while we retry in the background?"

## Question-Asking Techniques

### The "What If" Technique
Format: "What if [unexpected user behavior / edge case]?"
- Forces consideration of scenarios not in the happy path
- Example: "What if a user clicks 'Submit' 10 times in quick succession?"

### The "How Should" Technique
Format: "How should [UI element/system] behave when [condition]?"
- Clarifies intended behavior
- Example: "How should the search bar behave when there are 0 results?"

### The "Have You Considered" Technique
Format: "Have you considered [alternative approach / tradeoff]?"
- Introduces new perspectives without being prescriptive
- Example: "Have you considered using a stepper component instead of separate pages?"

### The "User Journey" Technique
Format: "Walk me through what happens when a user [starts action] to [completes action]"
- Reveals gaps in the flow
- Example: "Walk me through what happens when a user submits a project for the first time"

### The "Why" Ladder
- Start with observation: "I notice [thing]"
- Ask why it's designed that way
- Ask what problem it solves
- Ask if there are alternative solutions
- Example: "I notice the voting form reloads the page on submit. What's the reason for a full page refresh rather than an inline update?"

## Usage Guidelines

1. **Ask 3-5 questions per component/page** - More than that becomes overwhelming
2. **Mix question types** - Combine technical, UX, and edge case questions
3. **Prioritize by impact** - Ask about critical flows first, polish last
4. **Be curious, not critical** - Frame as genuine inquiry, not implied criticism
5. **Offer context** - Explain why the question matters for UX
6. **Suggest, don't mandate** - "Have you considered..." not "You should..."
