import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BugReportIcon from '@mui/icons-material/BugReport';

interface ReviewProps {
  userType: 'candidate' | 'company' | '';
  firstName: string;
  lastName: string;
  skills: string[];
  proficiency: Record<string, number>;
  companyDetails: {
    name: string;
    industry: string;
    size: string;
    location: string;
  };
  requiredSkills: string[];
  experienceLevel: string;
  hederaExp: 'yes' | 'no' | '';
  GREEN_MAIN: string;
}

const Review: React.FC<ReviewProps> = ({
  userType,
  firstName,
  lastName,
  skills,
  proficiency,
  companyDetails,
  requiredSkills,
  experienceLevel,
  hederaExp,
  GREEN_MAIN
}) => {
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
          <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 700, mb: 2 }}>
          Review Your Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
          Please review all the information below before proceeding. You can go back to make changes if needed.
        </Typography>
      </Box>

      {/* Profile Type Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Chip
          label={userType === 'company' ? 'Company Profile' : 'Candidate Profile'}
          sx={{
            background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
          }}
        />
      </Box>

      {/* Review Content */}
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {userType === 'company' ? (
          // Company Review
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Company Details Section */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <BusinessIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Company Details
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    Company Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {companyDetails.name || 'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    Industry
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {companyDetails.industry || 'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    Company Size
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {companyDetails.size || 'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {companyDetails.location || 'Not specified'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Required Skills Section */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <DesignServicesIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Required Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requiredSkills.length > 0 ? (
                  requiredSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      sx={{
                        background: GREEN_MAIN,
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { background: GREEN_MAIN }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                    No skills selected
                  </Typography>
                )}
              </Box>
            </Paper>
            {/* Hedera Experience Section */}
            {hederaExp === 'yes' && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: '2px solid #02E2FF20', background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <BugReportIcon sx={{ color: '#02E2FF', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    Hedera Experience Required
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #02E2FF15 0%, #00FFC315 100%)',
                  border: '1px solid #02E2FF30'
                }}>
                  <CheckCircleIcon sx={{ color: '#02E2FF', fontSize: 24 }} />
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    Hedera experience verification completed
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        ) : (
          // Candidate Review
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Personal Details Section */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <PersonIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Personal Details
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    First Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {firstName || 'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    Last Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    {lastName || 'Not specified'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Skills Section */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CodeIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Selected Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      sx={{
                        background: GREEN_MAIN,
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { background: GREEN_MAIN }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                    No skills selected
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Proficiency Levels Section */}
            {skills.length > 0 && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StarIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                    Proficiency Levels
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {skills.map(skill => (
                    <Box key={skill} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: '#F8F9FA',
                      border: '1px solid #E9ECEF'
                    }}>
                      <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
                        {skill}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <Box
                              key={level}
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: level <= (proficiency[skill] || 1) ? GREEN_MAIN : '#E9ECEF',
                                transition: 'all 0.2s ease'
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, ml: 1 }}>
                          {proficiency[skill] || 1}/5
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Hedera Experience Section */}
            {hederaExp === 'yes' && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: '2px solid #02E2FF20', background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <BugReportIcon sx={{ color: '#02E2FF', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    Hedera Experience
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #02E2FF15 0%, #00FFC315 100%)',
                  border: '1px solid #02E2FF30'
                }}>
                  <CheckCircleIcon sx={{ color: '#02E2FF', fontSize: 24 }} />
                  <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                    Hedera experience verification completed
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Summary Message */}
      <Box sx={{ 
        mt: 6, 
        p: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        border: '2px solid #DEE2E6',
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto'
      }}>
        <Typography variant="body1" sx={{ color: '#495057', lineHeight: 1.6 }}>
          <strong>🎯 Ready to proceed?</strong> All your information has been captured. 
          Click the button below to {userType === 'company' ? 'access your dashboard' : 'start your assessment'}.
        </Typography>
      </Box>
    </Box>
  );
};

export default Review;
