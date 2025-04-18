import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '../store/features/profileSlice';
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
  InputLabel
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
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    experienceLevel: ''
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
  };

  const handleSkillTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkillType(event.target.value);
    setSelectedSkill('');
    setSoftSkillType('');
    setSoftSkillLanguage('');
  };

  const handleTestSubmit = () => {
    if (skillType === 'technical' && selectedSkill) {
      router.push(`/test?type=technical&skill=${selectedSkill}`);
    } else if (skillType === 'soft') {
      const selectedSoftSkill = softSkills.find(skill => skill.value === softSkillType);
      const queryParams = new URLSearchParams();
      queryParams.append('type', 'soft');
      queryParams.append('skill', softSkillType);
      
      if (selectedSoftSkill?.requiresLanguage) {
        queryParams.append('language', softSkillLanguage);
      }
      if (softSkillSubcategory) {
        queryParams.append('subcategory', softSkillSubcategory);
      }
      
      router.push(`/test?${queryParams.toString()}`);
    }
    handleCloseTestModal();
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

  const softSkills = [
    { 
      value: 'communication',
      label: 'Communication',
      requiresLanguage: true
    },
    { 
      value: 'leadership',
      label: 'Leadership',
      subcategories: [
        { value: 'team_management', label: 'Team Management' },
        { value: 'decision_making', label: 'Decision Making' },
        { value: 'strategic_planning', label: 'Strategic Planning' },
        { value: 'conflict_resolution', label: 'Conflict Resolution' }
      ]
    },
    { 
      value: 'problem_solving',
      label: 'Problem Solving',
      subcategories: [
        { value: 'analytical_thinking', label: 'Analytical Thinking' },
        { value: 'critical_thinking', label: 'Critical Thinking' },
        { value: 'creative_thinking', label: 'Creative Thinking' },
        { value: 'innovation', label: 'Innovation' }
      ]
    },
    { 
      value: 'interpersonal',
      label: 'Interpersonal Skills',
      subcategories: [
        { value: 'emotional_intelligence', label: 'Emotional Intelligence' },
        { value: 'teamwork', label: 'Teamwork' },
        { value: 'networking', label: 'Networking' },
        { value: 'collaboration', label: 'Collaboration' }
      ]
    },
    { 
      value: 'time_management',
      label: 'Time Management',
      subcategories: [
        { value: 'prioritization', label: 'Prioritization' },
        { value: 'delegation', label: 'Delegation' },
        { value: 'planning', label: 'Planning' },
        { value: 'organization', label: 'Organization' }
      ]
    }
  ];

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' }
  ];

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
                      {profile.skills?.map((skill: any) => (
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
                        onChange={(e) => {
                          setSoftSkillType(e.target.value);
                          setSoftSkillSubcategory('');
                          setSoftSkillLanguage('');
                        }}
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
                          <MenuItem key={skill.value} value={skill.value}>
                            {skill.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {softSkillType && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          {softSkillType === 'communication' ? 'Select Language' : 'Select Specific Area'}
                        </Typography>
                        
                        {softSkillType === 'communication' ? (
                          <FormControl fullWidth>
                            <Select
                              value={softSkillLanguage}
                              onChange={(e) => setSoftSkillLanguage(e.target.value)}
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
                              onChange={(e) => setSoftSkillSubcategory(e.target.value)}
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
                                .find(skill => skill.value === softSkillType)
                                ?.subcategories?.map((sub) => (
                                  <MenuItem key={sub.value} value={sub.value}>
                                    {sub.label}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
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
                    (skillType === 'soft' && softSkillType === 'communication' && !softSkillLanguage) ||
                    (skillType === 'soft' && softSkillType !== 'communication' && !softSkillSubcategory)
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
              
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                gap: 4,
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
                    value={85}
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
                      85%
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
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', opacity: 0.9, textAlign: { xs: 'center', md: 'left' } }}>
                    Skill Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Technical Skills</Typography>
                        <Typography sx={{ color: '#02E2FF' }}>90%</Typography>
                      </Box>
                      <Box sx={{ 
                        height: '6px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '90%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                          borderRadius: '3px'
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Soft Skills</Typography>
                        <Typography sx={{ color: '#02E2FF' }}>80%</Typography>
                      </Box>
                      <Box sx={{ 
                        height: '6px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '80%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                          borderRadius: '3px'
                        }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', opacity: 0.9 }}>
                  Skill Proficiency
                </Typography>
                {profile.skills?.map((skill: any) => (
                  <Box key={skill.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: '#ffffff' }}>{skill.name}</Typography>
                      <Typography sx={{ color: '#02E2FF' }}>{skill.proficiencyLevel}/5</Typography>
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

        
      </Container>
    </Box>
  );
} 