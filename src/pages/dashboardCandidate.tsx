import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Rating,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';

// Mock data - Will be replaced with API calls
const mockProfile = {
  name: "John Developer",
  avatar: "https://i.pravatar.cc/150?img=4",
  title: "Full Stack Developer",
  about: "Passionate developer with 5+ years of experience in web development and blockchain technologies.",
  skills: [
    { name: "React", proficiency: 4.5, verified: true },
    { name: "TypeScript", proficiency: 4.0, verified: true },
    { name: "Node.js", proficiency: 4.2, verified: true },
    { name: "Hedera", proficiency: 3.8, verified: false }
  ],
  contact: {
    email: "john@example.com",
    linkedin: "https://linkedin.com/in/john",
    github: "https://github.com/john"
  },
  experience: [
    {
      company: "Tech Solutions Inc",
      position: "Senior Developer",
      duration: "2020 - Present"
    },
    {
      company: "Web Innovators",
      position: "Full Stack Developer",
      duration: "2018 - 2020"
    }
  ],
  education: [
    {
      institution: "Tech University",
      degree: "BSc Computer Science",
      year: "2018"
    }
  ],
  tests: [
    {
      name: "Hedera Fundamentals",
      status: "Not Started",
      description: "Test your knowledge of Hedera blockchain fundamentals"
    },
    {
      name: "React Advanced",
      status: "Completed",
      score: 92,
      description: "Advanced React concepts and best practices"
    }
  ]
};

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.2)'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: theme.spacing(3)
}));

const ExperienceItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(241, 245, 249, 0.5)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    transform: 'translateX(8px)'
  }
}));

const SkillBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(241, 245, 249, 0.5)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(241, 245, 249, 0.8)'
  }
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  '& .MuiAvatar-root': {
    width: 120,
    height: 120,
    marginBottom: theme.spacing(2),
    border: '4px solid #02E2FF',
    boxShadow: '0 0 20px rgba(2,226,255,0.3)'
  }
}));

const SocialLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiIconButton-root': {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  }
}));

