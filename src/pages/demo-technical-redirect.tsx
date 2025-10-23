'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { CodeIcon, PlayArrowIcon, LinkIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

const TechnicalRedirectDemo = () => {
  const router = useRouter();
  const [config, setConfig] = useState({
    skill: 'React',
    skills: 'React,JavaScript,TypeScript',
    proficiency: '4',
    role: 'Senior React Developer',
    company: 'TechCorp',
    difficulty: 'advanced',
    duration: '45'
  });

  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const generateUrl = () => {
    const params = new URLSearchParams({
      type: 'technical',
      skill: config.skill,
      skills: config.skills,
      proficiency: config.proficiency,
      role: config.role,
      company: config.company,
      difficulty: config.difficulty,
      duration: config.duration
    });

    const url = `/interview/hr?${params.toString()}`;
    setGeneratedUrl(url);
    return url;
  };

  const testRedirect = () => {
    const url = generateUrl();
    router.push(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CodeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Technical Skills URL Redirect Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test how the technical skills configuration redirects to the HR interview page with proper URL parameters
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Configure Technical Skills Assessment
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Skill"
              value={config.skill}
              onChange={(e) => handleConfigChange('skill', e.target.value)}
              placeholder="e.g., React"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="All Skills (comma-separated)"
              value={config.skills}
              onChange={(e) => handleConfigChange('skills', e.target.value)}
              placeholder="e.g., React,JavaScript,TypeScript"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Role"
              value={config.role}
              onChange={(e) => handleConfigChange('role', e.target.value)}
              placeholder="e.g., Senior React Developer"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company"
              value={config.company}
              onChange={(e) => handleConfigChange('company', e.target.value)}
              placeholder="e.g., TechCorp"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Proficiency Level</InputLabel>
              <Select
                value={config.proficiency}
                onChange={(e) => handleConfigChange('proficiency', e.target.value)}
                label="Proficiency Level"
              >
                <MenuItem value="1">Entry Level (1-2 years)</MenuItem>
                <MenuItem value="2">Junior (2-3 years)</MenuItem>
                <MenuItem value="3">Mid Level (3-5 years)</MenuItem>
                <MenuItem value="4">Senior (5-8 years)</MenuItem>
                <MenuItem value="5">Expert (8+ years)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={config.difficulty}
                onChange={(e) => handleConfigChange('difficulty', e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Duration (minutes)</InputLabel>
              <Select
                value={config.duration}
                onChange={(e) => handleConfigChange('duration', e.target.value)}
                label="Duration (minutes)"
              >
                <MenuItem value="15">15 minutes</MenuItem>
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="45">45 minutes</MenuItem>
                <MenuItem value="60">60 minutes</MenuItem>
                <MenuItem value="90">90 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={testRedirect}
            startIcon={<PlayArrowIcon />}
            size="large"
          >
            Test Redirect to HR Interview
          </Button>
          <Button
            variant="outlined"
            onClick={generateUrl}
            startIcon={<LinkIcon />}
            size="large"
          >
            Generate URL
          </Button>
        </Box>
      </Paper>

      {generatedUrl && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Generated URL:
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'white', 
            borderRadius: 1, 
            border: '1px solid #e0e0e0',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            wordBreak: 'break-all',
            mb: 2
          }}>
            {generatedUrl}
          </Box>
          <Button
            variant="outlined"
            onClick={copyToClipboard}
            size="small"
          >
            Copy URL
          </Button>
        </Paper>
      )}

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> When you click "Test Redirect", the system will:
          <br />1. Generate URL parameters from your configuration
          <br />2. Redirect to the HR interview page with technical skills parameters
          <br />3. The HR interview page will automatically detect the technical interview type
          <br />4. Display the appropriate technical skills assessment interface
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          URL Parameters Explained:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>type=technical</strong> - Sets interview type to technical skills
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>skill=React</strong> - Primary skill for the assessment
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>skills=React,JavaScript,TypeScript</strong> - All skills to assess
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>proficiency=4</strong> - Experience level (1-5)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>role=Senior React Developer</strong> - Target job role
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>company=TechCorp</strong> - Target company
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>difficulty=advanced</strong> - Question difficulty level
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>duration=45</strong> - Interview duration in minutes
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TechnicalRedirectDemo;
