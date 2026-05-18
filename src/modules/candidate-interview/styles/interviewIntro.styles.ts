import { PURPLE, PURPLE_DARK } from '../constants';

export const PURPLE_BG     = 'rgba(225,248,237,1)';
export const PURPLE_BORDER = 'rgba(106,211,156,0.35)';

export const SX = {
  sectionHeading: { fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1 },
  bodyText:       { fontFamily: 'Poppins', fontSize: '0.8rem',  color: '#4B5563', lineHeight: 1.65 },
  tipText:        { fontFamily: 'Poppins', fontSize: '0.79rem', color: '#4B5563' },
  pillText:       { fontFamily: 'Poppins', fontSize: '0.72rem', color: '#374151' },
  pillTextPurple: { fontFamily: 'Poppins', fontSize: '0.72rem', color: PURPLE, fontWeight: 600 },

  stepCircleActive:   { width: 26, height: 26, borderRadius: '50%', bgcolor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepCircleInactive: { width: 26, height: 26, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepNumActive:      { color: '#fff',    fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' },
  stepNumInactive:    { color: '#9CA3AF', fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' },
  stepLabelActive:    { fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: PURPLE,    whiteSpace: 'nowrap' },
  stepLabelInactive:  { fontFamily: 'Poppins', fontWeight: 400, fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap' },

  metaChip:  { bgcolor: '#F9FAFB', color: '#374151', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid #E5E7EB', '& .MuiChip-icon': { color: '#6B7280 !important', fontSize: '14px !important' } },
  skillChip: { bgcolor: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem' },

  pill:       { display: 'flex', alignItems: 'center', gap: 0.6, px: 1.25, py: 0.5, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' },
  pillPurple: { display: 'flex', alignItems: 'center', gap: 0.6, px: 1.25, py: 0.5, bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: '8px' },
};

export { PURPLE, PURPLE_DARK };