const TestCard = styled(Card)<{ status: string }>(({ theme, status }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${
    status === 'Completed' ? '#10B981' : 
    status === 'In Progress' ? '#2563EB' : 
    '#6B7280'
  }`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateX(8px)'
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  }
}));

const LeftColumn = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '350px',
    flexShrink: 0
  }
}));

const RightColumn = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    flex: 1
  }
}));

export default function DashboardCandidate() {
  const router = useRouter();
  const [editSkillDialog, setEditSkillDialog] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 3 });

  const handleStartTest = (testName: string) => {
    // In a real app, this would start the test or redirect to test page
    router.push('/test');
  };

  const handleAddSkill = () => {
    // In a real app, this would update the skills through an API
    setEditSkillDialog(false);
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
        <ContentWrapper>
          {/* Left Column - Profile and Skills */}
          <LeftColumn>
            <StyledCard>
              <ProfileSection>
                <Avatar
                  src={mockProfile.avatar}
                  alt={mockProfile.name}
                />
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 1 
                }}>
                  {mockProfile.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#64748b',
                  mb: 2 
                }}>
                  {mockProfile.title}
                </Typography>
                <SocialLinks>
                  <IconButton
                    href={mockProfile.contact.linkedin}
                    target="_blank"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(14, 118, 168, 0.1)' 
                      }
                    }}
                  >
                    <LinkedInIcon sx={{ color: '#0e76a8' }} />
                  </IconButton>
                  <IconButton
                    href={mockProfile.contact.github}
                    target="_blank"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0,0,0,0.1)' 
                      }
                    }}
                  >
                    <GitHubIcon sx={{ color: '#333' }} />
                  </IconButton>
                </SocialLinks>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  {mockProfile.about}
                </Typography>
              </ProfileSection>
            </StyledCard>

            {/* Skills Section */}
            <StyledCard>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <SectionTitle>Skills & Expertise</SectionTitle>
                <IconButton
                  onClick={() => setEditSkillDialog(true)}
                  sx={{ 
                    backgroundColor: 'rgba(37,99,235,0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(37,99,235,0.2)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <AddIcon sx={{ color: '#2563eb' }} />
                </IconButton>
              </Box>
              {mockProfile.skills.map((skill) => (
                <SkillBar key={skill.name}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 0.5 
                    }}>
                      <Typography sx={{ 
                        fontWeight: 500,
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {skill.name}
                        {skill.verified && (
                          <Tooltip title="Verified Skill">
                            <VerifiedIcon sx={{ 
                              fontSize: 16, 
                              color: '#02E2FF' 
                            }} />
                          </Tooltip>
                        )}
                      </Typography>
                      <Typography sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        {(skill.proficiency * 20).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={skill.proficiency * 20}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(37,99,235,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#2563eb'
                        }
                      }}
                    />
                  </Box>
                </SkillBar>
              ))}
            </StyledCard>
          </LeftColumn>

          {/* Right Column */}
          <RightColumn>
            {/* Experience Section */}
            <StyledCard>
              <SectionTitle>Experience</SectionTitle>
              {mockProfile.experience.map((exp, index) => (
                <ExperienceItem key={index}>
                  <WorkIcon sx={{ color: '#2563eb' }} />
                  <Box>
                    <Typography sx={{ 
                      fontWeight: 600,
                      color: '#1e293b',
                      mb: 0.5
                    }}>
                      {exp.position}
                    </Typography>
                    <Typography sx={{ 
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}>
                      {exp.company} • {exp.duration}
                    </Typography>
                  </Box>
                </ExperienceItem>
              ))}
            </StyledCard>

            {/* Education Section */}
            <StyledCard>
              <SectionTitle>Education</SectionTitle>
              {mockProfile.education.map((edu, index) => (
                <ExperienceItem key={index}>
                  <SchoolIcon sx={{ color: '#2563eb' }} />
                  <Box>
                    <Typography sx={{ 
                      fontWeight: 600,
                      color: '#1e293b',
                      mb: 0.5
                    }}>
                      {edu.degree}
                    </Typography>
                    <Typography sx={{ 
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}>
                      {edu.institution} • {edu.year}
                    </Typography>
                  </Box>
                </ExperienceItem>
              ))}
            </StyledCard>

            {/* Tests Section */}
            <StyledCard>
              <SectionTitle>Available Tests</SectionTitle>
              {mockProfile.tests.map((test, index) => (
                <ExperienceItem key={index}>
                  <AssignmentIcon sx={{ color: '#2563eb' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Box>
                        <Typography sx={{ 
                          fontWeight: 600,
                          color: '#1e293b',
                          mb: 0.5
                        }}>
                          {test.name}
                        </Typography>
                        <Typography sx={{ 
                          color: '#64748b',
                          fontSize: '0.9rem'
                        }}>
                          {test.description}
                        </Typography>
                      </Box>
                      {test.status === 'Completed' ? (
                        <Chip
                          label={`Score: ${test.score}%`}
                          color="success"
                          size="small"
                          sx={{
                            fontWeight: 500,
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)'
                          }}
                        />
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStartTest(test.name)}
                          sx={{
                            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                            color: '#fff',
                            fontWeight: 500,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                            }
                          }}
                        >
                          Start Test
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ExperienceItem>
              ))}
            </StyledCard>
          </RightColumn>
        </ContentWrapper>

        {/* Add Skill Dialog */}
        <Dialog
          open={editSkillDialog}
          onClose={() => setEditSkillDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Add New Skill
            <IconButton
              onClick={() => setEditSkillDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Skill Name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              sx={{ mt: 2, mb: 2 }}
            />
            <Typography gutterBottom>Proficiency Level</Typography>
            <Rating
              value={newSkill.proficiency}
              precision={0.5}
              onChange={(_, value) => setNewSkill({ ...newSkill, proficiency: value || 0 })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditSkillDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddSkill}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
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