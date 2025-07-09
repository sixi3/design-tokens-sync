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
      type: 'checkbox',
      name: 'outputFormats',
      message: 'Which output formats would you like to generate?',
      choices: [
        {
          name: '🎨 CSS Custom Properties - For modern web applications',
          value: 'css',
          checked: true
        },
        {
          name: '🌊 Tailwind Config - For Tailwind CSS projects',
          value: 'tailwind',
          checked: true
        },
        {
          name: '📝 TypeScript Definitions - For type-safe development',
          value: 'typescript',
          checked: true
        },
        {
          name: '💎 SCSS Variables - For Sass/SCSS projects',
          value: 'scss',
          checked: false
        },
        {
          name: '📄 JSON Export - For data exchange and APIs',
          value: 'json',
          checked: false
        },
        {
          name: '⚡ JavaScript/ES Modules - For direct JS imports',
          value: 'javascript',
          checked: false
        },
        {
          name: '📱 iOS Swift - For iOS app development',
          value: 'ios',
          checked: false
        },
        {
          name: '🤖 Android XML - For Android app development',
          value: 'android',
          checked: false
        },
        {
          name: '🔷 Xamarin XAML - For cross-platform .NET apps',
          value: 'xamarin',
          checked: false
        },
        {
          name: '⚛️ React Native - For React Native apps',
          value: 'reactNative',
          checked: false
        },
        {
          name: '🐦 Flutter/Dart - For Flutter applications',
          value: 'flutter',
          checked: false
        },
        {
          name: '🟢 Kotlin Compose - For modern Android development',
          value: 'kotlinCompose',
          checked: false
        },
        {
          name: '🍎 SwiftUI - For modern iOS development',
          value: 'swiftui',
          checked: false
        }
      ],
      validate: (answers) => {
        if (answers.length === 0) {
          return 'Please select at least one output format';
        }
        return true;
      }
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
    
    // Show selected output formats
    if (answers.outputFormats.length > 0) {
      console.log('\n🎯 Output formats that will be generated:');
      answers.outputFormats.forEach(format => {
        const formatInfo = {
          css: '🎨 CSS Custom Properties',
          tailwind: '🌊 Tailwind Config',
          typescript: '📝 TypeScript Definitions',
          scss: '💎 SCSS Variables',
          json: '📄 JSON Export',
          javascript: '⚡ JavaScript/ES Modules',
          ios: '📱 iOS Swift',
          android: '🤖 Android XML',
          xamarin: '🔷 Xamarin XAML',
          reactNative: '⚛️ React Native',
          flutter: '🐦 Flutter/Dart',
          kotlinCompose: '🟢 Kotlin Compose',
          swiftui: '🍎 SwiftUI'
        };
        console.log(`  • ${formatInfo[format]}`);
      });
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
    if (answers.outputFormats.includes('tailwind')) {
      config.output.tailwind = 'tailwind.config.js';
    }
    
    if (answers.outputFormats.includes('typescript')) {
      config.output.typescript = 'tokens.d.ts';
    }
    
    if (answers.outputFormats.includes('scss')) {
      config.output.scss = 'tokens.scss';
    }

    if (answers.outputFormats.includes('json')) {
      config.output.json = 'tokens.json';
    }

    if (answers.outputFormats.includes('javascript')) {
      config.output.javascript = 'tokens.js';
    }

    if (answers.outputFormats.includes('ios')) {
      config.output.ios = 'ios/Colors.swift';
    }

    if (answers.outputFormats.includes('android')) {
      config.output.android = 'android/colors.xml';
    }

    if (answers.outputFormats.includes('xamarin')) {
      config.output.xamarin = 'xamarin/Colors.xaml';
    }

    if (answers.outputFormats.includes('reactNative')) {
      config.output.reactNative = 'reactNative/tokens.js';
    }

    if (answers.outputFormats.includes('flutter')) {
      config.output.flutter = 'flutter/lib/design_tokens.dart';
    }

    if (answers.outputFormats.includes('kotlinCompose')) {
      config.output.kotlinCompose = 'kotlinCompose/DesignTokens.kt';
    }

    if (answers.outputFormats.includes('swiftui')) {
      config.output.swiftui = 'swiftui/DesignTokens.swift';
    }
    
    // Check if the user's project uses ES modules
    const packageJsonPath = 'package.json';
    let useESModules = false;
    
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const pkg = await fs.readJSON(packageJsonPath);
        useESModules = pkg.type === 'module';
      } catch (error) {
        // If can't read package.json, default to CommonJS
        useESModules = false;
      }
    }

    const exportSyntax = useESModules ? 'export default' : 'module.exports =';
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

