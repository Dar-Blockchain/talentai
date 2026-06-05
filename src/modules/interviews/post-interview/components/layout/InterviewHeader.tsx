import React from 'react';
import { Box, Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { type RootState } from '@/store/store';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import UserAvatar from '@/modules/shared/layouts/shared/UserAvatar';

const InterviewHeader: React.FC = () => {
  const router = useRouter();
  const user   = useSelector((state: RootState) => state.user.connectedUser.user);

  return (
    <Box
      component="header"
      sx={{
        height: 60,
        bgcolor: '#fff',
        borderBottom: '1px solid #d1f5e7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Image
          src="/images/home/logo.svg"
          alt="TalentAI"
          width={130}
          height={34}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LanguageSwitcher variant="icon" size="small" />

        {user ? (
          <UserAvatar />
        ) : (
          <>
            <Button
              onClick={() => router.push('/login')}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '10px',
                borderColor: '#d1f5e7',
                color: '#6b7280',
                px: 2,
                '&:hover': { borderColor: '#6AD39C', color: '#6AD39C', bgcolor: 'rgba(106,211,156,0.04)' },
              }}
            >
              Log in
            </Button>
            <Button
              onClick={() => router.push('/register')}
              variant="contained"
              size="small"
              disableElevation
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '10px',
                bgcolor: '#6AD39C',
                color: '#fff',
                px: 2,
                '&:hover': { bgcolor: '#10453F' },
              }}
            >
              Sign up
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default InterviewHeader;
