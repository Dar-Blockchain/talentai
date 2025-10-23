'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Chip } from '@mui/material';
import { CodeIcon, PlayArrowIcon, SettingsIcon } from '@mui/icons-material';
import Link from 'next/link';

const TechnicalHRTestPage = () => {
  const testConfigurations = [
    {
      title: 'React Developer Assessment',
      description: 'Technical skills interview for React developers',
      url: '/interview/hr?type=technical&skill=React&skills=React,JavaScript,TypeScript&proficiency=4&role=Senior React Developer&company=TechCorp&difficulty=advanced&duration=45',
      skills: ['React', 'JavaScript', 'TypeScript'],
      level: 'Senior',
      duration: '45 minutes'
    },
    {
      title: 'Full Stack Developer Assessment',
      description: 'Comprehensive technical interview for full-stack developers',
      url: '/interview/hr?type=technical&skill=Node.js&skills=Node.js,React,MongoDB&proficiency=3&role=Full Stack Developer&company=StartupCo&difficulty=intermediate&duration=60',
      skills: ['Node.js', 'React', 'MongoDB'],
      level: 'Mid-Level',
      duration: '60 minutes'
    },
    {
      title: 'Python Developer Assessment',
      description: 'Technical skills interview for Python developers',
      url: '/interview/hr?type=technical&skill=Python&skills=Python,Django,SQL&proficiency=3&role=Python Developer&company=DataCorp&difficulty=intermediate&duration=30',
      skills: ['Python', 'Django', 'SQL'],
      level: 'Mid-Level',
      duration: '30 minutes'
    },
    {
      title: 'DevOps Engineer Assessment',
      description: 'Technical interview for DevOps and infrastructure roles',
      url: '/interview/hr?type=technical&skill=Docker&skills=Docker,Kubernetes,AWS&proficiency=4&role=DevOps Engineer&company=CloudTech&difficulty=advanced&duration=60',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      level: 'Senior',
      duration: '60 minutes'
    },
    {
      title: 'Machine Learning Engineer',
      description: 'Technical assessment for ML/AI engineers',
      url: '/interview/hr?type=technical&skill=Machine Learning&skills=Python,TensorFlow,Data Science&proficiency=4&role=ML Engineer&company=AITech&difficulty=expert&duration=90',
      skills: ['Python', 'TensorFlow', 'Data Science'],
      level: 'Expert',
      duration: '90 minutes'
    },
    {
      title: 'Custom Technical Assessment',
      description: 'Configure your own technical skills interview',
      url: '/interview/hr',
      skills: ['Customizable'],
      level: 'Any',
      duration: 'Configurable'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <CodeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Technical Skills HR Interview
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Test the integrated technical skills evaluation system within the HR interview framework
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {testConfigurations.map((config, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {config.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {config.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Skills to Assess:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {config.skills.map((skill, skillIndex) => (
                    <Chip
                      key={skillIndex}
                      label={skill}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Level: ${config.level}`}
                    color="secondary"
                    variant="filled"
                    size="small"
                  />
                  <Chip
                    label={`Duration: ${config.duration}`}
                    color="info"
                    variant="filled"
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  component={Link}
                  href={config.url}
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  sx={{ py: 1.5 }}
                >
                  Start {config.title}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                1. Configure Skills
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select technical skills, proficiency level, and interview parameters
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <PlayArrowIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                2. Start Interview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI generates technical questions based on your configuration
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <CodeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                3. Get Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive detailed technical skills assessment and recommendations
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Real-time Technical Assessment</strong> - AI evaluates technical responses in real-time
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Adaptive Questioning</strong> - Questions adjust based on your skill level
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Comprehensive Analysis</strong> - Detailed scoring and recommendations
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Multiple Skills Support</strong> - JavaScript, Python, React, Node.js, and more
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Proficiency Levels</strong> - Entry to Expert level assessments
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Job-Specific Questions</strong> - Tailored to specific roles and companies
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TechnicalHRTestPage;
