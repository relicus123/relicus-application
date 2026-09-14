// Relicus Psychological Services — App Theme
// Source: brand logo (#1C4966 / #8FBDD7) + refined palette

export const colors = {
  // Brand
  primary: '#1C4966',
  primaryDark: '#12354A',
  primaryHover: '#285B78',
  secondary: '#8FBDD7',

  // Backgrounds
  background: '#F7F9FB',
  surface: '#FFFFFF',
  surfaceSubtleBlue: '#EDF5F8',
  surfaceBlue: '#E1EFF5',

  // Text
  heading: '#172F3D',
  body: '#405563',
  secondaryText: '#71818B',
  caption: '#87959D',
  disabled: '#AAB5BB',

  // Borders
  border: '#DCE5EA',
  borderStrong: '#C9D9E2',
  borderFocus: '#1C4966',

  // Accent
  accent: '#C99545',
  accentLight: '#FBF1DF',
  accentDark: '#9A6C2D',

  // Status
  success: '#287A5A',
  successBg: '#E8F4EE',
  warning: '#C99545',
  warningBg: '#FBF1DF',
  error: '#C45151',
  errorBg: '#FBEAEA',
  info: '#1C4966',
  infoBg: '#EDF5F8',

  // Navigation / Sidebar
  navBackground: '#1C4966',
  navText: '#EDF5F8',
  navActiveText: '#FFFFFF',
  navActiveBackground: '#285B78',
  navIcon: '#8FBDD7',

  // Static
  white: '#FFFFFF',
} as const;

export const buttons = {
  primary: {
    background: colors.primary,
    text: colors.white,
    hoverBackground: colors.primaryHover,
  },
  secondary: {
    background: colors.surfaceBlue,
    text: colors.primary,
    border: colors.secondary,
  },
  outline: {
    background: 'transparent',
    border: colors.primary,
    text: colors.primary,
    hoverBackground: colors.surfaceBlue,
  },
} as const;

export const cards = {
  standard: {
    background: colors.surface,
    border: colors.border,
    title: colors.heading,
    text: colors.body,
  },
  selected: {
    background: colors.surfaceBlue,
    border: colors.secondary,
    title: colors.primary,
  },
  featured: {
    background: colors.primary,
    title: colors.white,
    text: colors.surfaceBlue, // near-white blue tint for readability on dark bg
    accent: colors.accent,
  },
} as const;

export const typography = {
  h1: { color: colors.heading, fontWeight: '700' as const },
  h2: { color: colors.heading, fontWeight: '700' as const },
  h3: { color: colors.primary, fontWeight: '600' as const },
  body: { color: colors.body, fontWeight: '400' as const },
  secondary: { color: colors.secondaryText, fontWeight: '400' as const },
  caption: { color: colors.caption, fontWeight: '400' as const },
  disabled: { color: colors.disabled, fontWeight: '400' as const },
} as const;

export default { colors, buttons, cards, typography };
