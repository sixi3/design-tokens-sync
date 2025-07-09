import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function init(options) {
  console.log(chalk.blue('\n🚀 Let\'s set up design tokens in your project!\n'));
  
  // Check if already initialized
  if (!options.force && await isInitialized()) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Design tokens already configured. Overwrite?',
      default: false
    }]);
    
    if (!proceed) {
      console.log(chalk.yellow('✖ Initialization cancelled'));
      return;
    }
  }
  
  // Gather project information
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'What framework are you using?',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Next.js', value: 'next' },
        { name: 'Nuxt.js', value: 'nuxt' },
        { name: 'SvelteKit', value: 'svelte' },
        { name: 'Angular', value: 'angular' },
        { name: 'Other/Vanilla', value: 'vanilla' },
        { name: 'None/Universal (minimal config for any platform)', value: 'universal' }
      ]
    },
    {
      type: 'confirm',
      name: 'useTailwind',
      message: 'Are you using Tailwind CSS?',
      default: true
    },
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: 'Are you using TypeScript?',
      default: true
    },
    {
      type: 'confirm',
      name: 'useSCSS',
      message: 'Do you want SCSS variable generation?',
      default: false,
      when: (answers) => !answers.useTailwind
    },
    {
      type: 'confirm',
      name: 'enableGit',
      message: 'Enable automatic git commits for token changes?',
      default: true
    },
    {
      type: 'confirm',
      name: 'enableAnalytics',
      message: 'Enable token usage analytics?',
      default: true
    },
    {
      type: 'confirm',
      name: 'setupGitHub',
      message: 'Would you like to set up GitHub Actions for CI/CD?',
      default: true,
      when: (answers) => answers.enableGit
    },
    {
      type: 'checkbox',
      name: 'workflows',
      message: 'Which workflows would you like to include?',
      choices: [
        {
          name: '🎨 Design Tokens Sync - Main automation workflow',
          value: 'design-tokens-sync',
          checked: true
        },
        {
          name: '🔍 Pre-commit Validation - Fast PR validation',
          value: 'pre-commit-validation',
          checked: true
        },
        {
          name: '📊 Weekly Analytics - Automated reporting',
          value: 'weekly-analytics',
          checked: false
        }
      ],
      when: (answers) => answers.setupGitHub
    }
  ]);
  
  const spinner = ora('Setting up design tokens...').start();
  
  try {
    // Create configuration file
    await createConfigFile(answers);
    spinner.text = 'Created configuration file';
    
    // Create tokens.json if it doesn't exist
    await createTokensFile(answers.framework);
    spinner.text = 'Created tokens.json';
    
    // Create necessary directories
    await createDirectories(answers);
    spinner.text = 'Created project structure';
    
    // Set up GitHub Actions if requested
    if (answers.setupGitHub) {
      await setupGitHubActions(answers);
      spinner.text = 'Set up GitHub Actions';
    }
    
    // Update package.json scripts
    await updatePackageScripts();
    spinner.text = 'Updated package.json scripts';
    
    // Create .gitignore entries
    await updateGitignore();
    spinner.text = 'Updated .gitignore';
    
    // Copy example components if available
    await copyExampleComponents(answers);
    spinner.text = 'Copied example components';
    
    spinner.succeed('Design tokens initialized successfully!');
    
    // Show next steps
    console.log(chalk.green('\n✨ Setup complete! Next steps:\n'));
    console.log('  1. Edit your tokens in ' + chalk.cyan('tokens.json'));
    
    if (answers.framework === 'universal') {
      console.log('  2. Customize the ' + chalk.cyan('output') + ' section in ' + chalk.cyan('design-tokens.config.js'));
      console.log('     Add platform-specific outputs like:');
      console.log('     • iOS: ' + chalk.dim('ios: "mobile/ios/Colors.swift"'));
      console.log('     • Android: ' + chalk.dim('android: "mobile/android/colors.xml"'));
      console.log('     • Xamarin: ' + chalk.dim('xamarin: "mobile/xamarin/Colors.xaml"'));
      console.log('  3. Run ' + chalk.cyan('npm run tokens:sync') + ' to generate output files');
      console.log('  4. Start development with ' + chalk.cyan('npm run tokens:watch'));
    } else {
      console.log('  2. Run ' + chalk.cyan('npm run tokens:sync') + ' to generate output files');
      console.log('  3. Start development with ' + chalk.cyan('npm run tokens:watch'));
    }
    
    if (answers.setupGitHub) {
      const step = answers.framework === 'universal' ? '5' : '4';
      console.log(`  ${step}. Push to GitHub to trigger automatic syncing`);
    }
    
    console.log('\n📚 Configuration created:');
    console.log('  • Config: ' + chalk.dim('design-tokens.config.js'));
    console.log('  • Tokens: ' + chalk.dim('tokens.json'));
    
    if (answers.useTailwind) {
      console.log('  • Tailwind: ' + chalk.dim('tailwind.config.js (will be updated)'));
    }
    
    if (answers.useTypeScript) {
      const typesPath = answers.framework === 'universal' ? 'tokens.d.ts' : 'src/types/tokens.d.ts';
      console.log('  • Types: ' + chalk.dim(`${typesPath} (will be generated)`));
    }
    
    console.log('\n📖 Documentation: https://github.com/sixi3/figma-code-sync#readme');
    
  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function isInitialized() {
  const configFiles = [
    'design-tokens.config.js',
    '.design-tokensrc',
    '.design-tokensrc.json'
  ];
  
  for (const file of configFiles) {
    if (await fs.pathExists(file)) {
      return true;
    }
  }
  
  return false;
}

async function createConfigFile(answers) {
  // Handle universal/minimal config
  if (answers.framework === 'universal') {
    const config = {
      tokens: {
        input: 'tokens.json',
        validation: {
          required: ['core.colors', 'colors'],  // Support both formats
          optional: ['core.spacing', 'core.typography', 'spacing', 'typography', 'borderRadius', 'shadows']
        }
      },
      output: {
        // Basic web outputs
        css: 'tokens.css'
      },
      git: {
        enabled: answers.enableGit,
        autoCommit: true,
        autoPush: false,
        commitMessage: '🎨 Update design tokens'
      },
      analytics: {
        enabled: answers.enableAnalytics,
        autoCollect: true
      },
      watch: {
        enabled: true,
        ignore: ['node_modules', '.git', 'dist', 'build']
      }
    };
    
    // Add optional outputs based on user preferences
    if (answers.useTailwind) {
      config.output.tailwind = 'tailwind.config.js';
    }
    
    if (answers.useTypeScript) {
      config.output.typescript = 'tokens.d.ts';
    }
    
    if (answers.useSCSS) {
      config.output.scss = 'tokens.scss';
    }
    
    const configContent = `// Universal Design Tokens Configuration
// Generated by design-tokens-sync
// 
// This is a minimal configuration that works with any framework.
// Customize the 'output' section to generate files for your platforms:
//
// Example outputs you can add:
//   css: 'src/styles/tokens.css'
//   typescript: 'src/types/tokens.d.ts'
//   tailwind: 'tailwind.config.js'
//   scss: 'src/styles/tokens.scss'
//   ios: 'mobile/ios/Colors.swift'
//   android: 'mobile/android/colors.xml'
//   xamarin: 'mobile/xamarin/Colors.xaml'

module.exports = ${JSON.stringify(config, null, 2)};
`;
    
    await fs.writeFile('design-tokens.config.js', configContent);
    return;
  }
  
  // Check if framework-specific config template exists
  const frameworkConfigPath = path.join(__dirname, `../../templates/${answers.framework}/design-tokens.config.js`);
  
  if (await fs.pathExists(frameworkConfigPath)) {
    // Copy framework-specific config and customize
    let configContent = await fs.readFile(frameworkConfigPath, 'utf8');
    
    // Customize based on user answers
    if (!answers.useTailwind) {
      configContent = configContent.replace(/tailwind: '.*?',?\n?/g, '');
    }
    
    if (!answers.useTypeScript) {
      configContent = configContent.replace(/typescript: '.*?',?\n?/g, '');
    }
    
    if (!answers.useSCSS) {
      configContent = configContent.replace(/scss: '.*?',?\n?/g, '');
    }
    
    // Update git and analytics settings
    configContent = configContent.replace(/enabled: true,/, `enabled: ${answers.enableGit},`);
    configContent = configContent.replace(/enabled: true,(\s*\/\/ analytics)/, `enabled: ${answers.enableAnalytics},$1`);
    
    await fs.writeFile('design-tokens.config.js', configContent);
  } else {
    // Fallback to generated config
    const config = {
      tokens: {
        input: 'tokens.json',
        validation: {
          required: ['colors'],
          optional: ['spacing', 'typography', 'borderRadius']
        }
      },
      output: {
        css: getOutputPath(answers.framework, 'css')
      },
      git: {
        enabled: answers.enableGit,
        autoCommit: true,
        autoPush: false,
        commitMessage: '🎨 Update design tokens'
      },
      analytics: {
        enabled: answers.enableAnalytics,
        autoCollect: true
      },
      watch: {
        enabled: true,
        ignore: ['node_modules', '.git', 'dist', 'build']
      }
    };
    
    if (answers.useTailwind) {
      config.output.tailwind = 'tailwind.config.js';
    }
    
    if (answers.useTypeScript) {
      config.output.typescript = getOutputPath(answers.framework, 'types');
    }
    
    if (answers.useSCSS) {
      config.output.scss = getOutputPath(answers.framework, 'scss');
    }
    
    const configContent = `// Design Tokens Configuration
// Generated by design-tokens-sync

module.exports = ${JSON.stringify(config, null, 2)};
`;
    
    await fs.writeFile('design-tokens.config.js', configContent);
  }
}

function getOutputPath(framework, type) {
  const paths = {
    react: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss'
    },
    vue: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss'
    },
    next: {
      css: 'styles/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'styles/_tokens.scss'
    },
    nuxt: {
      css: 'assets/css/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'assets/scss/_tokens.scss'
    },
    svelte: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss'
    },
    angular: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss'
    },
    vanilla: {
      css: 'css/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'scss/_tokens.scss'
    },
    universal: {
      css: 'tokens.css',
      types: 'tokens.d.ts',
      scss: 'tokens.scss'
    }
  };
  
  return paths[framework]?.[type] || paths.vanilla[type];
}

