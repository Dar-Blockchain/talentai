import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Visibility,
  LocationOn,
  Work,
  Star,
  Email,
  Business,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchHRAgents, selectHRAgents } from '@/store/slices/hrAgentsSlice';

const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  borderRadius: '6px',
  fontSize: '0.75rem',
  height: '24px',
  border: 'none',
  ...(status === 'available' && {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  }),
  ...(status === 'busy' && {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  }),
  ...(status === 'offline' && {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  }),
}));

interface MatchedSkill {
  name: string;
  proficiencyLevel: number;
  experienceLevel: string;
  _id: string;
  Levelconfirmed: string | number;
}

interface RequiredSkill {
  name: string;
  level: string;
  importance: string;
  category: string;
  _id: string;
}

interface Match {
  candidateId: string;
  name: string;
  score: number;
  finalBid: number | null;
  biddingCompany: string | null;
  matchedSkills: MatchedSkill[];
  requiredSkills: RequiredSkill[];
}

interface HRAgent {
  agentId: string;
  name: string;
  jobTitle?: string;
  matches: Match[];
  message?: string;
}

interface TransformedHRAgent extends HRAgent {
  _id: string;
  company: string;
  email: string;
  phone?: string;
  specialization: string[];
  experience: number;
  rating: number;
  bidAmount: number;
  status: 'available' | 'busy' | 'offline';
  description: string;
  skills: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface HRAgentsTableProps {
  companyId: string;
}

const HRAgentsTable: React.FC<HRAgentsTableProps> = ({ companyId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: agents, status, error } = useSelector(selectHRAgents);
  const [selectedAgent, setSelectedAgent] = useState<TransformedHRAgent | null>(null);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchHRAgents(companyId));
    }
  }, [dispatch, companyId]);

  // Transform the API data to match our expected format
  const transformedAgents: TransformedHRAgent[] = agents?.map((agent: any) => ({
    ...agent,
    _id: agent.agentId,
    company: 'HR Agency', // Default since not provided in API
    email: 'contact@hragent.com', // Default since not provided in API
    specialization: agent.jobTitle ? [agent.jobTitle] : ['General HR'],
    experience: 5, // Default since not provided in API
    rating: 4.5, // Default since not provided in API
    bidAmount: agent.matches.length > 0 ? Math.min(...agent.matches.map((m: any) => m.finalBid || 0).filter((bid: number) => bid > 0)) : 0,
    status: agent.matches.length > 0 ? 'available' : 'offline',
    description: agent.message || 'Professional HR agent specializing in talent acquisition',
    skills: agent.matches.length > 0 ? agent.matches[0].requiredSkills.map((s: any) => s.name) : [],
    location: 'Remote', // Default since not provided in API
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })) || [];

  const handleViewDetails = (agent: TransformedHRAgent) => {
    setSelectedAgent(agent);
  };

  const handleCloseDetails = () => {
    setSelectedAgent(null);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  if (status === 'loading') {
    return (
      <StyledCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress sx={{ color: '#3b82f6' }} />
          <Typography variant="body1" sx={{ ml: 2, color: '#6b7280' }}>
            Loading HR agents...
          </Typography>
        </Box>
      </StyledCard>
    );
  }

  if (status === 'failed') {
    return (
      <StyledCard>
        <Alert severity="error">
          {error || 'Failed to load HR agents'}
        </Alert>
      </StyledCard>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <StyledCard>
        <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700, mb: 3 }}>
          HR Agents
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 8,
          px: 4,
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Work sx={{ fontSize: 32, color: '#0369a1' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, mb: 1 }}>
              No HR Agents Available
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: '500px', lineHeight: 1.6 }}>
              We're currently working on connecting you with the best HR agents. New agents are being onboarded regularly to help you find the perfect talent for your company.
            </Typography>
          </Box>
        </Box>
      </StyledCard>
    );
  }

  return (
    <>
      <StyledCard>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700 }}>
            HR Agents
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Chip
              label={`${agents.length} agents`}
              size="small"
              sx={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid #bfdbfe'
              }}
            />
            <Chip
              label={`${agents.reduce((total, agent: any) => total + agent.matches.length, 0)} matches`}
              size="small"
              sx={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid #bbf7d0'
              }}
            />
          </Box>
        </Box>

        {/* Agent Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {agents.map((agent: any) => {
            const topScore = agent.matches.length > 0 ? Math.max(...agent.matches.map((m: any) => m.score)) : 0;
            const minBid = agent.matches.length > 0 ? Math.min(...agent.matches.map((m: any) => m.finalBid || 0).filter((bid: number) => bid > 0)) : 0;
            const status = agent.matches.length > 0 ? 'available' : 'offline';

            return (
              <Box
                key={agent.agentId}
                sx={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  p: 3,
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: '#d1d5db'
                  }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar
                      sx={{
                        bgcolor: '#f3f4f6',
                        color: '#111827',
                        width: 48,
                        height: 48,
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {agent.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{
                        color: '#111827',
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: '1rem'
                      }}>
                        {agent.name.length > 40 ? `${agent.name.substring(0, 40)}...` : agent.name}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#6b7280',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}>
                        {agent.jobTitle || 'General HR Agent'}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Chip
                          label={`ID: ${agent.agentId.slice(-8)}`}
                          size="small"
                          sx={{
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24,
                            border: '1px solid #bfdbfe'
                          }}
                        />
                        <StatusChip
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          size="small"
                          status={status}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{
                      color: '#10b981',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: '2rem'
                    }}>
                      {topScore}%
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#6b7280',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}>
                      Top Score
                    </Typography>
                  </Box>
                </Box>

                {/* Stats Row */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                  mb: 2,
                  p: 2,
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {agent.matches.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Matches
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {minBid > 0 ? `$${minBid.toLocaleString()}` : 'No bids'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Min Bid
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {agent.matches.length > 0 ? Math.round(agent.matches.reduce((sum: number, m: any) => sum + m.score, 0) / agent.matches.length) : 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Avg Score
                    </Typography>
                  </Box>
                </Box>

                {/* Action Button */}
                <Box sx={{
                  pt: 2,
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(transformedAgents.find(t => t._id === agent.agentId)!)}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      py: 1.25,
                      '&:hover': {
                        borderColor: '#2563eb',
                        backgroundColor: '#eff6ff'
                      }
                    }}
                  >
                    VIEW DETAILS
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </StyledCard>

      {/* Agent Details Dialog */}
      <Dialog
        open={!!selectedAgent}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }
        }}
      >
        {selectedAgent && (
          <>
            <DialogTitle sx={{
              p: 3,
              pb: 2,
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" sx={{
                  color: '#111827',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}>
                  {selectedAgent.name}
                </Typography>
                <StatusChip
                  label={selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                  status={selectedAgent.status}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{
              p: 3, mt: "10px"
            }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{
                    color: '#111827',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: '1.125rem'
                  }}>
                    Agent Information
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Business sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Agent ID: {selectedAgent._id}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Work sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Job Title: {selectedAgent.jobTitle || 'General HR'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Star sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Total Matches: {selectedAgent.matches?.length || 0}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{
                    color: '#111827',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: '1.125rem'
                  }}>
                    Contact Details
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>{selectedAgent.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>{selectedAgent.location}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ width: '100%', mt: 3 }}>
                <Divider sx={{ my: 2, borderColor: '#e5e7eb' }} />
                <Typography variant="h6" sx={{
                  color: '#111827',
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1.125rem'
                }}>
                  Matched Candidates
                </Typography>
                {selectedAgent.matches && selectedAgent.matches.length > 0 ? (
                  <Box>
                    {selectedAgent.matches.map((match, index) => (
                      <Box key={index} sx={{
                        mb: 2,
                        p: 3,
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb'
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6" sx={{
                            color: '#111827',
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}>
                            {match.name}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Chip
                              label={`Score: ${match.score}%`}
                              size="small"
                              sx={{
                                backgroundColor: match.score >= 70 ? '#d1fae5' : '#fee2e2',
                                color: match.score >= 70 ? '#065f46' : '#991b1b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: 'none',
                                borderRadius: '6px'
                              }}
                            />
                            <Chip
                              label={match.finalBid ? `Bid: $${match.finalBid.toLocaleString()}` : 'No bid'}
                              size="small"
                              sx={{
                                backgroundColor: '#eff6ff',
                                color: '#1e40af',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: '1px solid #bfdbfe'
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                          Candidate ID: {match.candidateId}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{
                            color: '#111827',
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '0.875rem'
                          }}>
                            Matched Skills:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {match.matchedSkills.map((skill, skillIndex) => (
                              <Chip
                                key={skillIndex}
                                label={`${skill.name} (${skill.experienceLevel})`}
                                size="small"
                                sx={{
                                  backgroundColor: '#f3f4f6',
                                  color: '#374151',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                    px: 2,
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      No matches found for this agent.
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{
              p: 3,
              pt: 2,
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <Button
                onClick={handleCloseDetails}
                sx={{
                  textTransform: 'none',
                  color: '#6b7280',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </>
  );
};

export default HRAgentsTable;
