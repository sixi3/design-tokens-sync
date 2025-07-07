import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export async function config(options) {
  try {
    console.log(chalk.blue('📋 Design Tokens Configuration\n'));
    
    const config = await loadConfig(options.config);
    
    console.log(chalk.green('✅ Configuration loaded successfully\n'));
    
    // Display input configuration
    console.log(chalk.bold('📁 Input:'));
    console.log(`  File: ${chalk.cyan(config.tokens.input)}`);
    
    if (config.tokens.validation) {
      console.log(chalk.bold('\n✅ Validation:'));
      console.log(`  Required: ${chalk.cyan(config.tokens.validation.required.join(', '))}`);
      console.log(`  Optional: ${chalk.dim(config.tokens.validation.optional.join(', '))}`);
    }
    
    // Display output configuration
    console.log(chalk.bold('\n📤 Output:'));
    Object.entries(config.output).forEach(([format, path]) => {
      console.log(`  ${format}: ${chalk.cyan(path)}`);
    });
    
    // Display git configuration
    if (config.git) {
      console.log(chalk.bold('\n🔧 Git:'));
      console.log(`  Enabled: ${config.git.enabled ? '✅' : '❌'}`);
      console.log(`  Auto Commit: ${config.git.autoCommit ? '✅' : '❌'}`);
      console.log(`  Auto Push: ${config.git.autoPush ? '✅' : '❌'}`);
      console.log(`  Commit Message: ${chalk.dim(config.git.commitMessage)}`);
    }
    
    // Display analytics configuration
    if (config.analytics) {
      console.log(chalk.bold('\n📊 Analytics:'));
      console.log(`  Enabled: ${config.analytics.enabled ? '✅' : '❌'}`);
      console.log(`  Auto Collect: ${config.analytics.autoCollect ? '✅' : '❌'}`);
    }
    
    // Display watch configuration
    if (config.watch) {
      console.log(chalk.bold('\n👀 Watch:'));
      console.log(`  Enabled: ${config.watch.enabled ? '✅' : '❌'}`);
      console.log(`  Ignored: ${chalk.dim(config.watch.ignore.join(', '))}`);
    }
    
    console.log(chalk.dim('\n💡 To modify configuration, edit design-tokens.config.js'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to load configuration:'), error.message);
    console.log(chalk.yellow('\n💡 Run `npx design-tokens-sync init` to create initial configuration'));
    process.exit(1);
  }
} 