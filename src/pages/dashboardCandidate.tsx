import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile } from '../store/features/profileSlice';
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
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/router';

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

const SkillCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    background: 'rgba(30, 41, 59, 0.8)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
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

const UserInfoCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(3),
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

export default function DashboardCandidate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);
  const [editSkillDialog, setEditSkillDialog] = useState(false);

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

  const getProficiencyRating = (level: number) => (level / 5) * 5;

  const getExperienceLevelColor = (level: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'Entry Level': { bg: 'rgba(74, 222, 128, 0.1)', text: '#22c55e' },
      'Junior+': { bg: 'rgba(56, 189, 248, 0.1)', text: '#0ea5e9' },
      'Mid Level': { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
      'Senior': { bg: 'rgba(251, 146, 60, 0.1)', text: '#fb923c' },
      'Expert': { bg: 'rgba(244, 63, 94, 0.1)', text: '#f43f5e' }
    };
    return colors[level] || { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
  };

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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, position: 'relative', zIndex: 2, color: '#ffffff' }}>
            {profile.userId.username}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, position: 'relative', zIndex: 2, color: '#ffffff' }}>
            {profile.type} • {profile.userId.role}
          </Typography>
          <StatsContainer>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Experience Level
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile.requiredExperienceLevel}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Skills Count
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile.skills.length}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Last Login
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {new Date(profile.userId.lastLogin).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Typography>
            </StatCard>
          </StatsContainer>
        </ProfileHeader>

        {/* User Information */}
        <UserInfoCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <SectionTitle>User Information</SectionTitle>
            {profile.userId.isVerified && (
              <Chip
                label="Verified Account"
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
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', width: '120px' }}>Username:</Typography>
            <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.username}</Typography>
          </InfoRow>
          
          <InfoRow>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', width: '120px' }}>Email:</Typography>
            <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.email}</Typography>
          </InfoRow>
          
          <InfoRow>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', width: '120px' }}>Role:</Typography>
            <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.userId.role}</Typography>
          </InfoRow>
          
          <InfoRow>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', width: '120px' }}>Member Since:</Typography>
            <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>
              {new Date(profile.userId.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
          </InfoRow>
          
          <InfoRow>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', width: '120px' }}>Last Active:</Typography>
            <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>
              {new Date(profile.userId.lastLogin).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </InfoRow>
        </UserInfoCard>

        {/* Skills Section */}
        <StyledCard>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4
          }}>
            <SectionTitle>Technical Skills</SectionTitle>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setEditSkillDialog(true)}
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
              Add Skill
            </Button>
          </Box>
          
          {profile.skills.map((skill) => (
            <SkillCard key={skill._id} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#ffffff' }}>
                    {skill.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StyledRating
                      value={getProficiencyRating(skill.proficiencyLevel)}
                      precision={0.5}
                      readOnly
                      icon={<StarIcon fontSize="small" />}
                      emptyIcon={<StarIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.2)' }} />}
                    />
                    <Chip 
                      label={skill.experienceLevel}
                      size="small"
                      sx={{ 
                        borderRadius: '8px',
                        backgroundColor: getExperienceLevelColor(skill.experienceLevel).bg,
                        color: getExperienceLevelColor(skill.experienceLevel).text,
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                    Proficiency: {skill.proficiencyLevel}/5
                  </Typography>
                </Box>
              </Box>
            </SkillCard>
          ))}
        </StyledCard>

        {/* Add Skill Dialog */}
        <Dialog
          open={editSkillDialog}
          onClose={() => setEditSkillDialog(false)}
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Skill</Typography>
            <IconButton
              onClick={() => setEditSkillDialog(false)}
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
              Skill Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., JavaScript, Python, React"
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Proficiency Level (1-5)
            </Typography>
            <StyledRating
              sx={{ mb: 3 }}
              icon={<StarIcon fontSize="large" />}
              emptyIcon={<StarIcon fontSize="large" />}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Experience Level
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
              onClick={() => setEditSkillDialog(false)}
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
              onClick={() => setEditSkillDialog(false)}
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
              Add Skill
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 