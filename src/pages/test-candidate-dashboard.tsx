'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Alert } from '@mui/material';
import { PlayArrowIcon, CodeIcon, PsychologyIcon, CheckCircleIcon } from '@mui/icons-material';
import Link from 'next/link';

const TestCandidateDashboard = () => {
  const testScenarios = [
    {
      title: 'Technical Skills - React',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'React',
      type: 'technical',
      proficiency: 3,
      experienceLevel: 'Mid Level',
      expectedRole: 'React Developer',
      expectedCompany: 'TalentAI',
      icon: <CodeIcon />,
      color: '#8310FF'
    },
    {
      title: 'Technical Skills - Python',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'Python',
      type: 'technical',
      proficiency: 4,
      experienceLevel: 'Senior',
      expectedRole: 'Python Developer',
      expectedCompany: 'TalentAI',
      icon: <CodeIcon />,
      color: '#8310FF'
    },
    {
      title: 'Technical Skills - Rust',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'Rust',
      type: 'technical',
      proficiency: 2,
      experienceLevel: 'Junior',
      expectedRole: 'Rust Developer',
      expectedCompany: 'TalentAI',
      icon: <CodeIcon />,
      color: '#8310FF'
    },
    {
      title: 'Soft Skills - Communication',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'Communication',
      type: 'soft',
      proficiency: 3,
      experienceLevel: 'Mid Level',
      category: 'English',
      expectedRole: 'Communication Professional',
      expectedCompany: 'TalentAI',
      icon: <PsychologyIcon />,
      color: '#00b8d4'
    },
    {
      title: 'Soft Skills - Leadership',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'Leadership',
      type: 'soft',
      proficiency: 4,
      experienceLevel: 'Senior',
      category: 'Team Management',
      expectedRole: 'Leadership Professional',
      expectedCompany: 'TalentAI',
      icon: <PsychologyIcon />,
      color: '#00b8d4'
    },
    {
      title: 'Soft Skills - Problem Solving',
      description: 'From candidate dashboard "Start Test" button',
      skill: 'Problem Solving',
      type: 'soft',
      proficiency: 2,
      experienceLevel: 'Junior',
      category: 'Analytical Thinking',
      expectedRole: 'Problem Solving Professional',
      expectedCompany: 'TalentAI',
      icon: <PsychologyIcon />,
      color: '#00b8d4'
    }
  ];

  const generateTestUrl = (scenario: any) => {
    if (scenario.type === 'technical') {
      return `/interview/hr/?type=technical&skill=${scenario.skill}&proficiency=${scenario.proficiency}&role=${scenario.expectedRole}&company=${scenario.expectedCompany}&difficulty=intermediate&duration=45`;
    } else {
      const params = new URLSearchParams();
      params.append('type', 'soft');
      params.append('skill', scenario.skill);
      params.append('proficiency', scenario.proficiency.toString());
      params.append('role', scenario.expectedRole);
      params.append('company', scenario.expectedCompany);
      
      if (scenario.skill === 'Communication') {
        params.append('language', scenario.category);
      } else {
        params.append('subcategory', scenario.category);
      }
      
      return `/interview/hr/?${params.toString()}`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Candidate Dashboard Test
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Test that "Start Test" button in candidate dashboard works with auto-generated roles and TalentAI company
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>✅ Candidate Dashboard Updated:</strong> "Start Test" button now uses the same logic as the configuration builder - auto-generates roles and uses "TalentAI" as company for technical and soft skills.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {testScenarios.map((scenario, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '8px', 
                  bgcolor: `${scenario.color}20`, 
                  color: scenario.color,
                  mr: 2
                }}>
                  {scenario.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {scenario.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {scenario.type === 'technical' ? 'Technical Skills' : 'Soft Skills'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {scenario.description}
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
                  Skill: {scenario.skill}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Role: {scenario.expectedRole}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Company: {scenario.expectedCompany}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  Proficiency: {scenario.proficiency}
                </Typography>
              </Box>

              <Box sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Generated URL:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                  color: 'text.secondary'
                }}>
                  {generateTestUrl(scenario)}
                </Typography>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  component={Link}
                  href={generateTestUrl(scenario)}
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  sx={{ 
                    py: 1.5,
                    background: `linear-gradient(45deg, ${scenario.color} 30%, ${scenario.color}80 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${scenario.color} 30%, ${scenario.color}90 90%)`,
                    }
                  }}
                >
                  Test {scenario.skill} {scenario.type === 'technical' ? 'Technical' : 'Soft Skills'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'info.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          🎯 Candidate Dashboard Integration
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Updated Components:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • <code>src/pages/dashboard/candidate.tsx</code> - handleStartTest function
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • <code>src/components/dashboard-candidate/TestSelectionDialog.tsx</code> - test submission logic
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • Both now use the same logic as the configuration builder
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Auto-Generated Roles:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Technical Skills: "{skill} Developer" (e.g., "React Developer")
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Soft Skills: "{skill} Professional" (e.g., "Communication Professional")
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • Company: Always "TalentAI" for technical and soft skills
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Consistent Behavior:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Candidate dashboard "Start Test" button
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Test selection dialog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Technical skills configuration component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • All use the same URL generation logic
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          ✅ Benefits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Consistent Experience:</strong> All "Start Test" buttons work the same way across the platform<br/>
          <strong>Auto-Generated Roles:</strong> No need to manually specify roles - they're generated from skills<br/>
          <strong>TalentAI Branding:</strong> All technical and soft skills tests show TalentAI as the company<br/>
          <strong>Simplified URLs:</strong> Clean, consistent URL structure across all entry points
        </Typography>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          component={Link}
          href="/dashboard/candidate"
          variant="outlined"
          size="large"
          startIcon={<CheckCircleIcon />}
          sx={{ px: 4, py: 1.5 }}
        >
          Go to Candidate Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default TestCandidateDashboard;
