import { loadConfig } from '../utils/config.js';

/**
 * Token validation engine
 * Validates design tokens structure, values, and consistency
 * Supports both flat format and Figma Token Studio format
 */
export class TokenValidator {
  constructor(options = {}) {
    this.options = options;
    this.config = null;
  }

  async init() {
    if (!this.config) {
      this.config = await loadConfig();
    }
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
   * Check if tokens are in Figma Token Studio format
   */
  isFigmaTokenStudioFormat(tokens) {
    return tokens && (
      tokens.core || 
      tokens.semantic || 
      tokens.$themes || 
      tokens.$metadata
    );
  }

  /**
   * Extract tokens from Figma Token Studio format
   */
  extractTokensFromFigmaFormat(tokens) {
    const extracted = {};
    
    // Merge core and semantic tokens
    if (tokens.core) {
      Object.assign(extracted, tokens.core);
    }
    
    if (tokens.semantic) {
      // For semantic tokens, we need to be careful about merging
      // Let's add them under a semantic prefix to avoid conflicts
      Object.keys(tokens.semantic).forEach(category => {
        if (extracted[category]) {
          // Merge with existing category
          Object.assign(extracted[category], tokens.semantic[category]);
        } else {
          // Add new category
          extracted[category] = tokens.semantic[category];
        }
      });
    }
    
    return extracted;
  }

  /**
   * Validate basic structure
   */
  validateStructure(tokens, errors, warnings) {
    if (!tokens || typeof tokens !== 'object') {
      errors.push('Tokens must be an object');
      return;
    }

    // Handle Figma Token Studio format
    const isFigmaFormat = this.isFigmaTokenStudioFormat(tokens);
    let tokensToValidate = tokens;
    
    if (isFigmaFormat) {
      tokensToValidate = this.extractTokensFromFigmaFormat(tokens);
      
      // Validate Figma Token Studio specific structure
      if (tokens.$themes && !Array.isArray(tokens.$themes)) {
        warnings.push('$themes should be an array in Figma Token Studio format');
      }
      
      if (tokens.$metadata && typeof tokens.$metadata !== 'object') {
        warnings.push('$metadata should be an object in Figma Token Studio format');
      }
    }

    // Check for colors category (now extracted from core/semantic if needed)
    if (!tokensToValidate.colors) {
      errors.push('Missing required token category: colors');
    }

    // Check for common typos or incorrect structures
    const commonTypos = ['colour', 'color', 'spacings', 'typo', 'fonts'];
    commonTypos.forEach(typo => {
      if (tokensToValidate[typo] && !tokensToValidate[this.getCorrectCategory(typo)]) {
        warnings.push(`Found "${typo}" - did you mean "${this.getCorrectCategory(typo)}"?`);
      }
    });
  }

  /**
   * Validate required categories
   */
  validateRequiredCategories(tokens, errors, warnings) {
    const required = this.config?.tokens?.validation?.required || ['colors'];
    
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
    
    required.forEach(category => {
      if (!tokensToValidate[category] || Object.keys(tokensToValidate[category]).length === 0) {
        errors.push(`Missing required token category: ${category}`);
      }
    });

    // Specific color validation
    if (tokensToValidate.colors) {
      const requiredColorCategories = ['primary'];
      requiredColorCategories.forEach(colorCategory => {
        if (!tokensToValidate.colors[colorCategory] || Object.keys(tokensToValidate.colors[colorCategory]).length === 0) {
          errors.push(`Missing required color category: colors.${colorCategory}`);
        }
      });
    }
  }

  /**
   * Validate optional categories
   */
  validateOptionalCategories(tokens, errors, warnings) {
    const optional = this.config?.tokens?.validation?.optional || ['spacing', 'typography', 'borderRadius'];
    
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
    
    optional.forEach(category => {
      if (!tokensToValidate[category]) {
        warnings.push(`Optional token category not found: ${category}`);
      }
    });
  }

  /**
   * Validate color values
   */
  validateColors(tokens, errors, warnings) {
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
      
    if (!tokensToValidate.colors) return;

    Object.entries(tokensToValidate.colors).forEach(([category, shades]) => {
      if (!shades || typeof shades !== 'object') {
        errors.push(`Invalid color category structure: colors.${category}`);
        return;
      }

      Object.entries(shades).forEach(([shade, tokenData]) => {
        // Handle both Token Studio format {value, type} and simple string values
        const value = this.getTokenValue(tokenData);
        
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
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
      
    if (!tokensToValidate.spacing) return;

    Object.entries(tokensToValidate.spacing).forEach(([key, tokenData]) => {
      const value = this.getTokenValue(tokenData);
      
      if (!this.isValidSpacing(value)) {
        errors.push(`Invalid spacing value: spacing.${key} = "${value}"`);
      }
    });

    // Check for common spacing values
    const commonSpacing = ['0', '1', '2', '4', '8', '16'];
    const missingSpacing = commonSpacing.filter(spacing => !tokensToValidate.spacing[spacing]);
    if (missingSpacing.length > 0) {
      warnings.push(`Consider adding common spacing values: ${missingSpacing.join(', ')}`);
    }
  }

  /**
   * Validate typography
   */
  validateTypography(tokens, errors, warnings) {
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
      
    if (!tokensToValidate.typography) return;

    // Check required typography categories
    const requiredTypo = ['fontFamily'];
    requiredTypo.forEach(category => {
      if (!tokensToValidate.typography[category]) {
        warnings.push(`Missing typography category: typography.${category}`);
      }
    });

    // Validate font families
    if (tokensToValidate.typography.fontFamily) {
      if (!tokensToValidate.typography.fontFamily.sans) {
        errors.push('Missing sans-serif font family (typography.fontFamily.sans)');
      }

      Object.entries(tokensToValidate.typography.fontFamily).forEach(([key, tokenData]) => {
        const value = this.getTokenValue(tokenData);
        if (typeof value !== 'string' || value.trim().length === 0) {
          errors.push(`Invalid font family: typography.fontFamily.${key} = "${value}"`);
        }
      });
    }

    // Validate font sizes
    if (tokensToValidate.typography.fontSize) {
      Object.entries(tokensToValidate.typography.fontSize).forEach(([key, tokenData]) => {
        const value = this.getTokenValue(tokenData);
        if (!this.isValidSize(value)) {
          errors.push(`Invalid font size: typography.fontSize.${key} = "${value}"`);
        }
      });
    }
  }

  /**
   * Validate token consistency
   */
  validateConsistency(tokens, errors, warnings) {
    // Extract tokens if in Figma format
    const tokensToValidate = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;

    // Collect all values to check for duplicates
    const allValues = [];
    
    const collectValues = (obj, path = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if (this.getTokenValue(value) !== undefined) {
            // This is a token
            allValues.push({
              path: currentPath,
              value: this.getTokenValue(value)
            });
          } else {
            // This is a nested object
            collectValues(value, currentPath);
          }
        } else if (typeof value === 'string') {
          // Direct string value
          allValues.push({
            path: currentPath,
            value: value
          });
        }
      });
    };

    collectValues(tokensToValidate);

    // Find duplicates
    const valueCounts = {};
    allValues.forEach(({ path, value }) => {
      if (!valueCounts[value]) {
        valueCounts[value] = [];
      }
      valueCounts[value].push(path);
    });

    Object.entries(valueCounts).forEach(([value, paths]) => {
      if (paths.length > 1 && value !== '0' && value !== 'transparent') {
        warnings.push(`Duplicate value "${value}" found in: ${paths.join(', ')}`);
      }
    });
  }

  /**
   * Get token value from either Token Studio format or direct value
   */
  getTokenValue(tokenData) {
    if (tokenData && typeof tokenData === 'object') {
      // Token Studio format: {value: "...", type: "..."}
      return tokenData.value || tokenData.$value;
    }
    // Direct value
    return tokenData;
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
    if (typeof value !== 'string') return false;
    
    // CSS size units
    if (/^[\d.]+([a-z%]+)?$/i.test(value)) return true;
    
    // Token references
    if (value.startsWith('{') && value.endsWith('}')) return true;
    
    return false;
  }

  isNumericShade(shade) {
    return /^\d+$/.test(shade);
  }

  countCategories(tokens) {
    const tokensToCount = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
    return Object.keys(tokensToCount).filter(key => typeof tokensToCount[key] === 'object').length;
  }

  countTokens(tokens) {
    let count = 0;
    
    const tokensToCount = this.isFigmaTokenStudioFormat(tokens) 
      ? this.extractTokensFromFigmaFormat(tokens) 
      : tokens;
    
    const countInCategory = (obj) => {
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          if (this.getTokenValue(value) !== undefined) {
            count++; // Token Studio format or direct token
          } else {
            countInCategory(value); // Nested structure
          }
        } else {
          count++; // Direct value
        }
      });
    };
    
    Object.values(tokensToCount).forEach(category => {
      if (category && typeof category === 'object') {
        countInCategory(category);
      }
    });
    
    return count;
  }
} 