# React Design Tokens Template

This template provides a comprehensive design system foundation for React applications using design tokens.

## 🎨 What's Included

### Design Token Structure
- **Core Tokens**: Base values (colors, spacing, typography, shadows)
- **Semantic Tokens**: Contextual meanings (text, background, border colors)
- **Component Tokens**: Component-specific values (button, card styles)

### Generated Files
- `src/styles/tokens.css` - CSS custom properties
- `src/types/tokens.d.ts` - TypeScript type definitions
- `tailwind.config.js` - Tailwind configuration (if enabled)

### Example Components
- `Button.tsx` - Demonstrates variant patterns and token usage
- `Card.tsx` - Shows component-level tokens and responsive design

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Generate Design Tokens
```bash
npm run tokens:sync
```

### 3. Start Development
```bash
npm run tokens:watch  # Auto-sync tokens on changes
npm start            # Start your React app
```

## 💡 Using Design Tokens

### CSS Custom Properties
```css
.my-component {
  /* Use semantic tokens for meaning */
  color: var(--semantic-colors-text-primary);
  background: var(--semantic-colors-background-primary);
  
  /* Use core tokens for spacing */
  padding: var(--core-spacing-4) var(--core-spacing-6);
  border-radius: var(--core-border-radius-md);
  
  /* Use component tokens for consistency */
  box-shadow: var(--core-shadows-base);
}
```

### Tailwind Classes (if enabled)
```jsx
<div className="bg-gray-50 text-gray-900 p-4 rounded-md shadow-base">
  Content with token-based styles
</div>
```

### TypeScript Support
```typescript
import { Tokens } from '../types/tokens';

// Get typed token values
const primaryColor: string = Tokens.semantic.colors.brand.primary;
const spacing: string = Tokens.core.spacing[4];
```

## 🏗️ Architecture Patterns

### Component Variants
```tsx
// Button.tsx - Variant pattern
export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  children 
}) => {
  const classes = \`btn btn--\${variant} btn--\${size}\`;
  return <button className={classes}>{children}</button>;
};
```

### CSS Class Naming Convention
```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__title { }

/* Modifier */
.card--elevated { }
.card--outlined { }

/* State */
.card:hover { }
.card:focus { }
```

### Token Usage Hierarchy
1. **Component Tokens** first (if available)
2. **Semantic Tokens** for meaning
3. **Core Tokens** for base values

```css
.btn--primary {
  /* 1. Component token (preferred) */
  background: var(--component-button-primary-background-color);
  
  /* 2. Semantic token (fallback) */
  color: var(--semantic-colors-text-inverse);
  
  /* 3. Core token (base values) */
  padding: var(--core-spacing-3) var(--core-spacing-6);
}
```

## 📁 File Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   └── index.ts
│   └── Card/
│       ├── Card.tsx
│       ├── Card.css
│       └── index.ts
├── styles/
│   ├── tokens.css      # Generated token styles
│   ├── globals.css     # Global styles
│   └── components.css  # Component imports
├── types/
│   └── tokens.d.ts     # Generated TypeScript types
└── hooks/
    └── useTokens.ts    # Token utilities (if generated)
```

## 🎯 Best Practices

### 1. Use Semantic Tokens
```css
/* ✅ Good - Semantic meaning */
color: var(--semantic-colors-text-primary);

/* ❌ Avoid - Direct color reference */
color: var(--core-colors-gray-900);
```

### 2. Create Component Variants
```tsx
// ✅ Good - Flexible component API
<Button variant="primary" size="lg">Submit</Button>

// ❌ Avoid - Hardcoded styles
<button style={{ backgroundColor: '#3b82f6' }}>Submit</button>
```

### 3. Follow Token Hierarchy
```css
/* ✅ Good - Use most specific token available */
padding: var(--component-button-padding);

/* ✅ Acceptable - Semantic token when component token doesn't exist */
margin: var(--core-spacing-4);
```

### 4. Maintain Consistency
```tsx
// ✅ Good - Consistent spacing
<div className="space-y-4">  {/* Uses spacing tokens */}
  <Card>Content</Card>
  <Card>Content</Card>
</div>
```

## 🔧 Customization

### Adding New Tokens
1. Edit `tokens.json`
2. Run `npm run tokens:sync`
3. Use new tokens in your components

### Creating Custom Components
```tsx
// MyComponent.tsx
export const MyComponent: React.FC<Props> = ({ children }) => (
  <div className="my-component">
    {children}
  </div>
);
```

```css
/* MyComponent.css */
.my-component {
  background: var(--semantic-colors-background-secondary);
  border: 1px solid var(--semantic-colors-border-default);
  border-radius: var(--core-border-radius-lg);
  padding: var(--core-spacing-6);
}
```

## 📊 Analytics

Track token usage with:
```bash
npm run tokens:analytics        # Console report
npm run tokens:analytics --html # Visual report
```

## 🔄 Workflow

### Development
```bash
npm run tokens:watch    # Auto-sync on token changes
npm run dev            # Start development server
```

### Before Commit
```bash
npm run tokens:validate # Check token structure
npm run tokens:sync     # Ensure tokens are up-to-date
```

### CI/CD Integration
The included GitHub Actions workflow automatically:
- Syncs tokens on push
- Validates token structure
- Generates analytics reports

## 🆘 Troubleshooting

### Tokens Not Updating
```bash
# Force regenerate tokens
npm run tokens:sync --force

# Clear cache and rebuild
rm -rf .tokens-sync-cache.json
npm run tokens:sync
```

### CSS Variables Not Working
1. Ensure `tokens.css` is imported in your app
2. Check token names match exactly (use dev tools)
3. Verify token hierarchy (component > semantic > core)

### TypeScript Errors
```bash
# Regenerate TypeScript definitions
npm run tokens:sync
```

## 🔗 Related

- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [Token Studio Documentation](https://docs.tokens.studio/)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) 