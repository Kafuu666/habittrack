import { DarkTheme, Theme } from '@react-navigation/native';

// Dark Mode - Navy & Purple (sesuai PRD bagian 7)
export const colors = {
  background: '#0B1020',
  card: '#151C32',
  primary: '#8B5CF6',
  secondary: '#A78BFA',
  success: '#22C55E',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#252E4B',
  inputBg: '#10172B',
  danger: '#EF4444',
  warning: '#F59E0B',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.primary,
  },
};
