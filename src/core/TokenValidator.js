import { loadConfig } from '../utils/config.js';

/**
 * Token validation engine
 * Validates design tokens structure, values, and consistency
 */
export class TokenValidator {
  constructor(options = {}) {
    this.options = options;
    this.config = null;
  }

  /**
   * Initialize validator with configuration
   */
  async init() {
    if (!this.config) {
      this.config = await loadConfig(this.options.configPath);
    }
    return this.config;
  }

  /**
   * Validate design tokens
   */
  async validate(tokens) {
    await this.init();
    
    const errors = [];
    const warnings = [];
    
    // Validate structure
    this.validateStructure(tokens, errors, warnings);
    
    // Validate required categories
    this.validateRequiredCategories(tokens, errors, warnings);
    
    // Validate optional categories
    this.validateOptionalCategories(tokens, errors, warnings);
    
    // Validate color values
    this.validateColors(tokens, errors, warnings);
    
    // Validate spacing values
    this.validateSpacing(tokens, errors, warnings);
    
    // Validate typography
    this.validateTypography(tokens, errors, warnings);
    
    // Validate consistency
    this.validateConsistency(tokens, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalCategories: this.countCategories(tokens),
        validatedTokens: this.countTokens(tokens),
        errorCount: errors.length,
        warningCount: warnings.length
      }
    };
  }

  /**
   * Validate basic structure
   */
  validateStructure(tokens, errors, warnings) {
    if (!tokens || typeof tokens !== 'object') {
      errors.push('Tokens must be an object');
      return;
    }

    if (!tokens.colors) {
      errors.push('Missing colors category - this is required');
    }

    // Check for common typos or incorrect structures
    const commonTypos = ['colour', 'color', 'spacings', 'typo', 'fonts'];
    commonTypos.forEach(typo => {
      if (tokens[typo] && !tokens[this.getCorrectCategory(typo)]) {
        warnings.push(`Found "${typo}" - did you mean "${this.getCorrectCategory(typo)}"?`);
      }
    });
  }

  /**
   * Validate required categories
   */
  validateRequiredCategories(tokens, errors, warnings) {
    const required = this.config?.tokens?.validation?.required || ['colors'];
    
    required.forEach(category => {
      if (!tokens[category] || Object.keys(tokens[category]).length === 0) {
        errors.push(`Missing required token category: ${category}`);
      }
    });

    // Specific color validation
    if (tokens.colors) {
      const requiredColorCategories = ['primary'];
      requiredColorCategories.forEach(colorCategory => {
        if (!tokens.colors[colorCategory] || Object.keys(tokens.colors[colorCategory]).length === 0) {
          errors.push(`Missing required color category: colors.${colorCategory}`);
        }
      });
    }
  }

  /**
   * Validate optional categories
   */
  validateOptionalCategories(tokens, errors, warnings) {
    const optional = this.config?.tokens?.validation?.optional || ['spacing', 'typography'];
    
    optional.forEach(category => {
      if (!tokens[category]) {
        warnings.push(`Optional token category not found: ${category}`);
      }
    });
  }

  /**
   * Validate color values
   */
  validateColors(tokens, errors, warnings) {
    if (!tokens.colors) return;

    Object.entries(tokens.colors).forEach(([category, shades]) => {
      if (!shades || typeof shades !== 'object') {
        errors.push(`Invalid color category structure: colors.${category}`);
        return;
      }

      Object.entries(shades).forEach(([shade, value]) => {
        if (!this.isValidColor(value)) {
          errors.push(`Invalid color value: colors.${category}.${shade} = "${value}"`);
        }

        // Check for common shade inconsistencies
        if (this.isNumericShade(shade)) {
          const shadeNum = parseInt(shade);
          if (shadeNum < 50 || shadeNum > 950 || shadeNum % 50 !== 0) {
            warnings.push(`Unusual shade value: colors.${category}.${shade} (consider using 50, 100, 200... 900, 950)`);
          }
        }
      });

      // Check for missing common shades
      const hasNumericShades = Object.keys(shades).some(shade => this.isNumericShade(shade));
      if (hasNumericShades) {
        const commonShades = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
        const missingShades = commonShades.filter(shade => !shades[shade]);
        if (missingShades.length > 0) {
          warnings.push(`Consider adding common shades to colors.${category}: ${missingShades.join(', ')}`);
        }
      }
    });
  }

  /**
   * Validate spacing values
   */
  validateSpacing(tokens, errors, warnings) {
    if (!tokens.spacing) return;

    const requiredSpacing = ['0', '1', '2', '4', '8', '16'];
    const missingSpacing = requiredSpacing.filter(space => !tokens.spacing[space]);
    
    if (missingSpacing.length > 0) {
      warnings.push(`Missing common spacing values: ${missingSpacing.join(', ')}`);
    }

    Object.entries(tokens.spacing).forEach(([key, value]) => {
      if (!this.isValidSpacing(value)) {
        errors.push(`Invalid spacing value: spacing.${key} = "${value}"`);
      }
    });
  }

  /**
   * Validate typography
   */
  validateTypography(tokens, errors, warnings) {
    if (!tokens.typography) return;

    // Check required typography categories
    const requiredTypo = ['fontFamily'];
    requiredTypo.forEach(category => {
      if (!tokens.typography[category]) {
        warnings.push(`Missing typography category: typography.${category}`);
      }
    });

    // Validate font families
    if (tokens.typography.fontFamily) {
      if (!tokens.typography.fontFamily.sans) {
        errors.push('Missing sans-serif font family (typography.fontFamily.sans)');
      }

      Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          errors.push(`Invalid font family: typography.fontFamily.${key} = "${value}"`);
        }
      });
    }

    // Validate font sizes
    if (tokens.typography.fontSize) {
      Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
        if (!this.isValidSize(value)) {
          errors.push(`Invalid font size: typography.fontSize.${key} = "${value}"`);
        }
      });
    }
  }

  /**
   * Validate consistency across token sets
   */
  validateConsistency(tokens, errors, warnings) {
    // Check for naming consistency
    this.validateNamingConsistency(tokens, warnings);
    
    // Check for value consistency
    this.validateValueConsistency(tokens, warnings);
    
    // Check for scale consistency
    this.validateScaleConsistency(tokens, warnings);
  }

  /**
   * Validate naming consistency
   */
  validateNamingConsistency(tokens, warnings) {
    // Check for mixed naming conventions
    const allKeys = this.getAllTokenKeys(tokens);
    
    const hasKebabCase = allKeys.some(key => key.includes('-'));
    const hasCamelCase = allKeys.some(key => /[a-z][A-Z]/.test(key));
    const hasSnakeCase = allKeys.some(key => key.includes('_'));
    
    const conventions = [hasKebabCase, hasCamelCase, hasSnakeCase].filter(Boolean).length;
    if (conventions > 1) {
      warnings.push('Mixed naming conventions detected. Consider using consistent naming (kebab-case, camelCase, or snake_case)');
    }
  }

  /**
   * Validate value consistency
   */
  validateValueConsistency(tokens, warnings) {
    // Check for duplicate values that might indicate inconsistency
    const values = this.getAllTokenValues(tokens);
    const duplicates = this.findDuplicateValues(values);
    
    if (duplicates.length > 0) {
      duplicates.forEach(duplicate => {
        warnings.push(`Duplicate value "${duplicate.value}" found in: ${duplicate.tokens.join(', ')}`);
      });
    }
  }

  /**
   * Validate scale consistency
   */
  validateScaleConsistency(tokens, warnings) {
    // Check spacing scale
    if (tokens.spacing) {
      const spacingValues = Object.values(tokens.spacing)
        .map(val => this.parseSpacingValue(val))
        .filter(val => val !== null)
        .sort((a, b) => a - b);
      
      if (spacingValues.length > 2) {
        const ratios = [];
        for (let i = 1; i < spacingValues.length; i++) {
          ratios.push(spacingValues[i] / spacingValues[i - 1]);
        }
        
        const avgRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        const inconsistentRatios = ratios.filter(ratio => Math.abs(ratio - avgRatio) > 0.5);
        
        if (inconsistentRatios.length > ratios.length * 0.3) {
          warnings.push('Spacing scale appears inconsistent. Consider using a consistent ratio or modular scale');
        }
      }
    }
  }

  /**
   * Utility methods
   */
  getCorrectCategory(typo) {
    const mapping = {
      'colour': 'colors',
      'color': 'colors',
      'spacings': 'spacing',
      'typo': 'typography',
      'fonts': 'typography'
    };
    return mapping[typo] || typo;
  }

  isValidColor(value) {
    if (typeof value !== 'string') return false;
    
    // Hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) return true;
    
    // RGB/RGBA
    if (/^rgba?\([\d\s,./]+\)$/i.test(value)) return true;
    
    // HSL/HSLA
    if (/^hsla?\([\d\s,%./]+\)$/i.test(value)) return true;
    
    // CSS named colors (basic check)
    if (/^[a-z]+$/i.test(value)) return true;
    
    // Token references
    if (value.startsWith('{') && value.endsWith('}')) return true;
    
    return false;
  }

  isValidSpacing(value) {
    if (typeof value !== 'string') return false;
    
    // CSS units
    if (/^[\d.]+([a-z%]+)?$/i.test(value)) return true;
    
    // Zero
    if (value === '0') return true;
    
    // Token references
    if (value.startsWith('{') && value.endsWith('}')) return true;
    
    return false;
  }

  isValidSize(value) {
    return this.isValidSpacing(value); // Same validation for now
  }

  isNumericShade(shade) {
    return /^\d+$/.test(shade);
  }

  countCategories(tokens) {
    return Object.keys(tokens).filter(key => typeof tokens[key] === 'object').length;
  }

  countTokens(tokens) {
    let count = 0;
    
    const countInCategory = (obj) => {
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          if (value.value !== undefined) {
            count++; // Token Studio format
          } else {
            countInCategory(value); // Nested structure
          }
        } else {
          count++; // Direct value
        }
      });
    };
    
    Object.values(tokens).forEach(category => {
      if (category && typeof category === 'object') {
        countInCategory(category);
      }
    });
    
    return count;
  }

  getAllTokenKeys(tokens) {
    const keys = [];
    
    const extractKeys = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(key);
        
        if (obj[key] && typeof obj[key] === 'object' && !obj[key].value) {
          extractKeys(obj[key], fullKey);
        }
      });
    };
    
    extractKeys(tokens);
    return keys;
  }

  getAllTokenValues(tokens) {
    const values = [];
    
    const extractValues = (obj, path = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object' && value.value !== undefined) {
          values.push({ path: fullPath, value: value.value });
        } else if (value && typeof value === 'object') {
          extractValues(value, fullPath);
        } else {
          values.push({ path: fullPath, value });
        }
      });
    };
    
    extractValues(tokens);
    return values;
  }

  findDuplicateValues(values) {
    const valueMap = new Map();
    const duplicates = [];
    
    values.forEach(({ path, value }) => {
      if (valueMap.has(value)) {
        valueMap.get(value).push(path);
      } else {
        valueMap.set(value, [path]);
      }
    });
    
    valueMap.forEach((tokens, value) => {
      if (tokens.length > 1) {
        duplicates.push({ value, tokens });
      }
    });
    
    return duplicates;
  }

  parseSpacingValue(value) {
    if (typeof value !== 'string') return null;
    
    const match = value.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }
} 