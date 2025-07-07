import chalk from 'chalk';
import ora from 'ora';
import { TokenProcessor } from '../core/TokenProcessor.js';

export async function sync(options) {
  const spinner = ora('Starting token sync...').start();
  
  try {
    const processor = new TokenProcessor({
      configPath: options.config
    });

    // Initialize processor
    await processor.init();
    spinner.text = 'Configuration loaded';

    // Perform sync
    const result = await processor.sync({
      force: options.force,
      noGit: options.noGit
    });

    if (result) {
      spinner.succeed('Token sync completed successfully!');
      
      console.log(chalk.green('\n✨ Sync Summary:'));
      console.log('  • Tokens processed and validated');
      console.log('  • Output files generated');
      
      if (!options.noGit) {
        console.log('  • Git operations completed');
      }
      
      console.log(chalk.dim('\n💡 Run `npm run tokens:watch` to enable auto-sync'));
    } else {
      spinner.warn('Token sync completed with warnings');
    }

  } catch (error) {
    spinner.fail('Token sync failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    
    if (error.message.includes('validation failed')) {
      console.log(chalk.yellow('\n💡 Try running `npx design-tokens-sync validate` for detailed validation errors'));
    }
    
    process.exit(1);
  }
} 