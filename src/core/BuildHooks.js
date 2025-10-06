/**
 * Build Hooks - Style Dictionary-like build customization
 * Provides hooks for custom logic during the token processing pipeline
 */
export class BuildHooks {
  constructor() {
    this.hooks = {
      beforeProcess: [],
      afterProcess: [],
      beforeGenerate: [],
      afterGenerate: [],
      beforeValidate: [],
      afterValidate: []
    };
  }

  /**
   * Register a hook
   */
  registerHook(hookName, callback) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].push(callback);
    }
  }

  /**
   * Execute hooks for a specific phase
   */
  async executeHooks(hookName, context = {}) {
    if (!this.hooks[hookName]) return context;

    for (const hook of this.hooks[hookName]) {
      try {
        const result = await hook(context);
        if (result !== undefined) {
          context = result;
        }
      } catch (error) {
        console.error(`❌ Hook ${hookName} failed:`, error.message);
      }
    }

    return context;
  }

  /**
   * Register common hooks
   */
  registerCommonHooks() {
    // Example: Add metadata to tokens
    this.registerHook('afterProcess', (context) => {
      if (context.tokens) {
        context.tokens._metadata = {
          ...context.tokens._metadata,
          processedAt: new Date().toISOString(),
          version: '2.0.0'
        };
      }
      return context;
    });

    // Example: Validate token references
    this.registerHook('beforeValidate', async (context) => {
      if (context.rawTokens) {
        const issues = this.validateReferences(context.rawTokens);
        if (issues.length > 0) {
          console.warn('⚠️ Token reference issues found (UPDATED CODE):', issues);
        }
      }
      return context;
    });

    // Example: Custom CSS generation
    this.registerHook('beforeGenerate', (context) => {
      if (context.config?.output?.css && context.tokens?.component) {
        // Add custom CSS for component tokens
        context.customCSS = this.generateComponentCSS(context.tokens.component);
      }
      return context;
    });
  }

  /**
   * Validate token references
   */
  validateReferences(tokens) {
    const issues = [];
    const tokenPaths = new Set();

    // Collect all token paths
    const collectPaths = (obj, path = []) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = [...path, key];

          if (value && typeof value === 'object' && value.value !== undefined) {
            tokenPaths.add(currentPath.join('.'));
          } else {
            collectPaths(value, currentPath);
          }
        }
      }
    };

    collectPaths(tokens);

    // Check references
    const checkReferences = (obj, path = []) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = [...path, key];

          if (typeof value === 'string') {
            // Check for token references in the string (may contain multiple)
            const refRegex = /\{([^}]+)\}/g;
            let match;
            while ((match = refRegex.exec(value)) !== null) {
              const refPath = match[1];
              if (!tokenPaths.has(refPath)) {
                issues.push(`Invalid reference "${refPath}" in ${currentPath.join('.')}`);
              }
            }
          } else if (value && typeof value === 'object' && value.value !== undefined) {
            if (typeof value.value === 'string') {
              // Check for token references in the value string (may contain multiple)
              const refRegex = /\{([^}]+)\}/g;
              let match;
              while ((match = refRegex.exec(value.value)) !== null) {
                const refPath = match[1];
                if (!tokenPaths.has(refPath)) {
                  issues.push(`Invalid reference "${refPath}" in ${currentPath.join('.')}`);
                }
              }
            }
          } else {
            checkReferences(value, currentPath);
          }
        }
      }
    };

    checkReferences(tokens);
    return issues;
  }

  /**
   * Generate custom CSS for component tokens
   */
  generateComponentCSS(componentTokens) {
    const css = [];

    if (componentTokens.status) {
      css.push('/* Status component utility classes */');
      Object.entries(componentTokens.status).forEach(([status, styles]) => {
        css.push(`.status-${status} {`);
        if (styles.backgroundColor) {
          css.push(`  background-color: var(--component-status-${status}-backgroundColor);`);
        }
        if (styles.textColor) {
          css.push(`  color: var(--component-status-${status}-textColor);`);
        }
        css.push('}');
      });
      css.push('');
    }

    return css.join('\n');
  }
}

