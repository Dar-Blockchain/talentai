import React from 'react';
import { Button, Box } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

interface AvatarCustomizerLinkProps {
  variant?: 'button' | 'icon' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  children?: React.ReactNode;
}

export default function AvatarCustomizerLink({
  variant = 'button',
  size = 'medium',
  color = 'primary',
  children,
}: AvatarCustomizerLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/avatar-customizer');
  };

  if (variant === 'icon') {
    return (
      <Box
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          p: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,255,157,0.1)',
            transform: 'scale(1.1)',
          },
        }}
      >
        <PersonIcon
          sx={{
            fontSize: size === 'small' ? '20px' : size === 'large' ? '32px' : '24px',
            color: color === 'primary' ? '#00FF9D' : color === 'secondary' ? '#00C853' : 'inherit',
          }}
        />
      </Box>
    );
  }

  if (variant === 'text') {
    return (
      <Box
        component="span"
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          color: color === 'primary' ? '#00FF9D' : color === 'secondary' ? '#00C853' : 'inherit',
          textDecoration: 'underline',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          '&:hover': {
            color: color === 'primary' ? '#00C853' : color === 'secondary' ? '#00FF9D' : 'inherit',
          },
        }}
      >
        {children || 'Customize Avatar'}
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<PersonIcon />}
      onClick={handleClick}
      size={size}
      sx={{
        background: 'linear-gradient(45deg, #00FF9D, #00C853)',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: 2,
        px: 3,
        py: 1,
        '&:hover': {
          background: 'linear-gradient(45deg, #00C853, #00FF9D)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,255,157,0.3)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      {children || 'Customize Avatar'}
    </Button>
  );
} 