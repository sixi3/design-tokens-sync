import chalk from 'chalk';
import ora from 'ora';
import { TokenProcessor } from '../core/TokenProcessor.js';

export async function watch(options) {
  console.log(chalk.blue('👀 Starting token watch mode...\n'));
  
  const spinner = ora('Initializing watcher...').start();
  
  try {
    const processor = new TokenProcessor({
      configPath: options.config
    });

    // Initialize processor
    await processor.init();
    spinner.text = 'Configuration loaded';

    // Perform initial sync
    await processor.sync({ force: options.force });
    spinner.succeed('Initial sync completed');

    console.log(chalk.green('✨ Watch mode active!'));
    console.log(chalk.dim('  • Watching tokens.json for changes'));
    console.log(chalk.dim('  • Auto-sync enabled'));
    console.log(chalk.dim('  • Press Ctrl+C to stop\n'));

    // Start watching
    processor.watch((event, filepath) => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(chalk.cyan(`[${timestamp}]`), `File ${event}: ${filepath}`);
      
      if (event === 'change') {
        console.log(chalk.yellow('  → Syncing tokens...'));
      }
    }, (error) => {
      if (error) {
        console.error(chalk.red('  ❌ Sync failed:'), error.message);
      } else {
        console.log(chalk.green('  ✅ Sync completed'));
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n👋 Stopping watch mode...'));
      processor.stopWatching();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail('Watch mode failed to start');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
} 