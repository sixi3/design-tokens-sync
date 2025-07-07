# 🎨 design-tokens-sync

> Automated design token syncing between Figma Token Studio and your codebase with built-in analytics

[![npm version](https://badge.fury.io/js/design-tokens-sync.svg)](https://badge.fury.io/js/design-tokens-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔄 **Automatic Token Syncing** - Real-time sync from Figma Token Studio to code
- 🎨 **Multi-Format Output** - CSS variables, Tailwind config, TypeScript definitions, SCSS
- 📊 **Built-in Analytics** - Track token usage and generate insights
- 🔍 **Smart Validation** - Comprehensive token validation with helpful warnings
- 🚀 **CI/CD Ready** - GitHub Actions workflows and git automation
- ⚡ **Hot Reload** - Watch mode for development
- 🏗️ **Framework Agnostic** - Works with React, Vue, Next.js, and more

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
module.exports = {
  tokens: {
    input: 'tokens.json',
    validation: {
      required: ['colors'],
      optional: ['spacing', 'typography', 'borderRadius']
    }
  },
  
  output: {
    css: 'src/styles/tokens.css',
    tailwind: 'tailwind.config.js',
    typescript: 'src/types/tokens.d.ts',
    scss: 'src/styles/_tokens.scss'
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

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary-500: #3b82f6;
  
  /* Spacing */
  --spacing-4: 1rem;
}
```

### Tailwind Configuration

```javascript
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

### TypeScript Definitions

```typescript
export interface Colors {
  primary: {
    "500": string;
  };
}

export interface DesignTokens {
  colors: Colors;
  spacing: Record<string, string>;
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

### React with Tailwind

```jsx
// After running tokens:sync, use tokens in your components
function Button({ variant = 'primary' }) {
  return (
    <button className={`bg-${variant}-500 text-white px-4 py-2`}>
      Click me
    </button>
  );
}
```

### CSS Custom Properties

```css
.button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}
```

### TypeScript

```typescript
import type { DesignTokens } from './types/tokens';

// Fully typed token access
const theme: DesignTokens = {
  colors: {
    primary: { 500: '#3b82f6' }
  }
};
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

### Next.js App Router

```javascript
// design-tokens.config.js
module.exports = {
  output: {
    css: 'app/globals.css',
    tailwind: 'tailwind.config.js',
    typescript: 'types/tokens.d.ts'
  }
};
```

### Vue + Vite

```javascript
module.exports = {
  output: {
    css: 'src/styles/tokens.css',
    typescript: 'src/types/tokens.d.ts'
  },
  watch: {
    ignore: ['dist', 'node_modules']
  }
};
```

### React Native

```javascript
module.exports = {
  output: {
    javascript: 'src/design-tokens.js', // React Native compatible
    typescript: 'src/types/tokens.d.ts'
  }
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

### Sync Strategy

- **Development:** Use watch mode for real-time updates
- **CI/CD:** Validate tokens before syncing
- **Production:** Use git hooks to prevent inconsistencies

### Team Workflow

1. **Designers** update tokens in Figma Token Studio
2. **Export** tokens.json from Token Studio
3. **Commit** tokens.json to repository
4. **CI/CD** automatically syncs and deploys changes
5. **Developers** pull latest changes and get updated tokens

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

- [GitHub Repository](https://github.com/sixi3/figma-code-sync)
- [npm Package](https://www.npmjs.com/package/design-tokens-sync)
- [Documentation](https://github.com/sixi3/figma-code-sync#readme)
- [Issues](https://github.com/sixi3/figma-code-sync/issues)
- [Token Studio](https://tokens.studio/)

---

**Made with ❤️ for design systems teams**