async function createTokensFile(framework = 'react') {
  if (await fs.pathExists('tokens.json')) {
    return;
  }
  
  // For universal, always use the init template (most generic)
  if (framework === 'universal') {
    const defaultTemplatePath = path.join(__dirname, '../../templates/init/tokens.json');
    const starterTokens = await fs.readJSON(defaultTemplatePath);
    await fs.writeJSON('tokens.json', starterTokens, { spaces: 2 });
    return;
  }
  
  // Copy framework-specific tokens or fallback to default
  const frameworkTemplatePath = path.join(__dirname, `../../templates/${framework}/tokens.json`);
  const defaultTemplatePath = path.join(__dirname, '../../templates/init/tokens.json');
  
  let templatePath = defaultTemplatePath;
  if (await fs.pathExists(frameworkTemplatePath)) {
    templatePath = frameworkTemplatePath;
  }
  
  const starterTokens = await fs.readJSON(templatePath);
  await fs.writeJSON('tokens.json', starterTokens, { spaces: 2 });
}

async function createDirectories(answers) {
  const dirs = [];
  
  // Framework-specific directories
  switch (answers.framework) {
    case 'universal':
      // For universal, create minimal directories - files will be in root
      // Only create directories if user wants TypeScript or SCSS
      if (answers.useTypeScript) dirs.push('types');
      if (answers.useSCSS) dirs.push('scss');
      break;
    case 'next':
      dirs.push('styles', 'types');
      break;
    case 'nuxt':
      dirs.push('assets/css', 'types');
      if (answers.useSCSS) dirs.push('assets/scss');
      break;
    case 'angular':
      dirs.push('src/styles', 'src/types');
      break;
    case 'vanilla':
      dirs.push('css', 'types');
      if (answers.useSCSS) dirs.push('scss');
      break;
    default:
      dirs.push('src/styles', 'src/types');
  }
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

async function setupGitHubActions(answers) {
  const workflowDir = '.github/workflows';
  await fs.ensureDir(workflowDir);
  
  const selectedWorkflows = answers.workflows || ['design-tokens-sync'];
  
  // Copy selected workflow templates
  for (const workflow of selectedWorkflows) {
    const sourcePath = path.join(__dirname, `../../templates/github-actions/${workflow}.yml`);
    const targetPath = path.join(workflowDir, `${workflow}.yml`);
    
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath);
    } else {
      console.warn(`⚠️ Workflow template ${workflow}.yml not found, skipping...`);
    }
  }
  
  // Copy GitHub Actions README if workflows were selected
  if (selectedWorkflows.length > 0) {
    const readmePath = path.join(__dirname, '../../templates/github-actions/README.md');
    const targetReadmePath = '.github/workflows/README.md';
    
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, targetReadmePath);
    }
  }
  
  // Provide setup instructions
  console.log('\n🔧 GitHub Actions Setup:');
  console.log('  • Workflows copied to .github/workflows/');
  console.log('  • Review README.md in .github/workflows/ for setup instructions');
  console.log('  • Configure repository settings for proper permissions');
  
  if (selectedWorkflows.includes('weekly-analytics')) {
    console.log('  • Optional: Set up SLACK_WEBHOOK_URL secret for notifications');
  }
}

