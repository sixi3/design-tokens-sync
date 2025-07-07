import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import { TokenValidator } from '../core/TokenValidator.js';
import { loadConfig } from '../utils/config.js';

export async function validate(options) {
  const spinner = ora('Loading configuration...').start();
  
  try {
    // Load configuration
    const config = await loadConfig(options.config);
    spinner.text = 'Loading tokens...';

    // Load the actual tokens from the file
    const tokensPath = config.tokens.input;
    if (!await fs.pathExists(tokensPath)) {
      throw new Error(`Tokens file not found: ${tokensPath}`);
    }

    const tokensContent = await fs.readJSON(tokensPath);
    spinner.text = 'Validating tokens...';

    // Initialize validator
    const validator = new TokenValidator(config);
    
    // Validate tokens (pass the actual content, not the path)
    const result = await validator.validate(tokensContent);
    
    if (result.isValid) {
      spinner.succeed('Token validation passed!');
      
      console.log(chalk.green('\n✅ Validation Summary:'));
      console.log(`  • ${result.summary.validatedTokens} tokens processed`);
      console.log(`  • ${result.summary.totalCategories} categories found`);
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow(`  • ${result.warnings.length} warnings`));
      }
      
      console.log(chalk.dim('\n📊 Token Categories:'));
      // Show categories based on whether it's Figma format or not
      const validator2 = new TokenValidator();
      if (validator2.isFigmaTokenStudioFormat(tokensContent)) {
        console.log(chalk.dim('  • Figma Token Studio format detected'));
        const extracted = validator2.extractTokensFromFigmaFormat(tokensContent);
        Object.keys(extracted).forEach(category => {
          console.log(chalk.dim(`  • ${category}`));
        });
      } else {
        Object.keys(tokensContent).filter(key => typeof tokensContent[key] === 'object').forEach(category => {
          console.log(chalk.dim(`  • ${category}`));
        });
      }
      
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