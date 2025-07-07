import { DESIGN_SYSTEM_THEME } from './design-system';
import type { DesignSystemTheme } from '../types/design-system';

// Design System Sync Utility
// This utility helps maintain consistency between design tokens and implementation

export interface DesignSystemConfig {
  autoSync: boolean;
  validateOnBuild: boolean;
  generateTypes: boolean;
  watchFiles: string[];
  syncTargets: ('tailwind' | 'css' | 'types' | 'docs')[];
}

export const DEFAULT_CONFIG: DesignSystemConfig = {
  autoSync: true,
  validateOnBuild: true,
  generateTypes: true,
  watchFiles: [
    'tailwind.config.js',
    'src/index.css',
    'src/utils/design-system.ts',
    'src/types/design-system.ts'
  ],
  syncTargets: ['tailwind', 'css', 'types', 'docs']
};

// Validation functions to ensure consistency
export const validateDesignSystem = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if primary colors are defined
  if (!DESIGN_SYSTEM_THEME.colors.primary?.['500']) {
    errors.push('Primary color 500 is missing');
  }

  // Check if secondary colors are defined
  if (!DESIGN_SYSTEM_THEME.colors.secondary?.['500']) {
    errors.push('Secondary color 500 is missing');
  }

  // Validate color contrast ratios
  try {
    const primaryColor = DESIGN_SYSTEM_THEME.colors.primary['500'];
    const backgroundColor = DESIGN_SYSTEM_THEME.colors.background.primary;
    
    // Basic contrast check (simplified)
    if (primaryColor === backgroundColor) {
      errors.push('Primary color and background color are the same');
    }
  } catch (error) {
    errors.push('Error validating color contrast');
  }

  // Check typography scale completeness
  const requiredTypographyKeys = ['display-large', 'headline-large', 'title-large', 'body-large', 'label-large'];
  requiredTypographyKeys.forEach(key => {
    if (!(key in DESIGN_SYSTEM_THEME.typography)) {
      errors.push(`Typography scale missing: ${key}`);
    }
  });

  // Check spacing scale
  const requiredSpacingKeys = ['0', '1', '2', '4', '6', '8', '12', '16'];
  requiredSpacingKeys.forEach(key => {
    if (!(key in DESIGN_SYSTEM_THEME.spacing)) {
      errors.push(`Spacing scale missing: ${key}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate updated Tailwind config based on current design system
export const generateTailwindConfig = (theme: DesignSystemTheme): string => {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Auto-generated from design system
      fontFamily: {
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
        'display': ['DM Sans', 'system-ui', 'sans-serif'],
        'body': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      
      colors: ${JSON.stringify(theme.colors, null, 8).replace(/"/g, "'")},
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.025em' }],
      },

      spacing: ${JSON.stringify(theme.spacing, null, 8).replace(/"/g, "'")},
      
      borderRadius: ${JSON.stringify(theme.borderRadius, null, 8).replace(/"/g, "'")},
      
      boxShadow: ${JSON.stringify(theme.boxShadow, null, 8).replace(/"/g, "'")},
      
      animation: ${JSON.stringify(theme.animation, null, 8).replace(/"/g, "'")},
      
      // Keyframes and other configurations...
      keyframes: {
        'voice-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        'voice-listening': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 0 4px rgba(0, 177, 64, 0.2)' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 0 8px rgba(0, 177, 64, 0.3)' 
          },
        },
        'voice-processing': {
          '0%, 100%': { 
            transform: 'rotate(0deg) scale(1)', 
            borderColor: '#baff29' 
          },
          '50%': { 
            transform: 'rotate(180deg) scale(1.1)', 
            borderColor: '#00b140' 
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'breath': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      transitionTimingFunction: {
        'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}`;
};

// Generate CSS variables for runtime updates
export const generateCSSVariables = (theme: DesignSystemTheme): string => {
  const cssVariables: string[] = [];
  
  // Color variables
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    cssVariables.push(`  --color-primary-${key}: ${value};`);
  });
  
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    cssVariables.push(`  --color-secondary-${key}: ${value};`);
  });
  
  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVariables.push(`  --spacing-${key}: ${value};`);
  });
  
  return `:root {
${cssVariables.join('\n')}
}`;
};

