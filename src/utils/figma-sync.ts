import { DESIGN_SYSTEM_THEME } from './design-system';
import { designSystemTracker } from './design-system-sync';

// Figma API Configuration
interface FigmaConfig {
  accessToken: string;
  fileKey: string;
  teamId?: string;
  autoSync: boolean;
  syncInterval: number; // milliseconds
}

interface FigmaColorStyle {
  key: string;
  name: string;
  styleType: 'FILL';
  paints: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
  }>;
}

interface FigmaTextStyle {
  key: string;
  name: string;
  styleType: 'TEXT';
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

// Figma API Client
export class FigmaDesignSystemSync {
  private config: FigmaConfig;
  private syncTimer?: number;

  constructor(config: FigmaConfig) {
    this.config = config;
  }

  // Convert hex color to Figma RGB format
  private hexToFigmaRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    };
  }

  // Convert Figma RGB to hex (currently unused but kept for future use)
  // private _figmaRgbToHex(r: number, g: number, b: number): string {
  //   const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  //   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  // }

  // Generate Figma color styles from design system
  private generateFigmaColorStyles(): FigmaColorStyle[] {
    const styles: FigmaColorStyle[] = [];
    
    // Primary colors
    Object.entries(DESIGN_SYSTEM_THEME.colors.primary).forEach(([shade, hex]) => {
      styles.push({
        key: `primary-${shade}`,
        name: `Primary/${shade}`,
        styleType: 'FILL',
        paints: [{
          type: 'SOLID',
          color: this.hexToFigmaRgb(hex)
        }]
      });
    });

    // Secondary colors
    Object.entries(DESIGN_SYSTEM_THEME.colors.secondary).forEach(([shade, hex]) => {
      styles.push({
        key: `secondary-${shade}`,
        name: `Secondary/${shade}`,
        styleType: 'FILL',
        paints: [{
          type: 'SOLID',
          color: this.hexToFigmaRgb(hex)
        }]
      });
    });

    // Neutral colors
    Object.entries(DESIGN_SYSTEM_THEME.colors.neutral).forEach(([shade, hex]) => {
      styles.push({
        key: `neutral-${shade}`,
        name: `Neutral/${shade}`,
        styleType: 'FILL',
        paints: [{
          type: 'SOLID',
          color: this.hexToFigmaRgb(hex)
        }]
      });
    });

    // Semantic colors
    ['success', 'warning', 'error'].forEach(semantic => {
      const colors = (DESIGN_SYSTEM_THEME.colors as any)[semantic];
      Object.entries(colors).forEach(([shade, hex]) => {
        styles.push({
          key: `${semantic}-${shade}`,
          name: `${semantic.charAt(0).toUpperCase() + semantic.slice(1)}/${shade}`,
          styleType: 'FILL',
          paints: [{
            type: 'SOLID',
            color: this.hexToFigmaRgb(hex as string)
          }]
        });
      });
    });

    return styles;
  }

  // Generate Figma text styles from design system
  private generateFigmaTextStyles(): FigmaTextStyle[] {
    const styles: FigmaTextStyle[] = [];
    
    // Typography scale mapping
    const typographyMapping = {
      'display-large': { fontSize: 64, fontWeight: 400, lineHeight: 1.1 },
      'display-medium': { fontSize: 48, fontWeight: 400, lineHeight: 1.1 },
      'display-small': { fontSize: 36, fontWeight: 400, lineHeight: 1.2 },
      'headline-large': { fontSize: 32, fontWeight: 400, lineHeight: 1.2 },
      'headline-medium': { fontSize: 28, fontWeight: 400, lineHeight: 1.3 },
      'headline-small': { fontSize: 24, fontWeight: 400, lineHeight: 1.3 },
      'title-large': { fontSize: 22, fontWeight: 500, lineHeight: 1.4 },
      'title-medium': { fontSize: 18, fontWeight: 500, lineHeight: 1.4 },
      'title-small': { fontSize: 16, fontWeight: 500, lineHeight: 1.4 },
      'body-large': { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
      'body-medium': { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
      'body-small': { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
      'label-large': { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
      'label-medium': { fontSize: 12, fontWeight: 600, lineHeight: 1.4 },
      'label-small': { fontSize: 10, fontWeight: 600, lineHeight: 1.4 }
    };

    Object.entries(typographyMapping).forEach(([name, props]) => {
      styles.push({
        key: name,
        name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        styleType: 'TEXT',
        fontSize: props.fontSize,
        fontFamily: 'DM Sans',
        fontWeight: props.fontWeight,
        lineHeight: props.lineHeight,
        letterSpacing: 0.025
      });
    });

    return styles;
  }

  // Push design system to Figma
  async pushToFigma(): Promise<void> {
    if (!this.config.accessToken || !this.config.fileKey) {
      throw new Error('Figma access token and file key are required');
    }

    try {
      console.log('🎨 Pushing design system to Figma...');

      // Generate styles
      const colorStyles = this.generateFigmaColorStyles();
      const textStyles = this.generateFigmaTextStyles();

      // Push color styles
      for (const style of colorStyles) {
        await this.createOrUpdateColorStyle(style);
      }

      // Push text styles
      for (const style of textStyles) {
        await this.createOrUpdateTextStyle(style);
      }

      console.log('✅ Design system successfully pushed to Figma');
      
      // Track this sync
      designSystemTracker.trackChange(
        'component',
        'figma-sync',
        null,
        'pushed-to-figma',
        'Design system synchronized with Figma'
      );

    } catch (error) {
      console.error('❌ Failed to push to Figma:', error);
      throw error;
    }
  }

  // Create or update color style in Figma
  private async createOrUpdateColorStyle(style: FigmaColorStyle): Promise<void> {
    const url = `https://api.figma.com/v1/files/${this.config.fileKey}/styles`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Figma-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: style.name,
        style_type: style.styleType,
        fills: style.paints
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create color style ${style.name}: ${response.statusText}`);
    }
  }

  // Create or update text style in Figma
  private async createOrUpdateTextStyle(style: FigmaTextStyle): Promise<void> {
    const url = `https://api.figma.com/v1/files/${this.config.fileKey}/styles`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Figma-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: style.name,
        style_type: style.styleType,
        type_style: {
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          lineHeightPx: style.fontSize * style.lineHeight,
          letterSpacing: style.letterSpacing
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create text style ${style.name}: ${response.statusText}`);
    }
  }

  // Pull design system from Figma
  async pullFromFigma(): Promise<void> {
    if (!this.config.accessToken || !this.config.fileKey) {
      throw new Error('Figma access token and file key are required');
    }

    try {
      console.log('📥 Pulling design system from Figma...');

      // Get styles from Figma
      const stylesResponse = await fetch(
        `https://api.figma.com/v1/files/${this.config.fileKey}/styles`,
        {
          headers: {
            'X-Figma-Token': this.config.accessToken
          }
        }
      );

      if (!stylesResponse.ok) {
        throw new Error(`Failed to fetch styles: ${stylesResponse.statusText}`);
      }

      const stylesData = await stylesResponse.json();
      
      // Process color styles
      const colorStyles = stylesData.meta.styles.filter((style: any) => style.style_type === 'FILL');
      await this.processColorStyles(colorStyles);

      // Process text styles
      const textStyles = stylesData.meta.styles.filter((style: any) => style.style_type === 'TEXT');
      await this.processTextStyles(textStyles);

      console.log('✅ Design system successfully pulled from Figma');

    } catch (error) {
      console.error('❌ Failed to pull from Figma:', error);
      throw error;
    }
  }

  // Process color styles from Figma
  private async processColorStyles(styles: any[]): Promise<void> {
    // Implementation would update the design system colors
    // This is a simplified version - full implementation would require
    // parsing the Figma color structure and updating the design system
    console.log('Processing color styles from Figma:', styles.length);
  }

  // Process text styles from Figma
  private async processTextStyles(styles: any[]): Promise<void> {
    // Implementation would update the design system typography
    console.log('Processing text styles from Figma:', styles.length);
  }

  // Start automatic sync
  startAutoSync(): void {
    if (this.config.autoSync && !this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.pushToFigma().catch(console.error);
      }, this.config.syncInterval);
      
      console.log(`🔄 Started auto-sync to Figma (interval: ${this.config.syncInterval}ms)`);
    }
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('⏹️ Stopped auto-sync to Figma');
    }
  }

  // Generate Figma tokens file
  generateFigmaTokens(): string {
    const tokens = {
      global: {
        colors: {
          primary: {},
          secondary: {},
          neutral: {},
          semantic: {}
        },
        typography: {
          fontFamily: {
            primary: { value: 'DM Sans' }
          },
          fontSize: {},
          fontWeight: {},
          lineHeight: {}
        },
        spacing: {}
      }
    };

    // Add colors
    Object.entries(DESIGN_SYSTEM_THEME.colors.primary).forEach(([shade, hex]) => {
      (tokens.global.colors.primary as any)[shade] = { value: hex };
    });

    Object.entries(DESIGN_SYSTEM_THEME.colors.secondary).forEach(([shade, hex]) => {
      (tokens.global.colors.secondary as any)[shade] = { value: hex };
    });

    Object.entries(DESIGN_SYSTEM_THEME.colors.neutral).forEach(([shade, hex]) => {
      (tokens.global.colors.neutral as any)[shade] = { value: hex };
    });

    // Add spacing
    Object.entries(DESIGN_SYSTEM_THEME.spacing).forEach(([key, value]) => {
      (tokens.global.spacing as any)[key] = { value };
    });

    return JSON.stringify(tokens, null, 2);
  }

  // Export design system as Figma-compatible JSON
  exportForFigma(): any {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      colors: this.generateFigmaColorStyles(),
      typography: this.generateFigmaTextStyles(),
      spacing: DESIGN_SYSTEM_THEME.spacing,
      borderRadius: DESIGN_SYSTEM_THEME.borderRadius,
      shadows: DESIGN_SYSTEM_THEME.boxShadow
    };
  }
}

