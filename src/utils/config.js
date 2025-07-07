import { cosmiconfig } from 'cosmiconfig';
import Joi from 'joi';
import { join } from 'path';
import { existsSync } from 'fs';

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
    css: Joi.string().default('src/styles/tokens.css'),
    tailwind: Joi.string().allow(null).default('tailwind.config.js'),
    typescript: Joi.string().allow(null),
    scss: Joi.string().allow(null)
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
    reportSchedule: Joi.string().allow(null)
  }),
  
  watch: Joi.object({
    enabled: Joi.boolean().default(true),
    ignore: Joi.array().items(Joi.string()).default(['node_modules', '.git'])
  })
}).default();

export async function loadConfig(searchFrom = process.cwd()) {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'package.json',
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.js`,
      `.${MODULE_NAME}rc.cjs`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.cjs`,
      `design-tokens.config.js`
    ]
  });

  try {
    const result = await explorer.search(searchFrom);
    
    if (result) {
      const { value, error } = configSchema.validate(result.config);
      if (error) {
        throw new Error(`Configuration validation error: ${error.message}`);
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
      tailwind: 'tailwind.config.js'
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
    }
  };
} 