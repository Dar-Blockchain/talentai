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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import { useRouter } from 'next/router';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
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
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
    borderRadius: '2px'
  }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  color: '#ffffff',
  padding: theme.spacing(4),
  borderRadius: '16px',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'radial-gradient(circle at top right, rgba(2,226,255,0.1) 0%, transparent 60%)',
    zIndex: 1
  }
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3)
}));

const StatCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)',
  padding: theme.spacing(2),
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)'
}));

const CompanyInfoCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(3),
  backdropFilter: 'blur(10px)'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: 'rgba(2, 226, 255, 0.1)',
  color: '#02E2FF',
  fontWeight: 600,
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(2, 226, 255, 0.2)',
  }
}));

const CandidateCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(2,226,255,0.1)'
  }
}));

const MatchCard = styled(Box)(({ theme }) => ({
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

const MatchScore = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(2,226,255,0.1) 0%, rgba(0,255,195,0.1) 100%)',
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

// Add this near the top with other interfaces
interface MatchingCandidate {
  id: string;
  name: string;
  matchScore: number;
  location: string;
  role: string;
  skills: string[];
  experienceLevel: string;
}

export default function DashboardCompany() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);
  const [editSkillsDialog, setEditSkillsDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<MatchingCandidate[]>([]);

  // Add useEffect to handle filtering
  useEffect(() => {
    const filtered = sampleMatchingCandidates.filter(candidate => {
      const meetsScoreRequirement = candidate.matchScore >= minScore;
      const meetsSkillRequirement = selectedSkills.length === 0 || 
        selectedSkills.every(skill => candidate.skills.includes(skill));
      return meetsScoreRequirement && meetsSkillRequirement;
    });
    setFilteredCandidates(filtered);
  }, [minScore, selectedSkills]);

  // Initialize filtered candidates
  useEffect(() => {
    setFilteredCandidates(sampleMatchingCandidates);
  }, []);

  const handleFilterApply = () => {
    setFilterDialog(false);
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

  // Add sample matching candidates data
  const sampleMatchingCandidates: MatchingCandidate[] = [
    {
      id: "1",
      name: "John Doe",
      matchScore: 95,
      skills: ["React", "TypeScript", "Node.js"],
      experienceLevel: "Senior",
      location: "New York, USA",
      role: "Full Stack Developer"
    },
    {
      id: "2",
      name: "Jane Smith",
      matchScore: 88,
      skills: ["React", "JavaScript", "AWS"],
      experienceLevel: "Mid Level",
      location: "London, UK",
      role: "Frontend Developer"
    },
    {
      id: "3",
      name: "Mike Johnson",
      matchScore: 82,
      skills: ["React", "Python", "Docker"],
      experienceLevel: "Senior",
      location: "Berlin, Germany",
      role: "Backend Developer"
    }
  ];

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <ProfileHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                {profile.companyDetails?.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, color: '#ffffff' }}>
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
          <StatsContainer>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Industry
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile.companyDetails?.industry}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Company Size
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile.companyDetails?.size}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Location
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile.companyDetails?.location}
              </Typography>
            </StatCard>
          </StatsContainer>
        </ProfileHeader>

        {/* Company Information */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <CompanyInfoCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionTitle>Company Information</SectionTitle>
                {profile.userId.isVerified && (
                  <Chip
                    label="Verified Company"
                    color="success"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  />
                )}
              </Box>
              
              <InfoRow>
                <BusinessIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.name}</Typography>
              </InfoRow>
              
              <InfoRow>
                <CategoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.industry}</Typography>
              </InfoRow>
              
              <InfoRow>
                <GroupsIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.size} employees</Typography>
              </InfoRow>
              
              <InfoRow>
                <LocationOnIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.location}</Typography>
              </InfoRow>
            </CompanyInfoCard>

            {/* Required Skills Section */}
            <StyledCard>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3
              }}>
                <SectionTitle>Required Skills</SectionTitle>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setEditSkillsDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                    }
                  }}
                >
                  Add Skills
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.requiredSkills.map((skill, index) => (
                  <SkillChip key={index} label={skill} />
                ))}
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Required Experience Level
                </Typography>
                <Chip 
                  label={profile.requiredExperienceLevel}
                  sx={{ 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 226, 255, 0.1)',
                    color: '#02E2FF',
                    fontWeight: 600
                  }}
                />
              </Box>
            </StyledCard>
          </Box>

          {/* Matching Candidates Section */}
          <Box sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <SectionTitle>Matching Candidates</SectionTitle>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setFilterDialog(true)}
                sx={{
                  color: '#02E2FF',
                  borderColor: 'rgba(2,226,255,0.5)',
                  '&:hover': {
                    borderColor: '#02E2FF',
                    background: 'rgba(2,226,255,0.1)'
                  }
                }}
              >
                Filter Candidates
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                        {candidate.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <LocationOnIcon sx={{ fontSize: 16 }} />
                        {candidate.location}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${candidate.matchScore}%`}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(2,226,255,0.15) 0%, rgba(0,255,195,0.15) 100%)',
                        color: '#02E2FF',
                        fontWeight: 600,
                        borderRadius: '8px'
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={candidate.role}
                        size="small"
                        sx={{
                          background: 'rgba(2,226,255,0.1)',
                          color: '#02E2FF',
                          borderRadius: '6px'
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        • {candidate.experienceLevel}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      mb: 1
                    }}>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {candidate.skills.map((skill) => (
                        <SkillChip
                          key={skill}
                          label={skill}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: 'rgba(2,226,255,0.5)',
                        color: '#02E2FF',
                        '&:hover': {
                          borderColor: '#02E2FF',
                          background: 'rgba(2,226,255,0.1)'
                        }
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                        color: '#ffffff',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                        }
                      }}
                    >
                      Contact
                    </Button>
                  </Box>
                </CandidateCard>
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                View All Candidates
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Edit Skills Dialog */}
        <Dialog
          open={editSkillsDialog}
          onClose={() => setEditSkillsDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            pb: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Required Skills</Typography>
            <IconButton
              onClick={() => setEditSkillsDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'rgba(255,255,255,0.8)'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Add Required Skills
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter skills (comma separated)"
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Required Experience Level
            </Typography>
            <TextField
              fullWidth
              select
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              <option value="">Select Level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Junior+">Junior+</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior">Senior</option>
              <option value="Expert">Expert</option>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}>
            <Button 
              onClick={() => setEditSkillsDialog(false)}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setEditSkillsDialog(false)}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog
          open={filterDialog}
          onClose={() => setFilterDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Filter Candidates</Typography>
              <IconButton
                onClick={() => setFilterDialog(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>
              Minimum Match Score
            </Typography>
            <TextField
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              fullWidth
              InputProps={{
                inputProps: { min: 0, max: 100 },
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
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {profile?.requiredSkills.map((skill) => (
                <SkillChip
                  key={skill}
                  label={skill}
                  onClick={() => {
                    setSelectedSkills(prev =>
                      prev.includes(skill)
                        ? prev.filter(s => s !== skill)
                        : [...prev, skill]
                    );
                  }}
                  sx={{
                    backgroundColor: selectedSkills.includes(skill)
                      ? 'rgba(2,226,255,0.3)'
                      : 'rgba(2,226,255,0.1)',
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Button
              onClick={() => {
                setMinScore(0);
                setSelectedSkills([]);
              }}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                mr: 1
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleFilterApply}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                }
              }}
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 