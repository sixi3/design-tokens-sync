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
      
      // Show which formats were generated
      const config = await processor.config || processor.getConfig();
      const generatedFormats = [];
      
      if (config.output.css) generatedFormats.push('🎨 CSS Custom Properties');
      if (config.output.tailwind) generatedFormats.push('🌊 Tailwind Config');
      if (config.output.typescript) generatedFormats.push('📝 TypeScript Definitions');
      if (config.output.scss) generatedFormats.push('💎 SCSS Variables');
      if (config.output.json) generatedFormats.push('📄 JSON Export');
      if (config.output.javascript) generatedFormats.push('⚡ JavaScript/ES Modules');
      if (config.output.ios) generatedFormats.push('📱 iOS Swift');
      if (config.output.android) generatedFormats.push('🤖 Android XML');
      if (config.output.xamarin) generatedFormats.push('🔷 Xamarin XAML');
      
      if (generatedFormats.length > 0) {
        console.log('  • Generated formats:');
        generatedFormats.forEach(format => {
          console.log(`    - ${format}`);
        });
      }
      
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