async function updatePackageScripts() {
  const packagePath = 'package.json';
  
  if (!await fs.pathExists(packagePath)) {
    console.warn('⚠️ package.json not found - skipping script updates');
    return;
  }
  
  const pkg = await fs.readJSON(packagePath);
  
  pkg.scripts = pkg.scripts || {};
  
  // Add token scripts
  Object.assign(pkg.scripts, {
    'tokens:sync': 'design-tokens-sync sync',
    'tokens:watch': 'design-tokens-sync watch',
    'tokens:validate': 'design-tokens-sync validate',
    'tokens:analytics': 'design-tokens-sync analytics report'
  });
  
  await fs.writeJSON(packagePath, pkg, { spaces: 2 });
}

async function updateGitignore() {
  const gitignorePath = '.gitignore';
  
  const tokenEntries = `
# Design tokens cache
.tokens-sync-cache.json

# Generated token files (optional - you may want to commit these)
# src/styles/tokens.css
# src/types/tokens.d.ts
`;

  if (await fs.pathExists(gitignorePath)) {
    const existingContent = await fs.readFile(gitignorePath, 'utf8');
    if (!existingContent.includes('.tokens-sync-cache.json')) {
      await fs.appendFile(gitignorePath, tokenEntries);
    }
  } else {
    const baseGitignore = `# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment files
.env*

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
${tokenEntries}`;
    
    await fs.writeFile(gitignorePath, baseGitignore);
  }
}

