import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';

// Mock data - This will be replaced with API calls
const mockCompanyPreferences = {
  companyDetails: {
    name: "Tech Corp",
    industry: "Software Development"
  },
  requiredSkills: ["React", "TypeScript", "Node.js"],
  experienceLevel: "Mid-Senior",
  hederaRequired: true
};

const mockCandidates = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: [
      { name: 'React', proficiency: 4.5 },
      { name: 'TypeScript', proficiency: 4.0 },
      { name: 'Hedera', proficiency: 4.8 }
    ],
    hederaExperience: {
      verified: true,
      experience: '1-3 months'
    },
    contact: {
      email: 'alex@example.com',
      linkedin: 'https://linkedin.com/in/alex'
    },
    matchScore: 92
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    skills: [
      { name: 'React', proficiency: 4.2 },
      { name: 'Node.js', proficiency: 4.5 },
      { name: 'Hedera', proficiency: 3.8 }
    ],
    hederaExperience: {
      verified: true,
      experience: '3-6 months'
    },
    contact: {
      email: 'sarah@example.com',
      linkedin: 'https://linkedin.com/in/sarah'
    },
    matchScore: 88
  },
  {
    id: '3',
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=3',
    skills: [
      { name: 'React', proficiency: 4.8 },
      { name: 'TypeScript', proficiency: 4.6 }
    ],
    contact: {
      email: 'michael@example.com'
    },
    matchScore: 75
  }
];

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255,255,255,0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    borderColor: '#02E2FF'
  }
}));

const SkillMatch = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: 'rgba(0,0,0,0.03)',
  '&:hover': {
    backgroundColor: 'rgba(2,226,255,0.05)'
  }
}));

const MatchScore = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  backgroundColor: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.875rem'
}));

const CandidatesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
  }
}));

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  skills: Array<{
    name: string;
    proficiency: number;
  }>;
  hederaExperience?: {
    verified: boolean;
    experience: string;
  };
  contact: {
    email: string;
    linkedin?: string;
  };
  matchScore: number;
}

export default function DashboardCompany() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  const handleContactCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEmailContent(`Hi ${candidate.name},\n\nI came across your profile on TalentAI and I'm impressed with your skills and experience. Would you be interested in discussing potential opportunities at our company?\n\nBest regards,\n${mockCompanyPreferences.companyDetails.name}`);
    setDialogOpen(true);
  };

  const handleSendEmail = () => {
    // In a real app, this would send the email through your backend
    window.location.href = `mailto:${selectedCandidate?.contact.email}?subject=Opportunity at ${mockCompanyPreferences.companyDetails.name}&body=${encodeURIComponent(emailContent)}`;
    setDialogOpen(false);
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
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#fff',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Matching Candidates
          </Typography>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            Filter Matches
          </Button>
        </Box>

        {/* Company Requirements Summary */}
        <StyledCard sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Your Requirements
            </Typography>
            <Button
              size="small"
              sx={{ 
                color: '#2563eb',
                '&:hover': { backgroundColor: 'rgba(37,99,235,0.05)' }
              }}
            >
              Edit Requirements
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {mockCompanyPreferences.requiredSkills.map((skill: string) => (
              <Chip
                key={skill}
                label={skill}
                sx={{
                  backgroundColor: 'rgba(37,99,235,0.1)',
                  color: '#2563eb',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(37,99,235,0.2)'
                  }
                }}
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon sx={{ fontSize: 20 }} />
            Experience Level: {mockCompanyPreferences.experienceLevel}
            {mockCompanyPreferences.hederaRequired && (
              <>
                <Box component="span" sx={{ mx: 1 }}>•</Box>
                <VerifiedIcon sx={{ color: '#02E2FF' }} />
                Hedera experience required
              </>
            )}
          </Typography>
        </StyledCard>

        {/* Candidates List */}
        <CandidatesContainer>
          {mockCandidates.map(candidate => (
            <StyledCard key={candidate.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={candidate.avatar}
                  sx={{ 
                    width: 64,
                    height: 64,
                    mr: 2,
                    border: '2px solid #02E2FF',
                    boxShadow: '0 0 10px rgba(2,226,255,0.3)'
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {candidate.name}
                    {candidate.hederaExperience?.verified && (
                      <Tooltip title="Hedera Verified">
                        <VerifiedIcon sx={{ ml: 1, color: '#02E2FF' }} />
                      </Tooltip>
                    )}
                  </Typography>
                  <MatchScore>
                    <StarIcon sx={{ fontSize: 18 }} />
                    {candidate.matchScore}% Match
                  </MatchScore>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Contact Candidate">
                    <IconButton
                      onClick={() => handleContactCandidate(candidate)}
                      sx={{ 
                        backgroundColor: 'rgba(37,99,235,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(37,99,235,0.2)'
                        }
                      }}
                    >
                      <EmailIcon sx={{ color: '#2563eb' }} />
                    </IconButton>
                  </Tooltip>
                  {candidate.contact.linkedin && (
                    <Tooltip title="View LinkedIn Profile">
                      <IconButton
                        onClick={() => window.open(candidate.contact.linkedin, '_blank')}
                        sx={{ 
                          backgroundColor: 'rgba(10,102,194,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(10,102,194,0.2)'
                          }
                        }}
                      >
                        <LinkedInIcon sx={{ color: '#0A66C2' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                Skills & Expertise
              </Typography>

              {/* Skills */}
              <Box sx={{ mb: 3 }}>
                {candidate.skills.map(skill => (
                  <SkillMatch key={skill.name}>
                    <Typography variant="body2" sx={{ 
                      minWidth: 120,
                      fontWeight: 500,
                      color: mockCompanyPreferences.requiredSkills.includes(skill.name) ? '#2563eb' : 'inherit'
                    }}>
                      {skill.name}
                    </Typography>
                    <Rating
                      value={skill.proficiency}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#2563eb'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
                      {(skill.proficiency * 20).toFixed(0)}%
                    </Typography>
                  </SkillMatch>
                ))}
              </Box>

              {/* Hedera Experience Badge */}
              {candidate.hederaExperience?.verified && (
                <Chip
                  icon={<VerifiedIcon />}
                  label={`Hedera Experience: ${candidate.hederaExperience.experience}`}
                  color="primary"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(2,226,255,0.1)',
                    color: '#02E2FF',
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: '#02E2FF'
                    }
                  }}
                />
              )}
            </StyledCard>
          ))}
        </CandidatesContainer>

        {/* Contact Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Contact {selectedCandidate?.name}
            <IconButton
              onClick={() => setDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendEmail}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                }
              }}
            >
              Send Email
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 