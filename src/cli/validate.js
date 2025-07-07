import chalk from 'chalk';
import ora from 'ora';
import { TokenValidator } from '../core/TokenValidator.js';
import { loadConfig } from '../utils/config.js';

export async function validate(options) {
  const spinner = ora('Loading configuration...').start();
  
  try {
    // Load configuration
    const config = await loadConfig(options.config);
    spinner.text = 'Validating tokens...';

    // Initialize validator
    const validator = new TokenValidator(config);
    
    // Validate tokens
    const result = await validator.validate(config.tokens.input);
    
    if (result.isValid) {
      spinner.succeed('Token validation passed!');
      
      console.log(chalk.green('\n✅ Validation Summary:'));
      console.log(`  • ${result.tokenCount} tokens processed`);
      console.log(`  • ${result.categoriesFound.length} categories found`);
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow(`  • ${result.warnings.length} warnings`));
      }
      
      console.log(chalk.dim('\n📊 Token Categories:'));
      result.categoriesFound.forEach(category => {
        console.log(chalk.dim(`  • ${category}`));
      });
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️ Warnings:'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
      
    } else {
      spinner.fail('Token validation failed');
      
      console.log(chalk.red('\n❌ Validation Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️ Warnings:'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
      
      console.log(chalk.dim('\n💡 Fix these errors and run validation again'));
      process.exit(1);
    }

  } catch (error) {
    spinner.fail('Validation failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
} 