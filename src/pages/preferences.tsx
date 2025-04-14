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
  Tabs,
  Tab,
  Paper,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AnalyticsIcon from '@mui/icons-material/Analytics';

type Skill = { label: string; color: string; category: string };

// --- Skills List ---
const ALL_SKILLS: Skill[] = [
  // Development
  { label: 'JavaScript', color: 'F7DF1E', category: 'development' },
  { label: 'TypeScript', color: '3178C6', category: 'development' },
  { label: 'React', color: '61DAFB', category: 'development' },
  { label: 'Node.js', color: '339933', category: 'development' },
  { label: 'Python', color: '3776AB', category: 'development' },
  { label: 'Go', color: '00ADD8', category: 'development' },
  { label: 'Rust', color: '000000', category: 'development' },
  { label: 'GraphQL', color: 'E10098', category: 'development' },
  { label: 'Docker', color: '2496ED', category: 'development' },
  { label: 'Hedera', color: '02E2FF', category: 'development' },
  // Marketing
  { label: 'SEO', color: 'FF6B6B', category: 'marketing' },
  { label: 'Content Marketing', color: '4ECDC4', category: 'marketing' },
  { label: 'Social Media', color: '45B7D1', category: 'marketing' },
  { label: 'Email Marketing', color: '96CEB4', category: 'marketing' },
  { label: 'Analytics', color: 'FFEEAD', category: 'marketing' },
  // Design
  { label: 'UI/UX', color: 'FF9F1C', category: 'design' },
  { label: 'Figma', color: 'F24E1E', category: 'design' },
  { label: 'Adobe XD', color: 'FF61F6', category: 'design' },
  { label: 'Photoshop', color: '31A8FF', category: 'design' },
  { label: 'Illustrator', color: 'FF9A00', category: 'design' },
  // Business
  { label: 'Project Management', color: '6C5CE7', category: 'business' },
  { label: 'Agile', color: '00B894', category: 'business' },
  { label: 'Scrum', color: 'FDCB6E', category: 'business' },
  { label: 'Product Management', color: 'E84393', category: 'business' },
  { label: 'Business Analysis', color: '0984E3', category: 'business' }
];

const CATEGORIES = [
  { id: 'development', label: 'Development', icon: <CodeIcon /> },
  { id: 'marketing', label: 'Marketing', icon: <AnalyticsIcon /> },
  { id: 'design', label: 'Design', icon: <DesignServicesIcon /> },
  { id: 'business', label: 'Business', icon: <BusinessIcon /> }
];

const PROJECT_TYPES = [
  'Web Application',
  'Backend API',
  'Mobile App',
  'Automation Script',
  'Library/Package'
];

// 5 Hedera QCM questions
const HEDERA_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which Hedera service have you used?',
    options: ['Consensus Service', 'Token Service', 'Smart Contract Service']
  },
  {
    id: 'q2',
    question: 'Which SDK have you used?',
    options: ['Java SDK', 'JavaScript SDK', 'Go SDK', 'Other']
  },
  {
    id: 'q3',
    question: 'On which network did you deploy?',
    options: ['Testnet', 'Mainnet', 'Previewnet']
  },
  {
    id: 'q4',
    question: 'How long have you worked with Hedera?',
    options: ['< 1 month', '1–3 months', '3–6 months', '> 6 months']
  },
  {
    id: 'q5',
    question: 'Have you implemented a Consensus topic?',
    options: ['Yes', 'No']
  }
];