${exportSyntax} ${JSON.stringify(config, null, 2)};
`;
    
    await fs.writeFile('design-tokens.config.js', configContent);
    return;
  }
  
  // Check if framework-specific config template exists
  const frameworkConfigPath = path.join(__dirname, `../../templates/${answers.framework}/design-tokens.config.js`);
  
  if (await fs.pathExists(frameworkConfigPath)) {
    // Copy framework-specific config and customize
    let configContent = await fs.readFile(frameworkConfigPath, 'utf8');
    
    // Parse the existing config to modify it properly
    try {
      // Extract the config object from the file content
      const configMatch = configContent.match(/export default\s+({[\s\S]*?});?\s*$/);
      if (configMatch) {
        const configObjectString = configMatch[1];
        // Use eval in a safe context to parse the config (this is safe since we control the input)
        const config = eval(`(${configObjectString})`);
        
        // Add missing formats that user selected but aren't in the template
        const mobilePlatformMappings = {
          ios: getOutputPath(answers.framework, 'ios'),
          android: getOutputPath(answers.framework, 'android'),
          xamarin: getOutputPath(answers.framework, 'xamarin'),
          reactNative: getOutputPath(answers.framework, 'reactNative'),
          flutter: getOutputPath(answers.framework, 'flutter'),
          kotlinCompose: getOutputPath(answers.framework, 'kotlinCompose'),
          swiftui: getOutputPath(answers.framework, 'swiftui')
        };
        
        // Add selected mobile platforms that are missing from template
        answers.outputFormats.forEach(format => {
          if (mobilePlatformMappings[format] && !config.output[format]) {
            config.output[format] = mobilePlatformMappings[format];
          }
        });
        
        // Remove formats not selected
        if (!answers.outputFormats.includes('tailwind') && config.output.tailwind) {
          delete config.output.tailwind;
        }
        
        if (!answers.outputFormats.includes('typescript') && config.output.typescript) {
          delete config.output.typescript;
        }
        
        if (!answers.outputFormats.includes('scss') && config.output.scss) {
          delete config.output.scss;
        }

        if (!answers.outputFormats.includes('json') && config.output.json) {
          delete config.output.json;
        }

        if (!answers.outputFormats.includes('javascript') && config.output.javascript) {
          delete config.output.javascript;
        }

        // Remove mobile platforms not selected
        Object.keys(mobilePlatformMappings).forEach(platform => {
          if (!answers.outputFormats.includes(platform) && config.output[platform]) {
            delete config.output[platform];
          }
        });
        
        // Update git and analytics settings
        config.git.enabled = answers.enableGit;
        config.analytics.enabled = answers.enableAnalytics;
        
        // Regenerate the config file content
        configContent = `// Design Tokens Configuration for ${answers.framework.charAt(0).toUpperCase() + answers.framework.slice(1)}
// Generated by design-tokens-sync

