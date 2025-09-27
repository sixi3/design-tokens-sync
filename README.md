# 🎨 Design Tokens Sync v2.0.0

**Style Dictionary-powered design token syncing with semantic & component token support, advanced transforms, and build hooks**

[![npm version](https://badge.fury.io/js/design-tokens-sync.svg)](https://badge.fury.io/js/design-tokens-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ What's New in v2.0.0

**Style Dictionary-Level Robustness:**
- ✅ **Semantic & Component Token Support** - Process tokens beyond just core tokens
- ✅ **Advanced Token Reference Resolution** - Full `{core.colors.primary.500}` support
- ✅ **Custom Transforms & Filters** - Style Dictionary-style token transformations
- ✅ **Build Hooks System** - Pre/post processing with custom logic
- ✅ **Multiple Output Formats** - CSS, SCSS, JSON, TypeScript, and more
- ✅ **Platform-Specific Configurations** - Different transforms per platform

## 🚀 Quick Start

### 1. Install
```bash
npm install design-tokens-sync --save-dev
```

### 2. Initialize
```bash
npx design-tokens-sync init
```

### 3. Configure (design-tokens.config.js)
```javascript
export default {
  tokens: {
    input: "tokens.json"
  },
  transforms: ["color/hex", "size/rem", "name/kebab"],
  filters: [],
  output: {
    css: "src/styles/tokens.css",
    scss: "src/styles/tokens.scss",
    typescript: "src/types/tokens.d.ts"
  }
}
```

### 4. Sync Tokens
```bash
npm run tokens:sync
```

## 🎯 Key Features

### Component Token Support
Process tokens like:
```json
{
  "component": {
    "status": {
      "active": {
        "backgroundColor": "{core.colors.success.50}",
        "textColor": "{core.colors.success.100}"
      }
    }
  }
}
```

Generates:
```css
:root {
  --component-status-active-backgroundColor: #E6F4EC;
  --component-status-active-textColor: #2D8659;
}

.status-active {
  background-color: var(--component-status-active-backgroundColor);
  color: var(--component-status-active-textColor);
}
```

### Advanced Transforms
```javascript
export default {
  transforms: ["color/hex", "size/rem"],
  platforms: {
    css: { transforms: ["color/hex", "size/rem"] },
    scss: { transforms: ["color/hex", "size/rem"] }
  }
}
```

### Build Hooks
```javascript
// Register custom hooks
import { BuildHooks } from 'design-tokens-sync/src/core/BuildHooks';

const hooks = new BuildHooks();
hooks.registerHook('afterProcess', (context) => {
  console.log('Tokens processed:', context.tokens);
  return context;
});
```

## 📖 Documentation

### Configuration Options

#### transforms
Array of transform names to apply to tokens
- `"color/hex"` - Ensure hex color format
- `"size/rem"` - Convert px to rem
- `"name/kebab"` - Convert names to kebab-case

#### filters
Array of filter names to limit which tokens are processed

#### platforms
Platform-specific configurations:
```javascript
platforms: {
  web: {
    transforms: ["color/hex", "size/rem"],
    filters: []
  },
  ios: {
    transforms: ["color/hex"],
    filters: ["excludeDeprecated"]
  }
}
```

#### output
Configure output files:
```javascript
output: {
  css: "src/styles/tokens.css",
  scss: "src/styles/tokens.scss",
  typescript: "src/types/tokens.d.ts",
  json: "tokens.json",
  javascript: "tokens.js"
}
```

### Token Structure

Supports the full Design Tokens specification:

```json
{
  "core": {
    "colors": { /* base colors */ },
    "spacing": { /* spacing values */ },
    "typography": { /* font settings */ }
  },
  "semantic": {
    "colors": {
      "text": {
        "primary": "{core.colors.primary.500}",
        "secondary": "{core.colors.gray.700}"
      }
    }
  },
  "component": {
    "button": {
      "primary": {
        "backgroundColor": "{semantic.colors.brand.primary}",
        "textColor": "{semantic.colors.text.inverse}"
      }
    }
  }
}
```

## 🛠️ CLI Commands

```bash
# Initialize project
design-tokens-sync init

# Sync tokens
design-tokens-sync sync

# Watch for changes
design-tokens-sync watch

# Validate tokens
design-tokens-sync validate

# Analytics report
design-tokens-sync analytics report
```

## 🔧 API Usage

```javascript
import { TokenProcessor } from 'design-tokens-sync/src/core/TokenProcessor';

const processor = new TokenProcessor();
await processor.init();
await processor.sync();
```

## 📊 Analytics

Track token usage across your codebase:

```bash
npm run tokens:analytics
```

Generates reports on:
- Token usage frequency
- Unused tokens
- Coverage metrics
- Migration suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT © [sixi3](https://github.com/sixi3)

## 🙏 Acknowledgments

Built on the foundation of design token best practices from:
- [Style Dictionary](https://styledictionary.com)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Figma Token Studio](https://tokens.studio)

