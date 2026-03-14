# UI/UX Deep Analysis Checklist

Use this checklist when performing a deep UI/UX analysis of a project. For each item, frame your findings as **questions** that prompt discussion and improvement rather than prescriptive fixes.

**Format for each section:**
- Observe what exists
- Ask questions about intent, edge cases, and improvements
- Reference specific files and line numbers

## 1. Visual Consistency & Brand Identity
- **Color Palette**: Are colors used consistently? Does the project follow a defined primary/secondary/accent system?
  - _Questions to ask_: "What's your intended color palette? Are there specific meanings for each color (e.g., red for errors, green for success)?" "I noticed three shades of blue used - is this intentional or should they be unified?"
- **Typography**: Are font sizes, weights, and styles consistent across headings, body text, and UI elements?
  - _Questions to ask_: "Is there a type scale/system being followed? Should all headings use the same font weight?" "What's the intended hierarchy - which content should draw attention first?"
- **Spacing/Grid**: Is there a consistent rhythm in margins and padding?
  - _Questions to ask_: "I see spacing values of 12px, 16px, and 20px used - is there a spacing scale we should standardize to?" "Should components always align to a grid?"
- **Iconography**: Are icons from the same family? Do they have consistent sizing and stroke weights?
  - _Questions to ask_: "Are we using icons from a single library (e.g., Lucide, Heroicons)?" "Should all icons be the same size, or do some deserve more visual weight?"

## 2. Navigation & Information Architecture
- **Primary Flow**: How easy is it for a new user to reach the core value proposition (e.g., "Submit Project", "Vote")?
  - _Questions to ask_: "What's the #1 action first-time users should take? How many clicks to get there?" "If a user lands on the homepage, what's the clearest path to [core feature]?"
- **Breadcrumbs/Back buttons**: Can the user easily return to previous states or parent pages?
  - _Questions to ask_: "What happens if a user clicks back during [process]? Should progress be saved?" "Are breadcrumbs needed for deep nested pages?"
- **Global Navigation**: Is the navbar/sidebar intuitive? Does it clearly show the active state?
  - _Questions to ask_: "How will users know which page they're currently on?" "Should navigation be sticky, or can it scroll away?" "Is the mobile menu discoverable?"
- **Search/Filtering**: Are discovery mechanisms (search bars, dropdowns) easy to find and use?
  - _Questions to ask_: "What should happen when search returns 0 results?" "Should filters be immediately visible or hidden in a dropdown?" "Do filters apply on selection or require a 'Submit' button?"

## 3. Interaction Design & Feedback
- **Loading States**: Are there skeletons or spinners for async operations?
  - _Questions to ask_: "What should users see while [data] loads? Skeleton, spinner, or progressive content?" "How long is acceptable before showing 'this is taking longer than usual'?" "Should the whole page wait, or can sections load independently?"
- **Empty States**: What happens when there is no data? Are there clear CTAs?
  - _Questions to ask_: "What should users see when there are 0 [items]? A helpful message or call-to-action?" "Should we show example content to illustrate what will appear here?" "Is the empty state encouraging or does it feel broken?"
- **Success/Error Feedback**: Are toast notifications or inline alerts used for form submissions or errors?
  - _Questions to ask_: "How should we celebrate successful [action]?" "Should error messages be technical or user-friendly?" "Do errors clear automatically or require dismissal?" "Should success toasts auto-dismiss or persist?"
- **Button States**: Do buttons have hover, active, and disabled states? Is the primary action visually distinct?
  - _Questions to ask_: "What visual feedback shows a button has been clicked vs. is processing?" "Should buttons disable during submission to prevent double-clicks?" "How do we differentiate primary, secondary, and tertiary actions?"

## 4. Forms & Input
- **Validation**: Is validation real-time or only on submit? Are error messages clear and helpful?
  - _Questions to ask_: "Should validation happen as users type, on blur, or only on submit?" "What's the most helpful error message for [invalid input]?" "If submission fails, should form data be preserved?" "Can we validate [field] earlier to catch errors before submission?"
