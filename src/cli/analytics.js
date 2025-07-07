import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { AnalyticsEngine } from '../analytics/AnalyticsEngine.js';
import { loadConfig } from '../utils/config.js';

export async function analytics(subcommand, options) {
  try {
    // Load configuration
    const config = await loadConfig(options.config);
    
    if (!config.analytics || !config.analytics.enabled) {
      console.log(chalk.yellow('⚠️ Analytics is disabled in your configuration'));
      console.log(chalk.dim('Enable it in design-tokens.config.js to use analytics features'));
      return;
    }

    switch (subcommand) {
      case 'collect':
        await collectAnalytics(config, options);
        break;
      case 'report':
        await generateReport(config, options);
        break;
      default:
        console.log(chalk.red('Unknown analytics command'));
        console.log(chalk.dim('Available commands: collect, report'));
        process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('❌ Analytics failed:'), error.message);
    process.exit(1);
  }
}

async function collectAnalytics(config, options) {
  console.log(chalk.blue('📊 Collecting token usage analytics...\n'));
  
  const spinner = ora('Initializing analytics engine...').start();
  
  try {
    // Initialize analytics engine with custom config
    const analyticsConfig = {
      scanDirs: options.scanDirs || config.analytics.scanDirs || ['src/**/*'],
      fileExtensions: options.extensions || config.analytics.fileExtensions || ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.css', '.scss'],
      outputDir: options.output || config.analytics.outputDir || '.tokens-analytics',
      excludePatterns: config.analytics.excludePatterns || ['node_modules', '.git', 'dist', 'build']
    };
    
    const engine = new AnalyticsEngine(analyticsConfig);
    spinner.text = 'Scanning project files...';
    
    // Collect usage data
    const data = await engine.collectUsageData();
    spinner.text = 'Generating analytics report...';
    
    // Save JSON report
    const jsonReport = await engine.saveReport(options.output);
    spinner.succeed('Analytics collection completed!');
    
    console.log(chalk.green('\n✨ Collection Summary:'));
    console.log(`  • ${data.stats.filesScanned} files scanned`);
    console.log(`  • ${data.stats.uniqueTokens || 0} unique tokens found`);
    console.log(`  • ${data.stats.totalUsages || 0} total token usages`);
    console.log(`  • ${data.stats.componentsAnalyzed} components analyzed`);
    
    console.log(chalk.dim(`\n📄 Report saved: ${jsonReport}`));
    
    if (data.stats.mostUsedToken) {
      console.log(chalk.cyan(`\n🏆 Most used token: ${data.stats.mostUsedToken.token} (${data.stats.mostUsedToken.count} uses)`));
    }
    
    if (data.stats.leastUsedTokens && data.stats.leastUsedTokens.length > 0) {
      console.log(chalk.yellow(`\n⚠️ Found ${data.stats.leastUsedTokens.length} potentially unused tokens`));
      console.log(chalk.dim('Run `npx design-tokens-sync analytics report --html` for detailed analysis'));
    }

  } catch (error) {
    spinner.fail('Analytics collection failed');
    throw error;
  }
}

async function generateReport(config, options) {
  console.log(chalk.blue('📋 Generating analytics report...\n'));
  
  const spinner = ora('Loading analytics data...').start();
  
  try {
    const analyticsConfig = {
      outputDir: options.output || config.analytics.outputDir || '.tokens-analytics'
    };
    
    const engine = new AnalyticsEngine(analyticsConfig);
    
    // Check if we need to collect data first
    const existingData = await findLatestAnalyticsData(analyticsConfig.outputDir);
    
    let data;
    if (!existingData || options.fresh) {
      spinner.text = 'Collecting fresh analytics data...';
      data = await engine.collectUsageData();
    } else {
      spinner.text = 'Using existing analytics data...';
      const fs = await import('fs-extra');
      const reportData = await fs.readJSON(existingData);
      
      // Restore data to engine
      engine.tokenUsageData = reportData.usage || {};
      engine.componentData = reportData.components || {};
      engine.stats = reportData.stats || {};
      
      data = {
        usage: engine.tokenUsageData,
        components: engine.componentData,
        stats: engine.stats
      };
    }
    
    if (options.html) {
      spinner.text = 'Generating HTML report...';
      const htmlReport = await engine.generateHTMLReport(options.outputFile);
      spinner.succeed('HTML report generated!');
      
      console.log(chalk.green('\n✨ Report Summary:'));
      console.log(`  • ${data.stats.filesScanned} files analyzed`);
      console.log(`  • ${data.stats.uniqueTokens || 0} unique tokens tracked`);
      console.log(`  • ${data.stats.totalUsages || 0} total usages found`);
      
      console.log(chalk.dim(`\n🌐 HTML report: ${htmlReport}`));
      console.log(chalk.cyan('Open this file in your browser to view the interactive report'));
      
    } else {
      // Console report
      spinner.succeed('Analytics report ready!');
      
      console.log(chalk.green('\n📊 Token Usage Analytics\n'));
      
      // Display summary stats
      displaySummaryStats(data.stats);
      
      // Display most used tokens
      displayMostUsedTokens(data.usage);
      
      // Display token types breakdown
      displayTokenTypesBreakdown(data.stats.tokenTypes);
      
      // Display warnings about unused tokens
      displayUnusedTokensWarning(data.stats.leastUsedTokens);
      
      console.log(chalk.dim('\n💡 Use --html flag for detailed interactive report'));
    }

  } catch (error) {
    spinner.fail('Report generation failed');
    throw error;
  }
}

