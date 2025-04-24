import { useState, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '../store/features/profileSlice';
import type { Profile as ProfileType } from '../store/features/profileSlice';
import { AppDispatch } from '../store/store';
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Rating,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  Paper,
  Grid,
  Stack,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
  Slider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
    borderRadius: '2px'
  }
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: '#02E2FF'
  },
  '& .MuiRating-iconHover': {
    color: '#00FFC3'
  }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
  color: '#ffffff',
  padding: theme.spacing(6),
  borderRadius: '24px',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'radial-gradient(circle at top right, rgba(2,226,255,0.15) 0%, transparent 70%)',
    zIndex: 1
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255,255,255,0.05)',
  padding: theme.spacing(3),
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: 'rgba(255,255,255,0.08)'
  }
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '8px',
  padding: theme.spacing(1),
  height: '32px',
  background: 'rgba(2, 226, 255, 0.1)',
  color: '#02E2FF',
  border: '1px solid rgba(2, 226, 255, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(2, 226, 255, 0.2)',
    transform: 'scale(1.05)'
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
  }
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.05)',
    transform: 'translateX(4px)'
  }
}));

interface MatchingCandidate {
  id: string;
  name: string;
  matchScore: number;
  location: string;
  role: string;
  skills: Array<{
    name: string;
    proficiencyLevel: number;
  }>;
  experienceLevel: string;
  description: string;
  avatarUrl: string;
  availability: string;
  expectedSalary?: string;
}

interface Skill {
  name: string;
  proficiencyLevel: number;
  value?: string;
  requiresLanguage?: boolean;
  subcategories?: Array<{
    value: string;
    label: string;
  }>;
}

// Add this before calculateSkillPercentage
const softSkillNames = ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management'];

// Update the calculation function to handle both technical and soft skills
const calculateSkillPercentage = (profile: any, type: 'technical' | 'soft'): number => {
  if (!profile) return 0;

  if (type === 'technical') {
    const technicalSkills = profile.skills?.filter((skill: any) => !softSkillNames.includes(skill.name)) || [];
    if (technicalSkills.length === 0) return 0;
    
    const totalScore = technicalSkills.reduce((sum: number, skill: any) => {
      return sum + (skill.proficiencyLevel / 5) * 100;
    }, 0);
    
    return totalScore / technicalSkills.length;
  } else {
    // For soft skills
    if (!profile.softSkills?.length) return 0;
    
    const totalScore = profile.softSkills.reduce((sum: any, skill: any) => {
      // Convert experienceLevel to number
      const proficiencyMap: { [key: string]: number } = {
        'Entry Level': 1,
        'Junior': 2,
        'Mid Level': 3,
        'Senior': 4,
        'Expert': 5
      };
      const proficiencyLevel = proficiencyMap[skill.experienceLevel] || 1;
      return sum + (proficiencyLevel / 5) * 100;
    }, 0);
    
    return totalScore / profile.softSkills.length;
  }
};

// Add helper function to map proficiency to experience level
const getExperienceLevelFromProficiency = (proficiencyLevel: number): string => {
  switch (proficiencyLevel) {
    case 1:
      return 'Entry Level';
    case 2:
      return 'Junior';
    case 3:
      return 'Mid Level';
    case 4:
      return 'Senior';
    case 5:
      return 'Expert';
    default:
      return 'Entry Level';
  }
};

const CandidateCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(2,226,255,0.15)',
    border: '1px solid rgba(2,226,255,0.3)',
  }
}));

const SkillBar = styled(Box)(({ theme }) => ({
  height: '4px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '2px',
  overflow: 'hidden',
  '& .bar': {
    height: '100%',
    background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
    transition: 'width 0.3s ease'
  }
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '12px',
    height: '12px',
    background: '#22c55e',
    borderRadius: '50%',
    border: '2px solid rgba(30, 41, 59, 0.7)'
  }
}));

const ScoreCircle = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '150px',
  height: '150px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto'
}));

