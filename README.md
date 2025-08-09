# 🎨 design-tokens-sync

> Automated design token syncing between Figma Token Studio and your codebase with built-in analytics

[![npm version](https://badge.fury.io/js/design-tokens-sync.svg)](https://badge.fury.io/js/design-tokens-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔄 **Automatic Token Syncing** - Real-time sync from Figma Token Studio to code
- 🎨 **Multi-Format Output** - CSS variables, Tailwind presets, TypeScript definitions, SCSS
- 🌙 **Shadcn UI Ready** - Built-in dark mode support with CSS variable mapping
- 📊 **Built-in Analytics** - Track token usage and generate insights
- 🔍 **Smart Validation** - Comprehensive token validation with helpful warnings
- 🚀 **CI/CD Ready** - GitHub Actions workflows and git automation
- ⚡ **Hot Reload** - Watch mode for development
- 🏗️ **Framework Agnostic** - Works with React, Vue, Next.js, and more
- 📦 **Dual Module Support** - ESM and CommonJS outputs for maximum compatibility

## 📦 Installation

```bash
npm install --save-dev design-tokens-sync
```

## 🚀 Quick Start

1. **Initialize in your project:**
```bash
npx design-tokens-sync init
```

2. **Start syncing tokens:**
```bash
npm run tokens:sync
```

3. **Watch for changes during development:**
```bash
npm run tokens:watch
```

## 📖 Usage

### CLI Commands

```bash
# Initialize design tokens setup
npx design-tokens-sync init

# Sync tokens once
npx design-tokens-sync sync

# Watch for changes
npx design-tokens-sync watch

# Validate tokens
npx design-tokens-sync validate

# Generate analytics report
npx design-tokens-sync analytics report

# Show current configuration
npx design-tokens-sync config
```

### Programmatic Usage

```javascript
import designTokensSync from 'design-tokens-sync';

// Sync tokens programmatically
await designTokensSync.sync({
  configPath: './design-tokens.config.js'
});

// Validate tokens
const validation = await designTokensSync.validate('./tokens.json');
console.log(validation.isValid ? '✅ Valid' : '❌ Invalid');

// Generate analytics
const analytics = await designTokensSync.analytics.collect();
const report = await designTokensSync.analytics.report();
```

## ⚙️ Configuration

Create a `design-tokens.config.js` file in your project root:

```javascript
export default {
  tokens: {
    input: 'tokens.json',
    validation: {
      required: ['colors'],
      optional: ['spacing', 'typography', 'borderRadius']
    }
  },
  
  output: {
    css: 'src/styles/tokens.css',
    // Generate Tailwind presets instead of overwriting root config
    tailwindPresetEsm: 'tokens.tailwind.preset.js',
    tailwindPresetCjs: 'tokens.tailwind.preset.cjs',
    // Dual-module token outputs
    javascript: 'src/data/tokens.js',
    tokensCjs: 'src/data/tokens.cjs',
    // Shadcn theme CSS bridge
    shadcnThemeCss: 'src/styles/shadcn-theme.css',
    typescript: 'src/types/tokens.d.ts',
    scss: 'src/styles/_tokens.scss'
  },
  
  // CSS generation options
  css: {
    includeUtilities: false // Clean CSS vars only (no duplicate utilities)
  },
  
  // Shadcn UI integration
  shadcn: {
    enable: true,
    hsl: true, // Output HSL format for CSS variables
    mapping: {} // Custom variable mappings (optional)
  },
  
  // Init scaffolding
  init: {
    scaffoldRootTailwindConfig: true // Auto-create tailwind.config.ts if missing
  },
  
  git: {
    enabled: true,
    autoCommit: true,
    autoPush: false,
    commitMessage: '🎨 Update design tokens'
  },
  
  analytics: {
    enabled: true,
    autoCollect: true
  },
  
  watch: {
    enabled: true,
    ignore: ['node_modules', '.git', 'dist', 'build']
  }
};
```

## 📁 Input Format

Supports both Token Studio and standard JSON formats:

### Token Studio Format

```json
{
  "$themes": [],
  "$metadata": {
    "tokenSetOrder": ["core", "semantic"]
  },
  "core": {
    "colors": {
      "primary": {
        "500": {
          "value": "#3b82f6",
          "type": "color",
          "description": "Primary brand color"
        }
      }
    },
    "spacing": {
      "4": {
        "value": "1rem",
        "type": "spacing"
      }
    }
  }
}
```

### Standard Format

```json
{
  "colors": {
    "primary": {
      "500": "#3b82f6"
    }
  },
  "spacing": {
    "4": "1rem"
  }
}
```

## 🎯 Output Formats

### CSS Custom Properties (Clean by Default)

```css
/* src/styles/tokens.css - Only CSS variables, no utility classes */
:root {
  /* Colors */
  --color-primary-500: #3b82f6;
  
  /* Spacing */
  --spacing-4: 1rem;
}
```

### Shadcn UI Theme CSS (with Dark Mode)

```css
/* src/styles/shadcn-theme.css - Automatic light/dark theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.375rem;
}

.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 222 84% 5%;
}
```

### Tailwind Preset (Not Root Config)

```javascript
// tokens.tailwind.preset.js - Use in your tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6'
        }
      },
      spacing: {
        4: '1rem'
      }
    }
  }
};
```

### Dual Module Outputs

```javascript
// src/data/tokens.js (ESM)
export const tokens = { colors: { primary: { 500: '#3b82f6' } } };
export const colors = { primary: { 500: '#3b82f6' } };
export default tokens;

// src/data/tokens.cjs (CommonJS)
module.exports = {
  tokens: { colors: { primary: { 500: '#3b82f6' } } },
  colors: { primary: { 500: '#3b82f6' } }
};
module.exports.default = module.exports.tokens;
```

### TypeScript Definitions (Aligned with Runtime)

```typescript
export interface Colors {
  primary: {
    "500": string;
  };
}

export interface DesignTokens {
  colors: Colors;
  spacing: Record<string, string>;
  // Optional metadata (may not exist at runtime)
  source?: string;
  lastLoaded?: string;
}

// Named exports match JS module exports
declare const tokens: DesignTokens;
export default tokens;
export const colors: Colors;
export const spacing: Record<string, string>;
```

### Package.json Exports (Auto-configured)

```json
{
  "type": "module",
  "exports": {
    "./tokens": {
      "import": "./src/data/tokens.js",
      "require": "./src/data/tokens.cjs",
      "default": "./src/data/tokens.js"
    },
    "./tailwind-preset": {
      "import": "./tokens.tailwind.preset.js",
      "require": "./tokens.tailwind.preset.cjs",
      "default": "./tokens.tailwind.preset.js"
    }
  }
}
```

## 📊 Analytics

Track token usage across your codebase:

```bash
# Collect usage data
npx design-tokens-sync analytics collect

# Generate report
npx design-tokens-sync analytics report --format html

# Export to CSV
npx design-tokens-sync analytics report --format csv
```

Analytics features:
- **Usage Tracking** - Find which tokens are used where
- **Unused Token Detection** - Identify tokens that can be removed
- **Adoption Metrics** - Track design system adoption
- **Trend Analysis** - Monitor token usage over time

## 🔧 Integration

### GitHub Actions

Automatically sync tokens when `tokens.json` changes:

```yaml
name: Design Tokens Sync

on:
  push:
    paths: ['tokens.json']

jobs:
  sync-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run tokens:sync
      - run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --staged --quiet || git commit -m "🎨 Update design tokens"
          git push
```

### Package.json Scripts

The `init` command automatically adds these scripts:

```json
{
  "scripts": {
    "tokens:sync": "design-tokens-sync sync",
    "tokens:watch": "design-tokens-sync watch",
    "tokens:validate": "design-tokens-sync validate",
    "tokens:analytics": "design-tokens-sync analytics report"
  }
}
```

## 🏗️ Architecture

The package consists of several core modules:

- **TokenProcessor** - Loads, transforms, and processes tokens
- **TokenValidator** - Validates token structure and values
- **FileGenerator** - Generates output files in multiple formats
- **GitManager** - Handles version control operations
- **AnalyticsEngine** - Tracks usage and generates reports

## 📚 Examples

### Shadcn UI + Next.js Setup

```bash
# 1. Initialize with shadcn support
npx design-tokens-sync init
# ✓ Creates tailwind.config.ts (if missing)
# ✓ Generates shadcn-theme.css with dark mode
# ✓ Sets up package.json exports

# 2. Import the theme CSS (in app/globals.css)
```

```css
/* app/globals.css */
@import '../src/styles/shadcn-theme.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// tailwind.config.ts (auto-generated if missing)
import tokensPreset from './tokens.tailwind.preset.js';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  presets: [tokensPreset],
  plugins: [require('tailwindcss-animate')]
};
export default config;
```

```jsx
// app/page.tsx - Dark mode works automatically
export default function Page() {
  return (
    <div className="bg-background text-foreground">
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        Themed Button
      </button>
    </div>
  );
}
```

### Dual Module Imports

```javascript
// ESM import (modern)
import { colors, spacing } from './src/data/tokens.js';
import preset from './tokens.tailwind.preset.js';

// CommonJS require (legacy)
const { colors, spacing } = require('./src/data/tokens.cjs');
const preset = require('./tokens.tailwind.preset.cjs');

// Package exports (if configured)
import { colors } from 'your-package/tokens';
import preset from 'your-package/tailwind-preset';
```

### CSS Custom Properties

```css
.button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}

/* Shadcn variables work automatically */
.card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}
```

### TypeScript (Aligned with Runtime)

```typescript
import type { DesignTokens, Colors } from './types/tokens';
import { colors, spacing } from './src/data/tokens.js';

// Fully typed token access
const primaryColor: string = colors.primary[500];
const buttonSpacing: string = spacing[4];
```

## 🚨 Troubleshooting

### Common Issues

#### "Cannot find tokens.json"
Ensure your tokens file exists and the path in `design-tokens.config.js` is correct:
```javascript
module.exports = {
  tokens: {
    input: './path/to/your/tokens.json' // Update this path
  }
};
```

#### Git operations failing
If you're getting git errors, check your configuration:
```javascript
module.exports = {
  git: {
    enabled: false // Disable git operations
  }
};
```

#### Watch mode not working
Try excluding problematic directories:
```javascript
module.exports = {
  watch: {
    ignore: ['node_modules', '.git', 'dist', 'build', '.next']
  }
};
```

#### TypeScript errors after sync
Make sure your TypeScript configuration includes the generated types:
```json
{
  "compilerOptions": {
    "types": ["./src/types/tokens.d.ts"]
  }
}
```

### Debug Mode

Enable verbose logging:
```bash
DEBUG=design-tokens-sync npx design-tokens-sync sync
```

## 🔄 Migration Guide

### From version 0.x to 1.x

1. **Update configuration format:**
```javascript
// Old format (0.x)
module.exports = {
  input: 'tokens.json',
  output: 'tokens.css'
};

// New format (1.x)
module.exports = {
  tokens: { input: 'tokens.json' },
  output: { css: 'tokens.css' }
};
```

2. **CLI command changes:**
```bash
# Old commands
npx figma-tokens-sync

# New commands  
npx design-tokens-sync sync
```

### From manual sync to automated

1. **Add to package.json:**
```json
{
  "scripts": {
    "tokens:sync": "design-tokens-sync sync",
    "dev": "design-tokens-sync watch & next dev"
  }
}
```

2. **Set up GitHub Actions:**
```bash
npx design-tokens-sync init --github-actions
```

## 📚 Framework Integration

### Next.js App Router (with Shadcn)

```javascript
// design-tokens.config.js (auto-generated with new defaults)
export default {
  output: {
    css: 'styles/tokens.css',
    shadcnThemeCss: 'styles/shadcn-theme.css', // Dark mode support
    tailwindPresetEsm: 'tokens.tailwind.preset.js', // Use preset, not root config
    tailwindPresetCjs: 'tokens.tailwind.preset.cjs',
    javascript: 'data/tokens.js',
    tokensCjs: 'data/tokens.cjs', // Dual module support
    typescript: 'types/tokens.d.ts'
  },
  shadcn: { enable: true, hsl: true }, // Auto-enable shadcn support
  init: { scaffoldRootTailwindConfig: true } // Auto-create tailwind.config.ts
};
```

### Vue + Vite (Updated Defaults)

```javascript
export default {
  output: {
    css: 'src/styles/tokens.css',
    tailwindPresetEsm: 'tokens.tailwind.preset.js',
    tailwindPresetCjs: 'tokens.tailwind.preset.cjs',
    javascript: 'src/data/tokens.js',
    tokensCjs: 'src/data/tokens.cjs',
    typescript: 'src/types/tokens.d.ts'
  },
  css: { includeUtilities: false }, // Clean CSS vars only
  watch: {
    ignore: ['dist', 'node_modules']
  }
};
```

### React Native (Mobile Optimized)

```javascript
export default {
  output: {
    javascript: 'src/design-tokens.js', // React Native compatible
    tokensCjs: 'src/design-tokens.cjs', // For metro bundler
    typescript: 'src/types/tokens.d.ts'
  },
  css: { includeUtilities: false } // No CSS utilities needed for RN
};
```

## 🔧 Advanced Configuration

### Custom Token Validation

```javascript
module.exports = {
  tokens: {
    validation: {
      custom: {
        'colors': (value) => /^#[0-9A-F]{6}$/i.test(value),
        'spacing': (value) => value.endsWith('rem') || value.endsWith('px')
      }
    }
  }
};
```

### Post-processing Hooks

```javascript
module.exports = {
  hooks: {
    beforeSync: async (tokens) => {
      console.log('About to sync', Object.keys(tokens).length, 'tokens');
    },
    afterSync: async (results) => {
      console.log('Sync complete!', results);
    }
  }
};
```

### Multiple Output Targets

```javascript
module.exports = {
  output: {
    css: [
      'src/styles/tokens.css',
      'public/tokens.css'
    ],
    tailwind: 'tailwind.config.js',
    typescript: 'src/types/tokens.d.ts',
    json: 'dist/tokens.json'
  }
};
```

## 🔍 API Reference

### TokenProcessor

```javascript
import { TokenProcessor } from 'design-tokens-sync/core';

const processor = new TokenProcessor({
  configPath: './design-tokens.config.js'
});

// Load and parse tokens
const tokens = await processor.loadTokens();

// Transform tokens
const transformed = processor.transformTokens(rawTokens);

// Sync tokens
await processor.sync();
```

### Analytics

```javascript
import { AnalyticsEngine } from 'design-tokens-sync/analytics';

const analytics = new AnalyticsEngine();

// Collect usage data
const usage = await analytics.collectUsage('./src');

// Generate report
const report = await analytics.generateReport(usage);
```

## 💡 Best Practices

### Token Organization

- **Use semantic naming:** `color-brand-primary` instead of `color-blue-500`
- **Group related tokens:** Keep spacing, colors, typography organized
- **Document token purpose:** Use descriptions in Token Studio

### Shadcn UI Integration

- **Import theme CSS once:** Add `@import 'shadcn-theme.css'` to your globals.css
- **Use presets, not root config:** Let the tool scaffold `tailwind.config.ts` with presets
- **Enable dark mode:** Use `class="dark"` for automatic theme switching
- **Leverage CSS variables:** Use `hsl(var(--primary))` in custom components

### Module Strategy

- **ESM by default:** Modern projects should use `import` from `.js` files
- **CJS when needed:** Legacy tools can `require()` from `.cjs` files
- **Package exports:** Use the auto-configured exports for clean imports

### Sync Strategy

- **Development:** Use watch mode for real-time updates
- **CI/CD:** Validate tokens before syncing
- **Production:** Use git hooks to prevent inconsistencies
- **Clean CSS:** Keep `css.includeUtilities: false` to avoid Tailwind duplication

### Team Workflow

1. **Designers** update tokens in Figma Token Studio
2. **Export** tokens.json from Token Studio
3. **Commit** tokens.json to repository
4. **CI/CD** automatically syncs and deploys changes
5. **Developers** pull latest changes and get updated tokens
6. **Dark mode** works automatically with shadcn theme CSS

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/sixi3/design-tokens-sync.git
cd design-tokens-sync
npm install
npm run test
npm run build
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

## 📄 License

MIT © [sixi3](https://github.com/sixi3)

## 🔗 Links

- [GitHub Repository](https://github.com/sixi3/design-tokens-sync)
- [npm Package](https://www.npmjs.com/package/design-tokens-sync)
- [Documentation](https://github.com/sixi3/design-tokens-sync#readme)
- [Issues](https://github.com/sixi3/design-tokens-sync/issues)
- [Token Studio](https://tokens.studio/)

---

**Made with ❤️ for design systems teams**