// Design system update tracker
export class DesignSystemTracker {
  private changes: Array<{
    timestamp: number;
    type: 'color' | 'typography' | 'spacing' | 'component';
    property: string;
    oldValue: any;
    newValue: any;
    reason?: string;
  }> = [];

  trackChange(type: 'color' | 'typography' | 'spacing' | 'component', property: string, oldValue: any, newValue: any, reason?: string) {
    this.changes.push({
      timestamp: Date.now(),
      type,
      property,
      oldValue,
      newValue,
      reason
    });
    
    // Auto-sync if enabled
    if (DEFAULT_CONFIG.autoSync) {
      this.syncChanges();
    }
  }

  getChangeHistory() {
    return this.changes.slice().reverse(); // Most recent first
  }

  syncChanges() {
    console.log('🎨 Design System: Syncing changes...');
    
    // Validate current state
    const validation = validateDesignSystem();
    if (!validation.isValid) {
      console.warn('🚨 Design System validation failed:', validation.errors);
      return false;
    }
    
    // Generate updated files
    if (DEFAULT_CONFIG.syncTargets.includes('tailwind')) {
      generateTailwindConfig(DESIGN_SYSTEM_THEME);
      console.log('📝 Generated new Tailwind config');
    }
    
    if (DEFAULT_CONFIG.syncTargets.includes('css')) {
      generateCSSVariables(DESIGN_SYSTEM_THEME);
      console.log('🎨 Generated new CSS variables');
    }
    
    console.log('✅ Design System sync complete');
    return true;
  }

  exportChanges() {
    return {
      changes: this.changes,
      currentTheme: DESIGN_SYSTEM_THEME,
      validation: validateDesignSystem(),
      timestamp: Date.now()
    };
  }
}

// Global tracker instance
export const designSystemTracker = new DesignSystemTracker();

// Utility functions for common design system updates
export const updatePrimaryColor = (newColor: string, shade: string = '500', reason?: string) => {
  const oldValue = (DESIGN_SYSTEM_THEME.colors.primary as any)[shade];
  
  // Update the theme
  (DESIGN_SYSTEM_THEME.colors.primary as any)[shade] = newColor;
  
  // Track the change
  designSystemTracker.trackChange('color', `primary.${shade}`, oldValue, newColor, reason);
  
  console.log(`🎨 Updated primary color ${shade}: ${oldValue} → ${newColor}`);
};

export const updateSecondaryColor = (newColor: string, shade: string = '500', reason?: string) => {
  const oldValue = (DESIGN_SYSTEM_THEME.colors.secondary as any)[shade];
  
  // Update the theme
  (DESIGN_SYSTEM_THEME.colors.secondary as any)[shade] = newColor;
  
  // Track the change
  designSystemTracker.trackChange('color', `secondary.${shade}`, oldValue, newColor, reason);
  
  console.log(`🎨 Updated secondary color ${shade}: ${oldValue} → ${newColor}`);
};

export const updateSpacing = (key: string, newValue: string, reason?: string) => {
  const oldValue = (DESIGN_SYSTEM_THEME.spacing as any)[key];
  
  // Update the theme
  (DESIGN_SYSTEM_THEME.spacing as any)[key] = newValue;
  
  // Track the change
  designSystemTracker.trackChange('spacing', key, oldValue, newValue, reason);
  
  console.log(`📏 Updated spacing ${key}: ${oldValue} → ${newValue}`);
};

// Development helpers
export const logDesignSystemStatus = () => {
  console.group('🎨 Design System Status');
  
  const validation = validateDesignSystem();
  console.log('Validation:', validation.isValid ? '✅ Valid' : '❌ Invalid');
  
  if (!validation.isValid) {
    console.log('Errors:', validation.errors);
  }
  
  console.log('Primary Color:', DESIGN_SYSTEM_THEME.colors.primary['500']);
  console.log('Secondary Color:', DESIGN_SYSTEM_THEME.colors.secondary['500']);
  console.log('Recent Changes:', designSystemTracker.getChangeHistory().slice(0, 5));
  
  console.groupEnd();
};

// Hot reloading support for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 Design System hot reloaded');
    logDesignSystemStatus();
  });
} 