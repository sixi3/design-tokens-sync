export default {
  "tokens": {
    "input": "tokens.json"
  },
  "output": {
    "css": "src/styles/tokens.css",
    "typescript": "src/types/tokens.d.ts",
    "tailwindPresetEsm": "tokens.tailwind.preset.js",
    "tailwindPresetCjs": "tokens.tailwind.preset.cjs",
    "tokensCjs": "src/data/tokens.cjs",
    "shadcnThemeCss": "src/styles/shadcn-theme.css"
  },
  "git": {
    "enabled": false
  },
  "analytics": {
    "enabled": false
  },
  "css": {
    "includeUtilities": false
  },
  "shadcn": {
    "enable": true,
    "hsl": true
  }
};
