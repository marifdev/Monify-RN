export const colors = {
  primary: '#209653',
  black: '#231F20',
  red: '#A52422',
  white: '#FFFFFF',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
  },
  background: '#F5F5F5',
  card: '#FFFFFF',
} as const;

export const typography = {
  regular: 'RobotoSlab_400Regular',
  medium: 'RobotoSlab_500Medium',
  bold: 'RobotoSlab_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;

export type Theme = typeof theme; 