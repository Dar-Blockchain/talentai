// pages/preferences.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Link,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Skill = { label: string; color: string };

// Available skills (including Hedera)
const ALL_SKILLS: Skill[] = [
  { label: 'JavaScript', color: 'F7DF1E' },
  { label: 'TypeScript', color: '3178C6' },
  { label: 'React',      color: '61DAFB' },
  { label: 'Node.js',    color: '339933' },
  { label: 'Python',     color: '3776AB' },
  { label: 'Go',         color: '00ADD8' },
  { label: 'Rust',       color: '000000' },
  { label: 'GraphQL',    color: 'E10098' },
  { label: 'Docker',     color: '2496ED' },
  { label: 'Hedera',     color: '02E2FF' },  
];

// Project categories for Step 3
const PROJECT_TYPES = [
  'Web Application',
  'Backend API',
  'Mobile App',
  'Automation Script',
  'Library/Package'
];

// Step labels
const steps = [
  'Select Skills',
  'Rate Your Proficiency',
  'Choose Project Type',
  'Review & Submit'
];

// Connector with centered line and gradient on active/completed
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 25,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line},
     &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundImage: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
  },
}));

// Custom step icon
function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  const icons: Record<string, React.ReactElement> = {
    1: <CodeIcon />,
    2: <StarIcon />,
    3: <StarIcon />,
    4: <CheckCircleIcon />,
  };
  const bg = active || completed
    ? 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)'
    : '#eaeaf0';

  return (
    <Box sx={{
      background: bg,
      color: '#fff',
      width: 50,
      height: 50,
      display: 'flex',
      borderRadius: '50%',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: active ? '0 4px 10px rgba(0,0,0,0.25)' : 'none',
      zIndex: 1,
    }}>
      {icons[String(icon)]}
    </Box>
  );
}

export default function Preferences() {
  const theme = useTheme();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // STEP 1: Skills
  const [skills, setSkills] = useState<string[]>([]);
  const toggleSkill = (label: string) =>
    setSkills(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );

  // STEP 2: Proficiency
  const [proficiency, setProficiency] = useState<Record<string, number>>({});
  const setProf = (skill: string, value: number) =>
    setProficiency(prev => ({ ...prev, [skill]: value }));

  // STEP 3: Project Type
  const [projectType, setProjectType] = useState<Record<string, string>>({});
  const setProjType = (skill: string, type: string) =>
    setProjectType(prev => ({ ...prev, [skill]: type }));

  const handleNext = () => setActiveStep(s => s + 1);
  const handleBack = () => setActiveStep(s => s - 1);

  // On “Start Test”, persist and navigate
  const handleStartTest = () => {
    localStorage.setItem('prefs_skills', JSON.stringify(skills));
    localStorage.setItem('prefs_proficiency', JSON.stringify(proficiency));
    localStorage.setItem('prefs_projectType', JSON.stringify(projectType));
    router.push('/test');
  };

  // Compute progress
  const progress = useMemo(
    () => (activeStep / (steps.length - 1)) * 100,
    [activeStep]
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#00072D',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card elevation={8} sx={{ width: { xs: '100%', sm: 640 }, p: 4, borderRadius: 3 }}>
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            mb: 3,
            backgroundColor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              backgroundImage: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)'
            }
          }}
        />

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Let’s Deep Dive into Your Skills
        </Typography>

        <Stepper
          alternativeLabel
          activeStep={activeStep}
          connector={<ColorlibConnector />}
          sx={{ my: 4 }}
        >
          {steps.map(label => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Contents */}
        {activeStep === 0 && (
          <Box>
            {/* Hedera Banner */}
            <Box sx={{
              mb: 2,
              p: 2,
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="body1" sx={{ color: '#fff' }}>
                Built on{' '}
                <Link
                  href="https://hedera.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Hedera Hashgraph
                </Link>
              </Typography>
            </Box>
            <Typography mb={2}>Which skills do you bring to the table?</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {ALL_SKILLS.map(skill => {
                const sel = skills.includes(skill.label);
                return (
                  <Chip
                    key={skill.label}
                    label={skill.label}
                    clickable
                    onClick={() => toggleSkill(skill.label)}
                    sx={{
                      m: 0.5,
                      border: `1px solid #${skill.color}`,
                      backgroundColor: sel ? `#${skill.color}` : 'transparent',
                      color: sel ? '#fff' : `#${skill.color}`,
                      '&:hover': {
                        backgroundColor: `#${skill.color}`,
                        color: '#fff',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography mb={2}>Rate your proficiency (1 = Novice, 5 = Expert)</Typography>
            {skills.map(skill => (
              <Box key={skill} sx={{ mb: 3 }}>
                <Typography gutterBottom>{skill}</Typography>
                <Slider
                  value={proficiency[skill] ?? 3}
                  onChange={(_, v) => setProf(skill, v as number)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography mb={2}>For each skill, select the type of project you used it in:</Typography>
            {skills.map(skill => (
              <Box key={skill} sx={{ mb: 3 }}>
                <Typography gutterBottom>{skill}</Typography>
                <RadioGroup
                  row
                  value={projectType[skill] || ''}
                  onChange={e => setProjType(skill, e.target.value)}
                >
                  {PROJECT_TYPES.map(pt => (
                    <FormControlLabel
                      key={pt}
                      value={pt}
                      control={<Radio />}
                      label={pt}
                    />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography mb={2}>Review your inputs before starting the test:</Typography>
            <Typography variant="body2"><strong>Skills:</strong> {skills.join(', ')}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}><strong>Proficiency:</strong></Typography>
            {skills.map(skill => (
              <Typography key={skill} variant="body2">
                – {skill}: {proficiency[skill] ?? '-'}
              </Typography>
            ))}
            <Typography variant="body2" sx={{ mt: 1 }}><strong>Project Types:</strong></Typography>
            {skills.map(skill => (
              <Typography key={skill} variant="body2">
                – {skill}: {projectType[skill] || '(none selected)'}
              </Typography>
            ))}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Are you ready to pass the test?
              </Typography>
              <Button
                variant="contained"
                onClick={handleStartTest}
                sx={{ textTransform: 'none' }}
              >
                Yes, let’s go
              </Button>
            </Box>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && skills.length === 0) ||
                (activeStep === 1 && skills.some(s => proficiency[s] === undefined)) ||
                (activeStep === 2 && skills.some(s => !projectType[s]))
              }
              sx={{ textTransform: 'none' }}
            >
              Next
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}