// Default configuration
export const defaultFigmaConfig: Partial<FigmaConfig> = {
  autoSync: false,
  syncInterval: 30000, // 30 seconds
};

// Utility functions
export const createFigmaSync = (config: FigmaConfig): FigmaDesignSystemSync => {
  return new FigmaDesignSystemSync(config);
};

export const generateFigmaTokensFile = (): string => {
  const sync = new FigmaDesignSystemSync({ 
    accessToken: '', 
    fileKey: '', 
    autoSync: false, 
    syncInterval: 0 
  });
  return sync.generateFigmaTokens();
};

// Export for Figma Variables (newer format)
export const generateFigmaVariables = () => {
  const variables = {
    collections: [
      {
        id: 'colors',
        name: 'Colors',
        modes: [{ id: 'light', name: 'Light' }],
        variables: [] as any[]
      },
      {
        id: 'typography',
        name: 'Typography',
        modes: [{ id: 'default', name: 'Default' }],
        variables: [] as any[]
      },
      {
        id: 'spacing',
        name: 'Spacing',
        modes: [{ id: 'default', name: 'Default' }],
        variables: [] as any[]
      }
    ]
  };

  // Add color variables
  Object.entries(DESIGN_SYSTEM_THEME.colors.primary).forEach(([shade, hex]) => {
    variables.collections[0].variables.push({
      id: `primary-${shade}`,
      name: `primary/${shade}`,
      type: 'COLOR',
      values: {
        light: hex
      }
    });
  });

  Object.entries(DESIGN_SYSTEM_THEME.colors.secondary).forEach(([shade, hex]) => {
    variables.collections[0].variables.push({
      id: `secondary-${shade}`,
      name: `secondary/${shade}`,
      type: 'COLOR',
      values: {
        light: hex
      }
    });
  });

  // Add spacing variables
  Object.entries(DESIGN_SYSTEM_THEME.spacing).forEach(([key, value]) => {
    variables.collections[2].variables.push({
      id: `spacing-${key}`,
      name: `spacing/${key}`,
      type: 'FLOAT',
      values: {
        default: parseFloat(value.replace('rem', '')) * 16 // Convert rem to px
      }
    });
  });

  return variables;
};

