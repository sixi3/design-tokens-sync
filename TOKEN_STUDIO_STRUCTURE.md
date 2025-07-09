# 🎨 Ideal Token Studio Structure for design-tokens-sync

This guide explains the optimal Token Studio structure for seamless integration with the `design-tokens-sync` package.

## 📋 Overview

The `design-tokens-sync` package works best with a **hierarchical token structure** that follows Token Studio's **token set organization**. This structure enables efficient processing, validation, and output generation.

## 🏗️ Recommended Structure

### Core Structure

```json
{
  "$schema": "https://schemas.figma.com/figma-tokens/1.0.0",
  "$metadata": {
    "tokenSetOrder": [
      "core",
      "semantic", 
      "component"
    ]
  },
  "core": {
    // Foundation tokens (primitives)
  },
  "semantic": {
    // Semantic/alias tokens 
  },
  "component": {
    // Component-specific tokens
  }
}
```

## 🎯 Token Set Breakdown

### 1. **Core Tokens** (Foundation Layer)
Foundation tokens that define the basic design language primitives.

```json
"core": {
  "colors": {
    "gray": {
      "50": { "value": "#f9fafb", "type": "color" },
      "100": { "value": "#f3f4f6", "type": "color" },
      "500": { "value": "#6b7280", "type": "color" },
      "900": { "value": "#111827", "type": "color" }
    },
    "blue": {
      "500": { "value": "#3b82f6", "type": "color" },
      "600": { "value": "#2563eb", "type": "color" }
    }
  },
  "spacing": {
    "1": { "value": "0.25rem", "type": "spacing" },
    "2": { "value": "0.5rem", "type": "spacing" },
    "4": { "value": "1rem", "type": "spacing" },
    "8": { "value": "2rem", "type": "spacing" }
  },
  "typography": {
    "fontFamily": {
      "sans": { 
        "value": ["Inter", "system-ui", "sans-serif"], 
        "type": "fontFamilies" 
      }
    },
    "fontSize": {
      "sm": { "value": "0.875rem", "type": "fontSizes" },
      "base": { "value": "1rem", "type": "fontSizes" },
      "lg": { "value": "1.125rem", "type": "fontSizes" }
    },
    "fontWeight": {
      "normal": { "value": "400", "type": "fontWeights" },
      "semibold": { "value": "600", "type": "fontWeights" }
    }
  },
  "borderRadius": {
    "sm": { "value": "0.125rem", "type": "borderRadius" },
    "md": { "value": "0.375rem", "type": "borderRadius" },
    "lg": { "value": "0.5rem", "type": "borderRadius" }
  },
  "shadows": {
    "sm": { "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "type": "boxShadow" },
    "md": { "value": "0 4px 6px -1px rgb(0 0 0 / 0.1)", "type": "boxShadow" }
  }
}
```

### 2. **Semantic Tokens** (Alias Layer)
Semantic tokens that reference core tokens with meaningful names.

```json
"semantic": {
  "colors": {
    "text": {
      "primary": { "value": "{core.colors.gray.900}", "type": "color" },
      "secondary": { "value": "{core.colors.gray.600}", "type": "color" },
      "inverse": { "value": "{core.colors.gray.50}", "type": "color" }
    },
    "background": {
      "primary": { "value": "{core.colors.gray.50}", "type": "color" },
      "secondary": { "value": "{core.colors.gray.100}", "type": "color" }
    },
    "border": {
      "default": { "value": "{core.colors.gray.200}", "type": "color" },
      "focus": { "value": "{core.colors.blue.500}", "type": "color" }
    },
    "brand": {
      "primary": { "value": "{core.colors.blue.500}", "type": "color" },
      "secondary": { "value": "{core.colors.blue.600}", "type": "color" }
    },
    "feedback": {
      "success": { "value": "{core.colors.green.500}", "type": "color" },
      "error": { "value": "{core.colors.red.500}", "type": "color" }
    }
  }
}
```

### 3. **Component Tokens** (Component Layer)
Component-specific tokens that combine multiple properties.

```json
"component": {
  "button": {
    "primary": {
      "backgroundColor": { "value": "{semantic.colors.brand.primary}", "type": "color" },
      "textColor": { "value": "{semantic.colors.text.inverse}", "type": "color" },
      "borderRadius": { "value": "{core.borderRadius.md}", "type": "borderRadius" },
      "padding": { "value": "{core.spacing.3} {core.spacing.6}", "type": "spacing" }
    }
  },
  "card": {
    "backgroundColor": { "value": "#ffffff", "type": "color" },
    "borderColor": { "value": "{semantic.colors.border.default}", "type": "color" },
    "borderRadius": { "value": "{core.borderRadius.lg}", "type": "borderRadius" },
    "padding": { "value": "{core.spacing.6}", "type": "spacing" },
    "shadow": { "value": "{core.shadows.md}", "type": "boxShadow" }
  }
}
```

## ✅ Required Token Categories

For optimal compatibility, include these token categories:

### **Essential Categories:**
- ✅ **colors** - Color palette (core requirement)
- ✅ **spacing** - Layout spacing values
- ✅ **typography** - Font families, sizes, weights

### **Recommended Categories:**
- 🔸 **borderRadius** - Border radius values
- 🔸 **shadows** - Box shadow definitions
- 🔸 **opacity** - Opacity values
- 🔸 **lineHeight** - Typography line heights

## 🎯 Best Practices

### 1. **Naming Conventions**
- Use **kebab-case** for token names
- Follow **logical hierarchy**: `category.subcategory.variant`
- Use **semantic names** for alias tokens

### 2. **Token References**
- Use **curly brace syntax**: `{core.colors.blue.500}`
- Build **semantic layer** that references core tokens
- Keep **component tokens** referencing semantic tokens

### 3. **Token Types**
Always specify the `type` property for proper processing:

```json
{
  "value": "#3b82f6",
  "type": "color"  // ← Essential for proper validation
}
```

### 4. **Value Formats**
- **Colors**: Use hex (`#3b82f6`) or rgb (`rgb(59, 130, 246)`)
- **Spacing**: Use rem units (`1rem`) for scalability
- **Typography**: Use rem for font sizes, unitless for line heights
- **Shadows**: Use full CSS shadow syntax

## ⚙️ Configuration Requirements

Update your `design-tokens.config.js` to validate the structure:

```javascript
module.exports = {
  tokens: {
    input: 'tokens.json',
    validation: {
      required: [
        'core.colors',
        'core.spacing', 
        'core.typography'
      ],
      optional: [
        'semantic.colors',
        'component',
        'core.borderRadius',
        'core.shadows'
      ]
    }
  },
  // ... rest of config
};
```

## 🚀 Getting Started

1. **Install the package:**
   ```bash
   npm install --save-dev design-tokens-sync
   ```

2. **Initialize in your project:**
   ```bash
   npx design-tokens-sync init
   ```

3. **Replace the generated `tokens.json` with your Token Studio export**

4. **Sync your tokens:**
   ```bash
   npm run tokens:sync
   ```

## 📝 Example Complete Structure

See the included `tokens.json` file in this package for a complete example that follows all these best practices.

## 🔗 Related

- [Token Studio Documentation](https://docs.figma.com/tokens/)
- [Design Tokens Community Group](https://designtokens.org/)
- [Package README](./README.md) 