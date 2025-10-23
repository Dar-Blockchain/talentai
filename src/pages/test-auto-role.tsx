'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Alert } from '@mui/material';
import { PlayArrowIcon, CodeIcon, PsychologyIcon } from '@mui/icons-material';
import Link from 'next/link';

const TestAutoRole = () => {
  const testUrls = [
    {
      title: 'Rust Technical Test',
      description: 'Should auto-generate "Rust Developer" role',
      url: '/interview/hr?type=technical&skill=Rust&proficiency=3&difficulty=intermediate&duration=45',
      icon: <CodeIcon />,
      color: '#8310FF',
      expectedRole: 'Rust Developer',
      skill: 'Rust'
    },
    {
      title: 'Python Technical Test',
      description: 'Should auto-generate "Python Developer" role',
      url: '/interview/hr?type=technical&skill=Python&proficiency=4&difficulty=advanced&duration=60',
      icon: <CodeIcon />,
      color: '#8310FF',
      expectedRole: 'Python Developer',
      skill: 'Python'
    },
    {
      title: 'React Technical Test',
      description: 'Should auto-generate "React Developer" role',
      url: '/interview/hr?type=technical&skill=React&proficiency=3&difficulty=intermediate&duration=45',
      icon: <CodeIcon />,
      color: '#8310FF',
      expectedRole: 'React Developer',
      skill: 'React'
    },
    {
      title: 'Communication Soft Skills',
      description: 'Should auto-generate "Communication Professional" role',
      url: '/interview/hr?type=soft&skill=Communication&proficiency=3&language=English',
      icon: <PsychologyIcon />,
      color: '#00b8d4',
      expectedRole: 'Communication Professional',
      skill: 'Communication'
    },
    {
      title: 'Leadership Soft Skills',
      description: 'Should auto-generate "Leadership Professional" role',
      url: '/interview/hr?type=soft&skill=Leadership&proficiency=4&subcategory=Team Management',
      icon: <PsychologyIcon />,
      color: '#00b8d4',
      expectedRole: 'Leadership Professional',
      skill: 'Leadership'
    },
    {
      title: 'Custom Role Override',
      description: 'Should use custom role when provided',
      url: '/interview/hr?type=technical&skill=Rust&role=Senior Rust Engineer&proficiency=4&difficulty=advanced&duration=60',
      icon: <CodeIcon />,
      color: '#10b981',
      expectedRole: 'Senior Rust Engineer',
      skill: 'Rust'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Auto-Generated Role Test
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Test that target roles are automatically generated based on the selected skill
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>✅ Auto-Role Generation:</strong> Target roles are now automatically generated based on the selected skill (e.g., "Rust" → "Rust Developer").
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
                    Skill: {test.skill}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {test.description}
              </Typography>

              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Expected Role Generation:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  {test.skill} → {test.expectedRole}
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
                  Test {test.skill} Role Generation
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'info.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          🔧 How Auto-Role Generation Works
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Technical Skills:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • "Rust" → "Rust Developer"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • "Python" → "Python Developer"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • "React" → "React Developer"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • "Machine Learning" → "Machine Learning Developer"
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Soft Skills:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • "Communication" → "Communication Professional"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • "Leadership" → "Leadership Professional"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • "Problem Solving" → "Problem Solving Professional"
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Custom Override:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • If you provide a custom role in the URL, it will use that instead of auto-generating
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          ✅ Benefits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Automatic:</strong> No need to manually specify roles for each skill<br/>
          <strong>Consistent:</strong> Standardized role naming across all skills<br/>
          <strong>Flexible:</strong> Can still override with custom roles when needed<br/>
          <strong>User-Friendly:</strong> Simpler URLs and configuration
        </Typography>
      </Box>
    </Container>
  );
};

export default TestAutoRole;