// Export for Tokens Studio Plugin (W3C Design Tokens format)
export const generateTokensStudioFormat = () => {
  return {
    "colors": {
      "primary": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.primary).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Primary brand color - ${shade}`
          }
        ])
      ),
      "secondary": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.secondary).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Secondary accent color - ${shade}`
          }
        ])
      ),
      "neutral": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.neutral).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Neutral color - ${shade}`
          }
        ])
      ),
      "success": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.success).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Success semantic color - ${shade}`
          }
        ])
      ),
      "warning": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.warning).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Warning semantic color - ${shade}`
          }
        ])
      ),
      "error": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.error).map(([shade, hex]) => [
          shade,
          {
            "value": hex,
            "type": "color",
            "description": `Error semantic color - ${shade}`
          }
        ])
      ),
      "voice": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.voice).map(([state, hex]) => [
          state,
          {
            "value": hex,
            "type": "color",
            "description": `Voice assistant ${state} state color`
          }
        ])
      ),
      "background": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.background).map(([variant, hex]) => [
          variant,
          {
            "value": hex,
            "type": "color",
            "description": `Background color - ${variant}`
          }
        ])
      ),
      "surface": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.surface).map(([variant, hex]) => [
          variant,
          {
            "value": hex,
            "type": "color",
            "description": `Surface color - ${variant}`
          }
        ])
      ),
      "text": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.text).map(([variant, hex]) => [
          variant,
          {
            "value": hex,
            "type": "color",
            "description": `Text color - ${variant}`
          }
        ])
      ),
      "border": Object.fromEntries(
        Object.entries(DESIGN_SYSTEM_THEME.colors.border).map(([variant, hex]) => [
          variant,
          {
            "value": hex,
            "type": "color",
            "description": `Border color - ${variant}`
          }
        ])
      )
    },
    "spacing": Object.fromEntries(
      Object.entries(DESIGN_SYSTEM_THEME.spacing).map(([key, value]) => [
        key,
        {
          "value": value,
          "type": "dimension",
          "description": `Spacing scale - ${key}`
        }
      ])
    ),
    "borderRadius": Object.fromEntries(
      Object.entries(DESIGN_SYSTEM_THEME.borderRadius).map(([key, value]) => [
        key,
        {
          "value": value,
          "type": "dimension",
          "description": `Border radius - ${key}`
        }
      ])
    ),
    "boxShadow": Object.fromEntries(
      Object.entries(DESIGN_SYSTEM_THEME.boxShadow).map(([key, value]) => [
        key,
        {
          "value": value,
          "type": "shadow",
          "description": `Box shadow - ${key}`
        }
      ])
    ),
    "animation": Object.fromEntries(
      Object.entries(DESIGN_SYSTEM_THEME.animation).map(([key, value]) => [
        key,
        {
          "value": value,
          "type": "other",
          "description": `Animation - ${key}`
        }
      ])
    ),
    "breakpoints": Object.fromEntries(
      Object.entries(DESIGN_SYSTEM_THEME.breakpoints).map(([key, value]) => [
        key,
        {
          "value": value,
          "type": "dimension",
          "description": `Responsive breakpoint - ${key}`
        }
      ])
    ),
    "typography": {
      "fontFamily": {
        "primary": {
          "value": "DM Sans",
          "type": "fontFamily",
          "description": "Primary font family"
        },
        "mono": {
          "value": "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          "type": "fontFamily",
          "description": "Monospace font family"
        }
      },
      "fontSize": {
        "xs": { "value": "0.75rem", "type": "dimension", "description": "Extra small text size" },
        "sm": { "value": "0.875rem", "type": "dimension", "description": "Small text size" },
        "base": { "value": "1rem", "type": "dimension", "description": "Base text size" },
        "lg": { "value": "1.125rem", "type": "dimension", "description": "Large text size" },
        "xl": { "value": "1.25rem", "type": "dimension", "description": "Extra large text size" },
        "2xl": { "value": "1.5rem", "type": "dimension", "description": "2x large text size" },
        "3xl": { "value": "1.875rem", "type": "dimension", "description": "3x large text size" },
        "4xl": { "value": "2.25rem", "type": "dimension", "description": "4x large text size" },
        "5xl": { "value": "3rem", "type": "dimension", "description": "5x large text size" },
        "6xl": { "value": "3.75rem", "type": "dimension", "description": "6x large text size" },
        "7xl": { "value": "4.5rem", "type": "dimension", "description": "7x large text size" },
        "8xl": { "value": "6rem", "type": "dimension", "description": "8x large text size" },
        "9xl": { "value": "8rem", "type": "dimension", "description": "9x large text size" }
      },
      "fontWeight": {
        "thin": { "value": "100", "type": "fontWeight", "description": "Thin font weight" },
        "extralight": { "value": "200", "type": "fontWeight", "description": "Extra light font weight" },
        "light": { "value": "300", "type": "fontWeight", "description": "Light font weight" },
        "normal": { "value": "400", "type": "fontWeight", "description": "Normal font weight" },
        "medium": { "value": "500", "type": "fontWeight", "description": "Medium font weight" },
        "semibold": { "value": "600", "type": "fontWeight", "description": "Semibold font weight" },
        "bold": { "value": "700", "type": "fontWeight", "description": "Bold font weight" },
        "extrabold": { "value": "800", "type": "fontWeight", "description": "Extra bold font weight" },
        "black": { "value": "900", "type": "fontWeight", "description": "Black font weight" }
      },
      "lineHeight": {
        "none": { "value": "1", "type": "dimension", "description": "No line height" },
        "tight": { "value": "1.25", "type": "dimension", "description": "Tight line height" },
        "snug": { "value": "1.375", "type": "dimension", "description": "Snug line height" },
        "normal": { "value": "1.5", "type": "dimension", "description": "Normal line height" },
        "relaxed": { "value": "1.625", "type": "dimension", "description": "Relaxed line height" },
        "loose": { "value": "2", "type": "dimension", "description": "Loose line height" }
      },
      "letterSpacing": {
        "tighter": { "value": "-0.05em", "type": "dimension", "description": "Tighter letter spacing" },
        "tight": { "value": "-0.025em", "type": "dimension", "description": "Tight letter spacing" },
        "normal": { "value": "0em", "type": "dimension", "description": "Normal letter spacing" },
        "wide": { "value": "0.025em", "type": "dimension", "description": "Wide letter spacing" },
        "wider": { "value": "0.05em", "type": "dimension", "description": "Wider letter spacing" },
        "widest": { "value": "0.1em", "type": "dimension", "description": "Widest letter spacing" }
      },
      "textTransform": {
        "none": { "value": "none", "type": "other", "description": "No text transform" },
        "capitalize": { "value": "capitalize", "type": "other", "description": "Capitalize text" },
        "uppercase": { "value": "uppercase", "type": "other", "description": "Uppercase text" },
        "lowercase": { "value": "lowercase", "type": "other", "description": "Lowercase text" }
      }
    },
    "opacity": {
      "0": { "value": "0", "type": "opacity", "description": "Fully transparent" },
      "5": { "value": "0.05", "type": "opacity", "description": "Nearly transparent" },
      "10": { "value": "0.1", "type": "opacity", "description": "Very transparent" },
      "20": { "value": "0.2", "type": "opacity", "description": "Transparent" },
      "25": { "value": "0.25", "type": "opacity", "description": "Quarter opacity" },
      "30": { "value": "0.3", "type": "opacity", "description": "Low opacity" },
      "40": { "value": "0.4", "type": "opacity", "description": "Medium low opacity" },
      "50": { "value": "0.5", "type": "opacity", "description": "Half opacity" },
      "60": { "value": "0.6", "type": "opacity", "description": "Medium high opacity" },
      "70": { "value": "0.7", "type": "opacity", "description": "High opacity" },
      "75": { "value": "0.75", "type": "opacity", "description": "Three quarter opacity" },
      "80": { "value": "0.8", "type": "opacity", "description": "Very high opacity" },
      "90": { "value": "0.9", "type": "opacity", "description": "Nearly opaque" },
      "95": { "value": "0.95", "type": "opacity", "description": "Almost opaque" },
      "100": { "value": "1", "type": "opacity", "description": "Fully opaque" }
    },
    "zIndex": {
      "0": { "value": "0", "type": "other", "description": "Base z-index" },
      "10": { "value": "10", "type": "other", "description": "Low z-index" },
      "20": { "value": "20", "type": "other", "description": "Medium z-index" },
      "30": { "value": "30", "type": "other", "description": "High z-index" },
      "40": { "value": "40", "type": "other", "description": "Very high z-index" },
      "50": { "value": "50", "type": "other", "description": "Maximum z-index" },
      "modal": { "value": "1000", "type": "other", "description": "Modal z-index" },
      "dropdown": { "value": "1010", "type": "other", "description": "Dropdown z-index" },
      "tooltip": { "value": "1020", "type": "other", "description": "Tooltip z-index" },
      "overlay": { "value": "1030", "type": "other", "description": "Overlay z-index" }
    },
    "transition": {
      "duration": {
        "75": { "value": "75ms", "type": "duration", "description": "Very fast transition" },
        "100": { "value": "100ms", "type": "duration", "description": "Fast transition" },
        "150": { "value": "150ms", "type": "duration", "description": "Quick transition" },
        "200": { "value": "200ms", "type": "duration", "description": "Normal transition" },
        "300": { "value": "300ms", "type": "duration", "description": "Slow transition" },
        "500": { "value": "500ms", "type": "duration", "description": "Very slow transition" },
        "700": { "value": "700ms", "type": "duration", "description": "Extra slow transition" },
        "1000": { "value": "1000ms", "type": "duration", "description": "Ultra slow transition" }
      },
      "easing": {
        "linear": { "value": "linear", "type": "cubicBezier", "description": "Linear easing" },
        "in": { "value": "cubic-bezier(0.4, 0, 1, 1)", "type": "cubicBezier", "description": "Ease in" },
        "out": { "value": "cubic-bezier(0, 0, 0.2, 1)", "type": "cubicBezier", "description": "Ease out" },
        "in-out": { "value": "cubic-bezier(0.4, 0, 0.2, 1)", "type": "cubicBezier", "description": "Ease in-out" }
      }
    }
  };
};

// Integration with design system tracker
export const setupFigmaIntegration = (config: FigmaConfig) => {
  const figmaSync = createFigmaSync(config);
  
  // Listen for design system changes
  const originalTrackChange = designSystemTracker.trackChange;
  designSystemTracker.trackChange = function(type, property, oldValue, newValue, reason) {
    // Call original method
    originalTrackChange.call(this, type, property, oldValue, newValue, reason);
    
    // Auto-sync to Figma if enabled
    if (config.autoSync && (type === 'color' || type === 'typography' || type === 'spacing')) {
      figmaSync.pushToFigma().catch(console.error);
    }
  };

  return figmaSync;
}; 