- **Input Types**: Are appropriate input types used (e.g., `type="url"`, `type="email"`)?
  - _Questions to ask_: "Should [field] use a specialized input type for better mobile keyboards?" "Would a date picker be better than free text?" "Is autocomplete helpful or annoying for [field]?"
- **Labels & Placeholders**: Are labels clear? Do placeholders provide helpful examples?
  - _Questions to ask_: "Are labels descriptive enough, or do users need extra context?" "Should placeholder text show format examples (e.g., 'john@example.com')?" "Do required fields have visual indicators?"

## 5. Accessibility (a11y)
- **Contrast**: Is text readable against its background?
  - _Questions to ask_: "Does [text on colored background] meet WCAG AA contrast ratios?" "Is low contrast intentional for de-emphasis, or should it be improved?"
- **Semantic HTML**: Are `header`, `nav`, `main`, `footer`, `h1-h6`, and `button` tags used correctly?
  - _Questions to ask_: "Should [styled div] actually be a semantic element like `<button>` or `<nav>`?" "What's the heading hierarchy - should this be an `<h2>` or just styled text?" "Is [clickable div] better as a proper `<button>` or `<a>` tag?"
- **Aria Labels**: Do interactive elements without text (like icon-only buttons) have `aria-label`?
  - _Questions to ask_: "What should screen readers announce for [icon-only button]?" "Do all form inputs have associated labels?" "How will keyboard-only users navigate [complex component]?"

## 6. Mobile Responsiveness
- **Layout Shifts**: Does the layout break on small screens?
  - _Questions to ask_: "How should [multi-column layout] reorganize on mobile?" "Should [sidebar] become a drawer, or hide completely?" "What breaks first when the screen gets narrow?"
- **Touch Targets**: Are buttons and links large enough for fingers (min 44x44px)?
  - _Questions to ask_: "Are all tap targets big enough for comfortable tapping?" "Should we increase spacing between [adjacent buttons] on mobile?" "Is [small icon button] usable on touch screens?"
- **Navigation**: Is there a mobile menu (hamburger)?
  - _Questions to ask_: "How should navigation work on mobile? Hamburger menu, bottom bar, or something else?" "Should the mobile menu slide in from which direction?" "What's the mobile alternative to [hover interaction]?"

## 7. Intuitive vs. Non-intuitive Flows
- **Friction Points**: Where might a user get confused or stuck?
  - _Questions to ask_: "What could confuse a first-time user at [step]?" "If you removed all instructional text, would the flow still make sense?" "Where might users abandon the process?"
- **Magic Moments**: Are there parts of the UX that feel particularly smooth or delightful?
  - _Questions to ask_: "What makes [interaction] feel good?" "Could this pattern be applied elsewhere for consistency?" "How can we make [mundane task] feel more satisfying?"
- **Cognitive Load**: Is there too much information on one screen?
  - _Questions to ask_: "What's the minimum info needed to make a decision here?" "Could [complex page] be broken into steps?" "What can be hidden by default and revealed on demand?" "Is [feature] causing distraction from [primary goal]?"

## 8. Edge Cases & Boundaries
- **Data Extremes**: Test with 0 items, 1 item, 100+ items
  - _Questions to ask_: "What if a user has 0 [items]? Does the UI still work?" "How does [layout] handle extremely long text/usernames?" "What if [image] fails to load?"
- **Network & Performance**: Consider slow connections, offline, errors
  - _Questions to ask_: "What happens if [action] is triggered while offline?" "Should we show stale data with a warning, or block the UI?" "How do we handle timeouts gracefully?"
- **Permissions & Auth**: Think about logged-out, unauthorized, expired sessions
  - _Questions to ask_: "What should logged-out users see on [protected page]?" "If a session expires mid-action, how do we handle it?" "Should disabled features be hidden or shown as locked?"
