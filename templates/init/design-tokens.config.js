// Design Tokens Configuration
module.exports = {
  tokens: {
    input: 'tokens.json',
    validation: {
      required: ['colors'],
      optional: ['spacing', 'typography', 'borderRadius']
    }
  },
  
  output: {
    css: 'src/styles/tokens.css',
    // Prefer Tailwind presets
    tailwindPresetEsm: 'tokens.tailwind.preset.js',
    tailwindPresetCjs: 'tokens.tailwind.preset.cjs',
    // Dual-module tokens
    javascript: 'src/data/tokens.js',
    tokensCjs: 'src/data/tokens.cjs',
    // Shadcn theme CSS bridge
    shadcnThemeCss: 'src/styles/shadcn-theme.css'
  },
  // Shadcn behavior
  shadcn: {
    enable: true,
    hsl: true,
    format: 'rgb',
    strict: false,
    fallback: 'shadcn'
  },
  
  git: {
    enabled: true,
    autoCommit: true,
    autoPush: false,
    commitMessage: '🎨 Update design tokens'
  },
  
  analytics: {
    enabled: true,
    autoCollect: true
  },
  
  watch: {
    enabled: true,
    ignore: ['node_modules', '.git', 'dist', 'build']
  }
}; 