import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  LocationOn,
  Work,
  Star,
  Phone,
  Email,
  Business,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchHRAgents, selectHRAgents } from '@/store/slices/hrAgentsSlice';
import { toast } from 'react-toastify';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 'bold',
  borderRadius: '12px',
  fontSize: '0.75rem',
  height: '28px',
  ...(status === 'available' && {
    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
    color: '#2e7d32',
    border: '1px solid #a5d6a7',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '8px',
      transform: 'translateY(-50%)',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: '#4caf50',
    },
  }),
  ...(status === 'busy' && {
    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    color: '#f57c00',
    border: '1px solid #ffcc02',
  }),
  ...(status === 'offline' && {
    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
    color: '#d32f2f',
    border: '1px solid #ef9a9a',
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
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading HR agents...
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (status === 'failed') {
    return (
      <StyledCard>
        <CardContent>
          <Alert severity="error">
            {error || 'Failed to load HR agents'}
          </Alert>
        </CardContent>
      </StyledCard>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          {/* Block Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ 
              color: '#0f172a', 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.5rem' },
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
            }}>
              HR Agents
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            py: 8,
            px: 4,
            background: 'linear-gradient(135deg, rgba(2,226,255,0.03) 0%, rgba(0,255,195,0.03) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(0,255,157,0.1)',
            textAlign: 'center'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(2,226,255,0.1), rgba(0,255,195,0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(2,226,255,0.15)'
            }}>
              <Work sx={{ fontSize: 40, color: '#02E2FF' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700, mb: 2 }}>
                No HR Agents Available
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', maxWidth: '500px', lineHeight: 1.6, mb: 4 }}>
                We're currently working on connecting you with the best HR agents. New agents are being onboarded regularly to help you find the perfect talent for your company.
              </Typography>
            </Box>
         
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <>
      <StyledCard>
        <CardContent>
          {/* Block Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ 
              color: '#0f172a', 
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2rem' },
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
            }}>
              HR Agents
            </Typography>
          </Box>

          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: { xs: 36, sm: 32 },
                height: { xs: 36, sm: 32 },
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(0,255,157,0.9), rgba(2,226,255,0.9))',
                boxShadow: '0 4px 12px rgba(2,226,255,0.35)'
              }}>
                <Work sx={{ color: '#0f172a', fontSize: { xs: 20, sm: 18 } }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#64748b', 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}>
                Available Agents & Matches
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 1.25,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              <Chip
                label={`${agents.length} agents`}
                size="small"
                sx={{
                  background: 'rgba(2, 226, 255, 0.12)',
                  color: '#0f172a',
                  fontWeight: 700,
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: { xs: '0.75rem', sm: '0.75rem' }
                }}
              />
              <Chip
                label={`${agents.reduce((total, agent: any) => total + agent.matches.length, 0)} matches`}
                size="small"
                sx={{
                  background: 'rgba(0, 255, 157, 0.12)',
                  color: '#0f172a',
                  fontWeight: 700,
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: { xs: '0.75rem', sm: '0.75rem' }
                }}
              />
            </Box>
          </Box>

          {/* Stats Summary */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,255,157,0.05) 0%, rgba(2,226,255,0.05) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0,255,157,0.1)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
              Available HR Agents
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              {agents.filter((agent: any) => agent.matches.length > 0).length} active agents
            </Typography>
          </Box>

          {/* Agent Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {agents.map((agent: any) => {
              const topScore = agent.matches.length > 0 ? Math.max(...agent.matches.map((m: any) => m.score)) : 0;
              const minBid = agent.matches.length > 0 ? Math.min(...agent.matches.map((m: any) => m.finalBid || 0).filter((bid: number) => bid > 0)) : 0;
              const status = agent.matches.length > 0 ? 'available' : 'offline';
              
              return (
                <Box
                  key={agent.agentId}
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,255,157,0.15)',
                    boxShadow: '0 8px 32px rgba(0,255,157,0.1)',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 48px rgba(0,255,157,0.15)',
                      border: '1px solid rgba(0,255,157,0.25)'
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                          width: { xs: 64, sm: 56 },
                          height: { xs: 64, sm: 56 },
                          fontSize: { xs: '1.75rem', sm: '1.5rem' },
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(2,226,255,0.3)',
                        }}
                      >
                        {agent.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 0.5,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}>
                          {agent.name.length > 30 ? `${agent.name.substring(0, 30)}...` : agent.name}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#64748b', 
                          mb: 1,
                          fontSize: { xs: '0.9rem', sm: '0.875rem' }
                        }}>
                          {agent.jobTitle || 'General HR Agent'}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                          <Chip
                            label={`ID: ${agent.agentId.slice(-8)}`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(2, 226, 255, 0.12)',
                              color: '#0f172a',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24
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
                    <Box sx={{ 
                      textAlign: { xs: 'center', sm: 'right' },
                      mt: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="h4" sx={{ 
                        color: '#00FFC3', 
                        fontWeight: 800, 
                        mb: 0.5,
                        fontSize: { xs: '2rem', sm: '2.125rem' }
                      }}>
                        {topScore}%
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b', 
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.75rem' }
                      }}>
                        Top Score
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats Row */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                    gap: 2, 
                    mb: 3,
                    p: 2,
                    background: 'rgba(0,255,157,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,255,157,0.08)'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
                        {agent.matches.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Matches
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
                        {minBid > 0 ? `$${minBid.toLocaleString()}` : 'No bids'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Min Bid
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
                        {agent.matches.length > 0 ? Math.round(agent.matches.reduce((sum: number, m: any) => sum + m.score, 0) / agent.matches.length) : 0}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Avg Score
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Button */}
                  <Box sx={{
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid rgba(0,255,157,0.1)'
                  }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(transformedAgents.find(t => t._id === agent.agentId)!)}
                      sx={{
                        background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                        color: '#0f172a',
                        fontWeight: 700,
                        borderRadius: '16px',
                        py: { xs: 1.25, sm: 1.5 },
                        textTransform: 'none',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        boxShadow: '0 4px 16px rgba(2,226,255,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(2,226,255,0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </StyledCard>

      {/* Agent Details Dialog */}
      <Dialog
        open={!!selectedAgent}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedAgent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{selectedAgent.name}</Typography>
                <StatusChip
                  label={selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                  status={selectedAgent.status}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Agent ID: {selectedAgent._id}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Work sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Job Title: {selectedAgent.jobTitle || 'General HR'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Star sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Matches: {selectedAgent.matches?.length || 0}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Agent Information
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{selectedAgent.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{selectedAgent.location}</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ width: '100%', mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Matched Candidates
                </Typography>
                {selectedAgent.matches && selectedAgent.matches.length > 0 ? (
                  <Box>
                    {selectedAgent.matches.map((match, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {match.name}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              Score: {match.score}%
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              Bid: {match.finalBid ? `$${match.finalBid.toLocaleString()}` : 'No bid'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Candidate ID: {match.candidateId}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" fontWeight="bold">Matched Skills:</Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {match.matchedSkills.map((skill, skillIndex) => (
                              <Chip 
                                key={skillIndex} 
                                label={`${skill.name} (${skill.experienceLevel})`} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No matches found for this agent.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </>
  );
};

export default HRAgentsTable;
