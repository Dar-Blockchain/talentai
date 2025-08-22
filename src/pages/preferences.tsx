// pages/preferences.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
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
  Tabs,
  Tab,
  Paper,
  Tooltip,
  TextField,
  MenuItem,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Grow,
  Collapse
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
import LogoutIcon from '@mui/icons-material/Logout';

import Cookies from 'js-cookie';
import { color } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout } from '@/store/slices/authSlice';

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
  const userRole = useSelector((state: RootState) => state.user?.userType || '');
  
  // Company flow icons
  const companyIcons: Record<string, React.ReactElement> = {
    1: <BusinessIcon />,        // Company Details
    2: <DesignServicesIcon />,  // Required Skills
    3: <AnalyticsIcon />,       // Experience Level
    4: <CheckCircleIcon />      // Review
  };
  
  // Candidate flow icons
  const candidateIcons: Record<string, React.ReactElement> = {
    1: <PersonIcon />,          // Personal Details
    2: <CodeIcon />,            // Select Skills
    3: <BugReportIcon />,       // Hedera QCM (if applicable)
    4: <StarIcon />,            // Rate Proficiency
    5: <CheckCircleIcon />      // Review
  };
  
  // Select type icon (initial step)
  const selectTypeIcon = <BusinessIcon />;
  
  const icons = userRole === 'company' ? companyIcons : candidateIcons;
  
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
      {icons[String(icon)] || selectTypeIcon}
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
    const steps = ['Personal Details', 'Select Skills'];
    if (hasHederaExp === 'yes') steps.push('Hedera QCM');
    steps.push('Rate Proficiency', 'Review');
    return steps;
  }
};

// Add styled select component


