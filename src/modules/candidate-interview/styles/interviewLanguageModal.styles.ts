export const TEAL    = '#0D9488';
export const TEAL_BG = '#F0FDFA';

export const SX = {
  paper: { borderRadius: '20px', width: 420, maxWidth: '95vw', p: 0, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.14)' },

  accentBar: { height: 4, background: `linear-gradient(90deg, ${TEAL}, #0891B2)` },
  body:      { p: 3 },
  headerBox: { textAlign: 'center', mb: 3 },

  iconBox: { width: 48, height: 48, borderRadius: '14px', background: `linear-gradient(135deg, ${TEAL_BG}, #E0F2FE)`, border: '1.5px solid #99F6E4', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' },
  desc:    { fontSize: '12.5px', color: '#6B7280', mt: 0.75, lineHeight: 1.65, px: 2 },

  langGrid: (count: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`, gap: 1.25, mb: 2 }),
  langCardActive:   { cursor: 'pointer', border: `2px solid ${TEAL}`, borderRadius: '14px', bgcolor: TEAL_BG,  p: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, position: 'relative', transition: 'all 0.18s ease', '&:hover': { borderColor: TEAL, bgcolor: TEAL_BG, transform: 'translateY(-1px)' } },
  langCardInactive: { cursor: 'pointer', border: '2px solid #E5E7EB',         borderRadius: '14px', bgcolor: '#FAFAFA', p: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, position: 'relative', transition: 'all 0.18s ease', '&:hover': { borderColor: TEAL, bgcolor: TEAL_BG, transform: 'translateY(-1px)' } },
  checkBadge: { position: 'absolute', top: 7, right: 7, width: 18, height: 18, borderRadius: '50%', bgcolor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(13,148,136,0.4)' },

  langLabel:         (active: boolean) => ({ fontSize: '12.5px', fontWeight: active ? 800 : 600, color: active ? TEAL : '#111827', lineHeight: 1.2 }),
  langEnglishLabel:  (active: boolean) => ({ fontSize: '10.5px', color: active ? '#0F766E' : '#9CA3AF', mt: 0.25 }),

  selectedBanner: { display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2.5 },
  selectedText:   { fontSize: '12px', color: '#374151', flex: 1 },

  singleCard:          { display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 2.5, borderRadius: '14px', bgcolor: TEAL_BG, border: '1.5px solid #99F6E4' },
  singleLangName:      { fontSize: '14px', fontWeight: 800, color: TEAL, lineHeight: 1.2 },
  singleLangNameSpan:  { fontWeight: 500, fontSize: '11.5px', color: '#0F766E', ml: 1 },
  singleLangNote:      { fontSize: '11.5px', color: '#0F766E', mt: 0.4, lineHeight: 1.5 },

  actionsRow: { display: 'flex', gap: 1.25 },
  btnBack:    { textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '10px', height: 44, px: 2.5, color: '#6B7280', border: '1px solid #E5E7EB', flexShrink: 0, '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' } },
  btnConfirm: { textTransform: 'none', fontWeight: 700, fontSize: '13.5px', borderRadius: '10px', height: 44, bgcolor: TEAL, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#0F766E', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' } },
};
