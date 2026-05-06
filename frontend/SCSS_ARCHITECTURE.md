# SCSS Architecture Documentation

## Overview

The project has been migrated from CSS Modules to SCSS with a proper architecture. This provides better maintainability, reusability, and developer experience.

## Structure

```
styles/
├── scss/
│   ├── _variables.scss   # All colors, spacing, typography, breakpoints
│   ├── _mixins.scss       # Reusable mixins (media queries, effects, utilities)
│   └── _functions.scss    # SCSS functions (rem converter, color utilities)
└── globals.scss           # Global styles, resets, base typography

components/
└── [ComponentName]/
    └── ComponentName.module.scss   # Component-specific styles with nesting

app/[locale]/
└── [page]/
    └── page.module.scss    # Page-specific styles with nesting
```

## Key Features

### 1. Variables (`_variables.scss`)

All design tokens are centralized:
- **Colors**: Background, text, accent colors
- **Spacing**: Consistent spacing scale
- **Typography**: Font families and sizes
- **Breakpoints**: Mobile, tablet, desktop, wide
- **Transitions**: Animation durations

Example:
```scss
$bg-primary: #0B0B0B;
$accent-gold: #C9A15D;
$spacing-md: 24px;
$breakpoint-tablet: 768px;
```

### 2. Mixins (`_mixins.scss`)

Reusable style patterns:
- **Media Queries**: `@include mobile`, `@include tablet`, `@include desktop`
- **Effects**: `@include glass-effect`, `@include hover-glow`
- **Utilities**: `@include gpu-accelerate`, `@include flex-center`
- **Animations**: `@include fade-in`

Example:
```scss
.myComponent {
  @include glass-effect(0.25, 24px);
  
  @include mobile {
    padding: $spacing-sm;
  }
  
  @include desktop {
    padding: $spacing-lg;
  }
}
```

### 3. Functions (`_functions.scss`)

SCSS helper functions:
- `rem($pixels)` - Convert px to rem
- `lighten-color($color, $amount)` - Lighten a color
- `darken-color($color, $amount)` - Darken a color
- `alpha($color, $opacity)` - Add transparency

Example:
```scss
font-size: rem(16);  // 1rem
background: alpha($bg-primary, 0.8);
```

### 4. Component Styles

Each component has its own `.module.scss` file with:
- **Nesting**: Natural hierarchy
- **BEM-like naming**: Clear class names
- **Responsive**: Mobile-first approach
- **Variables**: Use global tokens

Example structure:
```scss
@use '../../styles/scss/variables' as *;
@use '../../styles/scss/mixins' as *;

.component {
  padding: $spacing-lg;
  
  &.variant {
    background: $accent-gold;
  }
  
  @include mobile {
    padding: $spacing-sm;
  }
}

.title {
  font-family: $font-display;
  color: $text-primary;
  
  &:hover {
    color: $accent-gold;
  }
}
```

## Benefits

### ✅ Better Organization
- Variables in one place
- Reusable mixins
- Logical file structure

### ✅ Easier Maintenance
- Change a variable → updates everywhere
- Consistent spacing and colors
- Clear component hierarchy

### ✅ Developer Experience
- IntelliSense for variables
- Nesting for better readability
- Functions for calculations

### ✅ Performance
- Same CSS Modules output
- No runtime overhead
- Optimized builds

## Usage Examples

### Responsive Design
```scss
.hero {
  padding: 60px 0;
  
  @include tablet {
    padding: 80px 0;
  }
  
  @include desktop {
    padding: 120px 0;
  }
}
```

### Glass Effect
```scss
.card {
  @include glass-effect(0.25, 24px);  // opacity, blur
}
```

### Hover Effects
```scss
.button {
  background: $accent-gold;
  @include hover-glow($accent-gold, 0.3);
}
```

### GPU Acceleration
```scss
.videoContainer {
  @include gpu-accelerate;
}
```

## Migration Notes

All CSS files have been successfully migrated to SCSS:
- ✅ Component modules converted
- ✅ Page modules converted
- ✅ Global styles converted
- ✅ All imports updated
- ✅ Old CSS files removed

## Best Practices

1. **Always use variables** for colors, spacing, and typography
2. **Use mixins** for responsive design and common patterns
3. **Nest logically** but don't go more than 3-4 levels deep
4. **Import order**: variables first, then mixins
5. **Mobile-first**: Base styles for mobile, then `@include tablet/desktop`

## Adding New Styles

When creating a new component:

1. Create `ComponentName.module.scss`
2. Import variables and mixins:
   ```scss
   @use '../../styles/scss/variables' as *;
   @use '../../styles/scss/mixins' as *;
   ```
3. Use nesting and variables
4. Add responsive styles with mixins
5. Import in component: `import styles from './ComponentName.module.scss';`

## Troubleshooting

If you see compilation errors:
1. Check import paths (`@use` statements)
2. Ensure `sass` package is installed
3. Clear `.next` cache: `Remove-Item -Recurse -Force .next`
4. Restart dev server

## Resources

- [Sass Documentation](https://sass-lang.com/documentation)
- [CSS Modules with Next.js](https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css)
- Project's `_variables.scss`, `_mixins.scss`, `_functions.scss`
