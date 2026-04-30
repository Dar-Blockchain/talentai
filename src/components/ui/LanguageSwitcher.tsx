import React, { useState } from 'react';
import {
  Box, Button, Menu, MenuItem, Typography, Divider,
} from '@mui/material';
import LanguageOutlined   from '@mui/icons-material/LanguageOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import CheckOutlined      from '@mui/icons-material/CheckOutlined';
import { useLanguage, type LanguageOption } from '@/hooks/useLanguage';

interface Props {
  /** 'icon' — globe + chevron only; 'full' — includes label text (default) */
  variant?: 'icon' | 'full';
  /** Size passed through to MUI Button */
  size?: 'small' | 'medium';
}

const LanguageSwitcher: React.FC<Props> = ({ variant = 'full', size = 'small' }) => {
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const current = languages.find(l => l.code === currentLang) ?? languages[0];

  const open  = (e: React.MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const select = async (lang: LanguageOption) => {
    close();
    if (lang.code !== currentLang) await changeLanguage(lang.code);
  };

  return (
    <>
      <Button
        size={size}
        onClick={open}
        startIcon={<LanguageOutlined sx={{ fontSize: 16 }} />}
        endIcon={<ExpandMoreOutlined sx={{ fontSize: 14, transition: 'transform 0.2s', transform: anchor ? 'rotate(180deg)' : 'none' }} />}
        sx={{
          textTransform: 'none',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          fontSize: size === 'small' ? 13 : 14,
          color: '#374151',
          bgcolor: 'transparent',
          border: '1px solid #E5E7EB',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          gap: 0.25,
          '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
        }}
      >
        <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
          <img src={`https://flagcdn.com/w20/${current.flag}.png`} srcSet={`https://flagcdn.com/w40/${current.flag}.png 2x`} width={20} height={14} alt={current.flag} style={{ borderRadius: 2, display: 'block' }} />
        </Box>
        {variant === 'full' && (
          <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
            {current.label}
          </Typography>
        )}
      </Button>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        disableScrollLock
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5, minWidth: 160,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Language
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />

        {languages.map(lang => (
          <MenuItem
            key={lang.code}
            onClick={() => select(lang)}
            sx={{
              px: 1.5, py: 1, borderRadius: 1.5, mx: 0.5,
              display: 'flex', alignItems: 'center', gap: 1.5,
              fontFamily: 'Poppins, sans-serif',
              bgcolor: lang.code === currentLang ? '#F5F3FF' : 'transparent',
              '&:hover': { bgcolor: lang.code === currentLang ? '#EDE9FE' : '#F9FAFB' },
            }}
          >
            <img src={`https://flagcdn.com/w20/${lang.flag}.png`} srcSet={`https://flagcdn.com/w40/${lang.flag}.png 2x`} width={20} height={14} alt={lang.flag} style={{ borderRadius: 2, display: 'block' }} />
            <Typography sx={{ flex: 1, fontSize: 13, fontWeight: lang.code === currentLang ? 600 : 400, color: '#111827' }}>
              {lang.label}
            </Typography>
            {lang.code === currentLang && (
              <CheckOutlined sx={{ fontSize: 14, color: '#7C3AED' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