function displaySummaryStats(stats) {
  console.log(chalk.bold('📈 Summary Statistics:'));
  console.log(`  Files Scanned: ${chalk.cyan(stats.filesScanned || 0)}`);
  console.log(`  Unique Tokens: ${chalk.cyan(stats.uniqueTokens || 0)}`);
  console.log(`  Total Usages: ${chalk.cyan(stats.totalUsages || 0)}`);
  console.log(`  Components: ${chalk.cyan(stats.componentsAnalyzed || 0)}`);
  
  if (stats.mostUsedToken) {
    console.log(`  Most Used: ${chalk.green(stats.mostUsedToken.token)} (${stats.mostUsedToken.count} uses)`);
  }
  console.log('');
}

function displayMostUsedTokens(usage) {
  console.log(chalk.bold('🏆 Top 10 Most Used Tokens:'));
  
  const sortedTokens = Object.entries(usage)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10);
  
  if (sortedTokens.length === 0) {
    console.log(chalk.dim('  No token usage found'));
  } else {
    sortedTokens.forEach(([token, data], index) => {
      const rank = `${index + 1}.`.padEnd(3);
      const count = `${data.count} uses`.padEnd(12);
      console.log(`  ${chalk.dim(rank)} ${chalk.cyan(token.padEnd(30))} ${chalk.green(count)}`);
    });
  }
  console.log('');
}

function displayTokenTypesBreakdown(tokenTypes = {}) {
  console.log(chalk.bold('🔍 Token Usage by Type:'));
  
  const types = Object.entries(tokenTypes);
  if (types.length === 0) {
    console.log(chalk.dim('  No usage types tracked'));
  } else {
    types.forEach(([type, count]) => {
      const formattedType = type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`  ${chalk.cyan(formattedType.padEnd(20))} ${chalk.yellow(count)} usages`);
    });
  }
  console.log('');
}

function displayUnusedTokensWarning(leastUsedTokens = []) {
  if (leastUsedTokens.length === 0) {
    console.log(chalk.green('✅ No potentially unused tokens found'));
  } else {
    console.log(chalk.yellow(`⚠️ Potentially Unused Tokens (${leastUsedTokens.length}):`));
    
    leastUsedTokens.slice(0, 5).forEach(({ token, count }) => {
      console.log(`  ${chalk.red('•')} ${chalk.dim(token)} (${count} use)`);
    });
    
    if (leastUsedTokens.length > 5) {
      console.log(chalk.dim(`  ... and ${leastUsedTokens.length - 5} more`));
    }
    
    console.log(chalk.dim('\n💡 Review these tokens - they might be safe to remove'));
  }
}

async function findLatestAnalyticsData(outputDir) {
  try {
    const fs = await import('fs-extra');
    const { glob } = await import('glob');
    
    if (!await fs.pathExists(outputDir)) {
      return null;
    }
    
    const files = await glob(path.join(outputDir, 'analytics-*.json'));
    
    if (files.length === 0) {
      return null;
    }
    
    // Sort by modification time, return the latest
    const fileStats = await Promise.all(
      files.map(async file => ({
        file,
        mtime: (await fs.stat(file)).mtime
      }))
    );
    
    fileStats.sort((a, b) => b.mtime - a.mtime);
    return fileStats[0].file;
    
  } catch (error) {
    return null;
  }
} 