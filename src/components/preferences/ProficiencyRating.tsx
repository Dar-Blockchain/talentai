import React from 'react';
import { Box, Typography, Paper, Slider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';

interface ProficiencyRatingProps {
  skills: string[];
  proficiency: Record<string, number>;
  setProf: (skill: string, value: number) => void;
  GREEN_MAIN: string;
}

const ProficiencyRating: React.FC<ProficiencyRatingProps> = ({
  skills,
  proficiency,
  setProf,
  GREEN_MAIN
}) => {
  if (skills.length === 0) return null;

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 8px 25px rgba(0, 255, 157, 0.3)'
        }}>
          <StarIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 700, mb: 2 }}>
          Rate Your Proficiency
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
          Assess your skill level for each selected skill. Be honest about your capabilities to get the most accurate assessment.
        </Typography>
      </Box>

      {/* Proficiency Rating Section */}
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {skills.map(skill => (
          <Paper
            key={skill}
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              border: '2px solid #E0E0E0',
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: GREEN_MAIN,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#333', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon sx={{ color: GREEN_MAIN, fontSize: 24 }} />
                {skill}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                Drag the slider to rate your proficiency level
              </Typography>
            </Box>

            {/* Slider */}
            <Box sx={{ px: 2 }}>
              <Slider
                value={proficiency[skill] ?? 3}
                onChange={(_, v) => setProf(skill, v as number)}
                step={1}
                min={1}
                max={5}
                marks={[
                  { value: 1, label: 'Novice' },
                  { value: 2, label: 'Beginner' },
                  { value: 3, label: 'Intermediate' },
                  { value: 4, label: 'Advanced' },
                  { value: 5, label: 'Expert' }
                ]}
                sx={{
                  color: GREEN_MAIN,
                  height: 8,
                  '& .MuiSlider-track': {
                    border: 'none',
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                  },
                  '& .MuiSlider-rail': {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#E0E0E0'
                  },
                  '& .MuiSlider-thumb': {
                    width: 24,
                    height: 24,
                    backgroundColor: GREEN_MAIN,
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'box-shadow 120ms ease',
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.28)'
                    },
                    '&.Mui-active': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.28)'
                    },
                    '&.Mui-focusVisible': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.28)'
                    }
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: '#E0E0E0',
                    width: 4,
                    height: 4,
                    borderRadius: '50%'
                  },
                  '& .MuiSlider-markActive': {
                    backgroundColor: GREEN_MAIN
                  },
                  '& .MuiSlider-markLabel': {
                    color: '#666',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    mt: 1
                  }
                }}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => {
                  const labels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                  return labels[value - 1] || value;
                }}
              />
            </Box>

            {/* Proficiency Level Display */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: `${GREEN_MAIN}10`,
              border: `1px solid ${GREEN_MAIN}30`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                Current Level:
              </Typography>
              <Typography variant="h6" sx={{ 
                color: GREEN_MAIN,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {(() => {
                  const level = proficiency[skill] ?? 3;
                  const labels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                  return labels[level - 1] || level;
                })()}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Help Text */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        borderRadius: 3, 
        backgroundColor: '#E8F5E8',
        border: '2px solid #C8E6C9',
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto'
      }}>
        <Typography variant="body2" sx={{ color: '#2E7D32', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> Rate your skills honestly based on your actual experience and confidence level. 
          This helps us provide you with the most appropriate assessment and opportunities.
        </Typography>
      </Box>
    </Box>
  );
};

export default ProficiencyRating;
