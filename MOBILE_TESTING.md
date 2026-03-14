# Mobile Testing Checklist

## Test Viewports

Test the application at these common mobile viewport sizes:

- **320px** - iPhone SE (smallest common mobile)
- **375px** - iPhone 12/13 (most common)
- **768px** - iPad portrait (tablet)

## General Checks

### Layout
- [ ] No horizontal scroll on any page
- [ ] Text doesn't overflow containers
- [ ] Images scale properly
- [ ] Cards stack vertically on mobile
- [ ] Grids adapt to single column when needed

### Typography
- [ ] All text is readable (minimum 14px for body text)
- [ ] Headings scale appropriately (use responsive text sizing)
- [ ] Long words/URLs break properly (break-words-safe applied)
- [ ] Line height is comfortable for reading

### Touch Targets
- [ ] All buttons are at least 44x44px (iOS guideline)
- [ ] Links have adequate spacing between them
- [ ] Form inputs are easy to tap
- [ ] Dropdown menus are accessible

### Navigation
- [ ] Mobile navigation icons appear correctly
- [ ] Active states are visible
- [ ] User menu is accessible
- [ ] Theme toggle works on mobile

## Page-Specific Tests

### Events Page (`/events`)
- [ ] Header title wraps properly
- [ ] Region filter is full-width on mobile
- [ ] View toggle buttons are accessible
- [ ] Map displays correctly
- [ ] Event cards stack vertically
- [ ] Empty states display properly with CTA

### Dashboard (`/dashboard`)
- [ ] Cards stack on mobile
- [ ] Stats are readable
- [ ] Quick actions are accessible

### Voting Form (`/vote`)
- [ ] Project title wraps without overflow
- [ ] Team name displays properly
- [ ] Rating sliders are easy to use
- [ ] All criteria visible and rateable
- [ ] Submit button is prominent
- [ ] Loading state is clear

### Leaderboard (`/leaderboard`)
- [ ] Table scrolls horizontally if needed
- [ ] Team names don't overflow
- [ ] Scores are readable
- [ ] Filters work on mobile

### Settings (`/settings`)
- [ ] Form fields are full-width on mobile
- [ ] Input labels are visible
- [ ] Save button is accessible
- [ ] Social links section works

## Form Testing

- [ ] All inputs are tappable and usable
- [ ] Keyboard doesn't cover inputs (iOS)
- [ ] Form validation messages are visible
- [ ] Submit buttons are reachable
- [ ] Success/error messages display properly

## Performance

- [ ] Pages load quickly on 3G
- [ ] Images are optimized
- [ ] No layout shift on load
- [ ] Smooth scrolling

## Accessibility

- [ ] Text contrast meets WCAA standards
- [ ] Focus states are visible
- [ ] Screen reader compatible
- [ ] Zoom to 200% works without breaking layout

## Testing Tools

### Browser DevTools
1. Chrome DevTools Device Mode
2. Firefox Responsive Design Mode
3. Safari Web Inspector (for iOS testing)

### Real Devices
- Test on actual iOS device
- Test on actual Android device
- Consider different screen sizes

### Online Tools
- BrowserStack (real device testing)
- Responsive Design Checker
- Google Mobile-Friendly Test

## Common Issues to Watch For

1. **Text Overflow**: Long project names, URLs, email addresses
2. **Fixed Widths**: Components with hardcoded pixel widths
3. **Small Touch Targets**: Buttons or links smaller than 44px
4. **Hidden Content**: Elements that disappear on mobile
5. **Horizontal Scroll**: Usually caused by fixed-width elements
6. **Font Sizes**: Too small text (below 14px)
7. **Spacing Issues**: Elements too close together

## Quick Fixes

- Add `break-words-safe` class to prevent text overflow
- Use `w-full` on mobile, `w-auto` on desktop
- Use responsive text sizes: `text-sm sm:text-base`
- Add `px-4` padding to containers
- Use `gap-4` instead of fixed margins
- Test with Chrome DevTools throttling enabled

## Sign-Off

After testing all items:
- [ ] All critical issues resolved
- [ ] No horizontal scroll on any page
- [ ] All touch targets meet minimum size
- [ ] Typography is readable across all viewports
- [ ] Forms are fully functional on mobile
