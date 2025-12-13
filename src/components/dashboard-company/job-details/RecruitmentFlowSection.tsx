import React from 'react';
import { Box, Typography, IconButton, Stack, Stepper, Step, StepLabel } from '@mui/material';
import Link from 'next/link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface RecruitmentFlowSectionProps {
  steps: any[];
  interviewHref: string | null;
  onCopyLink: () => void;
}

const RecruitmentFlowSection: React.FC<RecruitmentFlowSectionProps> = ({ steps, interviewHref, onCopyLink }) => {
  return (
    <>
      {/* Recruitment Flow Section */}
      {steps.length > 0 && (
        <Box sx={{
          mb: 4,
          p: 3,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Typography variant="h6" sx={{
            color: '#111827',
            fontWeight: 700,
            mb: 3,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: 6,
              height: 24,
              backgroundColor: '#6366f1',
              borderRadius: '3px'
            }} />
            Recruitment Flow
          </Typography>
          <Box sx={{ px: 2, py: 2 }}>
            <Stepper activeStep={-1} alternativeLabel sx={{
              '& .MuiStepLabel-label': {
                typography: 'body2',
                color: '#4b5563',
                fontSize: '0.875rem',
                fontWeight: 600,
                mt: 1
              },
              '& .MuiStepLabel-iconContainer': {
                '& .MuiSvgIcon-root': {
                  color: '#10b981',
                  fontSize: '2rem',
                  filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                }
              },
              '& .MuiStepConnector-line': {
                borderColor: '#d1d5db',
                borderTopWidth: 2
              }
            }}>
              {steps.map((s: any, i: number) => (
                <Step key={s._id || s.id || i}>
                  <StepLabel
                    optional={s.data?.subtitle ? (
                      <Typography variant="caption" sx={{
                        color: '#9ca3af',
                        display: 'block',
                        mt: 0.5,
                        fontSize: '0.75rem'
                      }}>
                        {s.data.subtitle}
                      </Typography>
                    ) : undefined}
                  >
                    {s.data?.label || `Step ${i + 1}`}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>
      )}

      {/* Interview Link Section */}
      {!!interviewHref && (
        <Box sx={{
          mb: 4,
          p: 3,
          border: '2px solid #10b981',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Box sx={{
            minWidth: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <OpenInNewIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 700, mb: 0.5 }}>
              Interview Link
            </Typography>
            <Typography variant="body2" sx={{
              color: '#166534',
              wordBreak: 'break-all',
              fontSize: '0.85rem'
            }}>
              {interviewHref}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Link href={interviewHref} passHref legacyBehavior>
              <IconButton
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open interview link in new tab"
                sx={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#059669'
                  }
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Link>
            <IconButton
              onClick={onCopyLink}
              aria-label="Copy interview link"
              sx={{
                backgroundColor: 'white',
                border: '2px solid #10b981',
                color: '#10b981',
                '&:hover': {
                  backgroundColor: '#f0fdf4'
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default React.memo(RecruitmentFlowSection);