async function copyExampleComponents(answers) {
  const { framework } = answers;
  
  // Check if framework template has example components
  const templateComponentsPath = path.join(__dirname, `../../templates/${framework}/src/components`);
  
  if (!await fs.pathExists(templateComponentsPath)) {
    return; // No example components for this framework
  }
  
  try {
    // Determine target directory based on framework
    let targetDir = 'src/components';
    
    switch (framework) {
      case 'next':
        targetDir = 'components';
        break;
      case 'nuxt':
        targetDir = 'components';
        break;
      case 'angular':
        targetDir = 'src/app/components';
        break;
      default:
        targetDir = 'src/components';
    }
    
    // Create target directory
    await fs.ensureDir(targetDir);
    
    // Copy example components
    await fs.copy(templateComponentsPath, targetDir, {
      overwrite: false, // Don't overwrite existing components
      filter: (src) => {
        // Only copy if target doesn't exist
        const relativePath = path.relative(templateComponentsPath, src);
        const targetPath = path.join(targetDir, relativePath);
        return !fs.existsSync(targetPath);
      }
    });
    
    // Copy framework-specific README if it exists
    const readmePath = path.join(__dirname, `../../templates/${framework}/README.md`);
    if (await fs.pathExists(readmePath)) {
      const targetReadmePath = 'DESIGN_TOKENS.md';
      if (!await fs.pathExists(targetReadmePath)) {
        await fs.copy(readmePath, targetReadmePath);
      }
    }
    
  } catch (error) {
    // Silently fail if copying components fails
    console.warn(`Warning: Could not copy example components: ${error.message}`);
  }
} 