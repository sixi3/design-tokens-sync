// Design System Type Definitions

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
};

export type ColorPalette = {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
};

export type SemanticColors = {
  voice: {
    idle: string;
    listening: string;
    processing: string;
    speaking: string;
    error: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    link: string;
    'link-hover': string;
  };
  border: {
    primary: string;
    secondary: string;
    tertiary: string;
    focus: string;
    error: string;
  };
};

export type TypographyScale = {
  'display-large': string;
  'display-medium': string;
  'display-small': string;
  'headline-large': string;
  'headline-medium': string;
  'headline-small': string;
  'title-large': string;
  'title-medium': string;
  'title-small': string;
  'body-large': string;
  'body-medium': string;
  'body-small': string;
  'label-large': string;
  'label-medium': string;
  'label-small': string;
};

export type SpacingScale = {
  0: string;
  '0.5': string;
  1: string;
  '1.5': string;
  2: string;
  '2.5': string;
  3: string;
  '3.5': string;
  4: string;
  '4.5': string;
  5: string;
  '5.5': string;
  6: string;
  '6.5': string;
  7: string;
  '7.5': string;
  8: string;
  '8.5': string;
  9: string;
  '9.5': string;
  10: string;
  11: string;
  12: string;
  13: string;
  14: string;
  15: string;
  16: string;
  17: string;
  18: string;
  19: string;
  20: string;
  21: string;
  22: string;
  23: string;
  24: string;
  25: string;
  26: string;
  27: string;
  28: string;
  29: string;
  30: string;
  31: string;
  32: string;
  33: string;
  34: string;
  35: string;
  36: string;
  37: string;
  38: string;
  39: string;
  40: string;
};

export type BorderRadiusScale = {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  full: string;
};

export type ShadowScale = {
  xs: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
  'voice-idle': string;
  'voice-listening': string;
  'voice-processing': string;
  'voice-speaking': string;
  'voice-error': string;
};

export type AnimationScale = {
  'voice-pulse': string;
  'voice-listening': string;
  'voice-processing': string;
  'thinking': string;
  'fade-in': string;
  'fade-out': string;
  'slide-up': string;
  'slide-down': string;
  'slide-left': string;
  'slide-right': string;
  'scale-in': string;
  'scale-out': string;
  'breath': string;
  'float': string;
  'glow': string;
};

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost';

export type ButtonSize = 
  | 'small'
  | 'medium'
  | 'large';

export type VoiceState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export type StatusType = 
  | 'success'
  | 'warning'
  | 'error';

export type BreakpointScale = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

export interface DesignSystemTheme {
  colors: ColorPalette & SemanticColors;
  typography: TypographyScale;
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  boxShadow: ShadowScale;
  animation: AnimationScale;
  breakpoints: BreakpointScale;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface VoiceButtonProps extends BaseComponentProps {
  state?: VoiceState;
  onClick?: () => void;
  disabled?: boolean;
}

export interface StatusIndicatorProps extends BaseComponentProps {
  type: StatusType;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface CardProps extends BaseComponentProps {
  elevated?: boolean;
  padding?: keyof SpacingScale;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Utility types
export type ResponsiveValue<T> = T | { [key in keyof BreakpointScale]?: T };

export type ThemeColorKey = keyof ColorPalette | keyof SemanticColors;

export type ThemeSpacingKey = keyof SpacingScale;

export type ThemeTypographyKey = keyof TypographyScale;

export type ThemeBorderRadiusKey = keyof BorderRadiusScale;

export type ThemeShadowKey = keyof ShadowScale;

export type ThemeAnimationKey = keyof AnimationScale; 