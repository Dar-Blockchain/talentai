import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: 'white',
  borderRadius: '12px',
  border: '1px solid rgba(84,98,116,0.1)',
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

// Interfaces
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

// Style constants
const COMMON_STYLES = {
  title: {
    color: "rgba(0, 0, 0, 1)",
    fontFamily: "Poppins",
    fontWeight: 600,
    fontStyle: "normal",
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0",
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "-8px",
      left: 0,
      width: "40px",
      height: "5px",
      backgroundColor: "rgba(222, 147, 0, 1)",
      borderRadius: "2px",
    },
  },
  sectionTitle: {
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: "Poppins",
    fontWeight: 600,
  },
  button: {
    backgroundColor: "rgba(224, 154, 16, 1)",
    borderColor: "rgba(224, 154, 16, 1)",
    color: "white",
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    borderRadius: '38px',
    height: '42px',
    '&:hover': {
      backgroundColor: "rgba(224, 154, 16, 0.8)",
      borderColor: "rgba(224, 154, 16, 0.8)"
    }
  },
  agentCard: {
    background: "rgba(255, 251, 244, 1)",
    borderRadius: '12px',
    border: '1px solid rgba(222, 147, 0, 1)',
    p: 3,
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(222, 147, 0, 0.15)'
    }
  }
} as const;

// Utility functions
const calculateValidScores = (matches: Match[]): number[] => {
  return matches
    .map(m => m.score)
    .filter(score => !isNaN(score) && score !== null && score !== undefined);
};

const calculateMinBid = (matches: Match[] | undefined): number => {
  if (!matches || matches.length === 0) return 0;
  const validBids = matches
    .map(m => m.finalBid || 0)
    .filter(bid => bid > 0);
  return validBids.length > 0 ? Math.min(...validBids) : 0;
};

