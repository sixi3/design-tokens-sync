/**
 * Transform Engine - Style Dictionary-like token transformations
 * Provides custom transforms, filters, and advanced token processing
 */
export class TransformEngine {
  constructor(options = {}) {
    this.options = options;
    this.transforms = new Map();
    this.filters = new Map();

    // Register built-in transforms
    this.registerBuiltInTransforms();
  }

  /**
   * Register built-in transforms (Style Dictionary style)
   */
  registerBuiltInTransforms() {
    // Color transforms
    this.registerTransform('color/hex', {
      type: 'value',
      matcher: (token) => token.type === 'color',
      transformer: (token) => {
        // Ensure hex format
        const value = token.value;
        if (value.startsWith('#')) return value;
        if (value.startsWith('rgb')) return value; // Keep rgb/hsl as-is for CSS
        return value;
      }
    });

    this.registerTransform('color/hexAlpha', {
      type: 'value',
      matcher: (token) => token.type === 'color' && token.value.includes('rgba'),
      transformer: (token) => {
        // Convert rgba to hex with alpha if needed
        return token.value; // For now, keep as-is
      }
    });

    // Size transforms
    this.registerTransform('size/rem', {
      type: 'value',
      matcher: (token) => ['spacing', 'sizing', 'borderRadius'].includes(token.type),
      transformer: (token) => {
        const value = token.value;
        if (typeof value === 'string' && value.endsWith('px')) {
          const pxValue = parseFloat(value);
          return `${pxValue / 16}rem`;
        }
        return value;
      }
    });

    // Typography transforms
    this.registerTransform('typography/css/shorthand', {
      type: 'value',
      matcher: (token) => token.type === 'typography',
      transformer: (token) => {
        // Convert typography object to CSS shorthand
        const { fontSize, fontWeight, lineHeight, fontFamily } = token.value;
        return `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;
      }
    });

    // Name transforms
    this.registerTransform('name/kebab', {
      type: 'name',
      transformer: (token) => {
        return token.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      }
    });
  }

  /**
   * Register a custom transform
   */
  registerTransform(name, transform) {
    this.transforms.set(name, transform);
  }

  /**
   * Register a custom filter
   */
  registerFilter(name, filter) {
    this.filters.set(name, filter);
  }

  /**
   * Apply transforms to tokens
   */
  applyTransforms(tokens, transformNames = []) {
    if (!transformNames.length) {
      // Apply default transforms
      transformNames = ['color/hex', 'size/rem', 'name/kebab'];
    }

    const transformedTokens = JSON.parse(JSON.stringify(tokens));

    // Recursively process all tokens
    const processTokens = (obj, path = []) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = [...path, key];

          if (value && typeof value === 'object' && value.value !== undefined) {
            // This is a token
            const token = {
              name: currentPath.join('.'),
              value: value.value,
              type: value.type,
              path: currentPath
            };

            // Apply transforms
            let transformedToken = { ...token };
            for (const transformName of transformNames) {
              const transform = this.transforms.get(transformName);
              if (transform && (!transform.matcher || transform.matcher(transformedToken))) {
                if (transform.type === 'value') {
                  transformedToken.value = transform.transformer(transformedToken);
                } else if (transform.type === 'name') {
                  transformedToken.name = transform.transformer(transformedToken);
                }
              }
            }

            // Update the token
            obj[key] = {
              ...value,
              value: transformedToken.value
            };
          } else {
            // Recurse into nested objects
            processTokens(value, currentPath);
          }
        }
      }
    };

    processTokens(transformedTokens);
    return transformedTokens;
  }

  /**
   * Apply filters to tokens
   */
  applyFilters(tokens, filterNames = []) {
    if (!filterNames.length) return tokens;

    const filteredTokens = {};

    const processTokens = (obj, result, path = []) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = [...path, key];

          if (value && typeof value === 'object' && value.value !== undefined) {
            // This is a token
            const token = {
              name: currentPath.join('.'),
              value: value.value,
              type: value.type,
              path: currentPath
            };

            // Check if token passes all filters
            let passesFilters = true;
            for (const filterName of filterNames) {
              const filter = this.filters.get(filterName);
              if (filter && !filter(token)) {
                passesFilters = false;
                break;
              }
            }

            if (passesFilters) {
              // Add to result
              let current = result;
              for (let i = 0; i < currentPath.length - 1; i++) {
                if (!current[currentPath[i]]) current[currentPath[i]] = {};
                current = current[currentPath[i]];
              }
              current[key] = value;
            }
          } else {
            // Recurse into nested objects
            if (!result[key]) result[key] = {};
            processTokens(value, result[key], currentPath);
          }
        }
      }
    };

    processTokens(tokens, filteredTokens);
    return filteredTokens;
  }

  /**
   * Advanced token composition (Style Dictionary style)
   */
  composeTokens(baseTokens, overrideTokens) {
    const composed = JSON.parse(JSON.stringify(baseTokens));

    const merge = (target, source) => {
      for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (!target[key]) target[key] = {};
          merge(target[key], value);
        } else {
          target[key] = value;
        }
      }
    };

    merge(composed, overrideTokens);
    return composed;
  }

  /**
   * Create platform-specific token sets
   */
  createPlatformTokens(tokens, platform) {
    const platformTransforms = {
      web: ['color/hex', 'size/rem'],
      ios: ['color/hex', 'size/rem'],
      android: ['color/hex', 'size/rem'],
      react: ['color/hex', 'size/rem'],
      flutter: ['color/hex', 'size/rem']
    };

    const transforms = platformTransforms[platform] || [];
    return this.applyTransforms(tokens, transforms);
  }
}

