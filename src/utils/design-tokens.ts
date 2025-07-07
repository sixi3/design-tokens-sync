// Central design tokens system - Single source of truth from tokens.json
import { tokensLoader } from './tokens-loader';

// Design tokens interface that matches our project structure
export interface DesignTokens {
  colors: Record<string, Record<string, string>>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  source: 'tokens.json' | 'design-system' | 'mixed';
  lastLoaded: string;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  shadows: Record<string, string>;
  opacity: Record<string, string>;
  zIndex: Record<string, number>;
  transitions: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  breakpoints: Record<string, string>;
  animations: Record<string, {
    duration: string;
    easing: string;
    properties?: string[];
  }>;
}

// Cache for loaded tokens
let cachedTokens: DesignTokens | null = null;
let isLoading = false;

// Load and parse tokens from tokens.json
export async function loadDesignTokens(): Promise<DesignTokens> {
  if (cachedTokens) {
    return cachedTokens;
  }

  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return cachedTokens!;
  }

  isLoading = true;

  try {
    const loadedTokens = await tokensLoader.getTokens();
    
    // Transform loaded tokens to our expected structure
    cachedTokens = {
      colors: loadedTokens.colors,
      spacing: loadedTokens.spacing,
      borderRadius: loadedTokens.borderRadius,
      source: loadedTokens.source,
      lastLoaded: loadedTokens.lastLoaded,
      typography: loadedTokens.typography?.fontFamily ? {
        fontFamily: loadedTokens.typography.fontFamily,
        fontSize: loadedTokens.typography.fontSize || {},
        fontWeight: loadedTokens.typography.fontWeight || {},
        lineHeight: loadedTokens.typography.lineHeight || {},
        letterSpacing: loadedTokens.typography.letterSpacing || {},
      } : {
        fontFamily: { sans: 'Inter, system-ui, sans-serif' },
        fontSize: { base: '1rem', lg: '1.125rem' },
        fontWeight: { normal: '400', medium: '500', semibold: '600' },
        lineHeight: { normal: '1.5', tight: '1.25' },
        letterSpacing: { normal: '0', wide: '0.05em' },
      },
      shadows: extractTokenCategory(loadedTokens, 'boxShadow') || {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      opacity: extractTokenCategory(loadedTokens, 'opacity') || {
        '0': '0',
        '25': '0.25',
        '50': '0.5',
        '75': '0.75',
        '100': '1',
      },
      zIndex: extractTokenCategory(loadedTokens, 'zIndex') || {
        auto: 0,
        base: 1,
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modal: 1040,
        popover: 1050,
        tooltip: 1060,
      },
      transitions: {
        duration: extractTokenCategory(loadedTokens, 'transitionDuration') || {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms',
        },
        easing: extractTokenCategory(loadedTokens, 'transitionEasing') || {
          linear: 'linear',
          ease: 'ease',
          'ease-in': 'ease-in',
          'ease-out': 'ease-out',
          'ease-in-out': 'ease-in-out',
        },
      },
      breakpoints: extractTokenCategory(loadedTokens, 'breakpoints') || {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      animations: extractTokenCategory(loadedTokens, 'animations') || {
        fadeIn: { duration: '300ms', easing: 'ease-out' },
        fadeOut: { duration: '200ms', easing: 'ease-in' },
        slideUp: { duration: '300ms', easing: 'ease-out' },
        slideDown: { duration: '300ms', easing: 'ease-out' },
        scaleIn: { duration: '200ms', easing: 'ease-out' },
        scaleOut: { duration: '150ms', easing: 'ease-in' },
        voicePulse: { duration: '1000ms', easing: 'ease-in-out' },
        voiceWave: { duration: '800ms', easing: 'ease-in-out' },
      },
    };

    console.log('✅ Design tokens loaded from:', loadedTokens.source);
    return cachedTokens;

  } catch (error) {
    console.error('❌ Failed to load design tokens:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

// Helper function to extract token categories
function extractTokenCategory(tokens: any, category: string): any {
  if (tokens && typeof tokens === 'object' && tokens[category]) {
    return tokens[category];
  }
  return null;
}

// Refresh cached tokens (call when tokens.json changes)
export function refreshDesignTokens(): void {
  cachedTokens = null;
  tokensLoader.refresh();
}

// Get tokens synchronously (use only after loadDesignTokens has been called)
export function getDesignTokens(): DesignTokens {
  if (!cachedTokens) {
    throw new Error('Design tokens not loaded. Call loadDesignTokens() first.');
  }
  return cachedTokens;
}

// React hook for using design tokens
export function useDesignTokens() {
  const [tokens, setTokens] = React.useState<DesignTokens | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const designTokens = await loadDesignTokens();
        setTokens(designTokens);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design tokens');
        console.error('Design tokens loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // Subscribe to token changes
    const unsubscribe = tokensLoader.subscribe(() => {
      refreshDesignTokens();
      loadTokens();
    });

    return unsubscribe;
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      refreshDesignTokens();
      const designTokens = await loadDesignTokens();
      setTokens(designTokens);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh design tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  return { tokens, loading, error, refresh };
}

// CSS Custom Properties generator
export function generateCSSCustomProperties(tokens: DesignTokens): string {
  const cssVars: string[] = [':root {'];

  // Colors
  Object.entries(tokens.colors).forEach(([category, shades]) => {
    if (shades && typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        cssVars.push(`  --color-${category}-${shade}: ${value};`);
      });
    }
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVars.push(`  --border-radius-${key}: ${value};`);
  });

  // Typography
  Object.entries(tokens.typography).forEach(([category, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      cssVars.push(`  --typography-${category}-${key}: ${value};`);
    });
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  // Opacity
  Object.entries(tokens.opacity).forEach(([key, value]) => {
    cssVars.push(`  --opacity-${key}: ${value};`);
  });

  // Z-Index
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    cssVars.push(`  --z-index-${key}: ${value};`);
  });

  // Transitions
  Object.entries(tokens.transitions.duration).forEach(([key, value]) => {
    cssVars.push(`  --transition-duration-${key}: ${value};`);
  });
  Object.entries(tokens.transitions.easing).forEach(([key, value]) => {
    cssVars.push(`  --transition-easing-${key}: ${value};`);
  });

  // Breakpoints
  Object.entries(tokens.breakpoints).forEach(([key, value]) => {
    cssVars.push(`  --breakpoint-${key}: ${value};`);
  });

  cssVars.push('}');
  return cssVars.join('\n');
}

// Tailwind CSS configuration generator
export function generateTailwindConfig(tokens: DesignTokens): any {
  return {
    theme: {
      extend: {
        colors: tokens.colors,
        spacing: tokens.spacing,
        borderRadius: tokens.borderRadius,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        fontWeight: tokens.typography.fontWeight,
        lineHeight: tokens.typography.lineHeight,
        letterSpacing: tokens.typography.letterSpacing,
        boxShadow: tokens.shadows,
        opacity: tokens.opacity,
        zIndex: tokens.zIndex,
        transitionDuration: tokens.transitions.duration,
        transitionTimingFunction: tokens.transitions.easing,
        screens: tokens.breakpoints,
      },
    },
  };
}

// Framer Motion variants generator (for animations)
export function generateMotionVariants(tokens: DesignTokens) {
  const variants: Record<string, any> = {};

  Object.entries(tokens.animations).forEach(([name, config]) => {
    variants[name] = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: {
        duration: parseFloat(config.duration) / 1000, // Convert ms to seconds
        ease: config.easing === 'ease-out' ? [0.4, 0, 0.2, 1] : 
              config.easing === 'ease-in' ? [0.4, 0, 1, 1] :
              config.easing === 'ease-in-out' ? [0.4, 0, 0.2, 1] : 'linear',
      },
    };
  });

  // Voice-specific animations
  variants.voicePulse = {
    initial: { scale: 1, opacity: 0.7 },
    animate: { 
      scale: [1, 1.1, 1], 
      opacity: [0.7, 1, 0.7] 
    },
    transition: {
      duration: parseFloat(tokens.animations.voicePulse.duration) / 1000,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  variants.voiceWave = {
    initial: { scaleY: 1 },
    animate: { 
      scaleY: [1, 1.5, 0.8, 1.2, 1] 
    },
    transition: {
      duration: parseFloat(tokens.animations.voiceWave.duration) / 1000,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return variants;
}

// Token validation
export function validateDesignTokens(tokens: DesignTokens): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required color categories
  const requiredColorCategories = ['primary', 'secondary', 'neutral'];
  requiredColorCategories.forEach(category => {
    if (!tokens.colors[category] || Object.keys(tokens.colors[category]).length === 0) {
      errors.push(`Missing required color category: ${category}`);
    }
  });

  // Check required spacing values
  const requiredSpacing = ['0', '1', '2', '4', '8', '16'];
  requiredSpacing.forEach(spacing => {
    if (!tokens.spacing[spacing]) {
      warnings.push(`Missing common spacing value: ${spacing}`);
    }
  });

  // Check typography completeness
  if (!tokens.typography.fontFamily.sans) {
    errors.push('Missing sans-serif font family');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// React import
import React from 'react'; 