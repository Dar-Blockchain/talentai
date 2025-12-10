import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  styled,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

// Hooks
import { usePagination } from '../../hooks/usePagination';
import { useAuthToken } from '../../hooks/useAuthToken';

const GREEN_MAIN = '#8310FF';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(131,16,255,0.10)',
  border: '1.5px solid #ece6fa',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(131,16,255,0.13)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 900,
  color: '#8310FF',
  marginBottom: theme.spacing(4),
  letterSpacing: '-1px',
  position: 'relative',
  lineHeight: 1.1,
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '0',
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #8310FF 0%, #00FFC3 100%)',
    borderRadius: '2px',
  },
}));

// Types
interface AssessmentResultData {
  _id: string;
  assessmentId: string;
  candidateId: string;
  username: string;
  email: string;
  jobTitle: string;
  jobMatch: {
    percentage: number;
    status: string;
    keyGaps: string[];
  };
  timestamp: string;
  analysis: {
    overallScore: number;
    skillAnalysis: any[];
    jobMatch: {
      percentage: number;
      status: string;
      keyGaps: string[];
    };
  };
}

interface AssessmentResultsProps {
  autoFetch?: boolean;
}

/**
 * AssessmentResults Component
 * Displays job assessment results with skill-based filtering and pagination
 * Extracted from admin.tsx for better modularity
 */
const AssessmentResults: React.FC<AssessmentResultsProps> = ({ autoFetch = false }) => {
  // Auth
  const { token, isAuthenticated } = useAuthToken();

  // State
  const [results, setResults] = useState<AssessmentResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [scoreRangeFilter, setScoreRangeFilter] = useState('');

  // Pagination - using custom hook
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, getPaginatedData } = usePagination({
    initialRowsPerPage: 10,
  });

  /**
   * Fetch assessment results from API
   */
  const fetchAssessmentResults = useCallback(
    async (skillName?: string) => {
      if (!isAuthenticated || !token) {
        console.error('Authentication required');
        return;
      }

      try {
        setLoading(true);

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/'}dashboard/getJobAssessmentsBySkill`;
        const method = 'POST';
        const body = skillName ? JSON.stringify({ skillName }) : JSON.stringify({});

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success || data.assessments) {
          const processedResults: AssessmentResultData[] = [];
          if (data.assessments) {
            data.assessments.forEach((assessment: any) => {
              if (assessment.candidates) {
                assessment.candidates.forEach((candidate: any) => {
                  processedResults.push({
                    _id: `${assessment._id}_${candidate.username || candidate.candidateId}`,
                    assessmentId: assessment._id,
                    candidateId: candidate.candidateId,
                    username: candidate.username,
                    email: candidate.email,
                    jobTitle: assessment.jobDetails?.jobDetails?.title || 'Unknown Job',
                    jobMatch: candidate.jobMatch,
                    timestamp: new Date().toISOString(),
                    analysis: {
                      overallScore: candidate.jobMatch?.percentage || 0,
                      skillAnalysis: [],
                      jobMatch: candidate.jobMatch,
                    },
                  });
                });
              }
            });
          }

          setResults(processedResults);

          // Add the searched skill to available skills
          const skills = new Set<string>();
          if (skillName) {
            skills.add(skillName);
          }

          setAvailableSkills(Array.from(skills).sort());
        } else {
          console.error('Failed to fetch assessment results:', data.message);
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching assessment results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token, isAuthenticated]
  );

  /**
   * Handle skill search button click
   */
  const handleSkillSearch = useCallback(() => {
    if (skillSearch.trim() === '') {
      fetchAssessmentResults();
    } else {
      fetchAssessmentResults(skillSearch.trim());
    }
  }, [skillSearch, fetchAssessmentResults]);

  /**
   * Handle Show All button click
   */
  const handleShowAll = useCallback(() => {
    setSkillSearch('');
    fetchAssessmentResults();
  }, [fetchAssessmentResults]);

  /**
   * Filter results based on score range
   */
  const filteredResults = results.filter((result) => {
    if (scoreRangeFilter) {
      const score = result.jobMatch?.percentage || result.analysis?.overallScore || 0;
      const [min, max] = scoreRangeFilter.split('-').map(Number);
      if (score < min || score > max) {
        return false;
      }
    }
    return true;
  });

  // Get paginated results
  const paginatedResults = getPaginatedData(filteredResults);

  // Auto-fetch on mount - always fetch all results when component loads
  useEffect(() => {
    fetchAssessmentResults();
  }, [fetchAssessmentResults]);

  return (
    <Box sx={{ width: '100%' }}>
      <SectionTitle>Job Assessment Results</SectionTitle>

      {/* Skill Search */}
      <StyledCard>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Search by Skill
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search by specific skill (e.g., Node.js, React, Python)"
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            placeholder="Enter skill name..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSkillSearch();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSkillSearch}
            disabled={loading || !isAuthenticated}
            sx={{ backgroundColor: GREEN_MAIN, '&:hover': { backgroundColor: '#6a0dad' } }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleShowAll}
            disabled={loading || !isAuthenticated}
            sx={{ borderColor: GREEN_MAIN, color: GREEN_MAIN }}
          >
            Show All
          </Button>
        </Box>
      </StyledCard>

      {/* Results Table */}
      <StyledCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Assessment Results ({filteredResults.length} total)
          </Typography>
          {loading && <CircularProgress size={24} sx={{ color: GREEN_MAIN }} />}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Job Match %</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Key Gaps</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {loading
                        ? 'Loading...'
                        : results.length === 0
                          ? 'Enter a skill name above and click "Search" to find assessment results, or click "Show All" to view all results.'
                          : 'No assessment results match your filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResults.map((result) => (
                  <TableRow key={result._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {result.username || 'Unknown'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {result.jobTitle || 'Unknown Job'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${result.jobMatch?.percentage?.toFixed(1) || result.analysis?.overallScore?.toFixed(1) || 0}%`}
                        color={
                          result.jobMatch?.percentage >= 80
                            ? 'success'
                            : result.jobMatch?.percentage >= 60
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.jobMatch?.status || 'Unknown'}
                        color={
                          result.jobMatch?.status === 'Good match'
                            ? 'success'
                            : result.jobMatch?.status === 'Fair match'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        {result.jobMatch?.keyGaps?.slice(0, 2).map((gap: string, index: number) => (
                          <Typography
                            key={index}
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: 'text.secondary',
                              mb: 0.5,
                              lineHeight: 1.2,
                            }}
                          >
                            • {gap}
                          </Typography>
                        ))}
                        {result.jobMatch?.keyGaps?.length > 2 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic',
                            }}
                          >
                            +{result.jobMatch.keyGaps.length - 2} more gaps
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Handle view details
                          console.log('View assessment result:', result);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredResults.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </StyledCard>
    </Box>
  );
};

export default React.memo(AssessmentResults);