const HRAgentsTable: React.FC<HRAgentsTableProps> = ({ companyId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: agents, status, error } = useSelector(selectHRAgents);
  const [selectedAgent, setSelectedAgent] = useState<TransformedHRAgent | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch agents on mount
  useEffect(() => {
    if (companyId) {
      dispatch(fetchHRAgents(companyId));
    }
  }, [dispatch, companyId]);

  // Transform agents data (memoized)
  const transformedAgents: TransformedHRAgent[] = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];

    return agents.map((agent: any) => ({
      ...agent,
      _id: agent.agentId,
      company: 'HR Agency',
      email: 'contact@hragent.com',
      specialization: agent.jobTitle ? [agent.jobTitle] : ['General HR'],
      experience: 5,
      rating: 4.5,
      bidAmount: agent.matches ? calculateMinBid(agent.matches) : 0,
      status: agent.hasPost ? 'available' as const : 'offline' as const,
      description: agent.message || 'Professional HR agent specializing in talent acquisition',
      skills: agent.matches?.length > 0 ? agent.matches[0].requiredSkills.map((s: any) => s.name) : [],
      location: 'Remote',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matches: agent.matches || [], // Ensure matches array exists (empty if not loaded)
    })) || [];
  }, [agents]);

  // Pagination calculations (memoized)
  const { totalPages, startIndex, endIndex, paginatedAgents } = useMemo(() => {
    const total = Math.max(1, Math.ceil((agents?.length || 0) / itemsPerPage));
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = agents?.slice(start, end) || [];

    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedAgents: paginated
    };
  }, [agents, page, itemsPerPage]);

  // Reset page when items per page changes
  useEffect(() => {
    setPage(1);
  }, [itemsPerPage, agents?.length]);

  // Ensure page doesn't exceed total pages
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Event handlers (memoized)
  const handleItemsPerPageChange = useCallback((event: any) => {
    setItemsPerPage(Number(event.target.value));
  }, []);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  const handleViewDetails = useCallback((agent: TransformedHRAgent) => {
    setSelectedAgent(agent);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  // Loading state
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

  // Error state
  if (status === 'failed') {
    return (
      <StyledCard>
        <Alert severity="error">
          {error || 'Failed to load HR agents'}
        </Alert>
      </StyledCard>
    );
  }

  // Empty state
  if (!agents || agents.length === 0) {
    return (
      <StyledCard>
        <Typography variant="h5" sx={{ ...COMMON_STYLES.title, mb: 3 }}>
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
          backgroundColor: "rgba(62, 233, 167, 0.03)",
          borderRadius: '8px',
          border: '1px solid rgba(98, 111, 134, 0.18)',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={COMMON_STYLES.title}>
            HR Agents
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="hr-agents-per-page-label">Per Page</InputLabel>
              <Select
                labelId="hr-agents-per-page-label"
                value={itemsPerPage}
                label="Per Page"
                onChange={handleItemsPerPageChange}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                }}
              >
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
              </Select>
            </FormControl>
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
              label={`${agents.reduce((total: number, agent: any) => total + (agent.matches?.length || 0), 0)} matches`}
              size="small"
              sx={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid #bbf7d0'
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              Showing {startIndex + 1}-{Math.min(endIndex, agents.length)} of {agents.length}
            </Typography>
          </Box>
        </Box>

        {/* Agent Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedAgents.map((agent: any) => {
            const scores = calculateValidScores(agent.matches || []);
            const topScore = scores.length > 0 ? Math.max(...scores) : 0;
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : 0;
            const minBid = calculateMinBid(agent.matches);
            const status = agent.matches?.length > 0 ? 'available' : 'offline';

            return (
              <Box key={agent.agentId} sx={COMMON_STYLES.agentCard}>
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
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgba(222, 147, 0, 0.3)'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {agent.matches?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Matches
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {minBid > 0 ? `${minBid.toLocaleString()} TAI` : 'No prices'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Min Price
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, fontSize: '1.25rem' }}>
                      {avgScore}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                      Avg Score
                    </Typography>
                  </Box>
                </Box>

                {/* Action Button */}
                <Box sx={{
                  pt: 2,
                  borderTop: '1px solid rgba(222, 147, 0, 0.2)'
                }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(transformedAgents.find(t => t._id === agent.agentId)!)}
                    sx={COMMON_STYLES.button}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>

        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 3,
              gap: 1.5,
              textAlign: 'center',
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#6b7280',
                  '&.Mui-selected': {
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                },
              }}
            />
          </Box>
        )}
      </StyledCard>

      {/* Agent Details Dialog */}
      <Dialog
        open={!!selectedAgent}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(84,98,116,0.1)'
          }
        }}
      >
        {selectedAgent && (
          <>
            <DialogTitle sx={{
              p: 3,
              pb: 2,
              borderBottom: '1px solid rgba(84,98,116,0.1)',
              backgroundColor: 'rgba(255, 251, 244, 0.3)'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" sx={{
                  ...COMMON_STYLES.sectionTitle,
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
                    ...COMMON_STYLES.sectionTitle,
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
                    ...COMMON_STYLES.sectionTitle,
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
                <Divider sx={{ my: 2, borderColor: 'rgba(84,98,116,0.1)' }} />
                <Typography variant="h6" sx={{
                  ...COMMON_STYLES.sectionTitle,
                  mb: 2,
                  fontSize: '1.125rem'
                }}>
                  Matched Candidates
                </Typography>
                {(() => {
                  const filteredMatches = selectedAgent.matches
                    ? [...selectedAgent.matches]
                        .filter((match) => match.finalBid && match.finalBid > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 2)
                    : [];

                  return filteredMatches.length > 0 ? (
                    <Box>
                      {filteredMatches.map((match, index) => (
                      <Box key={index} sx={{
                        mb: 2,
                        p: 3,
                        border: '1px solid rgba(222, 147, 0, 0.3)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 251, 244, 0.5)'
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
                              label={match.finalBid ? `Price: ${match.finalBid.toLocaleString()} TAI` : 'No price'}
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
                    backgroundColor: 'rgba(62, 233, 167, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(98, 111, 134, 0.18)'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      No matches found for this agent.
                    </Typography>
                  </Box>
                  );
                })()}
              </Box>
            </DialogContent>
            <DialogActions sx={{
              p: 3,
              pt: 2,
              borderTop: '1px solid rgba(84,98,116,0.1)',
              backgroundColor: 'rgba(255, 251, 244, 0.3)'
            }}>
              <Button
                onClick={handleCloseDetails}
                variant="outlined"
                sx={{
                  ...COMMON_STYLES.button,
                  px: 4,
                  py: 1,
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