function Preferences() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState<UserType>('');
  const [selectedCategory, setSelectedCategory] = useState('development');
  const [isTestJobReturnUrl, setIsTestJobReturnUrl] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Company specific states
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    industry: '',
    size: '',
    location: ''
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');

  // Candidate specific states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 1: skills + Hedera experience
  const [skills, setSkills] = useState<string[]>([]);
  const [skillWarning, setSkillWarning] = useState<string>('');

  const userRole = useSelector((state: RootState) => state.user?.userType || '');

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
          requiredExperienceLevel: experienceLevel,
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
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
        // Create candidate profile with all filled data
        const profileData = {
          type: "Candidate",
          FirstName: firstName,
          LastName: lastName,
          skills: skills.map(skill => ({ skill })), // array of objects for backend
          proficiencyLevels: Object.entries(proficiency)
            .filter(([skill]) => skills.includes(skill))
            .map(([skill, level]) => ({ skill, level })),
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
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
        router.push('/dashboard/company');
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
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const checkProfile = async () => {
      // Check if returnUrl points to a test job
      const returnUrl = router.query.returnUrl as string;
      if (returnUrl && returnUrl.includes('/testjob/')) {
        console.log('Coming from test page, setting test job return URL flag');
        setIsTestJobReturnUrl(true);
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
              router.push('/dashboard/company');
            } else {
              router.push('/dashboard/candidate');
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
  }, [router, isClient]);

  // Add effect to check for returnUrl on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const returnUrl = router.query.returnUrl as string;
    if (returnUrl && returnUrl.includes('/testjob/')) {
      setIsTestJobReturnUrl(true);
      setUserType('candidate');
    }
  }, [router.query.returnUrl, isClient]);

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
    } else if (userType === 'candidate') {
      switch (currentStep) {
        case 'Personal Details':
          return firstName.trim() !== '' && lastName.trim() !== '';
        case 'Select Skills':
          return skills.length > 0;
        default:
          return true;
      }
    }
    return true;
  };

  const { callbackUrl } = router.query;

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient || !user) {
    return null;
  }

  // Show loading state while preventing hydration
  if (!isClient) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h6" sx={{ color: '#666' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.95)',
          color: '#191919',
          boxShadow: '0 4px 24px 0 rgba(124,77,255,0.10)',
          mb: 3,
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          width: 'unset',
          mx: { xs: 1, sm: 4 },
          mt: 2,
          px: { xs: 1, sm: 3 },
          py: 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 72 },
            px: '0 !important',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="TalentAI Logo"
              sx={{ height: { xs: 28, sm: 32 }, mr: 1, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.07)' } }}
              onClick={() => router.push('/')}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                color: '#7C4DFF',
                textShadow: '0 2px 8px #7C4DFF11',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Preferences Setup
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Avatar
              sx={{
                bgcolor: 'linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)',
                color: '#fff',
                width: 44,
                height: 44,
                fontWeight: 700,
                fontSize: 22,
                boxShadow: '0 2px 8px #7C4DFF22',
                border: '2px solid #fff',
              }}
            >
              {userType === 'company' ? 'C' : 'U'}
            </Avatar>
            <Box sx={{ textAlign: 'right', minWidth: 120, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', fontSize: 17, lineHeight: 1.1 }}>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                {user.email}
              </Typography>
            </Box>
            <Box sx={{ mx: 1, height: 36, borderLeft: '1.5px solid #E0E0E0', display: { xs: 'none', sm: 'block' } }} />
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                py: 1.2,
                boxShadow: '0 2px 8px #00B8D422',
                textTransform: 'none',
                fontSize: 16,
                letterSpacing: 0.2,
                transition: 'background 0.2s, box-shadow 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                  boxShadow: '0 4px 16px #00B8D433',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
      <Card elevation={8} sx={{ backgroundColor: 'white', width: { xs: '100%', sm: 800 }, p: 4, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
        {activeStep !== 0 && <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'black' }}>
          Let's Deep Dive into Your Skills
        </Typography>}

        {/* Only show stepper when there are multiple steps AND not on the first step */}
        {steps.length > 1 && activeStep > 0 && (
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
        )}

        {/* User Type Selection Step */}
        {currentStep === 'Select Type' && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            {/* Enhanced Header Section */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Welcome to TalentAI
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Are you a candidate looking for opportunities or a company seeking talent?
              </Typography>
            </Box>

            {/* Warning Message */}
            {isTestJobReturnUrl && (
              <Box sx={{ 
                mb: 4,
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                color: 'white',
                maxWidth: 500,
                mx: 'auto',
                boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  ⚠️ You're accessing a job test, so only candidate registration is available.
                </Typography>
              </Box>
            )}

            {/* Enhanced Selection Cards */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 3, sm: 4 },
              maxWidth: 800,
              mx: 'auto',
              mt: 6
            }}>
              {/* Candidate Card */}
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: `3px solid ${userType === 'candidate' ? GREEN_MAIN : '#E0E0E0'}`,
                  backgroundColor: userType === 'candidate' ? `${GREEN_MAIN}15` : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    borderColor: GREEN_MAIN,
                    backgroundColor: `${GREEN_MAIN}10`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: userType === 'candidate' 
                      ? `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                      : 'transparent',
                    transition: 'all 0.3s ease'
                  }
                }}
                onClick={() => handleUserTypeSelect('candidate')}
              >
                {/* Icon Container */}
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: userType === 'candidate' 
                    ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                    : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  transition: 'all 0.3s ease',
                  boxShadow: userType === 'candidate' 
                    ? '0 8px 25px rgba(0, 255, 157, 0.3)'
                    : '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <PersonIcon sx={{ 
                    fontSize: 40, 
                    color: userType === 'candidate' ? 'white' : '#666',
                    transition: 'all 0.3s ease'
                  }} />
                </Box>

                {/* Content */}
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: userType === 'candidate' ? GREEN_MAIN : '#333',
                    mb: 2,
                    transition: 'color 0.3s ease'
                  }}
                >
                  I'm a Candidate
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: userType === 'candidate' ? '#555' : '#666',
                    lineHeight: 1.6,
                    mb: 3,
                    transition: 'color 0.3s ease'
                  }}
                >
                  Looking for exciting opportunities? Showcase your skills and connect with top companies.
                </Typography>

                {/* Features List */}
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  {[
                    '✓ Take skill assessments',
                    '✓ Build your profile',
                    '✓ Get matched with jobs',
                    '✓ Earn certifications'
                  ].map((feature, index) => (
                    <Typography 
                      key={index}
                      variant="body2" 
                      sx={{ 
                        color: userType === 'candidate' ? '#555' : '#666',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem'
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>

                {/* Status Badge */}
                {userType === 'candidate' && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
                  }}>
                  SELECTED
                </Box>
                )}
              </Box>

              {/* Company Card */}
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: `3px solid ${userType === 'company' ? GREEN_MAIN : '#E0E0E0'}`,
                  backgroundColor: userType === 'company' ? `${GREEN_MAIN}15` : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: (userRole === 'jobseeker' || isTestJobReturnUrl) ? 0.5 : 1,
                  '&:hover': {
                    transform: (userRole === 'jobseeker' || isTestJobReturnUrl) ? 'none' : 'translateY(-8px)',
                    boxShadow: (userRole === 'jobseeker' || isTestJobReturnUrl) ? 'none' : '0 20px 40px rgba(0,0,0,0.15)',
                    borderColor: (userRole === 'jobseeker' || isTestJobReturnUrl) ? '#E0E0E0' : GREEN_MAIN,
                    backgroundColor: (userRole === 'jobseeker' || isTestJobReturnUrl) ? 'white' : `${GREEN_MAIN}10`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: userType === 'company' 
                      ? `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                      : 'transparent',
                    transition: 'all 0.3s ease'
                  }
                }}
                onClick={() => !(userRole === 'jobseeker' || isTestJobReturnUrl) && handleUserTypeSelect('company')}
              >
                {/* Icon Container */}
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: userType === 'company' 
                    ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                    : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  transition: 'all 0.3s ease',
                  boxShadow: userType === 'company' 
                    ? '0 8px 25px rgba(0, 255, 157, 0.3)'
                    : '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <BusinessIcon sx={{ 
                    fontSize: 40, 
                    color: userType === 'company' ? 'white' : '#666',
                    transition: 'all 0.3s ease'
                  }} />
                </Box>

                {/* Content */}
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: userType === 'company' ? GREEN_MAIN : '#333',
                    mb: 2,
                    transition: 'color 0.3s ease'
                  }}
                >
                  I'm a Company
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: userType === 'company' ? '#555' : '#666',
                    lineHeight: 1.6,
                    mb: 3,
                    transition: 'color 0.3s ease'
                  }}
                >
                  Need talented professionals? Find the perfect match for your projects and teams.
                </Typography>

                {/* Features List */}
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  {[
                    '✓ Post job opportunities',
                    '✓ Access talent pool',
                    '✓ Skill-based matching',
                    '✓ Quality assessments'
                  ].map((feature, index) => (
                    <Typography 
                      key={index}
                      variant="body2" 
                      sx={{ 
                        color: userType === 'company' ? '#555' : '#666',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem'
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>

                {/* Status Badge */}
                {userType === 'company' && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
                  }}>
                  SELECTED
                </Box>
                )}

                {/* Disabled Overlay */}
                {(userRole === 'jobseeker' || isTestJobReturnUrl) && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                      Not Available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Bottom Info */}
            <Box sx={{ mt: 6, p: 3, borderRadius: 3, backgroundColor: '#F8F9FA', maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> Choose the option that best describes your current role. 
                You can always update your preferences later in your profile settings.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Personal Details Step - Only for candidates */}
        {currentStep === 'Personal Details' && userType === 'candidate' && (
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
                <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Tell us about yourself
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Let's start building your professional profile. This information helps us personalize your experience and connect you with the right opportunities.
              </Typography>
            </Box>

            {/* Enhanced Form */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              maxWidth: 600,
              mx: 'auto'
            }}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
              />
            </Box>

            {/* Help Text */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: '#F8F9FA',
              border: '2px solid #E9ECEF',
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#495057', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> Use your legal name as it appears on official documents. 
                This helps with verification and professional networking.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Company Details Step */}
        {currentStep === 'Company Details' && (
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
                <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Tell us about your company
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Help us understand your organization better to find the perfect talent match for your needs.
              </Typography>
            </Box>

            {/* Enhanced Form */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              maxWidth: 600,
              mx: 'auto'
            }}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyDetails.name}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
              />

              <StyledSelect
                select
                fullWidth
                label="Industry"
                value={companyDetails.industry}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, industry: e.target.value }))}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Technology" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Technology</MenuItem>
                <MenuItem value="Finance" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Finance</MenuItem>
                <MenuItem value="Healthcare" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Healthcare</MenuItem>
                <MenuItem value="Education" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Education</MenuItem>
                <MenuItem value="Other" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Other</MenuItem>
              </StyledSelect>

              <StyledSelect
                select
                fullWidth
                label="Company Size"
                value={companyDetails.size}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, size: e.target.value }))}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="1-10" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>1-10 employees</MenuItem>
                <MenuItem value="11-50" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>11-50 employees</MenuItem>
                <MenuItem value="51-200" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>51-200 employees</MenuItem>
                <MenuItem value="201-500" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>201-500 employees</MenuItem>
                <MenuItem value="501+" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>501+ employees</MenuItem>
              </StyledSelect>

              <StyledSelect
                select
                fullWidth
                label="Location"
                value={companyDetails.location}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, location: e.target.value }))}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    color: '#333',
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 500
                  },
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: '#E0E0E0',
                    borderWidth: 2,
                    transition: 'all 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN 
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: GREEN_MAIN,
                    borderWidth: 3
                  }
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Remote" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Remote</MenuItem>
                <MenuItem value="On-site" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>On-site</MenuItem>
                <MenuItem value="Hybrid" sx={{ color: '#333', fontWeight: 500, py: 1.5 }}>Hybrid</MenuItem>
              </StyledSelect>
            </Box>

            {/* Help Text */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: '#F8F9FA',
              border: '2px solid #E9ECEF',
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#495057', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> Providing accurate company information helps us match you with the right candidates 
                and ensures a better hiring experience for your organization.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Skills Selection Steps - Combined logic for both candidate and company */}
        {(currentStep === 'Select Skills' || currentStep === 'Required Skills') && (
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
                <CodeIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                {userType === 'company' ? 'Required Skills Selection' : 'Skill Assessment'}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {userType === 'company' 
                  ? 'Choose the skills that best match your company\'s requirements. This helps us find the perfect talent match.'
                  : 'Select the skill you want to be assessed on. Choose wisely as this will determine your test content.'
                }
              </Typography>
            </Box>

            {/* Enhanced Categories Tabs */}
            <Paper sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
              border: '2px solid #DEE2E6',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, textAlign: 'center' }}>
                Choose a Skill Category
              </Typography>
              <Tabs
                value={selectedCategory}
                onChange={(_, v) => setSelectedCategory(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 140,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#666',
                    borderRadius: 2,
                    mx: 0.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 157, 0.1)',
                      color: GREEN_MAIN
                    },
                    '&.Mui-selected': {
                      color: GREEN_MAIN,
                      backgroundColor: 'rgba(0, 255, 157, 0.15)',
                      fontWeight: 700
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: GREEN_MAIN,
                    height: 4,
                    borderRadius: 2
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
                    sx={{
                      '& .MuiTab-iconWrapper': {
                        color: 'inherit',
                        mr: 1
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Paper>

            {/* Skills Selection Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                mb={3} 
                sx={{ 
                  color: '#333',
                  fontWeight: 600,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {userType === 'company'
                  ? `Select ${selectedCategory} skills for your company`
                  : `Choose your ${selectedCategory} skill`
                }
              </Typography>

              {skillWarning && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: '#FFF3CD',
                  border: '1px solid #FFEAA7',
                  textAlign: 'center'
                }}>
                  <Typography color="warning.main" sx={{ fontWeight: 600 }}>
                    ⚠️ {skillWarning}
                  </Typography>
                </Box>
              )}

              {/* Enhanced Skills Grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
                gap: 3,
                mb: 4
              }}>
                {filteredSkills.map(skill => {
                  const isCompany = userType === 'company';
                  const skillsList = isCompany ? requiredSkills : skills;
                  const sel = skillsList.includes(skill.label);

                  return (
                    <Tooltip
                      key={skill.label}
                      title={`Click to ${sel ? 'remove' : 'add'} ${skill.label}`}
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                          '&:hover': {
                            transform: 'scale(1.08)',
                            zIndex: 1
                          }
                        }}
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
                            height: 50,
                            border: `2px solid #${skill.color}`,
                            backgroundColor: sel ? `#${skill.color}` : 'white',
                            color: sel ? '#fff' : `#${skill.color}`,
                            fontWeight: sel ? 700 : 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: sel 
                              ? `0 8px 25px rgba(${parseInt(skill.color.slice(0, 2), 16)}, ${parseInt(skill.color.slice(2, 4), 16)}, ${parseInt(skill.color.slice(4, 6), 16)}, 0.4)`
                              : '0 4px 15px rgba(0,0,0,0.1)',
                            '&:hover': {
                              backgroundColor: sel ? `#${skill.color}` : `#${skill.color}`,
                              color: '#fff',
                              boxShadow: `0 12px 30px rgba(${parseInt(skill.color.slice(0, 2), 16)}, ${parseInt(skill.color.slice(2, 4), 16)}, ${parseInt(skill.color.slice(4, 6), 16)}, 0.5)`,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        />
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>

              {/* Skills Summary */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                backgroundColor: '#F8F9FA',
                border: '2px solid #E9ECEF',
                textAlign: 'center'
              }}>
                <Typography variant="body1" sx={{ color: '#495057', fontWeight: 600, mb: 1 }}>
                  {userType === 'company' ? 'Selected Skills:' : 'Your Selected Skill:'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {userType === 'company' ? (
                    requiredSkills.length > 0 ? (
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
                        No skills selected yet
                      </Typography>
                    )
                  ) : (
                    skills.length > 0 ? (
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
                        No skill selected yet
                      </Typography>
                    )
                  )}
                </Box>
              </Box>
            </Box>

            {/* Enhanced Hedera Experience Question */}
            {((userType === 'candidate' && skills.includes('Hedera')) ||
              (userType === 'company' && requiredSkills.includes('Hedera'))) && (
                <Box sx={{ 
                  mt: 6, 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)',
                  border: '2px solid #02E2FF30',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 6px 20px rgba(2, 226, 255, 0.3)'
                  }}>
                    <BugReportIcon sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: '#333',
                      fontWeight: 600,
                      mb: 3
                    }}
                  >
                    {userType === 'company'
                      ? 'Is Hedera experience required?'
                      : 'Do you have experience working with Hedera?'
                    }
                  </Typography>
                  <RadioGroup
                    row
                    value={hederaExp}
                    onChange={(e) => setHederaExp(e.target.value as 'yes' | 'no')}
                    sx={{ 
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          sx={{
                            color: '#02E2FF',
                            '&.Mui-checked': {
                              color: '#02E2FF'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: '#333', fontWeight: 500 }}>
                          Yes, I have experience
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          sx={{
                            color: '#02E2FF',
                            '&.Mui-checked': {
                              color: '#02E2FF'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: '#333', fontWeight: 500 }}>
                          No, I'm new to Hedera
                        </Typography>
                      }
                    />
                  </RadioGroup>
                </Box>
              )}

            {/* Help Text */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: '#E8F5E8',
              border: '2px solid #C8E6C9',
              textAlign: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}>
              <Typography variant="body2" sx={{ color: '#2E7D32', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> {userType === 'company' 
                  ? 'Select skills that accurately represent your company\'s needs. You can select multiple skills to broaden your talent search.'
                  : 'Choose the skill you\'re most confident in. This will be the focus of your assessment and help showcase your expertise.'
                }
              </Typography>
            </Box>
          </Box>
        )}

        {/* Experience Level Step for Company */}
        {currentStep === 'Experience Level' && (
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
                <AnalyticsIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Required Experience Level
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Specify the experience level required for the position. This helps us match you with candidates who meet your criteria.
              </Typography>
            </Box>

            {/* Enhanced Experience Level Selection */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <RadioGroup
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                {[
                  { value: 'Entry Level', label: 'Entry Level', description: '0-2 years of experience', icon: '🌱' },
                  { value: 'Mid Level', label: 'Mid Level', description: '2-5 years of experience', icon: '🚀' },
                  { value: 'Senior', label: 'Senior', description: '5-8 years of experience', icon: '⭐' },
                  { value: 'Lead/Expert', label: 'Lead/Expert', description: '8+ years of experience', icon: '🏆' }
                ].map(level => (
                  <Paper
                    key={level.value}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: `2px solid ${experienceLevel === level.value ? GREEN_MAIN : '#E0E0E0'}`,
                      backgroundColor: experienceLevel === level.value ? `${GREEN_MAIN}10` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: GREEN_MAIN,
                        backgroundColor: `${GREEN_MAIN}05`,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => setExperienceLevel(level.value)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: experienceLevel === level.value 
                          ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                          : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        transition: 'all 0.3s ease'
                      }}>
                        {level.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormControlLabel
                          value={level.value}
                          control={
                            <Radio
                              sx={{
                                color: experienceLevel === level.value ? GREEN_MAIN : '#666',
                                '&.Mui-checked': {
                                  color: GREEN_MAIN
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="h6" sx={{ 
                                color: experienceLevel === level.value ? GREEN_MAIN : '#333',
                                fontWeight: 600,
                                mb: 0.5
                              }}>
                                {level.label}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: experienceLevel === level.value ? '#555' : '#666',
                                fontSize: '0.9rem'
                              }}>
                                {level.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </RadioGroup>
            </Box>

            {/* Help Text */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: '#F8F9FA',
              border: '2px solid #E9ECEF',
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#495057', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> Choose the experience level that best matches your requirements. 
                This ensures candidates have the right expertise for your projects.
              </Typography>
            </Box>
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
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
                <StarIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Rate Your Proficiency
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Assess your skill level for each selected skill. Be honest about your capabilities to get the most accurate assessment.
              </Typography>
            </Box>

            {/* Proficiency Rating Section */}
            <Box sx={{ maxWidth: 700, mx: 'auto' }}>
              {skills.map(skill => (
                <Paper
                  key={skill}
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    border: '2px solid #E0E0E0',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: GREEN_MAIN,
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#333',
                        fontWeight: 600,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CodeIcon sx={{ color: GREEN_MAIN, fontSize: 24 }} />
                      {skill}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        fontSize: '0.9rem'
                      }}
                    >
                      Drag the slider to rate your proficiency level
                    </Typography>
                  </Box>

                  {/* Enhanced Slider */}
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={proficiency[skill] ?? 3}
                      onChange={(_, v) => setProf(skill, v as number)}
                      step={1}
                      min={1}
                      max={5}
                      marks={[
                        { value: 1, label: 'Novice' },
                        { value: 2, label: 'Beginner' },
                        { value: 3, label: 'Intermediate' },
                        { value: 4, label: 'Advanced' },
                        { value: 5, label: 'Expert' }
                      ]}
                      sx={{
                        color: GREEN_MAIN,
                        height: 8,
                        '& .MuiSlider-track': {
                          border: 'none',
                          height: 8,
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                        },
                        '& .MuiSlider-rail': {
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#E0E0E0'
                        },
                        '& .MuiSlider-thumb': {
                          width: 24,
                          height: 24,
                          backgroundColor: GREEN_MAIN,
                          border: '3px solid white',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          '&:hover': {
                            boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                            transform: 'scale(1.1)'
                          }
                        },
                        '& .MuiSlider-mark': {
                          backgroundColor: '#E0E0E0',
                          width: 4,
                          height: 4,
                          borderRadius: '50%'
                        },
                        '& .MuiSlider-markActive': {
                          backgroundColor: GREEN_MAIN
                        },
                        '& .MuiSlider-markLabel': {
                          color: '#666',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          mt: 1
                        }
                      }}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => {
                        const labels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                        return labels[value - 1] || value;
                      }}
                    />
                  </Box>

                  {/* Proficiency Level Display */}
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: `${GREEN_MAIN}10`,
                    border: `1px solid ${GREEN_MAIN}30`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                      Current Level:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: GREEN_MAIN,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      {(() => {
                        const level = proficiency[skill] ?? 3;
                        const labels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                        return labels[level - 1] || level;
                      })()}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Help Text */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: '#E8F5E8',
              border: '2px solid #C8E6C9',
              textAlign: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}>
              <Typography variant="body2" sx={{ color: '#2E7D32', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> Rate your skills honestly based on your actual experience and confidence level. 
                This helps us provide you with the most appropriate assessment and opportunities.
              </Typography>
            </Box>
          </Box>
        )}

        {currentStep === 'Review' && (
          <Box sx={{ py: 4 }}>
            {/* Enhanced Header */}
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
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: 'black',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Review Your Profile
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Please review all the information below before proceeding. You can go back to make changes if needed.
              </Typography>
            </Box>

            {/* Profile Type Badge */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 4 
            }}>
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

                  {/* Experience Level Section */}
                  <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid ${GREEN_MAIN}20` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <AnalyticsIcon sx={{ color: GREEN_MAIN, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                        Required Experience Level
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                      {experienceLevel || 'Not specified'}
                    </Typography>
                  </Paper>

                  {/* Hedera Experience Section */}
                  {hederaExp === 'yes' && (
                    <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid #02E2FF20`, background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)' }}>
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
                              <Box sx={{ 
                                display: 'flex', 
                                gap: 0.5 
                              }}>
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
                    <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: `2px solid #02E2FF20`, background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)' }}>
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
          {activeStep === steps.length - 1 && callbackUrl ? (
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                const success = await handleCreateOrUpdateProfile();
                if (success) {
                  router.push(decodeURIComponent(callbackUrl as string));
                }
              }}
              sx={{ background: GREEN_MAIN, borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: GREEN_MAIN } }}
            >
              Go to Activate
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleStartTest : handleNext}
              disabled={
                activeStep === 0 && !userType ||
                (currentStep === 'Personal Details' && (firstName.trim() === '' || lastName.trim() === '')) ||
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
              {activeStep === 0
                ? 'Get Started'
                : activeStep === steps.length - 1
                  ? (userType === 'company'
                    ? 'Go to Dashboard'
                    : (router.query.returnUrl
                      ? 'Continue to Test'
                      : 'Start Test'))
                  : 'Next'}
            </Button>
          )}
        </Box>
      </Card>
        </Box>
      </Box>
  );
}

// Export with dynamic import to prevent SSR hydration issues
export default dynamic(() => Promise.resolve(Preferences), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Typography variant="h6" sx={{ color: '#666' }}>
        Loading...
      </Typography>
    </Box>
  )
});