export default function DashboardCandidate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [skillType, setSkillType] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [softSkillType, setSoftSkillType] = useState('');
  const [softSkillLanguage, setSoftSkillLanguage] = useState('');
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState('');
  const [softSkillProficiency, setSoftSkillProficiency] = useState<number>(1);
  const [isExistingSoftSkill, setIsExistingSoftSkill] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    experienceLevel: ''
  });

  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiencyLevel: 0
  });

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.userId.username,
        email: profile.userId.email,
        experienceLevel: profile.requiredExperienceLevel || ''
      });
    }
  }, [profile]);

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Add your update profile API call here
      console.log('Updating profile with:', formData);
      handleEditProfileClose();
      // Optionally refresh the profile data
      dispatch(getMyProfile());
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    try {
      // First clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Then clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStartTest = () => {
    setTestModalOpen(true);
  };

  const handleCloseTestModal = () => {
    setTestModalOpen(false);
    setSkillType('');
    setSelectedSkill('');
    setSoftSkillType('');
    setSoftSkillLanguage('');
    setSoftSkillSubcategory('');
    setSoftSkillProficiency(1);
  };

  const handleSkillTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkillType(event.target.value);
    setSelectedSkill('');
    setSoftSkillType('');
    setSoftSkillLanguage('');
  };

  const handleTestSubmit = async () => {
    try {
      if (skillType === 'technical' && selectedSkill) {
        // Find the selected skill in the profile to get its proficiency level
        const selectedSkillData = profile?.skills.find(skill => skill.name === selectedSkill);
        const proficiencyLevel = selectedSkillData?.proficiencyLevel || 1;
        
        router.push(`/test?type=technical&skill=${selectedSkill}&proficiency=${proficiencyLevel}`);
      } else if (skillType === 'soft') {
        // Get the experience level based on proficiency
        const experienceLevel = getExperienceLevelFromProficiency(softSkillProficiency);

        // Add soft skill to database
        const token = Cookies.get('api_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/addSoftSkills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            softSkills: [
              {
                name: softSkillType,
                category: softSkillType === 'Communication' ? softSkillLanguage : softSkillSubcategory,
                experienceLevel,
                NumberTestPassed: 0,
                ScoreTest: 0
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add soft skill');
        }

        // After successful addition, proceed with the test
        const selectedSoftSkill = softSkills.find(skill => skill.value === softSkillType);
        const queryParams = new URLSearchParams();
        queryParams.append('type', 'soft');
        queryParams.append('skill', softSkillType);
        queryParams.append('proficiency', softSkillProficiency.toString());

        if (selectedSoftSkill?.requiresLanguage) {
          queryParams.append('language', softSkillLanguage);
        }
        if (softSkillSubcategory) {
          queryParams.append('subcategory', softSkillSubcategory);
        }

        router.push(`/test?${queryParams.toString()}`);
      }
      handleCloseTestModal();
    } catch (error) {
      console.error('Error in test submission:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleAddSkill = async () => {
    try {
      const token = Cookies.get('api_token');

      // Combine existing skills with the new skill
      const updatedSkills = [
        ...(profile?.skills || []),
        {
          name: newSkill.name,
          proficiencyLevel: newSkill.proficiencyLevel,
          experienceLevel: getExperienceLevelFromProficiency(newSkill.proficiencyLevel),
          NumberTestPassed: 0,
          ScoreTest: 0
        }
      ];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "Candidate",
          skills: updatedSkills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }

      // Refresh the profile data
      dispatch(getMyProfile());

      // Reset form and close dialog
      setNewSkill({ name: '', proficiencyLevel: 0 });
      setAddSkillDialogOpen(false);
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const matchingCandidates: MatchingCandidate[] = [
    {
      id: "1",
      name: "Alex Thompson",
      matchScore: 95,
      location: "New York, USA",
      role: "Full Stack Developer",
      skills: [
        { name: "React", proficiencyLevel: 5 },
        { name: "TypeScript", proficiencyLevel: 4 },
        { name: "Node.js", proficiencyLevel: 4 }
      ],
      experienceLevel: "Senior",
      description: "Passionate developer with 5+ years of experience in full-stack development and a focus on React ecosystems.",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      availability: "Available in 2 weeks",
      expectedSalary: "$120k - $150k"
    },
    {
      id: "2",
      name: "Sarah Chen",
      matchScore: 88,
      location: "San Francisco, USA",
      role: "Machine Learning Engineer",
      skills: [
        { name: "Python", proficiencyLevel: 5 },
        { name: "TensorFlow", proficiencyLevel: 4 },
        { name: "AWS", proficiencyLevel: 3 }
      ],
      experienceLevel: "Mid Level",
      description: "ML engineer specializing in computer vision and deep learning applications.",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      availability: "Immediately available",
      expectedSalary: "$100k - $130k"
    },
    {
      id: "3",
      name: "James Wilson",
      matchScore: 85,
      location: "London, UK",
      role: "Frontend Developer",
      skills: [
        { name: "React", proficiencyLevel: 4 },
        { name: "Vue.js", proficiencyLevel: 5 },
        { name: "UI/UX", proficiencyLevel: 4 }
      ],
      experienceLevel: "Senior",
      description: "Frontend specialist with a strong focus on creating beautiful and accessible user interfaces.",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      availability: "Available in 1 month",
      expectedSalary: "£70k - £90k"
    }
  ];

  const softSkills: Skill[] = [
    { 
      name: 'Communication', 
      proficiencyLevel: 0,
      requiresLanguage: true,
      subcategories: [
        { value: 'verbal', label: 'Verbal Communication' },
        { value: 'written', label: 'Written Communication' },
        { value: 'presentation', label: 'Presentation Skills' },
        { value: 'negotiation', label: 'Negotiation Skills' }
      ]
    },
    { 
      name: 'Leadership', 
      proficiencyLevel: 0,
      subcategories: [
        { value: 'team-management', label: 'Team Management' },
        { value: 'decision-making', label: 'Decision Making' },
        { value: 'delegation', label: 'Task Delegation' },
        { value: 'motivation', label: 'Team Motivation' }
      ]
    },
    { 
      name: 'Problem Solving', 
      proficiencyLevel: 0,
      subcategories: [
        { value: 'analytical', label: 'Analytical Thinking' },
        { value: 'critical', label: 'Critical Thinking' },
        { value: 'creative', label: 'Creative Problem Solving' },
        { value: 'strategic', label: 'Strategic Planning' }
      ]
    },
    { 
      name: 'Teamwork', 
      proficiencyLevel: 0,
      subcategories: [
        { value: 'collaboration', label: 'Collaboration' },
        { value: 'conflict-resolution', label: 'Conflict Resolution' },
        { value: 'adaptability', label: 'Adaptability' },
        { value: 'cultural-awareness', label: 'Cultural Awareness' }
      ]
    },
    { 
      name: 'Time Management', 
      proficiencyLevel: 0,
      subcategories: [
        { value: 'prioritization', label: 'Task Prioritization' },
        { value: 'scheduling', label: 'Scheduling' },
        { value: 'deadline-management', label: 'Deadline Management' },
        { value: 'work-life-balance', label: 'Work-Life Balance' }
      ]
    }
  ];

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' }
  ];

  const renderSkillOptions = (skill: Skill) => (
    <MenuItem key={skill.name} value={skill.name}>
      {skill.name}
    </MenuItem>
  );

  const checkExistingSoftSkill = (skillName: string, category?: string) => {
    if (!profile?.softSkills?.length) return null;
    
    return profile.softSkills.find(
      (skill) => {
        if (skillName === 'Communication') {
          // For Communication skills, match both name and language (category)
          return skill.name === skillName && skill.category === category;
        } else {
          // For other skills, match name and subcategory
          return skill.name === skillName && skill.category === category;
        }
      }
    );
  };

  const handleSoftSkillChange = (value: string) => {
    setSoftSkillType(value);
    setSoftSkillSubcategory('');
    setSoftSkillLanguage('');
    setIsExistingSoftSkill(false);
    setSoftSkillProficiency(1);
  };

  const handleSoftSkillSubcategoryChange = (value: string) => {
    setSoftSkillSubcategory(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      setIsExistingSoftSkill(true);
      const proficiencyMap: { [key: string]: number } = {
        'Entry Level': 1,
        'Junior': 2,
        'Mid Level': 3,
        'Senior': 4,
        'Expert': 5
      };
      setSoftSkillProficiency(proficiencyMap[existingSkill.experienceLevel] || 1);
    } else {
      setIsExistingSoftSkill(false);
      setSoftSkillProficiency(1);
    }
  };

  // Add handler for language change
  const handleSoftSkillLanguageChange = (value: string) => {
    setSoftSkillLanguage(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      setIsExistingSoftSkill(true);
      const proficiencyMap: { [key: string]: number } = {
        'Entry Level': 1,
        'Junior': 2,
        'Mid Level': 3,
        'Senior': 4,
        'Expert': 5
      };
      setSoftSkillProficiency(proficiencyMap[existingSkill.experienceLevel] || 1);
    } else {
      setIsExistingSoftSkill(false);
      setSoftSkillProficiency(1);
    }
  };

  // Filter technical skills (exclude soft skills)
  const getTechnicalSkills = () => {
    if (!profile?.skills) return [];
    return profile.skills.filter(skill => !softSkillNames.includes(skill.name));
  };

  if (loading) {
    return (
      <Container sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a'
      }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ borderRadius: '12px' }}>No profile data available</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 50%)
      `,
      py: 6
    }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <ProfileHeader>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h3" sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Welcome back, {profile.userId.username}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, color: '#ffffff' }}>
                  {profile.type} • {profile.userId.role}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.1)'
                  },
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Logout
              </Button>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <ActionButton
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartTest}
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                Start Test
              </ActionButton>
              <ActionButton
                variant="outlined"
                onClick={() => setEditProfileOpen(true)}
                sx={{
                  borderColor: '#02E2FF',
                  color: '#02E2FF',
                  '&:hover': {
                    borderColor: '#00FFC3',
                    color: '#00FFC3'
                  }
                }}
              >
                Edit Profile
              </ActionButton>
            </Stack>

            {/* Edit Profile Modal */}
            <Dialog
              open={editProfileOpen}
              onClose={handleEditProfileClose}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  background: 'rgba(30, 41, 59, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
              }}
            >
              <DialogTitle sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Edit Profile</Typography>
                  <IconButton
                    onClick={handleEditProfileClose}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#02E2FF',
                        },
                      },
                    }}
                  />
                  <TextField
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#02E2FF',
                        },
                      },
                    }}
                  />
                  <TextField
                    select
                    name="experienceLevel"
                    label="Experience Level"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#02E2FF',
                        },
                      },
                    }}
                    SelectProps={{
                      sx: { color: '#ffffff' }
                    }}
                  >
                    {['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'].map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </DialogContent>
              <DialogActions sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: 2
              }}>
                <Button
                  onClick={handleEditProfileClose}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                    }
                  }}
                >
                  Save Changes
                </Button>
              </DialogActions>
            </Dialog>

            {/* Test Selection Modal */}
            <Dialog
              open={testModalOpen}
              onClose={handleCloseTestModal}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  background: 'rgba(30, 41, 59, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
              }}
            >
              <DialogTitle sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Start New Test</Typography>
                  <IconButton
                    onClick={handleCloseTestModal}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                  <FormLabel sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Select Skill Type</FormLabel>
                  <RadioGroup
                    value={skillType}
                    onChange={handleSkillTypeChange}
                  >
                    <FormControlLabel
                      value="technical"
                      control={<Radio sx={{ color: '#02E2FF' }} />}
                      label="Technical Skill"
                      sx={{ color: '#ffffff' }}
                    />
                    <FormControlLabel
                      value="soft"
                      control={<Radio sx={{ color: '#02E2FF' }} />}
                      label="Soft Skill"
                      sx={{ color: '#ffffff' }}
                    />
                  </RadioGroup>
                </FormControl>

                {skillType === 'technical' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Technical Skill</InputLabel>
                    <Select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      sx={{
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#02E2FF',
                        },
                      }}
                    >
                      {getTechnicalSkills().map((skill: any) => (
                        <MenuItem key={skill.name} value={skill.name}>
                          {skill.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {skillType === 'soft' && (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Soft Skill</InputLabel>
                      <Select
                        value={softSkillType}
                        onChange={(e) => handleSoftSkillChange(e.target.value)}
                        sx={{
                          color: '#ffffff',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#02E2FF',
                          },
                        }}
                      >
                        {softSkills.map((skill) => (
                          <MenuItem key={skill.name} value={skill.name}>
                            {skill.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {softSkillType && (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            {softSkillType === 'Communication' ? 'Select Language' : 'Select Specific Area'}
                          </Typography>

                          {softSkillType === 'Communication' ? (
                            <FormControl fullWidth>
                              <Select
                                value={softSkillLanguage}
                                onChange={(e) => handleSoftSkillLanguageChange(e.target.value)}
                                sx={{
                                  color: '#ffffff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#02E2FF',
                                  },
                                }}
                              >
                                {languages.map((lang) => (
                                  <MenuItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <FormControl fullWidth>
                              <Select
                                value={softSkillSubcategory}
                                onChange={(e) => handleSoftSkillSubcategoryChange(e.target.value)}
                                sx={{
                                  color: '#ffffff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#02E2FF',
                                  },
                                }}
                              >
                                {softSkills
                                  .find(skill => skill.name === softSkillType)
                                  ?.subcategories?.map((sub) => (
                                    <MenuItem key={sub.value} value={sub.value}>
                                      {sub.label}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            {isExistingSoftSkill ? 'Current Proficiency Level' : 'Select Proficiency Level'}
                          </Typography>
                          <Box sx={{ px: 1 }}>
                            <Slider
                              value={softSkillProficiency}
                              onChange={(_, value) => !isExistingSoftSkill && setSoftSkillProficiency(value as number)}
                              disabled={isExistingSoftSkill}
                              min={1}
                              max={5}
                              step={1}
                              marks={[
                                { value: 1, label: 'Beginner' },
                                { value: 2, label: 'Elementary' },
                                { value: 3, label: 'Intermediate' },
                                { value: 4, label: 'Advanced' },
                                { value: 5, label: 'Expert' }
                              ]}
                              sx={{
                                color: isExistingSoftSkill ? 'rgba(2,226,255,0.5)' : '#02E2FF',
                                '& .MuiSlider-mark': {
                                  backgroundColor: 'rgba(255,255,255,0.3)',
                                },
                                '& .MuiSlider-markLabel': {
                                  color: 'rgba(255,255,255,0.7)',
                                  fontSize: '0.75rem',
                                },
                                '& .MuiSlider-valueLabel': {
                                  background: isExistingSoftSkill 
                                    ? 'rgba(2,226,255,0.5)'
                                    : 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                                },
                                '& .MuiSlider-thumb': {
                                  '&:hover, &.Mui-focusVisible': {
                                    boxShadow: '0 0 0 8px rgba(2,226,255,0.16)',
                                  },
                                  '&.Mui-active': {
                                    boxShadow: '0 0 0 12px rgba(2,226,255,0.24)',
                                  },
                                  '&.Mui-disabled': {
                                    '&:hover': {
                                      boxShadow: 'none',
                                    },
                                  },
                                },
                              }}
                            />
                          </Box>
                          {isExistingSoftSkill && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.7)', 
                                display: 'block', 
                                mt: 1,
                                textAlign: 'center'
                              }}
                            >
                              You have already taken a test for this skill
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: 2
              }}>
                <Button
                  onClick={handleCloseTestModal}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTestSubmit}
                  disabled={
                    !skillType ||
                    (skillType === 'technical' && !selectedSkill) ||
                    (skillType === 'soft' && !softSkillType) ||
                    (skillType === 'soft' && softSkillType === 'Communication' && !softSkillLanguage) ||
                    (skillType === 'soft' && softSkillType !== 'Communication' && !softSkillSubcategory)
                  }
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  Start Test
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Box sx={{
            marginTop: theme => theme.spacing(4),
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: theme => theme.spacing(3)
          }}>
            <Box>
              <StatCard>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff', letterSpacing: 2 }}>
                  Experience Level
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#02E2FF', mt: 1 }}>
                  {profile.requiredExperienceLevel || 'Not Set'}
                </Typography>
              </StatCard>
            </Box>
            <Box>
              <StatCard>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff', letterSpacing: 2 }}>
                  Skills Count
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#02E2FF', mt: 1 }}>
                  {profile.skills?.length || 0}
                </Typography>
              </StatCard>
            </Box>
            <Box>
              <StatCard>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff', letterSpacing: 2 }}>
                  Last Login
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#02E2FF', mt: 1 }}>
                  {new Date(profile.userId.lastLogin).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </StatCard>
            </Box>
            <Box>
              <StatCard>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff', letterSpacing: 2 }}>
                  Profile Status
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#02E2FF', mt: 1 }}>
                  {profile.userId.isVerified ? 'Verified' : 'Pending'}
                </Typography>
              </StatCard>
            </Box>
          </Box>
        </ProfileHeader>

        {/* User Information */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          },
          gap: 4
        }}>
          <Box>
            <StyledCard>
              <SectionTitle>Personal Information</SectionTitle>
              <InfoItem>
                <PersonIcon sx={{ color: '#02E2FF' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Username</Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.username}</Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <EmailIcon sx={{ color: '#02E2FF' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.email}</Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <WorkIcon sx={{ color: '#02E2FF' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Role</Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.role}</Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <CalendarTodayIcon sx={{ color: '#02E2FF' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Member Since</Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                    {new Date(profile.userId.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
              </InfoItem>
            </StyledCard>
          </Box>

          <Box>
            <StyledCard>
              <SectionTitle>Skills & Expertise</SectionTitle>

              {/* Overall Score Circle */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 4
              }}>
                <ScoreCircle>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={150}
                    thickness={4}
                    sx={{
                      position: 'absolute',
                      color: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={150}
                    thickness={4}
                    sx={{
                      position: 'absolute',
                      color: 'transparent',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                        stroke: 'url(#gradient)'
                      }
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography
                      variant="h5"
                      sx={{
                        background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold'
                      }}
                    >
                      {profile ? `${calculateSkillPercentage(profile, 'technical').toFixed(2)}%` : '0.00%'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        mt: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Overall
                    </Typography>
                  </Box>
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#02E2FF" />
                        <stop offset="100%" stopColor="#00FFC3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </ScoreCircle>
              </Box>

              {/* Soft Skills Distribution */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', opacity: 0.9 }}>
                  Soft Skills Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {profile?.softSkills?.length ? (
                    profile.softSkills.map((skill: any) => {
                      const proficiencyMap: { [key: string]: number } = {
                        'Entry Level': 1,
                        'Junior': 2,
                        'Mid Level': 3,
                        'Senior': 4,
                        'Expert': 5
                      };
                      const proficiencyLevel = proficiencyMap[skill.experienceLevel] || 1;
                      const percentage = (proficiencyLevel / 5) * 100;

                      return (
                        <Box key={`${skill.name}-${skill.category}`}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {skill.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                {skill.category}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{ color: '#02E2FF' }}>
                                {percentage.toFixed(0)}%
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                {skill.experienceLevel}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                              borderRadius: '3px',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', py: 2 }}>
                      No soft skills added yet. Start a soft skill test to add them.
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Technical Skills */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', opacity: 0.9 }}>
                    Skill Proficiency
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setAddSkillDialogOpen(true)}
                    sx={{
                      color: '#02E2FF',
                      borderColor: 'rgba(2,226,255,0.5)',
                      '&:hover': {
                        borderColor: '#02E2FF',
                        background: 'rgba(2,226,255,0.1)'
                      }
                    }}
                  >
                    Add Skill
                  </Button>
                </Box>
                {profile.skills
                  ?.filter((skill: any) => !softSkillNames.includes(skill.name))
                  ?.map((skill: any) => (
                  <Box key={skill.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: '#ffffff' }}>{skill.name}</Typography>
                      <Typography sx={{ color: '#02E2FF' }}>{skill.experienceLevel}</Typography>
                    </Box>
                    <Box sx={{
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${(skill.proficiencyLevel / 5) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </StyledCard>
          </Box>
        </Box>

        {/* Add Skill Dialog */}
        <Dialog
          open={addSkillDialogOpen}
          onClose={() => setAddSkillDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }}
        >
          <DialogTitle sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Add New Skill</Typography>
              <IconButton
                onClick={() => setAddSkillDialogOpen(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Skill Name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                InputProps={{
                  sx: {
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  },
                }}
              />
              <Box>
                <Typography sx={{ color: '#ffffff', mb: 1 }}>Proficiency Level: {newSkill.proficiencyLevel}</Typography>
                <Slider
                  value={newSkill.proficiencyLevel}
                  onChange={(_, value) => setNewSkill({ ...newSkill, proficiencyLevel: value as number })}
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                  ]}
                  sx={{
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#02E2FF',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(2,226,255,0.2)',
                      },
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '& .MuiSlider-markActive': {
                      backgroundColor: '#02E2FF',
                    },
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{
            p: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Button
              onClick={() => setAddSkillDialogOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mr: 1
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSkill}
              disabled={!newSkill.name || !newSkill.proficiencyLevel}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Add Skill
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 