// Styled connector & step icon
const ColorlibConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 25 },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line},
     &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundImage: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)'
  }
}));
function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  const icons: Record<string, React.ReactElement> = {
    1: <CodeIcon />,
    2: <StarIcon />,
    3: <StarIcon />,
    4: <StarIcon />,
    5: <CheckCircleIcon />
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
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('development');

  // Step 1: skills + Hedera experience
  const [skills, setSkills] = useState<string[]>([]);
  const toggleSkill = (label: string) =>
    setSkills(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);

  const [hederaExp, setHederaExp] = useState<'yes' | 'no' | ''>('');

  // Step 2: QCM answers
  const [hedQcm, setHedQcm] = useState<Record<string, string>>({});
  const setQcm = (qid: string, ans: string) =>
    setHedQcm(prev => ({ ...prev, [qid]: ans }));

  // Step 3: proficiency
  const [proficiency, setProficiency] = useState<Record<string, number>>({});
  const setProf = (skill: string, value: number) =>
    setProficiency(prev => ({ ...prev, [skill]: value }));

  // Step 4: project types
  const [projectType, setProjectType] = useState<Record<string, string>>({});
  const setProjType = (skill: string, type: string) =>
    setProjectType(prev => ({ ...prev, [skill]: type }));

  // Build dynamic steps
  const steps = useMemo(() => {
    const s = ['Select Skills'];
    if (hederaExp === 'yes') s.push('Hedera QCM');
    s.push('Rate Your Proficiency', 'Choose Project Type', 'Review & Submit');
    return s;
  }, [hederaExp]);

  const progress = (activeStep / (steps.length - 1)) * 100;
  const current = steps[activeStep];

  const handleNext = () => setActiveStep(i => i + 1);
  const handleBack = () => setActiveStep(i => i - 1);
  const handleStartTest = () => {
    localStorage.setItem('prefs_skills', JSON.stringify(skills));
    localStorage.setItem('prefs_proficiency', JSON.stringify(proficiency));
    localStorage.setItem('prefs_projectType', JSON.stringify(projectType));
    if (hederaExp === 'yes') {
      localStorage.setItem('prefs_hederaQcm', JSON.stringify(hedQcm));
    }
    router.push('/test');
  };

  const filteredSkills = useMemo(
    () => ALL_SKILLS.filter(s => s.category === selectedCategory),
    [selectedCategory]
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
      <Card elevation={8} sx={{ width: { xs: '100%', sm: 800 }, p: 4, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
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

        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#00072D' }}>
          Let's Deep Dive into Your Skills
        </Typography>

        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />} sx={{ my: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* --- STEP CONTENTS --- */}
        {current === 'Select Skills' && (
          <Box>
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Tabs
                value={selectedCategory}
                onChange={(_, v) => setSelectedCategory(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { minWidth: 120, textTransform: 'none', fontWeight: 600 } }}
              >
                {CATEGORIES.map(c => (
                  <Tab key={c.id} value={c.id} label={c.label} icon={c.icon} iconPosition="start" />
                ))}
              </Tabs>
            </Paper>

            <Typography variant="h6" mb={2} sx={{ color: '#00072D' }}>
              Select your {selectedCategory} skills
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
              gap: 2
            }}>
              {filteredSkills.map(skill => {
                const sel = skills.includes(skill.label);
                return (
                  <Tooltip key={skill.label} title={`Click to ${sel ? 'remove' : 'add'} ${skill.label}`}>
                    <Chip
                      label={skill.label}
                      clickable
                      onClick={() => toggleSkill(skill.label)}
                      sx={{
                        width: '100%',
                        height: 40,
                        border: `1px solid #${skill.color}`,
                        backgroundColor: sel ? `#${skill.color}` : 'transparent',
                        color: sel ? '#fff' : `#${skill.color}`,
                        '&:hover': { backgroundColor: `#${skill.color}`, color: '#fff', transform: 'scale(1.05)' }
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>

            {skills.includes('Hedera') && (
              <Box sx={{ mt: 4 }}>
                <Typography mb={1}>Have you worked with Hedera before?</Typography>
                <RadioGroup
                  row
                  value={hederaExp}
                  onChange={e => setHederaExp(e.target.value as 'yes' | 'no')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </Box>
            )}
          </Box>
        )}

        {current === 'Hedera QCM' && (
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 3
              }}
            >
              Hedera Quick Check
            </Typography>
            {HEDERA_QUESTIONS.map(({ id, question, options }) => (
              <Paper key={id} sx={{ p: 3, mb: 2, backgroundColor: '#000' }} elevation={3}>
                <Typography gutterBottom>{question}</Typography>
                <RadioGroup
                  value={hedQcm[id] || ''}
                  onChange={e => setQcm(id, e.target.value)}
                >
                  {options.map(opt => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            ))}
          </Box>
        )}

        {current === 'Rate Your Proficiency' && (
          <Box>
            <Typography mb={2}>Rate your proficiency (1 = Novice, 5 = Expert)</Typography>
            {skills.map(skill => (
              <Box key={skill} sx={{ mb: 3, position: 'relative' }}>
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

        {current === 'Choose Project Type' && (
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
                    <FormControlLabel key={pt} value={pt} control={<Radio />} label={pt} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Box>
        )}

        {current === 'Review & Submit' && (
          <Box>
            <Typography mb={2}>Review your inputs before starting the test:</Typography>
            <Typography variant="body2"><strong>Skills:</strong> {skills.join(', ')}</Typography>
            {hederaExp === 'yes' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Hedera Answers:</strong> {JSON.stringify(hedQcm)}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}><strong>Proficiency:</strong></Typography>
            {skills.map(skill => (
              <Typography key={skill} variant="body2">– {skill}: {proficiency[skill] ?? '-'}</Typography>
            ))}
            <Typography variant="body2" sx={{ mt: 1 }}><strong>Project Types:</strong></Typography>
            {skills.map(skill => (
              <Typography key={skill} variant="body2">– {skill}: {projectType[skill] || '(none)'}</Typography>
            ))}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" gutterBottom>Are you ready to pass the test?</Typography>
              <Button variant="contained" onClick={handleStartTest} sx={{ textTransform: 'none' }}>
                Yes, let's go
              </Button>
            </Box>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleStartTest : handleNext}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
              }
            }}
          >
            {activeStep === steps.length - 1 ? 'Start Test' : 'Next'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
