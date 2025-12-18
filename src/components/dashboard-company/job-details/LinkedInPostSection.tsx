import React from 'react';
import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

interface LinkedInPostSectionProps {
  linkedinPost: any;
}

const LinkedInPostSection: React.FC<LinkedInPostSectionProps> = ({ linkedinPost }) => {
  if (!linkedinPost?.finalPost) return null;

  return (
    <Accordion
      sx={{
        mb: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        borderRadius: '16px !important',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        backgroundColor: 'white'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#0a66c2' }} />}
        sx={{
          backgroundColor: 'linear-gradient(to right, #eff6ff, white)',
          borderBottom: '1px solid #e5e7eb',
          minHeight: 64,
          '&:hover': { backgroundColor: '#f9fafb' },
          '& .MuiAccordionSummary-content': { my: 2 }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LinkedInIcon sx={{ color: '#0a66c2', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
              LinkedIn Post
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Auto-generated professional job posting
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, backgroundColor: '#fafbfc' }}>
        <Box sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#0a66c2',
            borderRadius: '10px'
          }
        }}>
          <Typography variant="body2" sx={{
            color: '#374151',
            whiteSpace: 'pre-line',
            lineHeight: 1.9,
            fontSize: '0.9rem',
            fontFamily: '"Segoe UI", Roboto, sans-serif'
          }}>
            {linkedinPost.finalPost}
          </Typography>
        </Box>
        {linkedinPost.hashtags && linkedinPost.hashtags.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mb: 1, display: 'block' }}>
              Hashtags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {linkedinPost.hashtags.map((tag: string, idx: number) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    border: '1px solid #c7d2fe',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#c7d2fe',
                      transform: 'translateY(-1px)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(LinkedInPostSection);
