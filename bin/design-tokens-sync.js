#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as commands from '../src/cli/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

// ASCII Art Logo
console.log(chalk.cyan(`
╔══════════════════════════════════════╗
║   🎨 Design Tokens Sync v${packageJson.version}      ║
║   Bridging Design & Development      ║
╚══════════════════════════════════════╝
`));

program
  .name('design-tokens-sync')
  .description('Sync design tokens between Figma Token Studio and your codebase')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize design tokens in your project')
  .option('-f, --force', 'Overwrite existing configuration')
  .option('-t, --template <type>', 'Project template (react, vue, next)', 'react')
  .action(commands.init);

// Sync command
program
  .command('sync')
  .description('Sync tokens from tokens.json to CSS/Tailwind')
  .option('-c, --config <path>', 'Path to config file')
  .option('--no-git', 'Skip git operations')
  .option('--force', 'Force update even if no changes')
  .action(commands.sync);

// Watch command
program
  .command('watch')
  .description('Watch tokens.json for changes')
  .option('-c, --config <path>', 'Path to config file')
  .action(commands.watch);

// Analytics commands
const analytics = program
  .command('analytics')
  .description('Design system analytics tools');

analytics
  .command('collect')
  .description('Collect token usage data')
  .option('-c, --config <path>', 'Path to config file')
  .option('--scan-dirs <dirs...>', 'Directories to scan')
  .option('--extensions <exts...>', 'File extensions to analyze')
  .option('-o, --output <path>', 'Output directory')
  .action((options) => commands.analytics('collect', options));

analytics
  .command('report')
  .description('Generate analytics report')
  .option('-c, --config <path>', 'Path to config file')
  .option('--html', 'Generate HTML report')
  .option('--fresh', 'Collect fresh data instead of using cache')
  .option('-o, --output <path>', 'Output directory')
  .option('--output-file <path>', 'Specific output file path')
  .action((options) => commands.analytics('report', options));

// Config command
program
  .command('config')
  .description('Show current configuration')
  .option('-c, --config <path>', 'Path to config file')
  .action(commands.config);

// Validate command
program
  .command('validate')
  .description('Validate tokens.json structure')
  .option('-c, --config <path>', 'Path to config file')
  .action(commands.validate);

// Parse arguments
program.parse(process.argv); 