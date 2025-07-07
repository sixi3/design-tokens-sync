import { type DesignSystemTheme } from '../types/design-system';

// Design System Constants
export const DESIGN_SYSTEM_THEME: DesignSystemTheme = {
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eafff2',
      100: '#d0ffe2',
      200: '#a4ffc8',
      300: '#68ffa0',
      400: '#26f471',
      500: '#00b140', // Main primary color
      600: '#009a3a',
      700: '#007d31',
      800: '#00622a',
      900: '#005124',
      950: '#002d13',
    },
    
    // Secondary Accent Colors
    secondary: {
      50: '#fdfff0',
      100: '#fbffe0',
      200: '#f7ffc2',
      300: '#f1ff98',
      400: '#e7ff62',
      500: '#baff29', // Main secondary color
      600: '#a3e620',
      700: '#8cc518',
      800: '#75a416',
      900: '#5d8317',
      950: '#334a08',
    },

    // Neutral Palette
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e8e8e8',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },

    // Semantic Colors
    success: {
      50: '#eafff2',
      100: '#d0ffe2',
      200: '#a4ffc8',
      300: '#68ffa0',
      400: '#26f471',
      500: '#00b140',
      600: '#009a3a',
      700: '#007d31',
      800: '#00622a',
      900: '#005124',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Voice Assistant States
    voice: {
      idle: '#737373',
      listening: '#00b140',
      processing: '#baff29',
      speaking: '#00b140',
      error: '#ef4444',
    },

    // Background & Surface Colors
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      inverse: '#171717',
    },
    
    surface: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#e8e8e8',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },

    // Text Colors
    text: {
      primary: '#171717',
      secondary: '#525252',
      tertiary: '#737373',
      inverse: '#ffffff',
      disabled: '#a3a3a3',
      link: '#00b140',
      'link-hover': '#007d31',
    },

    // Border Colors
    border: {
      primary: '#e8e8e8',
      secondary: '#d4d4d4',
      tertiary: '#a3a3a3',
      focus: '#00b140',
      error: '#ef4444',
    },
  },

  typography: {
    'display-large': 'text-6xl font-bold leading-tight tracking-tight',
    'display-medium': 'text-5xl font-bold leading-tight tracking-tight',
    'display-small': 'text-4xl font-bold leading-tight tracking-tight',
    'headline-large': 'text-3xl font-semibold leading-tight',
    'headline-medium': 'text-2xl font-semibold leading-tight',
    'headline-small': 'text-xl font-semibold leading-tight',
    'title-large': 'text-lg font-medium leading-normal',
    'title-medium': 'text-base font-medium leading-normal',
    'title-small': 'text-sm font-medium leading-normal',
    'body-large': 'text-base font-normal leading-relaxed',
    'body-medium': 'text-sm font-normal leading-relaxed',
    'body-small': 'text-xs font-normal leading-relaxed',
    'label-large': 'text-sm font-medium leading-normal tracking-wide',
    'label-medium': 'text-xs font-medium leading-normal tracking-wide',
    'label-small': 'text-xs font-medium leading-tight tracking-wide',
  },

  spacing: {
    0: '0rem',
    '0.5': '0.125rem',
    1: '0.25rem',
    '1.5': '0.375rem',
    2: '0.5rem',
    '2.5': '0.625rem',
    3: '0.75rem',
    '3.5': '0.875rem',
    4: '1rem',
    '4.5': '1.125rem',
    5: '1.25rem',
    '5.5': '1.375rem',
    6: '1.5rem',
    '6.5': '1.625rem',
    7: '1.75rem',
    '7.5': '1.875rem',
    8: '2rem',
    '8.5': '2.125rem',
    9: '2.25rem',
    '9.5': '2.375rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    13: '3.25rem',
    14: '3.5rem',
    15: '3.75rem',
    16: '4rem',
    17: '4.25rem',
    18: '4.5rem',
    19: '4.75rem',
    20: '5rem',
    21: '5.25rem',
    22: '5.5rem',
    23: '5.75rem',
    24: '6rem',
    25: '6.25rem',
    26: '6.5rem',
    27: '6.75rem',
    28: '7rem',
    29: '7.25rem',
    30: '7.5rem',
    31: '7.75rem',
    32: '8rem',
    33: '8.25rem',
    34: '8.5rem',
    35: '8.75rem',
    36: '9rem',
    37: '9.25rem',
    38: '9.5rem',
    39: '9.75rem',
    40: '10rem',
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
    '5xl': '2.5rem',
    '6xl': '3rem',
    full: '9999px',
  },

  boxShadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    'voice-idle': '0 0 0 4px rgba(115, 115, 115, 0.1)',
    'voice-listening': '0 0 0 4px rgba(0, 177, 64, 0.2), 0 0 20px rgba(0, 177, 64, 0.3)',
    'voice-processing': '0 0 0 4px rgba(186, 255, 41, 0.2), 0 0 20px rgba(186, 255, 41, 0.3)',
    'voice-speaking': '0 0 0 4px rgba(0, 177, 64, 0.2), 0 0 20px rgba(0, 177, 64, 0.3)',
    'voice-error': '0 0 0 4px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.3)',
  },

  animation: {
    'voice-pulse': 'voice-pulse 2s ease-in-out infinite',
    'voice-listening': 'voice-listening 1.5s ease-in-out infinite',
    'voice-processing': 'voice-processing 1s ease-in-out infinite',
    'thinking': 'thinking 1.5s ease-in-out infinite',
    'fade-in': 'fade-in 0.3s ease-out',
    'fade-out': 'fade-out 0.3s ease-out',
    'slide-up': 'slide-up 0.4s ease-out',
    'slide-down': 'slide-down 0.4s ease-out',
    'slide-left': 'slide-left 0.4s ease-out',
    'slide-right': 'slide-right 0.4s ease-out',
    'scale-in': 'scale-in 0.3s ease-out',
    'scale-out': 'scale-out 0.3s ease-out',
    'breath': 'breath 4s ease-in-out infinite',
    'float': 'float 3s ease-in-out infinite',
    'glow': 'glow 2s ease-in-out infinite alternate',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Utility Functions
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let current: any = DESIGN_SYSTEM_THEME.colors;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Color path "${path}" not found in design system`);
      return '#000000'; // fallback
    }
  }
  
  return typeof current === 'string' ? current : '#000000';
};

export const getSpacing = (key: keyof typeof DESIGN_SYSTEM_THEME.spacing): string => {
  return DESIGN_SYSTEM_THEME.spacing[key] || '0rem';
};

export const getTypography = (key: keyof typeof DESIGN_SYSTEM_THEME.typography): string => {
  return DESIGN_SYSTEM_THEME.typography[key] || '';
};

export const getBorderRadius = (key: keyof typeof DESIGN_SYSTEM_THEME.borderRadius): string => {
  return DESIGN_SYSTEM_THEME.borderRadius[key] || '0';
};

export const getShadow = (key: keyof typeof DESIGN_SYSTEM_THEME.boxShadow): string => {
  return DESIGN_SYSTEM_THEME.boxShadow[key] || 'none';
};

export const getAnimation = (key: keyof typeof DESIGN_SYSTEM_THEME.animation): string => {
  return DESIGN_SYSTEM_THEME.animation[key] || 'none';
};

// CSS Class Generators
export const generateButtonClasses = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary', size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-neutral-900 hover:bg-secondary-600 active:bg-secondary-700 shadow-md hover:shadow-lg focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm rounded-lg',
    medium: 'px-6 py-3 rounded-xl',
    large: 'px-8 py-4 text-lg rounded-2xl',
  };
  
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

export const generateVoiceButtonClasses = (state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error' = 'idle'): string => {
  const baseClasses = 'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const stateClasses = {
    idle: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 shadow-voice-idle focus:ring-neutral-500',
    listening: 'bg-primary-500 text-white shadow-voice-listening animate-voice-listening focus:ring-primary-500',
    processing: 'bg-secondary-500 text-neutral-900 shadow-voice-processing animate-voice-processing focus:ring-secondary-500',
    speaking: 'bg-primary-500 text-white shadow-voice-speaking animate-voice-pulse focus:ring-primary-500',
    error: 'bg-error-500 text-white shadow-voice-error animate-voice-pulse focus:ring-error-500',
  };
  
  return `${baseClasses} ${stateClasses[state]}`;
};

export const generateCardClasses = (elevated: boolean = false, padding: keyof typeof DESIGN_SYSTEM_THEME.spacing = 6): string => {
  const baseClasses = 'bg-surface-primary border border-border-primary rounded-2xl transition-shadow duration-200 ease-out';
  const elevatedClasses = elevated ? 'shadow-lg hover:shadow-xl' : 'shadow-sm hover:shadow-md';
  const paddingClass = `p-${padding}`;
  
  return `${baseClasses} ${elevatedClasses} ${paddingClass}`;
};

export const generateInputClasses = (hasError: boolean = false): string => {
  const baseClasses = 'w-full px-4 py-3 rounded-xl border-2 bg-surface-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-out';
  const errorClasses = hasError 
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500' 
    : 'border-border-primary focus:border-primary-500 focus:ring-primary-500';
  
  return `${baseClasses} ${errorClasses}`;
};

// Color Utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

export const isAccessible = (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const contrast = getContrastRatio(foreground, background);
  return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
};

// Responsive Utilities
export const generateResponsiveClasses = (property: string, values: Record<string, string>): string => {
  return Object.entries(values)
    .map(([breakpoint, value]) => {
      if (breakpoint === 'base') return `${property}-${value}`;
      return `${breakpoint}:${property}-${value}`;
    })
    .join(' ');
};

// Animation Utilities
export const createCustomAnimation = (name: string, _keyframes: Record<string, Record<string, string>>, duration: string = '1s', timing: string = 'ease-in-out', iteration: string = 'infinite'): string => {
  return `${name} ${duration} ${timing} ${iteration}`;
};

// Validation Utilities
export const validateDesignToken = (token: string, category: 'color' | 'spacing' | 'typography' | 'borderRadius' | 'shadow' | 'animation'): boolean => {
  switch (category) {
    case 'color':
      return token in DESIGN_SYSTEM_THEME.colors || token.includes('.');
    case 'spacing':
      return token in DESIGN_SYSTEM_THEME.spacing;
    case 'typography':
      return token in DESIGN_SYSTEM_THEME.typography;
    case 'borderRadius':
      return token in DESIGN_SYSTEM_THEME.borderRadius;
    case 'shadow':
      return token in DESIGN_SYSTEM_THEME.boxShadow;
    case 'animation':
      return token in DESIGN_SYSTEM_THEME.animation;
    default:
      return false;
  }
}; 