export default ${JSON.stringify(config, null, 2)};
`;
      }
    } catch (error) {
      // Fallback to regex-based approach if parsing fails
      console.warn('Warning: Could not parse template config, using fallback approach');
      
      // Remove formats not selected (original logic)
      if (!answers.outputFormats.includes('tailwind')) {
        configContent = configContent.replace(/tailwind: '.*?',?\n?/g, '');
      }
      
      if (!answers.outputFormats.includes('typescript')) {
        configContent = configContent.replace(/typescript: '.*?',?\n?/g, '');
      }
      
      if (!answers.outputFormats.includes('scss')) {
        configContent = configContent.replace(/scss: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('json')) {
        configContent = configContent.replace(/json: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('javascript')) {
        configContent = configContent.replace(/javascript: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('ios')) {
        configContent = configContent.replace(/ios: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('android')) {
        configContent = configContent.replace(/android: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('xamarin')) {
        configContent = configContent.replace(/xamarin: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('reactNative')) {
        configContent = configContent.replace(/reactNative: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('flutter')) {
        configContent = configContent.replace(/flutter: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('kotlinCompose')) {
        configContent = configContent.replace(/kotlinCompose: '.*?',?\n?/g, '');
      }

      if (!answers.outputFormats.includes('swiftui')) {
        configContent = configContent.replace(/swiftui: '.*?',?\n?/g, '');
      }
      
      // Add missing mobile platforms (fallback approach) - inject before closing brace of output section
      const mobilePlatformsToAdd = [];
      
      if (answers.outputFormats.includes('ios') && !configContent.includes('ios:')) {
        mobilePlatformsToAdd.push(`    ios: '${getOutputPath(answers.framework, 'ios')}'`);
      }
      
      if (answers.outputFormats.includes('android') && !configContent.includes('android:')) {
        mobilePlatformsToAdd.push(`    android: '${getOutputPath(answers.framework, 'android')}'`);
      }
      
      if (answers.outputFormats.includes('xamarin') && !configContent.includes('xamarin:')) {
        mobilePlatformsToAdd.push(`    xamarin: '${getOutputPath(answers.framework, 'xamarin')}'`);
      }
      
      if (answers.outputFormats.includes('reactNative') && !configContent.includes('reactNative:')) {
        mobilePlatformsToAdd.push(`    reactNative: '${getOutputPath(answers.framework, 'reactNative')}'`);
      }
      
      if (answers.outputFormats.includes('flutter') && !configContent.includes('flutter:')) {
        mobilePlatformsToAdd.push(`    flutter: '${getOutputPath(answers.framework, 'flutter')}'`);
      }
      
      if (answers.outputFormats.includes('kotlinCompose') && !configContent.includes('kotlinCompose:')) {
        mobilePlatformsToAdd.push(`    kotlinCompose: '${getOutputPath(answers.framework, 'kotlinCompose')}'`);
      }
      
      if (answers.outputFormats.includes('swiftui') && !configContent.includes('swiftui:')) {
        mobilePlatformsToAdd.push(`    swiftui: '${getOutputPath(answers.framework, 'swiftui')}'`);
      }
      
      if (mobilePlatformsToAdd.length > 0) {
        // Find the end of the output section and add mobile platforms
        const outputSectionMatch = configContent.match(/(output:\s*{[^}]*)(})/);
        if (outputSectionMatch) {
          const beforeClosing = outputSectionMatch[1];
          const addComma = beforeClosing.trim().endsWith(',') || beforeClosing.includes(':') ? ',\n' : '\n';
          configContent = configContent.replace(
            outputSectionMatch[0],
            `${beforeClosing}${addComma}${mobilePlatformsToAdd.join(',\n')}\n  }`
          );
        }
      }
      
      // Update git and analytics settings
      configContent = configContent.replace(/enabled: true,/, `enabled: ${answers.enableGit},`);
      configContent = configContent.replace(/enabled: true,(\s*\/\/ analytics)/, `enabled: ${answers.enableAnalytics},$1`);
    }
    
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
    
    if (answers.outputFormats.includes('tailwind')) {
      config.output.tailwind = 'tailwind.config.js';
    }
    
    if (answers.outputFormats.includes('typescript')) {
      config.output.typescript = getOutputPath(answers.framework, 'types');
    }
    
    if (answers.outputFormats.includes('scss')) {
      config.output.scss = getOutputPath(answers.framework, 'scss');
    }

    if (answers.outputFormats.includes('json')) {
      config.output.json = getOutputPath(answers.framework, 'json');
    }

    if (answers.outputFormats.includes('javascript')) {
      config.output.javascript = getOutputPath(answers.framework, 'javascript');
    }

    if (answers.outputFormats.includes('ios')) {
      config.output.ios = getOutputPath(answers.framework, 'ios');
    }

    if (answers.outputFormats.includes('android')) {
      config.output.android = getOutputPath(answers.framework, 'android');
    }

    if (answers.outputFormats.includes('xamarin')) {
      config.output.xamarin = getOutputPath(answers.framework, 'xamarin');
    }

    if (answers.outputFormats.includes('reactNative')) {
      config.output.reactNative = getOutputPath(answers.framework, 'reactNative');
    }

    if (answers.outputFormats.includes('flutter')) {
      config.output.flutter = getOutputPath(answers.framework, 'flutter');
    }

    if (answers.outputFormats.includes('kotlinCompose')) {
      config.output.kotlinCompose = getOutputPath(answers.framework, 'kotlinCompose');
    }

    if (answers.outputFormats.includes('swiftui')) {
      config.output.swiftui = getOutputPath(answers.framework, 'swiftui');
    }
    
    const configContent = `// Design Tokens Configuration
