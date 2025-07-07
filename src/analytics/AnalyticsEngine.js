import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export class AnalyticsEngine {
  constructor(config = {}) {
    this.config = {
      scanDirs: config.scanDirs || ['src/**/*', 'components/**/*', 'pages/**/*'],
      fileExtensions: config.fileExtensions || ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.css', '.scss'],
      outputDir: config.outputDir || '.tokens-analytics',
      excludePatterns: config.excludePatterns || ['node_modules', '.git', 'dist', 'build'],
      ...config
    };
    
    this.tokenUsageData = {};
    this.componentData = {};
    this.stats = {
      filesScanned: 0,
      tokensFound: 0,
      componentsAnalyzed: 0,
      timestamp: new Date().toISOString()
    };
  }

  async collectUsageData() {
    console.log('🔍 Scanning project for token usage...');
    
    // Get all files to scan
    const files = await this.getFilesToScan();
    this.stats.filesScanned = files.length;
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    // Generate summary statistics
    this.generateStats();
    
    return {
      usage: this.tokenUsageData,
      components: this.componentData,
      stats: this.stats
    };
  }

  async getFilesToScan() {
    const allFiles = [];
    
    for (const pattern of this.config.scanDirs) {
      const files = await glob(pattern, {
        ignore: this.config.excludePatterns
      });
      allFiles.push(...files);
    }
    
    // Filter by extensions
    return allFiles.filter(file => {
      const ext = path.extname(file);
      return this.config.fileExtensions.includes(ext);
    });
  }

  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fileExt = path.extname(filePath);
      
      // Analyze based on file type
      switch (fileExt) {
        case '.css':
        case '.scss':
          this.analyzeCSSFile(filePath, content);
          break;
        case '.js':
        case '.jsx':
        case '.ts':
        case '.tsx':
          this.analyzeJSFile(filePath, content);
          break;
        case '.vue':
          this.analyzeVueFile(filePath, content);
          break;
        case '.svelte':
          this.analyzeSvelteFile(filePath, content);
          break;
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze ${filePath}: ${error.message}`);
    }
  }

  analyzeCSSFile(filePath, content) {
    // Find CSS custom properties usage
    const customPropRegex = /var\(--([^)]+)\)/g;
    const matches = [...content.matchAll(customPropRegex)];
    
    matches.forEach(match => {
      const tokenName = match[1];
      this.recordTokenUsage(tokenName, filePath, 'css-variable');
    });

    // Find Tailwind classes
    const tailwindRegex = /class="([^"]+)"/g;
    const classMatches = [...content.matchAll(tailwindRegex)];
    
    classMatches.forEach(match => {
      const classes = match[1].split(/\s+/);
      classes.forEach(className => {
        if (this.isTailwindTokenClass(className)) {
          this.recordTokenUsage(className, filePath, 'tailwind-class');
        }
      });
    });
  }

  analyzeJSFile(filePath, content) {
    // Find CSS-in-JS token usage
    const cssInJsRegex = /--([a-zA-Z0-9-_]+)/g;
    const matches = [...content.matchAll(cssInJsRegex)];
    
    matches.forEach(match => {
      const tokenName = match[1];
      this.recordTokenUsage(tokenName, filePath, 'css-in-js');
    });

    // Find styled-components usage
    const styledRegex = /\${[^}]*var\(--([^)]+)\)/g;
    const styledMatches = [...content.matchAll(styledRegex)];
    
    styledMatches.forEach(match => {
      const tokenName = match[1];
      this.recordTokenUsage(tokenName, filePath, 'styled-components');
    });

    // Find className usage for Tailwind
    const classNameRegex = /className=["']([^"']+)["']/g;
    const classNameMatches = [...content.matchAll(classNameRegex)];
    
    classNameMatches.forEach(match => {
      const classes = match[1].split(/\s+/);
      classes.forEach(className => {
        if (this.isTailwindTokenClass(className)) {
          this.recordTokenUsage(className, filePath, 'tailwind-jsx');
        }
      });
    });

    // Analyze React components
    this.analyzeReactComponent(filePath, content);
  }

  analyzeVueFile(filePath, content) {
    // Extract template section
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      this.analyzeCSSFile(filePath, templateMatch[1]);
    }

    // Extract script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      this.analyzeJSFile(filePath, scriptMatch[1]);
    }

    // Extract style section
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      this.analyzeCSSFile(filePath, styleMatch[1]);
    }
  }

  analyzeSvelteFile(filePath, content) {
    // Similar to Vue but with Svelte syntax
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      this.analyzeJSFile(filePath, scriptMatch[1]);
    }

    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      this.analyzeCSSFile(filePath, styleMatch[1]);
    }

    // Analyze main content for classes
    this.analyzeCSSFile(filePath, content);
  }

  analyzeReactComponent(filePath, content) {
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Extract component export
    const exportMatch = content.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
    const actualComponentName = exportMatch ? exportMatch[1] : componentName;
    
    // Count props and state usage
    const propsCount = (content.match(/props\./g) || []).length;
    const stateCount = (content.match(/useState|state\./g) || []).length;
    
    // Find design token imports
    const tokenImports = this.findTokenImports(content);
    
    this.componentData[actualComponentName] = {
      filePath,
      propsUsage: propsCount,
      stateUsage: stateCount,
      tokenImports,
      fileSize: Buffer.byteLength(content, 'utf8'),
      lastModified: new Date().toISOString()
    };
    
    this.stats.componentsAnalyzed++;
  }

  findTokenImports(content) {
    const imports = [];
    
    // Find token-related imports
    const importRegex = /import\s+[^}]*from\s+['"]([^'"]*tokens?[^'"]*)['"];?/g;
    const matches = [...content.matchAll(importRegex)];
    
    matches.forEach(match => {
      imports.push(match[1]);
    });
    
    return imports;
  }

  isTailwindTokenClass(className) {
    // Common Tailwind token classes
    const tokenPatterns = [
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/,
      /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/,
      /^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/,
      /^(p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-\d+$/,
      /^rounded-\w+$/,
      /^shadow-\w+$/,
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
      /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/
    ];
    
    return tokenPatterns.some(pattern => pattern.test(className));
  }

  recordTokenUsage(tokenName, filePath, type) {
    if (!this.tokenUsageData[tokenName]) {
      this.tokenUsageData[tokenName] = {
        count: 0,
        files: [],
        types: new Set()
      };
    }
    
    this.tokenUsageData[tokenName].count++;
    this.tokenUsageData[tokenName].types.add(type);
    
    if (!this.tokenUsageData[tokenName].files.includes(filePath)) {
      this.tokenUsageData[tokenName].files.push(filePath);
    }
    
    this.stats.tokensFound++;
  }

  generateStats() {
    const tokens = Object.keys(this.tokenUsageData);
    
    this.stats = {
      ...this.stats,
      uniqueTokens: tokens.length,
      totalUsages: Object.values(this.tokenUsageData).reduce((sum, token) => sum + token.count, 0),
      mostUsedToken: this.getMostUsedToken(),
      leastUsedTokens: this.getLeastUsedTokens(),
      tokenTypes: this.getTokenTypeStats(),
      fileDistribution: this.getFileDistributionStats()
    };
  }

  getMostUsedToken() {
    let maxUsage = 0;
    let mostUsed = null;
    
    Object.entries(this.tokenUsageData).forEach(([token, data]) => {
      if (data.count > maxUsage) {
        maxUsage = data.count;
        mostUsed = { token, count: data.count };
      }
    });
    
    return mostUsed;
  }

  getLeastUsedTokens() {
    return Object.entries(this.tokenUsageData)
      .filter(([_, data]) => data.count === 1)
      .map(([token, data]) => ({ token, count: data.count }))
      .slice(0, 10);
  }

  getTokenTypeStats() {
    const typeStats = {};
    
    Object.values(this.tokenUsageData).forEach(tokenData => {
      tokenData.types.forEach(type => {
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    });
    
    return typeStats;
  }

  getFileDistributionStats() {
    const fileStats = {};
    
    Object.values(this.tokenUsageData).forEach(tokenData => {
      tokenData.files.forEach(file => {
        const ext = path.extname(file);
        fileStats[ext] = (fileStats[ext] || 0) + 1;
      });
    });
    
    return fileStats;
  }

  async saveReport(outputPath = null) {
    const reportData = {
      usage: this.tokenUsageData,
      components: this.componentData,
      stats: this.stats,
      meta: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        config: this.config
      }
    };
    
    // Convert Sets to Arrays for JSON serialization
    Object.values(reportData.usage).forEach(tokenData => {
      tokenData.types = Array.from(tokenData.types);
    });
    
    // Ensure output directory exists
    await fs.ensureDir(this.config.outputDir);
    
    const fileName = outputPath || path.join(this.config.outputDir, `analytics-${Date.now()}.json`);
    await fs.writeJSON(fileName, reportData, { spaces: 2 });
    
    return fileName;
  }

  async generateHTMLReport(outputPath = null) {
    const reportData = {
      usage: this.tokenUsageData,
      components: this.componentData,
      stats: this.stats
    };
    
    const htmlTemplate = this.getHTMLTemplate(reportData);
    
    const fileName = outputPath || path.join(this.config.outputDir, `analytics-report-${Date.now()}.html`);
    await fs.writeFile(fileName, htmlTemplate);
    
    return fileName;
  }

  getHTMLTemplate(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Tokens Analytics Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #64748b; font-size: 0.9rem; margin-top: 5px; }
        .section { margin-bottom: 40px; }
        .section-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: #1e293b; }
        .token-list { list-style: none; padding: 0; }
        .token-item { background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .token-name { font-family: monospace; font-weight: bold; }
        .token-count { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; }
        .chart { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Design Tokens Analytics Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${data.stats.filesScanned}</div>
                <div class="stat-label">Files Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.stats.uniqueTokens || 0}</div>
                <div class="stat-label">Unique Tokens</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.stats.totalUsages || 0}</div>
                <div class="stat-label">Total Usages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.stats.componentsAnalyzed}</div>
                <div class="stat-label">Components</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📊 Most Used Tokens</h2>
            <ul class="token-list">
                ${Object.entries(data.usage)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .slice(0, 10)
                  .map(([token, data]) => `
                    <li class="token-item">
                        <span class="token-name">${token}</span>
                        <span class="token-count">${data.count} uses</span>
                    </li>
                  `).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">🔍 Token Usage by Type</h2>
            <div class="chart">
                ${Object.entries(data.stats.tokenTypes || {})
                  .map(([type, count]) => `
                    <div style="margin-bottom: 10px;">
                        <strong>${type}:</strong> ${count} usages
                    </div>
                  `).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📁 File Distribution</h2>
            <div class="chart">
                ${Object.entries(data.stats.fileDistribution || {})
                  .map(([ext, count]) => `
                    <div style="margin-bottom: 10px;">
                        <strong>${ext} files:</strong> ${count} token usages
                    </div>
                  `).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">⚠️ Potentially Unused Tokens</h2>
            <ul class="token-list">
                ${(data.stats.leastUsedTokens || [])
                  .map(({ token, count }) => `
                    <li class="token-item">
                        <span class="token-name">${token}</span>
                        <span class="token-count" style="background: #ef4444;">${count} use</span>
                    </li>
                  `).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }
} 