// Warhammer 40K Reading Tracker Design System

export const colors = {
  // Primary brand color - Gold/Amber
  primary: {
    DEFAULT: '#D4AF37',
    light: '#E5C158',
    dark: '#B8941F',
  },

  // Background colors
  background: {
    main: '#0F172A',      // slate-900
    card: '#1E293B',      // slate-800
    elevated: '#334155',  // slate-700
  },

  // Text colors
  text: {
    primary: '#F8FAFC',   // slate-50
    secondary: '#94A3B8', // slate-400
    muted: '#64748B',     // slate-500
  },

  // Border colors
  border: {
    DEFAULT: '#334155',   // slate-700
    light: '#475569',     // slate-600
  },
};

// Tailwind class mappings for consistency
export const styles = {
  // Backgrounds
  bgMain: 'bg-slate-900',
  bgCard: 'bg-slate-800',
  bgElevated: 'bg-slate-700',

  // Text
  textPrimary: 'text-slate-50',
  textSecondary: 'text-slate-400',
  textMuted: 'text-slate-500',
  textGold: 'text-[#D4AF37]',

  // Borders
  border: 'border-slate-700',
  borderLight: 'border-slate-600',

  // Cards
  card: 'bg-slate-800 border border-slate-700 rounded-lg',

  // Buttons
  btnPrimary: 'bg-[#D4AF37] hover:bg-[#E5C158] text-slate-900 font-semibold px-4 py-2 rounded-lg transition-colors',
  btnSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-50 px-4 py-2 rounded-lg transition-colors',
  btnGhost: 'hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-colors',

  // Book status (unified look - no color coding)
  bookCard: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4 transition-all cursor-pointer',
  bookCardActive: 'bg-slate-700 border-slate-600',
};

// Status icons (using simple symbols instead of colors)
export const statusIcons = {
  unread: '○',
  reading: '◐',
  completed: '●',
};

// Reading status labels
export const statusLabels = {
  unread: 'Unread',
  reading: 'Reading',
  completed: 'Completed',
};
