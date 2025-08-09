import { cosmiconfig } from 'cosmiconfig';
import Joi from 'joi';
import { join } from 'path';
import { existsSync } from 'fs';
import path from 'path';

const MODULE_NAME = 'design-tokens';

// Configuration schema
const configSchema = Joi.object({
  tokens: Joi.object({
    input: Joi.string().default('tokens.json'),
    validation: Joi.object({
      required: Joi.array().items(Joi.string()).default(['colors']),
      optional: Joi.array().items(Joi.string()).default(['spacing', 'typography'])
    })
  }),
  
  output: Joi.object({
    css: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).default('src/styles/tokens.css'),
    tailwind: Joi.string().allow(null).default(null),
    // New preset outputs
    tailwindPresetEsm: Joi.string().allow(null).default('tokens.tailwind.preset.js'),
    tailwindPresetCjs: Joi.string().allow(null).default('tokens.tailwind.preset.cjs'),
    typescript: Joi.string().allow(null),
    scss: Joi.string().allow(null),
    javascript: Joi.string().allow(null),
    // New dual-module tokens output (CJS)
    tokensCjs: Joi.string().allow(null).default('src/data/tokens.cjs'),
    json: Joi.string().allow(null),
    // Shadcn theme CSS bridge
    shadcnThemeCss: Joi.string().allow(null).default('src/styles/shadcn-theme.css'),
    ios: Joi.string().allow(null),
    android: Joi.string().allow(null),
    xamarin: Joi.string().allow(null),
    reactNative: Joi.string().allow(null),
    flutter: Joi.string().allow(null),
    kotlinCompose: Joi.string().allow(null),
    swiftui: Joi.string().allow(null)
  }),
  
  git: Joi.object({
    enabled: Joi.boolean().default(true),
    autoCommit: Joi.boolean().default(true),
    autoPush: Joi.boolean().default(false),
    commitMessage: Joi.string().default('🎨 Update design tokens')
  }),
  
  analytics: Joi.object({
    enabled: Joi.boolean().default(true),
    autoCollect: Joi.boolean().default(true),
    reportSchedule: Joi.string().allow(null),
    scanDirs: Joi.array().items(Joi.string()).default(['src/**/*']),
    fileExtensions: Joi.array().items(Joi.string()).default(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']),
    outputDir: Joi.string().default('.tokens-analytics')
  }),
  
  // CSS generation options
  css: Joi.object({
    includeUtilities: Joi.boolean().default(false)
  }).default({ includeUtilities: false }),
  
  watch: Joi.object({
    enabled: Joi.boolean().default(true),
    ignore: Joi.array().items(Joi.string()).default(['node_modules', '.git'])
  }),

  // Init scaffolding
  init: Joi.object({
    scaffoldRootTailwindConfig: Joi.boolean().default(true)
  }).default({ scaffoldRootTailwindConfig: true }),

  // Shadcn specific settings
  shadcn: Joi.object({
    enable: Joi.boolean().default(true),
    hsl: Joi.boolean().default(true),
    format: Joi.string().valid('hsl', 'rgb').default('hsl'),
    mapping: Joi.object().optional()
  }).default({ enable: true, hsl: true, format: 'hsl' }),
  
  // Framework-specific configurations
  react: Joi.object({
    hooks: Joi.string().allow(null),
    components: Joi.string().allow(null),
    styledComponents: Joi.boolean().default(false),
    emotionSupport: Joi.boolean().default(false)
  }).optional(),
  
  nextjs: Joi.object({
    appDir: Joi.boolean().default(true),
    pages: Joi.string().default('app'),
    components: Joi.string().default('components'),
    styles: Joi.string().default('styles'),
    cssModules: Joi.boolean().default(false),
    styledJsx: Joi.boolean().default(false)
  }).optional(),
  
  vue: Joi.object({
    components: Joi.string().allow(null),
    composables: Joi.string().allow(null),
    scoped: Joi.boolean().default(true)
  }).optional(),
  
  build: Joi.object({
    beforeBuild: Joi.string().allow(null),
    validateBeforeCommit: Joi.boolean().default(true),
    generateStatic: Joi.boolean().default(false)
  }).optional(),
  
  hooks: Joi.object({
    beforeSync: Joi.function().allow(null),
    afterSync: Joi.function().allow(null)
  }).optional()
}).default();

export async function loadConfig(configPathOrSearchFrom = process.cwd()) {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'package.json',
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.js`,
      `.${MODULE_NAME}rc.cjs`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.cjs`,
      `design-tokens.config.js`,
      `design-tokens.config.cjs`
    ]
  });

  try {
    let result;
    
    // Check if configPathOrSearchFrom is a specific file path
    if (configPathOrSearchFrom && configPathOrSearchFrom !== process.cwd()) {
      const isFilePath = path.extname(configPathOrSearchFrom) !== '' || 
                        configPathOrSearchFrom.includes('/') || 
                        configPathOrSearchFrom.includes('\\');
      
      if (isFilePath) {
        // Load specific config file
        const configPath = path.resolve(configPathOrSearchFrom);
        if (existsSync(configPath)) {
          result = await explorer.load(configPath);
        } else {
          throw new Error(`Config file not found: ${configPath}`);
        }
      } else {
        // Search from directory
        result = await explorer.search(configPathOrSearchFrom);
      }
    } else {
      // Default search from current working directory
      result = await explorer.search(process.cwd());
    }
    
    if (result) {
      const { value, error } = configSchema.validate(result.config);
      if (error) {
        throw new Error(`Configuration validation error: ${error.message}`);
      }
      // Deprecation notice for root tailwind output
      if (value?.output?.tailwind) {
        console.warn('⚠️  Deprecation: output.tailwind will be removed in a future version. Generate presets via output.tailwindPresetEsm/Cjs and reference them from your root Tailwind config.');
      }
      return value;
    }
    
    // Return default config if no config file found
    return configSchema.validate({}).value;
    
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

export function createConfig(customConfig = {}) {
  const { value, error } = configSchema.validate(customConfig);
  if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }
  return value;
}

export function createDefaultConfig() {
  return {
    tokens: {
      input: 'tokens.json',
      validation: {
        required: ['colors'],
        optional: ['spacing', 'typography', 'borderRadius', 'shadows']
      }
    },
    output: {
      css: 'src/styles/tokens.css',
      tailwindPresetEsm: 'tokens.tailwind.preset.js',
      tailwindPresetCjs: 'tokens.tailwind.preset.cjs',
      tokensCjs: 'src/data/tokens.cjs',
      shadcnThemeCss: 'src/styles/shadcn-theme.css'
    },
    git: {
      enabled: true,
      autoCommit: true,
      autoPush: false,
      commitMessage: '🎨 Update design tokens - {{timestamp}}'
    },
    analytics: {
      enabled: true,
      autoCollect: true
    },
    css: { includeUtilities: false },
    init: { scaffoldRootTailwindConfig: true },
    shadcn: { enable: true, hsl: true }
  };
} 