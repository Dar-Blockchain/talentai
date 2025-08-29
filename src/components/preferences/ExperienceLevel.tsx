import { Box, Typography, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';

interface ExperienceLevelProps {
  experienceLevel: string;
  setExperienceLevel: (level: string) => void;
}

const ExperienceLevel = ({ experienceLevel, setExperienceLevel }: ExperienceLevelProps) => {
  const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

  const levels = [
    { value: 'Entry Level', label: 'Entry Level', description: '0-2 years of experience', icon: '🌱' },
    { value: 'Mid Level', label: 'Mid Level', description: '2-5 years of experience', icon: '🚀' },
    { value: 'Senior', label: 'Senior', description: '5-8 years of experience', icon: '⭐' },
    { value: 'Lead/Expert', label: 'Lead/Expert', description: '8+ years of experience', icon: '🏆' }
  ];

  return (
    <Box sx={{ py: 4 }}>
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
          <AnalyticsIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 700, mb: 2 }}>
          Required Experience Level
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
          Specify the experience level required for the position. This helps us match you with candidates who meet your criteria.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <RadioGroup
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {levels.map(level => (
            <Paper
              key={level.value}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${experienceLevel === level.value ? GREEN_MAIN : '#E0E0E0'}`,
                backgroundColor: experienceLevel === level.value ? `${GREEN_MAIN}10` : 'white',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: GREEN_MAIN,
                  backgroundColor: `${GREEN_MAIN}05`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => setExperienceLevel(level.value)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: experienceLevel === level.value 
                    ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                    : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  {level.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControlLabel
                    value={level.value}
                    control={
                      <Radio
                        sx={{
                          color: experienceLevel === level.value ? GREEN_MAIN : '#666',
                          '&.Mui-checked': { color: GREEN_MAIN }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: experienceLevel === level.value ? GREEN_MAIN : '#333',
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {level.label}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: experienceLevel === level.value ? '#555' : '#666',
                          fontSize: '0.9rem'
                        }}>
                          {level.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ margin: 0, width: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          ))}
        </RadioGroup>
      </Box>

      <Box sx={{ mt: 4, p: 3, borderRadius: 3, backgroundColor: '#F8F9FA', border: '2px solid #E9ECEF', maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#495057', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> Choose the experience level that best matches your requirements. 
          This ensures candidates have the right expertise for your projects.
        </Typography>
      </Box>
    </Box>
  );
};

export default ExperienceLevel;
