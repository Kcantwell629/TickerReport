// Ticker Report — visual theme
// Dark, data-dense fintech aesthetic (teal / cyan primary, orange secondary),
// matching the reference mobile UI moodboard supplied for this project.

export const colors = {
  bg: '#0A1416',
  bgElevated: '#0F1E21',
  card: '#122428',
  cardAlt: '#16292D',
  border: '#1F3A3F',
  borderSoft: '#172A2D',

  textPrimary: '#EAF6F4',
  textSecondary: '#8FA8AA',
  textMuted: '#5C7477',

  teal: '#2DD4BF',
  tealDim: '#1B7F73',
  tealGlow: 'rgba(45, 212, 191, 0.18)',

  orange: '#F97316',
  orangeDim: '#9A4B14',
  orangeGlow: 'rgba(249, 115, 22, 0.18)',

  blue: '#38BDF8',

  pass: '#2DD4BF',
  ok: '#5EEAD4',
  watch: '#F5B942',
  fail: '#FB7185',

  gaugeTrack: '#182F32',
};

export const gradients = {
  tealOrange: [colors.teal, colors.orange] as const,
  screenBg: [colors.bg, '#0D1B1D'] as const,
  cardSheen: ['rgba(45,212,191,0.10)', 'rgba(249,115,22,0.04)'] as const,
};

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_600SemiBold',
  body: 'SpaceGrotesk_500Medium',
  bodyRegular: 'SpaceGrotesk_400Regular',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
};

export type Grade = 'PASS' | 'STRONG' | 'OK' | 'WATCH' | 'FAIL' | 'N/A';

export function gradeColor(grade: Grade): string {
  switch (grade) {
    case 'PASS':
    case 'STRONG':
      return colors.pass;
    case 'OK':
      return colors.ok;
    case 'WATCH':
      return colors.watch;
    case 'FAIL':
      return colors.fail;
    default:
      return colors.textMuted;
  }
}
