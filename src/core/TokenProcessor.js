import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { loadConfig } from '../utils/config.js';
import { TokenValidator } from './TokenValidator.js';
import { FileGenerator } from './FileGenerator.js';
import { GitManager } from './GitManager.js';

/**
 * Core token processing engine
 * Handles loading, parsing, validation, and transformation of design tokens
 */
export class TokenProcessor {
  constructor(options = {}) {
    this.options = options;
    this.config = null;
    this.tokens = null;
    this.isLoading = false;
    this.watcher = null;
    this.validator = new TokenValidator(options);
    this.fileGenerator = new FileGenerator(options);
    this.gitManager = new GitManager(options);
  }

  /**
   * Initialize the processor with configuration
   */
  async init() {
    this.config = await loadConfig(this.options.configPath);
    return this.config;
  }

  /**
   * Load and parse tokens from the configured input file
   */
  async loadTokens(forceReload = false) {
    if (this.tokens && !forceReload) {
      return this.tokens;
    }

    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.tokens;
    }

    this.isLoading = true;

    try {
      if (!this.config) {
        await this.init();
      }

      const tokensPath = path.resolve(this.config.tokens.input);
      
      if (!await fs.pathExists(tokensPath)) {
        throw new Error(`Tokens file not found: ${tokensPath}`);
      }

      const rawTokens = await fs.readJSON(tokensPath);
      this.tokens = this.transformTokens(rawTokens);
      
      console.log(`✅ Design tokens loaded from: ${tokensPath}`);
      return this.tokens;

    } catch (error) {
      console.error('❌ Failed to load design tokens:', error.message);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Transform raw tokens into standardized format
   */
  transformTokens(rawTokens) {
    const transformed = {
      colors: this.extractColors(rawTokens),
      spacing: this.extractSpacing(rawTokens),
      typography: this.extractTypography(rawTokens),
      borderRadius: this.extractBorderRadius(rawTokens),
      sizing: this.extractSizing(rawTokens),
      shadows: this.extractShadows(rawTokens),
      opacity: this.extractOpacity(rawTokens),
      zIndex: this.extractZIndex(rawTokens),
      transitions: this.extractTransitions(rawTokens),
      breakpoints: this.extractBreakpoints(rawTokens),
      source: 'tokens.json',
      lastLoaded: new Date().toISOString()
    };

    return transformed;
  }

  /**
   * Extract color tokens from raw data
   */
  extractColors(rawTokens) {
    const colors = {};
    
    // Handle different Token Studio formats and flat format
    if (rawTokens.core?.colors || rawTokens.semantic?.colors) {
      // Token Studio format with core/semantic structure
      const coreColors = rawTokens.core?.colors || {};
      const semanticColors = rawTokens.semantic?.colors || {};
      
      Object.assign(colors, this.preserveNestedStructure(coreColors));
      Object.assign(colors, this.preserveNestedStructure(semanticColors));
    } else if (rawTokens.color) {
      // Token Studio format with direct 'color' field (singular)
      Object.assign(colors, this.preserveNestedStructure(rawTokens.color));
    } else if (rawTokens.colors) {
      // Direct colors format (plural)
      Object.assign(colors, this.preserveNestedStructure(rawTokens.colors));
    }

    return colors;
  }

  /**
   * Extract spacing tokens
   */
  extractSpacing(rawTokens) {
    const spacing = {};
    
    if (rawTokens.core?.spacing) {
      Object.assign(spacing, this.flattenTokenCategory(rawTokens.core.spacing));
    } else if (rawTokens.spacing) {
      Object.assign(spacing, this.flattenTokenCategory(rawTokens.spacing));
    }

    return spacing;
  }

  /**
   * Extract typography tokens
   */
  extractTypography(rawTokens) {
    const typography = {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    };

    // Handle different Token Studio format variations
    const typoData = rawTokens.core?.typography || rawTokens.typography || rawTokens.text || {};
    
    // Map Token Studio text structure to typography categories
    if (rawTokens.text) {
      // Token Studio format with 'text' field
      if (typoData['font family']) {
        typography.fontFamily = this.flattenTokenCategory(typoData['font family']);
      }
      if (typoData['font-size']) {
        typography.fontSize = this.flattenTokenCategory(typoData['font-size']);
      }
      if (typoData['font weight']) {
        typography.fontWeight = this.flattenTokenCategory(typoData['font weight']);
      }
      if (typoData['font line height']) {
        typography.lineHeight = this.flattenTokenCategory(typoData['font line height']);
      }
    } else {
      // Standard format
      Object.keys(typography).forEach(category => {
        if (typoData[category]) {
          typography[category] = this.flattenTokenCategory(typoData[category]);
        }
      });
    }

    // Provide defaults if empty
    if (Object.keys(typography.fontFamily).length === 0) {
      typography.fontFamily = {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'Fira Code, monospace'
      };
    }

    return typography;
  }

  /**
   * Extract border radius tokens
   */
  extractBorderRadius(rawTokens) {
    const borderRadius = {};
    
    if (rawTokens.core?.borderRadius) {
      Object.assign(borderRadius, this.flattenTokenCategory(rawTokens.core.borderRadius));
    } else if (rawTokens.borderRadius) {
      Object.assign(borderRadius, this.flattenTokenCategory(rawTokens.borderRadius));
    } else if (rawTokens.radius) {
      // Token Studio format with 'radius' field
      Object.assign(borderRadius, this.flattenTokenCategory(rawTokens.radius));
    }

    // Provide defaults
    if (Object.keys(borderRadius).length === 0) {
      return {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      };
    }

    return borderRadius;
  }

  /**
   * Extract sizing tokens
   */
  extractSizing(rawTokens) {
    const sizing = {};
    
    if (rawTokens.core?.sizing) {
      Object.assign(sizing, this.flattenTokenCategory(rawTokens.core.sizing));
    } else if (rawTokens.sizing) {
      Object.assign(sizing, this.flattenTokenCategory(rawTokens.sizing));
    }

    return sizing;
  }

  /**
   * Extract other token categories with defaults
   */
  extractShadows(rawTokens) {
    return this.extractTokenCategory(rawTokens, 'shadows') || {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    };
  }

  extractOpacity(rawTokens) {
    return this.extractTokenCategory(rawTokens, 'opacity') || {
      '0': '0',
      '25': '0.25',
      '50': '0.5',
      '75': '0.75',
      '100': '1'
    };
  }

  extractZIndex(rawTokens) {
    return this.extractTokenCategory(rawTokens, 'zIndex') || {
      auto: 0,
      base: 1,
      dropdown: 1000,
      modal: 1040,
      popover: 1050,
      tooltip: 1060
    };
  }

  extractTransitions(rawTokens) {
    return {
      duration: this.extractTokenCategory(rawTokens, 'transitionDuration') || {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: this.extractTokenCategory(rawTokens, 'transitionEasing') || {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out'
      }
    };
  }

  extractBreakpoints(rawTokens) {
    return this.extractTokenCategory(rawTokens, 'breakpoints') || {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
  }

  /**
   * Generic token category extractor
   */
  extractTokenCategory(rawTokens, category) {
    if (rawTokens.core?.[category]) {
      return this.flattenTokenCategory(rawTokens.core[category]);
    } else if (rawTokens[category]) {
      return this.flattenTokenCategory(rawTokens[category]);
    }
    return null;
  }

  /**
   * Preserve nested structure for colors (category -> shade -> value)
   */
  preserveNestedStructure(obj) {
    const structured = {};
    
    Object.entries(obj).forEach(([category, shades]) => {
      if (shades && typeof shades === 'object' && !Array.isArray(shades)) {
        structured[category] = {};
        
        Object.entries(shades).forEach(([shade, value]) => {
          if (value && typeof value === 'object' && value.value !== undefined) {
            // Token Studio format with .value
            structured[category][shade] = this.resolveTokenValue(value.value);
          } else {
            // Direct value
            structured[category][shade] = this.resolveTokenValue(value);
          }
        });
      }
    });

    return structured;
  }

  /**
   * Flatten nested token structure
   */
  flattenTokenCategory(obj, prefix = '') {
    const flattened = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}-${key}` : key;
      
      if (value && typeof value === 'object' && value.value !== undefined) {
        // Token Studio format with .value
        flattened[newKey] = this.resolveTokenValue(value.value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nested structure
        Object.assign(flattened, this.flattenTokenCategory(value, newKey));
      } else {
        // Direct value
        flattened[newKey] = this.resolveTokenValue(value);
      }
    });

    return flattened;
  }

  /**
   * Resolve token references (e.g., {core.colors.primary.500})
   */
  resolveTokenValue(value) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // This is a token reference - for now return as-is
      // TODO: Implement full token resolution
      return value;
    }
    return value;
  }

  /**
   * Sync tokens - validate, generate files, and commit
   */
  async sync(options = {}) {
    try {
      console.log('🔄 Starting token sync...');

      // Load raw tokens for validation
      if (!this.config) {
        await this.init();
      }

      const tokensPath = path.resolve(this.config.tokens.input);
      
      if (!await fs.pathExists(tokensPath)) {
        throw new Error(`Tokens file not found: ${tokensPath}`);
      }

      const rawTokens = await fs.readJSON(tokensPath);
      console.log(`✅ Design tokens loaded from: ${tokensPath}`);

      // Validate using raw tokens (preserves Figma Token Studio format)
      const validation = await this.validator.validate(rawTokens);
      if (!validation.isValid && !options.force) {
        console.error('❌ Token validation failed:', validation.errors);
        throw new Error('Token validation failed');
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Token warnings:', validation.warnings);
      }

      // Transform tokens for file generation
      this.tokens = this.transformTokens(rawTokens);

      // Generate output files
      await this.fileGenerator.generateAll(this.tokens, this.config);

      // Git operations
      if (this.config.git.enabled && !options.noGit) {
        await this.gitManager.commitChanges(this.config);
      }

      console.log('✅ Token sync completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Token sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Start watching tokens file for changes
   */
  async watch() {
    if (!this.config) {
      await this.init();
    }

    const tokensPath = path.resolve(this.config.tokens.input);
    
    console.log(`👀 Watching for changes: ${tokensPath}`);

    this.watcher = chokidar.watch(tokensPath, {
      ignored: this.config.watch.ignore,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async (path) => {
      console.log(`📝 Token file changed: ${path}`);
      try {
        await this.sync();
      } catch (error) {
        console.error('❌ Auto-sync failed:', error.message);
      }
    });

    this.watcher.on('error', (error) => {
      console.error('❌ Watch error:', error.message);
    });

    return this.watcher;
  }

  /**
   * Stop watching
   */
  async stopWatch() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      console.log('🛑 Stopped watching tokens file');
    }
  }

  /**
   * Refresh tokens cache
   */
  refresh() {
    this.tokens = null;
  }

  /**
   * Get current tokens (synchronous)
   */
  getTokens() {
    if (!this.tokens) {
      throw new Error('Tokens not loaded. Call loadTokens() first.');
    }
    return this.tokens;
  }
} 