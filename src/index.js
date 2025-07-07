// Public API for programmatic usage
export { TokenProcessor } from './core/TokenProcessor.js';
export { TokenValidator } from './core/TokenValidator.js';
export { FileGenerator } from './core/FileGenerator.js';
export { AnalyticsEngine } from './analytics/AnalyticsEngine.js';
export { createConfig, loadConfig } from './utils/config.js';

// Re-export CLI commands for programmatic usage
export * as cli from './cli/index.js';

// Default export with common operations
export default {
  sync: async (options = {}) => {
    const { TokenProcessor } = await import('./core/TokenProcessor.js');
    const processor = new TokenProcessor(options);
    return processor.sync();
  },
  
  watch: async (options = {}) => {
    const { TokenProcessor } = await import('./core/TokenProcessor.js');
    const processor = new TokenProcessor(options);
    return processor.watch();
  },
  
  validate: async (tokensPath, options = {}) => {
    const { TokenValidator } = await import('./core/TokenValidator.js');
    const validator = new TokenValidator(options);
    return validator.validate(tokensPath);
  },
  
  analytics: {
    collect: async (options = {}) => {
      const { AnalyticsEngine } = await import('./analytics/AnalyticsEngine.js');
      const engine = new AnalyticsEngine(options);
      return engine.collectUsage();
    },
    
    report: async (options = {}) => {
      const { AnalyticsEngine } = await import('./analytics/AnalyticsEngine.js');
      const engine = new AnalyticsEngine(options);
      return engine.generateReport();
    }
  }
}; 