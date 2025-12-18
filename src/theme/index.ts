import { StyleSheet } from 'react-native';

export const colors = {
  // Primary - Vibrant Green (Success/Correct)
  primary: '#58CC02',
  primaryDark: '#46A302',
  primaryLight: '#89E219',

  // Secondary - Bright Blue (Info/Learning)
  secondary: '#1CB0F6',
  secondaryDark: '#0099DD',
  secondaryLight: '#49C0F8',

  // Accent - Warm Orange (Energy/Action)
  accent: '#FF9600',
  accentDark: '#E68600',
  accentLight: '#FFB020',

  // Error/Wrong
  error: '#FF4B4B',
  errorDark: '#E53E3E',
  errorLight: '#FF6B6B',

  // Purple - Premium/Special
  purple: '#CE82FF',
  purpleDark: '#A855F7',
  purpleLight: '#DDA0FF',

  // Pink - Fun/Celebration
  pink: '#FF86D0',
  pinkDark: '#EC4899',

  // Neutral - Paper-like
  paper: '#FFFBF5',
  paperDark: '#F7F3ED',
  ink: '#3C3C3C',
  inkLight: '#6B7280',
  inkLighter: '#9CA3AF',

  // Backgrounds
  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  button: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  }),
};

export const typography = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '700' as const,
    lineHeight: 14,
  },
};

// Category colors
export const categoryColors: Record<string, { color: string; dark: string }> = {
  'sliding-window': { color: '#FF6B6B', dark: '#E55A5A' },
  'two-pointers': { color: '#4ECDC4', dark: '#3DBDB5' },
  'fast-slow-pointers': { color: '#45B7D1', dark: '#38A3BC' },
  'merge-intervals': { color: '#96CEB4', dark: '#7FB89E' },
  'cyclic-sort': { color: '#FFEAA7', dark: '#F5D77B' },
  'linked-list-reversal': { color: '#DDA0DD', dark: '#C890C8' },
  'tree-bfs': { color: '#98D8C8', dark: '#7DC5B4' },
  'tree-dfs': { color: '#F7DC6F', dark: '#E8CA50' },
  'two-heaps': { color: '#BB8FCE', dark: '#A77BB8' },
  'subsets': { color: '#85C1E9', dark: '#6BADD4' },
  'binary-search': { color: '#F8B500', dark: '#E0A300' },
  'top-k-elements': { color: '#00CEC9', dark: '#00B5B0' },
  'k-way-merge': { color: '#FD79A8', dark: '#E86995' },
  'topological-sort': { color: '#A29BFE', dark: '#8B84E8' },
  'island-matrix': { color: '#00B894', dark: '#00A381' },
  'bitwise-xor': { color: '#6C5CE7', dark: '#5B4BC4' },
  'backtracking': { color: '#E17055', dark: '#D35E48' },
  'knapsack-dp': { color: '#FDCB6E', dark: '#F9BF3B' },
  'monotonic-stack': { color: '#00CEC9', dark: '#00B5AD' },
  'system-design': { color: '#636E72', dark: '#4D5659' },
  'web-dev': { color: '#E17055', dark: '#C96248' },
  'ios': { color: '#0984E3', dark: '#0870C4' },
  'android': { color: '#00B894', dark: '#009B7D' },
};

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonAccent: {
    backgroundColor: colors.accent,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderDark,
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  buttonTextOutline: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  categoryColors,
  commonStyles,
};
