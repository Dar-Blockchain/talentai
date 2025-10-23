'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { CodeIcon, SettingsIcon, PlayArrowIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

interface TechnicalSkillsConfigProps {
  onStartInterview: (config: any) => void;
  initialConfig?: any;
}

const TECHNICAL_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Machine Learning', 'Data Science', 'DevOps'
];

const PROFICIENCY_LEVELS = [
  { value: '1', label: 'Entry Level (1-2 years)' },
  { value: '2', label: 'Junior (2-3 years)' },
  { value: '3', label: 'Mid Level (3-5 years)' },
  { value: '4', label: 'Senior (5-8 years)' },
  { value: '5', label: 'Expert (8+ years)' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' }
];

export default function TechnicalSkillsConfig({ onStartInterview, initialConfig }: TechnicalSkillsConfigProps) {
  const router = useRouter();
  const [config, setConfig] = useState({
    skill: initialConfig?.skill || 'JavaScript',
    proficiency: initialConfig?.proficiency || '3',
    role: initialConfig?.role || 'Software Developer',
    company: initialConfig?.company || 'TechCorp',
    difficulty: initialConfig?.difficulty || 'intermediate',
    duration: initialConfig?.duration || '45',
    language: initialConfig?.language || 'en'
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([config.skill]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStartInterview = () => {
    // Build URL parameters for the HR interview page
    const params = new URLSearchParams({
      type: 'technical',
      skill: selectedSkills[0], // Use first selected skill as primary
      proficiency: config.proficiency,
      role: config.role,
      company: config.company,
      difficulty: config.difficulty,
      duration: config.duration,
      language: config.language
    });

    // Add additional skills as comma-separated values
    if (selectedSkills.length > 1) {
      params.set('skills', selectedSkills.join(','));
    }

    // Redirect to HR interview page with technical parameters
    const url = `/interview/hr/?${params.toString()}`;
    router.push(url);
  };

  return (
    <Card elevation={3} sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CodeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Technical Skills Assessment
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure your technical skills interview to evaluate specific competencies and problem-solving abilities.
        </Typography>

        <Grid container spacing={3}>
          {/* Skills Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Select Technical Skills
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TECHNICAL_SKILLS.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={selectedSkills.includes(skill) ? 'primary' : 'default'}
                    variant={selectedSkills.includes(skill) ? 'filled' : 'outlined'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected: {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}
              </Typography>
            </Paper>
          </Grid>

          {/* Configuration Fields */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Target Role"
              value={config.role}
              onChange={(e) => handleConfigChange('role', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Target Company"
              value={config.company}
              onChange={(e) => handleConfigChange('company', e.target.value)}
              placeholder="e.g., Google, Microsoft"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={config.proficiency}
                onChange={(e) => handleConfigChange('proficiency', e.target.value)}
                label="Experience Level"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={config.difficulty}
                onChange={(e) => handleConfigChange('difficulty', e.target.value)}
                label="Difficulty Level"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Interview Duration</InputLabel>
              <Select
                value={config.duration}
                onChange={(e) => handleConfigChange('duration', e.target.value)}
                label="Interview Duration"
              >
                {DURATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={config.language}
                onChange={(e) => handleConfigChange('language', e.target.value)}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Assessment Preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assessment Preview
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Skills:</strong> {selectedSkills.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Role:</strong> {config.role} at {config.company}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Level:</strong> {PROFICIENCY_LEVELS.find(p => p.value === config.proficiency)?.label}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Difficulty:</strong> {DIFFICULTY_LEVELS.find(d => d.value === config.difficulty)?.label}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong> {DURATION_OPTIONS.find(d => d.value === config.duration)?.label}
            </Typography>
          </Paper>
        </Box>

        {/* Start Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartInterview}
            disabled={selectedSkills.length === 0}
            startIcon={<PlayArrowIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Technical Assessment
          </Button>
          {selectedSkills.length === 0 && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              Please select at least one technical skill
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
