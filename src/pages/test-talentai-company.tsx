'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Alert } from '@mui/material';
import { PlayArrowIcon, CodeIcon, PsychologyIcon, CheckCircleIcon } from '@mui/icons-material';
import Link from 'next/link';

const TestTalentAICompany = () => {
  const testUrls = [
    {
      title: 'Rust Technical Test',
      description: 'Should use "TalentAI" as company',
      url: '/interview/hr?type=technical&skill=Rust&proficiency=3&difficulty=intermediate&duration=45',
      icon: <CodeIcon />,
      color: '#8310FF',
      expectedCompany: 'TalentAI',
      expectedRole: 'Rust Developer',
      interviewType: 'Technical'
    },
    {
      title: 'Python Technical Test',
      description: 'Should use "TalentAI" as company',
      url: '/interview/hr?type=technical&skill=Python&proficiency=4&difficulty=advanced&duration=60',
      icon: <CodeIcon />,
      color: '#8310FF',
      expectedCompany: 'TalentAI',
      expectedRole: 'Python Developer',
      interviewType: 'Technical'
    },
    {
      title: 'Communication Soft Skills',
      description: 'Should use "TalentAI" as company',
      url: '/interview/hr?type=soft&skill=Communication&proficiency=3&language=English',
      icon: <PsychologyIcon />,
      color: '#00b8d4',
      expectedCompany: 'TalentAI',
      expectedRole: 'Communication Professional',
      interviewType: 'Soft Skills'
    },
    {
      title: 'Leadership Soft Skills',
      description: 'Should use "TalentAI" as company',
      url: '/interview/hr?type=soft&skill=Leadership&proficiency=4&subcategory=Team Management',
      icon: <PsychologyIcon />,
      color: '#00b8d4',
      expectedCompany: 'TalentAI',
      expectedRole: 'Leadership Professional',
      interviewType: 'Soft Skills'
    },
    {
      title: 'HR Interview Test',
      description: 'Should use custom company or default',
      url: '/interview/hr?type=hr&role=Software Engineer&company=TechCorp',
      icon: <CheckCircleIcon />,
      color: '#10b981',
      expectedCompany: 'TechCorp',
      expectedRole: 'Software Engineer',
      interviewType: 'HR'
    },
    {
      title: 'HR Interview Default',
      description: 'Should use "Target Company" as default',
      url: '/interview/hr?type=hr&role=Software Engineer',
      icon: <CheckCircleIcon />,
      color: '#10b981',
      expectedCompany: 'Target Company',
      expectedRole: 'Software Engineer',
      interviewType: 'HR'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          TalentAI Company Test
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Test that technical and soft skills interviews always use "TalentAI" as the target company
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>✅ TalentAI Company:</strong> Technical and soft skills interviews now always use "TalentAI" as the target company.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {testUrls.map((test, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '8px', 
                  bgcolor: `${test.color}20`, 
                  color: test.color,
                  mr: 2
                }}>
                  {test.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {test.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {test.interviewType}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {test.description}
              </Typography>

              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Expected Configuration:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Company: {test.expectedCompany}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  Role: {test.expectedRole}
                </Typography>
              </Box>

              <Box sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  URL:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                  color: 'text.secondary'
                }}>
                  {test.url}
                </Typography>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  component={Link}
                  href={test.url}
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  sx={{ 
                    py: 1.5,
                    background: `linear-gradient(45deg, ${test.color} 30%, ${test.color}80 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${test.color} 30%, ${test.color}90 90%)`,
                    }
                  }}
                >
                  Test {test.interviewType}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'info.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          🏢 Company Assignment Rules
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Technical Skills Interviews:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Always use "TalentAI" as target company
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Ignores any company parameter in URL
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • Example: /interview/hr?type=technical&skill=Rust&company=Google → Company = "TalentAI"
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Soft Skills Interviews:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Always use "TalentAI" as target company
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Ignores any company parameter in URL
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • Example: /interview/hr?type=soft&skill=Communication&company=Microsoft → Company = "TalentAI"
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>HR Interviews:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Use company parameter from URL if provided
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Fall back to "Target Company" if no company specified
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Example: /interview/hr?type=hr&company=TechCorp → Company = "TechCorp"
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          ✅ Benefits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Consistent Branding:</strong> All technical and soft skills assessments show TalentAI as the company<br/>
          <strong>Simplified URLs:</strong> No need to specify company for technical/soft skills<br/>
          <strong>Flexible HR:</strong> HR interviews can still use custom companies<br/>
          <strong>Professional Image:</strong> Maintains consistent company identity across assessments
        </Typography>
      </Box>
    </Container>
  );
};

export default TestTalentAICompany;
