import React from 'react';
import { Box, Typography, Button, Divider, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { type RootState } from '@/store/store';
import { SectionCard, GREEN, GREEN_DARK, GREEN_LIGHT, GREEN_BORDER } from './SkillPanelShared';

const FEATURES = [
  'AI adapts questions to your level',
  'Camera & voice recording',
  'Real-time skill coverage tracker',
  'Detailed report after completion',
];

interface SkillStartPanelProps {
  skill: string;
  proficiency: string | null;
  duration: number;
  onStartInterview?: () => void;
}

export default function SkillStartPanel({ skill, proficiency, duration, onStartInterview }: SkillStartPanelProps) {
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const router   = useRouter();

  const isAuthenticated = !!authUser && !!onStartInterview;

  return (
    <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, position: { md: 'sticky' }, top: { md: 24 } }}>
      <SectionCard>
        {isAuthenticated ? (
          <>
            <Chip
              label="Ready to assess"
              size="small"
              sx={{
                fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem',
                bgcolor: 'rgba(106,211,156,0.1)', color: '#10453F',
                border: '1px solid rgba(106,211,156,0.3)', mb: 1.5,
              }}
            />

            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', mb: 0.5 }}>
              Start your assessment
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', mb: 2.5, lineHeight: 1.6 }}>
              Prove your <strong>{skill}</strong> skills with an AI-powered {duration}-minute assessment.
            </Typography>

            {FEATURES.map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 15, color: GREEN, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#374151' }}>
                  {item}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={onStartInterview}
              startIcon={<PlayArrowIcon />}
              sx={{
                bgcolor: GREEN, color: '#fff', fontWeight: 700, fontFamily: 'Poppins',
                fontSize: '0.95rem', py: 1.5, borderRadius: '12px',
                textTransform: 'none', boxShadow: 'none',
                '&:hover': { bgcolor: GREEN_DARK, boxShadow: 'none' },
              }}
            >
              Start Assessment
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', mb: 0.5 }}>
              Sign in to begin
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', mb: 2.5, lineHeight: 1.6 }}>
              Create a free account or log in to start your <strong>{skill}</strong> skill assessment.
            </Typography>

            {[
              { num: 1, label: 'Create or log in to your account', sub: 'Takes less than a minute' },
              { num: 2, label: 'Allow camera & microphone access',  sub: 'Required for voice interview' },
              { num: 3, label: 'Complete the AI interview',         sub: `${duration} minutes, voice-based` },
            ].map(({ num, label, sub }) => (
              <Box key={num} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.75 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, bgcolor: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: '#10453F' }}>
                    {num}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{label}</Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#9CA3AF' }}>{sub}</Typography>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
              sx={{
                bgcolor: GREEN, color: '#fff', fontWeight: 700, fontFamily: 'Poppins',
                fontSize: '0.95rem', py: 1.5, borderRadius: '12px',
                textTransform: 'none', boxShadow: 'none',
                '&:hover': { bgcolor: GREEN_DARK, boxShadow: 'none' },
              }}
            >
              Get Started
            </Button>
          </>
        )}
      </SectionCard>
    </Box>
  );
}
