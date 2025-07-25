// Design Tokens Configuration for React
// Generated by design-tokens-sync

export default {
  tokens: {
    input: 'tokens.json',
    validation: {
      required: ['core.colors', 'core.spacing', 'core.typography'],
      optional: ['semantic', 'component', 'core.shadows', 'core.borderRadius']
    }
  },
  output: {
    css: 'src/styles/tokens.css',
    typescript: 'src/types/tokens.d.ts',
    tailwind: 'tailwind.config.js',
    scss: 'src/styles/_tokens.scss',
    json: 'src/data/tokens.json',
    javascript: 'src/data/tokens.js'
    // Mobile platforms (added automatically based on init selection):
    // ios: 'src/platforms/ios/Colors.swift',
    // android: 'src/platforms/android/colors.xml',
    // xamarin: 'src/platforms/xamarin/Colors.xaml',
    // reactNative: 'src/platforms/reactNative/tokens.js',
    // flutter: 'src/platforms/flutter/design_tokens.dart',
    // kotlinCompose: 'src/platforms/kotlinCompose/DesignTokens.kt',
    // swiftui: 'src/platforms/swiftui/DesignTokens.swift'
  },
  react: {
    // React-specific token generation
    hooks: 'src/hooks/useTokens.ts',
    components: 'src/components/tokens/',
    styledComponents: true,
    emotionSupport: false
  },
  git: {
    enabled: true,
    autoCommit: true,
    autoPush: false,
    commitMessage: '🎨 Update design tokens'
  },
  analytics: {
    enabled: true,
    autoCollect: true,
    scanDirs: ['src/**/*'],
    fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
    outputDir: '.tokens-analytics'
  },
  watch: {
    enabled: true,
    ignore: ['node_modules', '.git', 'dist', 'build', '.next']
  },
  build: {
    // Build integration
    beforeBuild: 'npm run tokens:sync',
    validateBeforeCommit: true
  }
}; 