// Generated by design-tokens-sync

export default ${JSON.stringify(config, null, 2)};
`;
    
    await fs.writeFile('design-tokens.config.js', configContent);
  }
}

function getOutputPath(framework, type) {
  const paths = {
    react: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss',
      json: 'src/data/tokens.json',
      javascript: 'src/data/tokens.js',
      ios: 'src/platforms/ios/Colors.swift',
      android: 'src/platforms/android/colors.xml',
      xamarin: 'src/platforms/xamarin/Colors.xaml',
      reactNative: 'src/platforms/reactNative/tokens.js',
      flutter: 'src/platforms/flutter/design_tokens.dart',
      kotlinCompose: 'src/platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'src/platforms/swiftui/DesignTokens.swift'
    },
    vue: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss',
      json: 'src/data/tokens.json',
      javascript: 'src/data/tokens.js',
      ios: 'src/platforms/ios/Colors.swift',
      android: 'src/platforms/android/colors.xml',
      xamarin: 'src/platforms/xamarin/Colors.xaml',
      reactNative: 'src/platforms/reactNative/tokens.js',
      flutter: 'src/platforms/flutter/design_tokens.dart',
      kotlinCompose: 'src/platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'src/platforms/swiftui/DesignTokens.swift'
    },
    next: {
      css: 'styles/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'styles/_tokens.scss',
      json: 'data/tokens.json',
      javascript: 'data/tokens.js',
      ios: 'platforms/ios/Colors.swift',
      android: 'platforms/android/colors.xml',
      xamarin: 'platforms/xamarin/Colors.xaml',
      reactNative: 'platforms/reactNative/tokens.js',
      flutter: 'platforms/flutter/design_tokens.dart',
      kotlinCompose: 'platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'platforms/swiftui/DesignTokens.swift'
    },
    nuxt: {
      css: 'assets/css/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'assets/scss/_tokens.scss',
      json: 'assets/data/tokens.json',
      javascript: 'assets/data/tokens.js',
      ios: 'platforms/ios/Colors.swift',
      android: 'platforms/android/colors.xml',
      xamarin: 'platforms/xamarin/Colors.xaml',
      reactNative: 'platforms/reactNative/tokens.js',
      flutter: 'platforms/flutter/design_tokens.dart',
      kotlinCompose: 'platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'platforms/swiftui/DesignTokens.swift'
    },
    svelte: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss',
      json: 'src/data/tokens.json',
      javascript: 'src/data/tokens.js',
      ios: 'src/platforms/ios/Colors.swift',
      android: 'src/platforms/android/colors.xml',
      xamarin: 'src/platforms/xamarin/Colors.xaml',
      reactNative: 'src/platforms/reactNative/tokens.js',
      flutter: 'src/platforms/flutter/design_tokens.dart',
      kotlinCompose: 'src/platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'src/platforms/swiftui/DesignTokens.swift'
    },
    angular: {
      css: 'src/styles/tokens.css',
      types: 'src/types/tokens.d.ts',
      scss: 'src/styles/_tokens.scss',
      json: 'src/data/tokens.json',
      javascript: 'src/data/tokens.js',
      ios: 'src/platforms/ios/Colors.swift',
      android: 'src/platforms/android/colors.xml',
      xamarin: 'src/platforms/xamarin/Colors.xaml',
      reactNative: 'src/platforms/reactNative/tokens.js',
      flutter: 'src/platforms/flutter/design_tokens.dart',
      kotlinCompose: 'src/platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'src/platforms/swiftui/DesignTokens.swift'
    },
    vanilla: {
      css: 'css/tokens.css',
      types: 'types/tokens.d.ts',
      scss: 'scss/_tokens.scss',
      json: 'data/tokens.json',
      javascript: 'data/tokens.js',
      ios: 'platforms/ios/Colors.swift',
      android: 'platforms/android/colors.xml',
      xamarin: 'platforms/xamarin/Colors.xaml',
      reactNative: 'platforms/reactNative/tokens.js',
      flutter: 'platforms/flutter/design_tokens.dart',
      kotlinCompose: 'platforms/kotlinCompose/DesignTokens.kt',
      swiftui: 'platforms/swiftui/DesignTokens.swift'
    },
    universal: {
      css: 'tokens.css',
      types: 'tokens.d.ts',
      scss: 'tokens.scss',
      json: 'tokens.json',
      javascript: 'tokens.js',
      ios: 'ios/Colors.swift',
      android: 'android/colors.xml',
      xamarin: 'xamarin/Colors.xaml',
      reactNative: 'reactNative/tokens.js',
      flutter: 'flutter/design_tokens.dart',
      kotlinCompose: 'kotlinCompose/DesignTokens.kt',
      swiftui: 'swiftui/DesignTokens.swift'
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
  
  // Helper function to check if any mobile platform is selected
  const hasMobilePlatforms = () => {
    return answers.outputFormats.includes('ios') || 
           answers.outputFormats.includes('android') || 
           answers.outputFormats.includes('xamarin') ||
           answers.outputFormats.includes('reactNative') ||
           answers.outputFormats.includes('flutter') ||
           answers.outputFormats.includes('kotlinCompose') ||
           answers.outputFormats.includes('swiftui');
  };
  
  // Framework-specific directories based on selected output formats
  switch (answers.framework) {
    case 'universal':
      // For universal, create directories based on selected formats
      if (answers.outputFormats.includes('ios')) dirs.push('ios');
      if (answers.outputFormats.includes('android')) dirs.push('android');
      if (answers.outputFormats.includes('xamarin')) dirs.push('xamarin');
      if (answers.outputFormats.includes('reactNative')) dirs.push('reactNative');
      if (answers.outputFormats.includes('flutter')) dirs.push('flutter');
      if (answers.outputFormats.includes('kotlinCompose')) dirs.push('kotlinCompose');
      if (answers.outputFormats.includes('swiftui')) dirs.push('swiftui');
      break;
    case 'next':
      dirs.push('styles');
      if (answers.outputFormats.includes('typescript')) dirs.push('types');
      if (answers.outputFormats.includes('json') || answers.outputFormats.includes('javascript')) dirs.push('data');
      if (hasMobilePlatforms()) dirs.push('platforms');
      break;
    case 'nuxt':
      dirs.push('assets/css');
      if (answers.outputFormats.includes('typescript')) dirs.push('types');
      if (answers.outputFormats.includes('scss')) dirs.push('assets/scss');
      if (answers.outputFormats.includes('json') || answers.outputFormats.includes('javascript')) dirs.push('assets/data');
      if (hasMobilePlatforms()) dirs.push('platforms');
      break;
    case 'angular':
      dirs.push('src/styles');
      if (answers.outputFormats.includes('typescript')) dirs.push('src/types');
      if (answers.outputFormats.includes('json') || answers.outputFormats.includes('javascript')) dirs.push('src/data');
      if (hasMobilePlatforms()) dirs.push('src/platforms');
      break;
    case 'vanilla':
      dirs.push('css');
      if (answers.outputFormats.includes('typescript')) dirs.push('types');
      if (answers.outputFormats.includes('scss')) dirs.push('scss');
      if (answers.outputFormats.includes('json') || answers.outputFormats.includes('javascript')) dirs.push('data');
      if (hasMobilePlatforms()) dirs.push('platforms');
      break;
    default:
      dirs.push('src/styles');
      if (answers.outputFormats.includes('typescript')) dirs.push('src/types');
      if (answers.outputFormats.includes('json') || answers.outputFormats.includes('javascript')) dirs.push('src/data');
      if (hasMobilePlatforms()) dirs.push('src/platforms');
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