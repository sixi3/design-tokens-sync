import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { loadConfig } from '../utils/config.js';
import { TokenValidator } from './TokenValidator.js';
import { FileGenerator } from './FileGenerator.js';
import { GitManager } from './GitManager.js';
import { TransformEngine } from './TransformEngine.js';
import { BuildHooks } from './BuildHooks.js';

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
    this.transformEngine = new TransformEngine(options);
    this.buildHooks = new BuildHooks();

    // Register common hooks
    this.buildHooks.registerCommonHooks();
  }

  /**
   * Initialize the processor with configuration
   */
  async init() {
    this.config = await loadConfig(this.options.configPath);
    return this.config;
  }

  /**
   * Load and parse tokens from the configured input file0
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
      this.rawTokens = rawTokens; // Store raw tokens for token resolution
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
   * Transform raw tokens into standardized format with Style Dictionary-like capabilities
   */
  transformTokens(rawTokens) {
    // Resolve all token references first
    const resolvedTokens = this.resolveAllTokenReferences(rawTokens);

    // Apply transforms and filters if configured
    let processedTokens = resolvedTokens;
    if (this.config?.transforms) {
      processedTokens = this.transformEngine.applyTransforms(resolvedTokens, this.config.transforms);
    }
    if (this.config?.filters) {
      processedTokens = this.transformEngine.applyFilters(processedTokens, this.config.filters);
    }

    const transformed = {
      // Core tokens
      colors: this.extractColors(processedTokens),
      spacing: this.extractSpacing(processedTokens),
      typography: this.extractTypography(processedTokens),
      borderRadius: this.extractBorderRadius(processedTokens),
      sizing: this.extractSizing(processedTokens),
      shadows: this.extractShadows(processedTokens),
      opacity: this.extractOpacity(processedTokens),
      zIndex: this.extractZIndex(processedTokens),
      transitions: this.extractTransitions(processedTokens),
      breakpoints: this.extractBreakpoints(processedTokens),

      // Semantic tokens (new)
      semantic: this.extractSemanticTokens(processedTokens),

      // Component tokens (new)
      component: this.extractComponentTokens(processedTokens),

      // Metadata
      source: 'tokens.json',
      lastLoaded: new Date().toISOString(),
      _resolvedTokens: resolvedTokens, // Store resolved tokens for advanced processing
      _processedTokens: processedTokens // Store processed tokens after transforms
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
   * Extract semantic tokens (text, background, border, brand, feedback)
   */
  extractSemanticTokens(rawTokens) {
    const semantic = {};

    if (rawTokens.semantic) {
      // Process each semantic category
      Object.keys(rawTokens.semantic).forEach(category => {
        semantic[category] = this.preserveNestedStructure(rawTokens.semantic[category]);
      });
    }

    return semantic;
  }

  /**
   * Extract component tokens (button, card, input, navbar, table, status)
   */
  extractComponentTokens(rawTokens) {
    const component = {};

    if (rawTokens.component) {
      // Process each component category
      Object.keys(rawTokens.component).forEach(componentName => {
        component[componentName] = this.extractComponentProperties(rawTokens.component[componentName]);
      });
    }

    return component;
  }

  /**
   * Extract component properties with proper structure preservation
   */
  extractComponentProperties(componentData) {
    const properties = {};

    Object.entries(componentData).forEach(([propName, propValue]) => {
      if (propValue && typeof propValue === 'object' && propValue.value !== undefined) {
        // Token Studio format with .value
        properties[propName] = this.resolveTokenValue(propValue.value, this.rawTokens);
      } else if (propValue && typeof propValue === 'object' && !Array.isArray(propValue)) {
        // Nested properties (like button variants)
        properties[propName] = {};
        Object.entries(propValue).forEach(([subProp, subValue]) => {
          if (subValue && typeof subValue === 'object' && subValue.value !== undefined) {
            properties[propName][subProp] = this.resolveTokenValue(subValue.value, this.rawTokens);
          } else {
            properties[propName][subProp] = subValue;
          }
        });
      } else {
        // Direct value
        properties[propName] = this.resolveTokenValue(propValue, this.rawTokens);
      }
    });

    return properties;
  }

  /**
   * Resolve all token references in the entire token tree (Style Dictionary style)
   */
  resolveAllTokenReferences(rawTokens) {
    const resolved = JSON.parse(JSON.stringify(rawTokens)); // Deep clone

    // Recursively resolve all references
    const resolveObject = (obj) => {
      if (typeof obj === 'string') {
        return this.resolveTokenValue(obj, rawTokens);
      } else if (Array.isArray(obj)) {
        return obj.map(item => resolveObject(item));
      } else if (obj && typeof obj === 'object') {
        const resolvedObj = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'value' && typeof value === 'string') {
            resolvedObj[key] = this.resolveTokenValue(value, rawTokens);
          } else {
            resolvedObj[key] = resolveObject(value);
          }
        }
        return resolvedObj;
      }
      return obj;
    };

    return resolveObject(resolved);
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
            structured[category][shade] = this.resolveTokenValue(value.value, this.rawTokens);
          } else {
            // Direct value
            structured[category][shade] = this.resolveTokenValue(value, this.rawTokens);
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
        flattened[newKey] = this.resolveTokenValue(value.value, this.rawTokens);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nested structure
        Object.assign(flattened, this.flattenTokenCategory(value, newKey));
      } else {
        // Direct value
        flattened[newKey] = this.resolveTokenValue(value, this.rawTokens);
      }
    });

    return flattened;
  }

  /**
   * Resolve token references (e.g., {core.colors.primary.500})
   */
  resolveTokenValue(value, rawTokens = null) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // This is a token reference - resolve it
      const tokenPath = value.slice(1, -1); // Remove { and }
      const resolvedValue = this.resolveTokenReference(tokenPath, rawTokens || this.rawTokens);
      return resolvedValue !== undefined ? resolvedValue : value; // Return original if not found
    }
    return value;
  }

  /**
   * Resolve a token reference path (e.g., "core.colors.blue.500")
   */
  resolveTokenReference(path, rawTokens) {
    if (!rawTokens) return undefined;
    
    const pathParts = path.split('.');
    let current = rawTokens;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && current[part] !== undefined) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    // If we found a token object with a value property, return the value
    if (current && typeof current === 'object' && current.value !== undefined) {
      // Recursively resolve nested token references
      return this.resolveTokenValue(current.value, rawTokens);
    }
    
    // If it's a direct value, return it
    return current;
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

      let rawTokens = await fs.readJSON(tokensPath);
      console.log(`✅ Design tokens loaded from: ${tokensPath}`);

      // Execute beforeProcess hooks
      let context = await this.buildHooks.executeHooks('beforeProcess', {
        rawTokens,
        config: this.config,
        options
      });
      rawTokens = context.rawTokens;

      // Store raw tokens for token resolution
      this.rawTokens = rawTokens;

      // Execute beforeValidate hooks
      context = await this.buildHooks.executeHooks('beforeValidate', context);

      // Validate using raw tokens (preserves Figma Token Studio format)
      const validation = await this.validator.validate(rawTokens);
      if (!validation.isValid && !options.force) {
        console.error('❌ Token validation failed:', validation.errors);
        throw new Error('Token validation failed');
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Token warnings:', validation.warnings);
      }

      // Execute afterValidate hooks
      context.validation = validation;
      context = await this.buildHooks.executeHooks('afterValidate', context);

      // Transform tokens for file generation
      this.tokens = this.transformTokens(rawTokens);

      // Execute afterProcess hooks
      context.tokens = this.tokens;
      context = await this.buildHooks.executeHooks('afterProcess', context);

      // Execute beforeGenerate hooks
      context = await this.buildHooks.executeHooks('beforeGenerate', context);

      // Generate output files
      await this.fileGenerator.generateAll(this.tokens, this.config, context);

      // Execute afterGenerate hooks
      context = await this.buildHooks.executeHooks('afterGenerate', context);

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
        // Clear cached tokens to force reload
        this.tokens = null;
        this.rawTokens = null;
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