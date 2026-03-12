# UI/UX Deep Analysis Checklist

Use this checklist when performing a deep UI/UX analysis of a project.

## 1. Visual Consistency & Brand Identity
- **Color Palette**: Are colors used consistently? Does the project follow a defined primary/secondary/accent system?
- **Typography**: Are font sizes, weights, and styles consistent across headings, body text, and UI elements?
- **Spacing/Grid**: Is there a consistent rhythm in margins and padding?
- **Iconography**: Are icons from the same family? Do they have consistent sizing and stroke weights?

## 2. Navigation & Information Architecture
- **Primary Flow**: How easy is it for a new user to reach the core value proposition (e.g., "Submit Project", "Vote")?
- **Breadcrumbs/Back buttons**: Can the user easily return to previous states or parent pages?
- **Global Navigation**: Is the navbar/sidebar intuitive? Does it clearly show the active state?
- **Search/Filtering**: Are discovery mechanisms (search bars, dropdowns) easy to find and use?

## 3. Interaction Design & Feedback
- **Loading States**: Are there skeletons or spinners for async operations?
- **Empty States**: What happens when there is no data? Are there clear CTAs?
- **Success/Error Feedback**: Are toast notifications or inline alerts used for form submissions or errors?
- **Button States**: Do buttons have hover, active, and disabled states? Is the primary action visually distinct?

## 4. Forms & Input
- **Validation**: Is validation real-time or only on submit? Are error messages clear and helpful?
- **Input Types**: Are appropriate input types used (e.g., `type="url"`, `type="email"`)?
- **Labels & Placeholders**: Are labels clear? Do placeholders provide helpful examples?

## 5. Accessibility (a11y)
- **Contrast**: Is text readable against its background?
- **Semantic HTML**: Are `header`, `nav`, `main`, `footer`, `h1-h6`, and `button` tags used correctly?
- **Aria Labels**: Do interactive elements without text (like icon-only buttons) have `aria-label`?

## 6. Mobile Responsiveness
- **Layout Shifts**: Does the layout break on small screens?
- **Touch Targets**: Are buttons and links large enough for fingers (min 44x44px)?
- **Navigation**: Is there a mobile menu (hamburger)?

## 7. Intuitive vs. Non-intuitive Flows
- **Friction Points**: Where might a user get confused or stuck?
- **Magic Moments**: Are there parts of the UX that feel particularly smooth or delightful?
- **Cognitive Load**: Is there too much information on one screen?
