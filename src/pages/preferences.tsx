// pages/preferences.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Tooltip,
  TextField,
  MenuItem
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
import PersonIcon from '@mui/icons-material/Person';
import BugReportIcon from '@mui/icons-material/BugReport';
import Cookies from 'js-cookie';
import { color } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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
  { label: 'Web3 Marketing', color: '00B894', category: 'marketing' },
  { label: 'NFT Marketing', color: '6C5CE7', category: 'marketing' },
  { label: 'Community Management', color: '0984E3', category: 'marketing' },
  { label: 'Token Economics', color: 'F7DF1E', category: 'marketing' },
  { label: 'DeFi Marketing', color: 'FF6B6B', category: 'marketing' },
  { label: 'Crypto PR', color: '00B894', category: 'marketing' },
  { label: 'Blockchain Events', color: 'E84393', category: 'marketing' },
  { label: 'DAO Governance', color: '6C5CE7', category: 'marketing' },
  // QA
  { label: 'Manual Testing', color: '9C27B0', category: 'qa' },
  { label: 'Automated Testing', color: '673AB7', category: 'qa' },
  { label: 'Test Planning', color: '3F51B5', category: 'qa' },
  { label: 'Performance Testing', color: '2196F3', category: 'qa' },
  { label: 'API Testing', color: '03A9F4', category: 'qa' },
  { label: 'Security Testing', color: '00BCD4', category: 'qa' },
  // Business
  { label: 'Project Management', color: '6C5CE7', category: 'business' },
  { label: 'Agile', color: '00B894', category: 'business' },
  { label: 'Scrum', color: 'FDCB6E', category: 'business' },
  { label: 'Product Management', color: 'E84393', category: 'business' },
  { label: 'Business Analysis', color: '0984E3', category: 'business' },
  // Web3
  { label: 'Solidity', color: '363636', category: 'web3' },
  { label: 'Ethereum', color: '627EEA', category: 'web3' },
  { label: 'Smart Contracts', color: 'F7931A', category: 'web3' },
  { label: 'DeFi', color: 'FF6B6B', category: 'web3' },
  { label: 'NFTs', color: '00B894', category: 'web3' },
  { label: 'Web3.js', color: 'F16822', category: 'web3' },
  { label: 'Hardhat', color: 'F7DF1E', category: 'web3' },
  { label: 'Truffle', color: '3FE0C5', category: 'web3' },
  { label: 'Massa', color: '00B894', category: 'web3' },
  { label: 'Hedera', color: '02E2FF', category: 'web3' },
  { label: 'Polkadot', color: 'E6007A', category: 'web3' },
  { label: 'NEAR', color: '000000', category: 'web3' },
  { label: 'Substrate', color: '000000', category: 'web3' },
  { label: 'Cosmos', color: '2E3148', category: 'web3' },
  { label: 'Solana', color: '00FFA3', category: 'web3' },
  { label: 'Avalanche', color: 'E84142', category: 'web3' },
  { label: 'Polygon', color: '8247E5', category: 'web3' },
  { label: 'Arbitrum', color: '28A0F0', category: 'web3' },
  { label: 'Optimism', color: 'FF0420', category: 'web3' },
  { label: 'Base', color: '0052FF', category: 'web3' },
  // AI
  { label: 'Machine Learning', color: 'FF6B6B', category: 'ai' },
  { label: 'Deep Learning', color: '00B894', category: 'ai' },
  { label: 'TensorFlow', color: 'FF6F00', category: 'ai' },
  { label: 'PyTorch', color: 'EE4C2C', category: 'ai' },
  { label: 'Natural Language Processing', color: '4ECDC4', category: 'ai' },
  { label: 'Computer Vision', color: '6C5CE7', category: 'ai' },
  { label: 'Reinforcement Learning', color: '0984E3', category: 'ai' },
  { label: 'Data Science', color: '00B894', category: 'ai' }
];

