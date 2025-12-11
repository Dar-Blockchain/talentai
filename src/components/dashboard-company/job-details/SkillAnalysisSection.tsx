import React from 'react';
import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface SkillAnalysisSectionProps {
  skillAnalysis: any;
}

const SkillAnalysisSection: React.FC<SkillAnalysisSectionProps> = ({ skillAnalysis }) => {
  if (!skillAnalysis) return null;

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
        expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
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
            <TrendingUpIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
              Skill Analysis
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Technology stack and learning path insights
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, backgroundColor: '#fafbfc' }}>
        {skillAnalysis.skillSummary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', fontWeight: 600, mb: 1 }}>
              Stack Complexity: <Chip label={skillAnalysis.skillSummary.stackComplexity} size="small" sx={{ ml: 1 }} />
            </Typography>
            {skillAnalysis.skillSummary.mainTechnologies?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Main Technologies</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skillAnalysis.skillSummary.mainTechnologies.map((tech: string, idx: number) => (
                    <Chip key={idx} label={tech} size="small" sx={{ backgroundColor: '#dbeafe', color: '#1e40af' }} />
                  ))}
                </Box>
              </Box>
            )}
            {skillAnalysis.skillSummary.complementarySkills?.filter(Boolean).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Complementary Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skillAnalysis.skillSummary.complementarySkills.filter(Boolean).map((skill: string, idx: number) => (
                    <Chip key={idx} label={skill} size="small" sx={{ backgroundColor: '#d1fae5', color: '#065f46' }} />
                  ))}
                </Box>
              </Box>
            )}
            {skillAnalysis.skillSummary.learningPath?.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Learning Path</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skillAnalysis.skillSummary.learningPath.map((path: string, idx: number) => (
                    <Chip key={idx} label={path} size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e' }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(SkillAnalysisSection);
