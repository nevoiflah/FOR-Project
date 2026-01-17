export const COLORS = {
  primary: '#D1E8E2', // Soft Mint Green
  primaryDark: '#A8C4BD', // Darker shade for contrast
  background: '#0F1214', // Very dark blue-gray (almost black)
  cardBg: 'rgba(255, 255, 255, 0.08)', // High transparency for glass
  cardBorder: 'rgba(255, 255, 255, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  accent: '#7FDBD2', // Bright accent compatible with mint
  success: '#9FE2BF',
  warning: '#F4D03F',
  danger: '#EC7063',
  glass: {
    background: 'rgba(40, 45, 50, 0.4)',
    border: 'rgba(209, 232, 226, 0.2)', // Hint of mint in border
    blur: 20,
  }
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  // Assuming system fonts for now, manageable via style props
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  bold: { fontWeight: '700' },
  headerSize: 28,
  subHeaderSize: 20,
  bodySize: 16,
  captionSize: 12,
};

export const LAYOUT = {
  borderRadius: 24,
  glassBorderRadius: 30,
};