const CATEGORIES = [
  { id: 'development', label: 'Development', icon: <CodeIcon /> },
  { id: 'web3', label: 'Web3', icon: <DesignServicesIcon /> },
  { id: 'ai', label: 'AI', icon: <AnalyticsIcon /> },
  { id: 'marketing', label: 'Marketing', icon: <AnalyticsIcon /> },
  { id: 'qa', label: 'Quality Assurance', icon: <BugReportIcon /> },
  { id: 'business', label: 'Business', icon: <BusinessIcon /> },

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

// Add new type and constants
type UserType = 'candidate' | 'company' | '';

const COMPANY_STEPS = [
  'Select Type',
  'Company Details',
  'Required Skills',
  'Experience Level',
  'Project Types',
  'Review'
];



function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  const userRole = useSelector((state: RootState) => state.user.userType);
  const icons: Record<string, React.ReactElement> = {
    1: <CodeIcon />,
    2: <StarIcon />,
    3: <StarIcon />,
    4: <StarIcon />,
    5: <CheckCircleIcon />
  };
  const bg = active || completed
    ? userRole === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF'
    : 'black';
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

// Update the step arrays to include conditional Hedera step
const getSteps = (userType: UserType, hasHederaExp: 'yes' | 'no' | '') => {
  if (!userType) return ['Select Type'];

  if (userType === 'company') {
    const steps = ['Company Details', 'Required Skills', 'Experience Level', 'Review'];
    return steps;
  } else {
    const steps = ['Select Skills'];
    if (hasHederaExp === 'yes') steps.push('Hedera QCM');
    steps.push('Rate Proficiency', 'Review');
    return steps;
  }
};

// Add styled select component


export default function Preferences() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState<UserType>('');
  const [selectedCategory, setSelectedCategory] = useState('development');

  // Company specific states
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    industry: '',
    size: '',
    location: ''
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');

  // Step 1: skills + Hedera experience
  const [skills, setSkills] = useState<string[]>([]);
  const [skillWarning, setSkillWarning] = useState<string>('');

  const userRole = useSelector((state: RootState) => state.user.userType);

  const GREEN_MAIN = userRole === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF';
  // Styled connector & step icon
  const COMPANY_COLOR = 'rgba(0,255,157,1)';
  const USER_COLOR = '#8310FF';
  const FADE_OPACITY = 0.3;

  const ColorlibConnector = styled(StepConnector)(({ theme }: any) => {
    const primary = userRole === 'company' ? COMPANY_COLOR : USER_COLOR;
    const faded = `rgba(${parseInt(primary.slice(1, 3), 16)},${parseInt(primary.slice(3, 5), 16)},${parseInt(primary.slice(5, 7), 16)},${FADE_OPACITY})`;

    return {
      /* shrink connector to exactly the pills + a bit of breathing room */
      [`&.${stepConnectorClasses.root}`]: {
        margin: '0 8px',
      },

      /* hide default solid line */
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: 'transparent',
        height: 4,
        position: 'relative',
      },

      /* draw two pills, default grey */
      [`& .${stepConnectorClasses.line}::before,
        & .${stepConnectorClasses.line}::after`]: {
        content: '""',
        position: 'absolute',
        top: 0,
        width: 62,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.grey[300],
      },
      [`& .${stepConnectorClasses.line}::before`]: { left: 0 },
      [`& .${stepConnectorClasses.line}::after`]: { right: 0 },

      /* COMPLETED connector: both pills full color */
      [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}::before,
        &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}::after`]: {
        backgroundColor: primary,
      },

      /* ACTIVE connector: first pill full color, second pill faded */
      [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}::before`]: {
        backgroundColor: primary,
      },
      [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}::after`]: {
        backgroundColor: faded,
      },
    };
  });
  const StyledSelect = styled(TextField)({
    '& .MuiSelect-select': {
      color: 'black'
    },
    '& .MuiInputLabel-root': {
      color: 'black'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)'
    },
    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line},
       &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
      backgroundColor: GREEN_MAIN
    }
  });
  const toggleSkill = (label: string) => {
    if (skills.includes(label)) {
      setSkills(prev => prev.filter(s => s !== label));
      setSkillWarning('');
    } else {
      if (skills.length >= 1) {
        setSkillWarning('You can only select 1 skill');
        return;
      }
      setSkills(prev => [...prev, label]);
      setSkillWarning('');
    }
  };

  const [hederaExp, setHederaExp] = useState<'yes' | 'no' | ''>('');

  // Step 2: QCM answers
  const [hedQcm, setHedQcm] = useState<Record<string, string>>({});
  const setQcm = (qid: string, ans: string) =>
    setHedQcm(prev => ({ ...prev, [qid]: ans }));

  // Step 3: proficiency
  const [proficiency, setProficiency] = useState<Record<string, number>>(() => {
    // Initialize with default value of 1 for all skills
    const defaultProficiency: Record<string, number> = {};
    ALL_SKILLS.forEach(skill => {
      defaultProficiency[skill.label] = 1;
    });
    return defaultProficiency;
  });
  const setProf = (skill: string, value: number) =>
    setProficiency(prev => ({ ...prev, [skill]: value }));

  // Step 4: project types
  const [projectType, setProjectType] = useState<Record<string, string>>({});

  // Get steps based on user type and Hedera experience
  const steps = useMemo(() => {
    const baseSteps = ['Select Type'];
    if (userType) {
      baseSteps.push(...getSteps(userType, hederaExp));
    }
    return baseSteps;
  }, [userType, hederaExp]);

  // Calculate actual step content to show
  const currentStep = useMemo(() => {
    if (activeStep === 0) return 'Select Type';
    return steps[activeStep];
  }, [steps, activeStep]);

  const progress = (activeStep / (steps.length - 1)) * 100;

  const handleNext = () => setActiveStep(i => i + 1);
  const handleBack = () => setActiveStep(i => i - 1);


  const handleCreateOrUpdateProfile = async () => {
    try {
      // Get token from cookies
      const token = Cookies.get('api_token');

      if (!token) {
        console.error('No token found');
        return false;
      }

      if (userType === 'company') {
        // Format company profile data
        const companyProfileData = {
          name: companyDetails.name,
          industry: companyDetails.industry,
          size: companyDetails.size,
          location: companyDetails.location,
          requiredSkills: requiredSkills,
          requiredExperienceLevel: experienceLevel
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateCompanyProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(companyProfileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update company profile');
        }

        return true;
      } else {
        // Create candidate profile without skills
        const profileData = {
          type: "Candidate",
          skills: [] // Empty skills array
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update profile');
        }

        return true;
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      return false;
    }
  };

  const handleStartTest = async () => {
    try {
      // Create or update profile first
      const profileCreated = await handleCreateOrUpdateProfile();

      if (!profileCreated) {
        console.error('Failed to create/update profile');
        return;
      }

      // Get returnUrl from query parameters
      const returnUrl = router.query.returnUrl as string;
      if (userType === 'company') {
        router.push('/dashboardCompany');
        return;
      }

      // If there's a returnUrl, go there
      if (returnUrl) {
        console.log('Redirecting to returnUrl:', returnUrl);
        const decodedUrl = decodeURIComponent(returnUrl);
        router.push(decodedUrl);
      } else {
        // For normal sign-in, go to test page with skills and levels
        router.push({
          pathname: '/test',
          query: {
            type: 'on-boarding',
            skills: skills.join(','),
            experienceLevel: 'Entry Level', // Default experience level
            proficiencyLevels: Object.entries(proficiency)
              .filter(([skill]) => skills.includes(skill))
              .map(([skill, level]) => `${skill}:${level}`)
              .join(',')
          }
        });
      }
    } catch (error) {
      console.error('Error in handleStartTest:', error);
      setError('Failed to save preferences. Please try again.');
    }
  };

  const filteredSkills = useMemo(
    () => ALL_SKILLS.filter(s => s.category === selectedCategory),
    [selectedCategory]
  );
  // Handle user type selection with auto-advance
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setActiveStep(prev => prev + 1);
  };
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Add effect to check traffic counter
  useEffect(() => {
    const checkProfile = async () => {
      // Skip the check if we're coming from a test page
      const returnUrl = router.query.returnUrl as string;
      if (returnUrl && returnUrl.includes('/testjob/')) {
        console.log('Coming from test page, skipping profile check');
        return;
      }

      // Add a small delay to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const token = localStorage.getItem('api_token');
        console.log('Current token:', token);
        
        if (!token) {
          console.log('No token found, redirecting to signin');
          router.push('/signin');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If profile exists and is valid, check returnUrl
        if (response.ok) {
          const data = await response.json();
          
          // Check if profile is complete
          const isProfileComplete = data && data.type &&
            ((data.type === 'Candidate' ) ||
              (data.type === 'Company' ));

          if (isProfileComplete) {
            if (returnUrl) {
              console.log('Found returnUrl, redirecting to:', returnUrl);
              router.push(decodeURIComponent(returnUrl));
              return;
            }

            // If no returnUrl, redirect to appropriate dashboard
            if (data.type === 'Company') {
              router.push('/dashboardCompany');
            } else {
              router.push('/dashboardCandidate');
            }
          }
          // If profile is not complete, stay on preferences page
        }
        // If profile doesn't exist or is invalid, stay on preferences page
      } catch (error) {
        console.error('Error checking profile:', error);
        // Stay on preferences page to create profile
      }
    };

    checkProfile();
  }, [router]);

  const [error, setError] = useState<string>('');

  const isCurrentStepValid = () => {
    if (userType === 'company') {
      switch (currentStep) {
        case 'Company Details':
          return companyDetails.name && companyDetails.industry && companyDetails.size && companyDetails.location;
        case 'Required Skills':
          return requiredSkills.length > 0;
        case 'Experience Level':
          return experienceLevel !== '';
        default:
          return true;
      }
    }
    return true;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card elevation={8} sx={{ backgroundColor: 'white', width: { xs: '100%', sm: 800 }, p: 4, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            mb: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: GREEN_MAIN
            }
          }}
        />

        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'black' }}>
          {activeStep === 0 ? 'Welcome to TalentAI' : "Let's Deep Dive into Your Skills"}
        </Typography>

        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />} sx={{ my: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={ColorlibStepIcon}
                sx={{
                  '& .MuiStepLabel-label.Mui-active': { color: `${GREEN_MAIN} !important` },
                  '& .MuiStepLabel-label.Mui-completed': { color: `${GREEN_MAIN} !important` }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* User Type Selection Step */}
        {currentStep === 'Select Type' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
              Are you a candidate looking for opportunities or a company seeking talent?
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              mt: 4
            }}>
              <Button
                variant={userType === 'candidate' ? 'contained' : 'outlined'}
                onClick={() => handleUserTypeSelect('candidate')}
                startIcon={<PersonIcon />}
                sx={{
                  color: userType === 'candidate' ? 'black' : GREEN_MAIN,
                  borderColor: GREEN_MAIN,
                  backgroundColor: userType === 'candidate' ? GREEN_MAIN : 'transparent',
                  py: 2,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: GREEN_MAIN,
                    color: 'black',
                  }
                }}
              >
                I'm a Candidate
              </Button>
              <Button
                variant={userType === 'company' ? 'contained' : 'outlined'}
                onClick={() => handleUserTypeSelect('company')}
                startIcon={<BusinessIcon />}
                sx={{
                  color: userType === 'company' ? 'black' : GREEN_MAIN,
                  borderColor: GREEN_MAIN,
                  backgroundColor: userType === 'company' ? GREEN_MAIN : 'transparent',
                  py: 2,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: GREEN_MAIN,
                    color: 'black',
                  }
                }}
              >
                I'm a Company
              </Button>
            </Box>
          </Box>
        )}

        {/* Company Details Step */}
        {currentStep === 'Company Details' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" sx={{ color: 'black' }} gutterBottom>
              Tell us about your company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyDetails.name}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '& .MuiInputBase-input': { color: 'grey' },
                  '& .MuiInputLabel-root': { color: 'grey' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' }
                }}
              />
              <StyledSelect
                select
                fullWidth
                label="Industry"
                value={companyDetails.industry}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, industry: e.target.value }))}
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '& .MuiInputBase-input': { color: 'grey' },
                  '& .MuiInputLabel-root': { color: 'grey' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Technology" sx={{ color: 'black' }}>Technology</MenuItem>
                <MenuItem value="Finance" sx={{ color: 'black' }}>Finance</MenuItem>
                <MenuItem value="Healthcare" sx={{ color: 'black' }}>Healthcare</MenuItem>
                <MenuItem value="Education" sx={{ color: 'black' }}>Education</MenuItem>
                <MenuItem value="Other" sx={{ color: 'black' }}>Other</MenuItem>
              </StyledSelect>

              <StyledSelect
                select
                fullWidth
                label="Company Size"
                value={companyDetails.size}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, size: e.target.value }))}
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '& .MuiInputBase-input': { color: 'grey' },
                  '& .MuiInputLabel-root': { color: 'grey' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="1-10" sx={{ color: 'black' }}  >1-10 employees</MenuItem>
                <MenuItem value="11-50" sx={{ color: 'black' }}>11-50 employees</MenuItem>
                <MenuItem value="51-200" sx={{ color: 'black' }}>51-200 employees</MenuItem>
                <MenuItem value="201-500" sx={{ color: 'black' }}>201-500 employees</MenuItem>
                <MenuItem value="501+" sx={{ color: 'black' }}>501+ employees</MenuItem>
              </StyledSelect>

              <StyledSelect
                select
                fullWidth
                label="Location"
                value={companyDetails.location}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, location: e.target.value }))}
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '& .MuiInputBase-input': { color: 'grey' },
                  '& .MuiInputLabel-root': { color: 'grey' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Remote" sx={{ color: 'black' }}>Remote</MenuItem>
                <MenuItem value="On-site" sx={{ color: 'black' }}>On-site</MenuItem>
                <MenuItem value="Hybrid" sx={{ color: 'black' }}>Hybrid</MenuItem>
              </StyledSelect>
            </Box>
          </Box>
        )}

        {/* Skills Selection Steps - Combined logic for both candidate and company */}
        {(currentStep === 'Select Skills' || currentStep === 'Required Skills') && (
          <Box>
            {/* Categories Tabs */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Tabs
                value={selectedCategory}
                onChange={(_, v) => setSelectedCategory(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 120,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    color: 'black',
                    '&.Mui-selected': {
                      color: GREEN_MAIN
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: GREEN_MAIN
                  }
                }}
              >
                {CATEGORIES.map(c => (
                  <Tab
                    key={c.id}
                    value={c.id}
                    label={c.label}
                    icon={c.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Paper>

            {/* Title */}
            <Typography variant="h6" mb={2} sx={{ color: 'black' }}>
              {userType === 'company'
                ? 'Select the skills your company is looking for'
                : `Select your ${selectedCategory} skill (1 skill required)`
              }
            </Typography>

            {skillWarning && (
              <Typography color="error" sx={{ mb: 2 }}>
                {skillWarning}
              </Typography>
            )}

            {/* Skills Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
              gap: 2
            }}>
              {filteredSkills.map(skill => {
                const isCompany = userType === 'company';
                const skillsList = isCompany ? requiredSkills : skills;
                const sel = skillsList.includes(skill.label);

                return (
                  <Tooltip
                    key={skill.label}
                    title={`Click to ${sel ? 'remove' : 'add'} ${skill.label}`}
                  >
                    <Chip
                      label={skill.label}
                      clickable
                      onClick={() => {
                        if (isCompany) {
                          setRequiredSkills(prev =>
                            sel ? prev.filter(s => s !== skill.label) : [...prev, skill.label]
                          );
                        } else {
                          toggleSkill(skill.label);
                        }
                      }}
                      sx={{
                        width: '100%',
                        height: 40,
                        border: `1px solid #${skill.color}`,
                        backgroundColor: sel ? `#${skill.color}` : 'transparent',
                        color: sel ? '#fff' : `#${skill.color}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: `#${skill.color}`,
                          color: '#fff',
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>

            {/* Hedera Experience Question */}
            {((userType === 'candidate' && skills.includes('Hedera')) ||
              (userType === 'company' && requiredSkills.includes('Hedera'))) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                    {userType === 'company'
                      ? 'Is Hedera experience required?'
                      : 'Do you have experience working with Hedera?'
                    }
                  </Typography>
                  <RadioGroup
                    row
                    value={hederaExp}
                    onChange={(e) => setHederaExp(e.target.value as 'yes' | 'no')}
                    sx={{ mt: 1 }}
                  >
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-checked': {
                              color: GREEN_MAIN
                            }
                          }}
                        />
                      }
                      label="Yes"
                      sx={{
                        color: '#fff'
                      }}
                    />
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-checked': {
                              color: GREEN_MAIN
                            }
                          }}
                        />
                      }
                      label="No"
                      sx={{
                        color: '#fff'
                      }}
                    />
                  </RadioGroup>
                </Box>
              )}
          </Box>
        )}

        {/* Experience Level Step for Company */}
        {currentStep === 'Experience Level' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'black' }} gutterBottom>
              Required Experience Level
            </Typography>
            <RadioGroup
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              sx={{ color: 'black' }}
            >
              {['Entry Level', 'Mid Level', 'Senior', 'Lead/Expert'].map(level => (
                <FormControlLabel
                  key={level}
                  value={level}
                  control={<Radio />}
                  label={level}
                />
              ))}
            </RadioGroup>
          </Box>
        )}

        {/* Hedera QCM Step - Only for candidates */}
        {currentStep === 'Hedera QCM' && userType === 'candidate' && (
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              Hedera Experience Verification
            </Typography>
            {HEDERA_QUESTIONS.map(({ id, question, options }) => (
              <Paper
                key={id}
                sx={{
                  p: 3,
                  mb: 2,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#02E2FF',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }
                }}
                elevation={0}
              >
                <Typography sx={{ color: '#00072D' }} gutterBottom>
                  {question}
                </Typography>
                <RadioGroup
                  value={hedQcm[id] || ''}
                  onChange={e => setQcm(id, e.target.value)}
                >
                  {options.map(opt => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={
                        <Radio
                          sx={{
                            color: '#64748b',
                            '&.Mui-checked': {
                              color: '#02E2FF'
                            }
                          }}
                        />
                      }
                      label={opt}
                      sx={{
                        color: '#1e293b',
                        '&:hover': { color: '#02E2FF' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            ))}
          </Box>
        )}

        {currentStep === 'Rate Proficiency' && (
          <Box>
            <Typography mb={2} sx={{ color: 'black' }}>Rate your proficiency (1 = Novice, 5 = Expert)</Typography>
            {skills.map(skill => (
              <Box key={skill} sx={{ mb: 3, position: 'relative' }}>
                <Typography gutterBottom sx={{ color: 'black' }}>{skill}</Typography>
                <Slider
                  value={proficiency[skill] ?? 3}
                  onChange={(_, v) => setProf(skill, v as number)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  sx={{ color: GREEN_MAIN }}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}
          </Box>
        )}

        {currentStep === 'Review' && (
          <Box>
            <Typography mb={2} sx={{ color: 'black' }}>Review your inputs before starting the test:</Typography>
            <Typography variant="body2" sx={{ color: 'black' }}>
              <strong>Type:</strong> {userType === 'company' ? 'Company' : 'Candidate'}
            </Typography>
            {userType === 'company' ? (
              <>
                <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                  <strong>Company Details:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'black' }}>
                  Name: {companyDetails.name}<br />
                  Industry: {companyDetails.industry}<br />
                  Size: {companyDetails.size}<br />
                  Location: {companyDetails.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                  <strong>Required Skills:</strong> {requiredSkills.join(', ')}
                </Typography>
                {hederaExp === 'yes' && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                    <strong>Hedera Experience:</strong> Verified
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                  <strong>Required Experience Level:</strong> {experienceLevel}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                  <strong>Skills:</strong> {skills.join(', ')}
                </Typography>
                {hederaExp === 'yes' && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                    <strong>Hedera Experience:</strong> Verified
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1, color: 'black' }}  >
                  <strong>Proficiency Levels:</strong>
                </Typography>
                {skills.map(skill => (
                  <Typography key={skill} variant="body2" sx={{ color: 'black' }}>
                    - {skill}: {proficiency[skill] ?? '-'}/5
                  </Typography>
                ))}
              </>
            )}
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: GREEN_MAIN,
              color: GREEN_MAIN,
              '&:hover': {
                borderColor: GREEN_MAIN
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleStartTest : handleNext}
            disabled={
              activeStep === 0 && !userType ||
              (currentStep === 'Select Skills' && skills.length === 0) ||
              (userType === 'company' && !isCurrentStepValid())
            }
            sx={{
              background: GREEN_MAIN,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: GREEN_MAIN
              }
            }}
          >
            {activeStep === steps.length - 1
              ? (userType === 'company'
                ? 'Go to Dashboard'
                : (router.query.returnUrl
                  ? 'Continue to Test'
                  : 'Start Test'))
              : 'Next'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
