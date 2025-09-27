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
    tailwind: 'tailwind.config.js'
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