# Spacing Guidelines

## Scale (4px base unit)

Our spacing system is based on a 4px base unit for consistent visual rhythm throughout the application.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | No spacing |
| `0.5` | 2px | Hairline spacing |
| `1` | 4px | Icon + text gaps |
| `1.5` | 6px | Tight spacing |
| `2` | 8px | Related items |
| `3` | 12px | Form fields, small gaps |
| `4` | 16px | Card sections, standard padding |
| `5` | 20px | Medium spacing |
| `6` | 24px | Card padding, medium gaps |
| `8` | 32px | Major sections |
| `10` | 40px | Large spacing |
| `12` | 48px | Section spacing |
| `16` | 64px | Extra large spacing |
| `20` | 80px | XXL spacing |
| `24` | 96px | Huge spacing |

## Common Patterns

### Gaps (Flexbox/Grid)
- `gap-1` (4px) - Icon + text in buttons
- `gap-2` (8px) - Related items, small components
- `gap-3` (12px) - Form fields, medium components
- `gap-4` (16px) - Card content sections
- `gap-6` (24px) - Card grid, component spacing
- `gap-8` (32px) - Major sections
- `gap-12` (48px) - Page sections

### Padding
- `p-2` (8px) - Tight padding for badges/chips
- `p-4` (16px) - Standard button/small card padding
- `p-6` (24px) - Standard card padding
- `p-8` (32px) - Large card/section padding

### Margins
- `mb-2` / `mt-2` (8px) - Small vertical spacing
- `mb-4` / `mt-4` (16px) - Standard vertical spacing
- `mb-6` / `mt-6` (24px) - Medium vertical spacing
- `mb-8` / `mt-8` (32px) - Large section spacing

### Responsive Spacing
Use responsive variants when needed:
- `gap-2 sm:gap-4` - Increase spacing on larger screens
- `p-4 md:p-6` - More padding on desktop

## Best Practices

1. **Consistency**: Use the spacing scale consistently across the app
2. **Hierarchy**: Larger spacing = greater separation/importance
3. **Grouping**: Related items should have smaller gaps (gap-2 to gap-4)
4. **Sections**: Major sections should have larger gaps (gap-8 to gap-12)
5. **Responsive**: Consider adjusting spacing for mobile vs desktop

## Examples

### Card Layout
```tsx
<Card className="p-6 space-y-4">
  <h3 className="text-lg font-semibold">Title</h3>
  <div className="flex items-center gap-2">
    <Icon size={16} />
    <span>Label</span>
  </div>
</Card>
```

### Grid Layout
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>
```

### Form Layout
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <label>Field Label</label>
    <input className="px-4 py-3" />
  </div>
</form>
```

## Migration Notes

When updating existing components:
1. Look for hardcoded pixel values in className
2. Replace with appropriate spacing tokens
3. Test on mobile and desktop
4. Verify visual consistency with design system
