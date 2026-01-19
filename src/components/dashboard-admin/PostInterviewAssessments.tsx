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
  CircularProgress,
  IconButton,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

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
interface PostInterviewAssessmentData {
  _id: string;
  post: {
    _id: string;
    jobDetails?: {
      title?: string;
      description?: string;
      requirements?: string[];
      responsibilities?: string[];
      location?: string;
      employmentType?: string;
      experienceLevel?: string;
      salary?: {
        min?: number;
        max?: number;
        currency?: string;
      };
    };
    status?: string;
  };
  candidate: {
    _id: string;
    username?: string;
    email?: string;
    role?: string;
  };
  company: {
    _id: string;
    username?: string;
    email?: string;
    role?: string;
  };
  interviewData?: {
    finalReport?: {
      coverage?: {
        overall?: number;
        areas?: Record<string, any>;
      };
      scores?: {
        overall?: number;
      };
      recommendations?: string[];
      summary?: string;
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      coveragePercentage?: number;
    };
    sessionId?: string;
    interviewType?: string;
  };
  metadata?: {
    skill?: string;
    role?: string;
    proficiency?: string;
    exportedAt?: string;
  };
  status?: string;
  stage?: string;
  overallScore?: number;
  createdAt: string;
  updatedAt?: string;
}

interface PostInterviewAssessmentsProps {
  autoFetch?: boolean;
}

/**
 * PostInterviewAssessments Component
 * Displays post interview assessments with filtering by post, candidate, and company
 */
const PostInterviewAssessments: React.FC<PostInterviewAssessmentsProps> = ({ autoFetch = true }) => {
  // Auth
  const { token, isAuthenticated } = useAuthToken();

  // State
  const [results, setResults] = useState<PostInterviewAssessmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);


  // Dialog state for viewing details
  const [selectedAssessment, setSelectedAssessment] = useState<PostInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * Fetch post interview assessments from API
   */
  const fetchPostInterviewAssessments = useCallback(
    async () => {
      if (!isAuthenticated || !token) {
        console.error('Authentication required');
        return;
      }

      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        params.append('page', String(page + 1));
        params.append('limit', String(rowsPerPage));

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/'}post-interview-assessment?${params.toString()}`;

        console.log('📡 [PostInterviewAssessments] Fetching from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 [PostInterviewAssessments] Response:', data);

        if (data.success || data.data || data.results) {
          const assessments = data.data || data.results || [];
          setResults(assessments);
          // Get total count from pagination object or fallback to other fields
          const total = data.pagination?.totalCount || data.total || data.count || data.totalCount || assessments.length;
          setTotalCount(total);
        } else {
          console.error('Failed to fetch post interview assessments:', data.message);
          setResults([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error('Error fetching post interview assessments:', error);
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [token, isAuthenticated, page, rowsPerPage]
  );

  /**
   * Handle page change
   */
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  /**
   * View assessment details
   */
  const handleViewDetails = useCallback((assessment: PostInterviewAssessmentData) => {
    setSelectedAssessment(assessment);
    setDetailsDialogOpen(true);
  }, []);

  /**
   * Get overall score from assessment data
   */
  const getOverallScore = (assessment: PostInterviewAssessmentData): number => {
    if (assessment.overallScore !== undefined) return assessment.overallScore;
    if (assessment.interviewData?.finalReport?.coverage?.overall !== undefined) {
      return assessment.interviewData.finalReport.coverage.overall;
    }
    if (assessment.interviewData?.finalReport?.scores?.overall !== undefined) {
      return assessment.interviewData.finalReport.scores.overall;
    }
    return 0;
  };

  /**
   * Get score color
   */
  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Auto-fetch on mount and when pagination changes
  useEffect(() => {
    if (autoFetch) {
      fetchPostInterviewAssessments();
    }
  }, [fetchPostInterviewAssessments, autoFetch, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      <SectionTitle>Post Interview Assessments</SectionTitle>

      {/* Results Table */}
      <StyledCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Assessment Results ({totalCount} total)
          </Typography>
          {loading && <CircularProgress size={24} sx={{ color: GREEN_MAIN }} />}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Post/Job</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {loading
                        ? 'Loading...'
                        : 'No post interview assessments found. Try adjusting your filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((assessment) => {
                  const score = getOverallScore(assessment);
                  return (
                    <TableRow key={assessment._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assessment.candidate?.username || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {assessment.candidate?.email || assessment.candidate?._id || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assessment.post?.jobDetails?.title || 'Untitled Post'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                            {assessment.post?._id || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assessment.company?.username || 'Unknown Company'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {assessment.company?.email || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${score.toFixed(1)}%`}
                          color={getScoreColor(score)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatDate(assessment.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(assessment)}
                          sx={{ color: GREEN_MAIN }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </StyledCard>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #6a0dad 100%)`,
          color: 'white'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interview Assessment Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedAssessment?.post?.jobDetails?.title || 'Assessment Review'}
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedAssessment && (
            <Box>
              {/* Score Header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${getOverallScore(selectedAssessment).toFixed(0)}%`}
                    color={getScoreColor(getOverallScore(selectedAssessment))}
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      height: 56,
                      width: 80,
                      '& .MuiChip-label': { px: 0 }
                    }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Overall Score
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {getOverallScore(selectedAssessment) >= 70 ? 'Excellent Performance' :
                       getOverallScore(selectedAssessment) >= 50 ? 'Satisfactory Performance' :
                       'Needs Improvement'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedAssessment.status && (
                    <Chip
                      label={selectedAssessment.status.charAt(0).toUpperCase() + selectedAssessment.status.slice(1)}
                      size="small"
                      sx={{
                        backgroundColor: selectedAssessment.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                        color: selectedAssessment.status === 'completed' ? '#2e7d32' : '#f57c00'
                      }}
                    />
                  )}
                  {selectedAssessment.stage && (
                    <Chip
                      label={selectedAssessment.stage.charAt(0).toUpperCase() + selectedAssessment.stage.slice(1)}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              {/* Two Column Layout */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Left Column */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, borderRight: { md: '1px solid #e0e0e0' } }}>
                  {/* Candidate Info */}
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      👤 Candidate
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedAssessment.candidate?.username || 'Unknown Candidate'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedAssessment.candidate?.email || 'No email provided'}
                      </Typography>
                      {selectedAssessment.candidate?.role && (
                        <Chip label={selectedAssessment.candidate.role} size="small" sx={{ width: 'fit-content' }} />
                      )}
                    </Box>
                  </Box>

                  {/* Company Info */}
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      🏢 Company
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedAssessment.company?.username || 'Unknown Company'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedAssessment.company?.email || 'No email provided'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Skill & Proficiency */}
                  {selectedAssessment.metadata && (selectedAssessment.metadata.skill || selectedAssessment.metadata.proficiency) && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        🎯 Skills Assessed
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedAssessment.metadata.skill && (
                          <Chip
                            label={selectedAssessment.metadata.skill}
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#1565c0',
                              fontWeight: 600
                            }}
                          />
                        )}
                        {selectedAssessment.metadata.proficiency && (
                          <Chip
                            label={selectedAssessment.metadata.proficiency}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                  {/* Job Details */}
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      💼 Job Position
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedAssessment.post?.jobDetails?.title || 'Untitled Position'}
                      </Typography>
                      {selectedAssessment.post?.jobDetails?.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {selectedAssessment.post.jobDetails.description.length > 150
                            ? selectedAssessment.post.jobDetails.description.substring(0, 150) + '...'
                            : selectedAssessment.post.jobDetails.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {selectedAssessment.post?.jobDetails?.location && (
                          <Chip
                            label={`📍 ${selectedAssessment.post.jobDetails.location}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {selectedAssessment.post?.jobDetails?.employmentType && (
                          <Chip
                            label={selectedAssessment.post.jobDetails.employmentType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {selectedAssessment.post?.jobDetails?.experienceLevel && (
                          <Chip
                            label={selectedAssessment.post.jobDetails.experienceLevel}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {selectedAssessment.post?.jobDetails?.salary && (
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500, mt: 1 }}>
                          💰 {selectedAssessment.post.jobDetails.salary.currency || 'USD'} {selectedAssessment.post.jobDetails.salary.min?.toLocaleString()} - {selectedAssessment.post.jobDetails.salary.max?.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Interview Analytics */}
                  {selectedAssessment.interviewData?.analytics && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📊 Interview Statistics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                            {Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Duration
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                            {selectedAssessment.interviewData.analytics.messageCount || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Responses
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                            {selectedAssessment.interviewData.analytics.coveragePercentage || 0}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Coverage
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Requirements if available */}
                  {selectedAssessment.post?.jobDetails?.requirements && selectedAssessment.post.jobDetails.requirements.length > 0 && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ✅ Job Requirements
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {selectedAssessment.post.jobDetails.requirements.slice(0, 4).map((req: string, idx: number) => (
                          <Typography key={idx} variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <span style={{ color: GREEN_MAIN }}>•</span> {req}
                          </Typography>
                        ))}
                        {selectedAssessment.post.jobDetails.requirements.length > 4 && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            +{selectedAssessment.post.jobDetails.requirements.length - 4} more requirements
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Full Width - Coverage Areas */}
              {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📈 Coverage Areas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]: [string, any]) => (
                      <Box key={areaName} sx={{
                        flex: { xs: '1 1 45%', md: '1 1 22%' },
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: areaData.percentage >= 70 ? '#e8f5e9' : areaData.percentage >= 50 ? '#fff3e0' : '#ffebee',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          color: areaData.percentage >= 70 ? '#2e7d32' : areaData.percentage >= 50 ? '#f57c00' : '#c62828'
                        }}>
                          {areaData.percentage || 0}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                          {areaName.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Timestamps */}
              <Box sx={{ p: 3, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    📅 Submitted: <strong>{formatDate(selectedAssessment.createdAt)}</strong>
                  </Typography>
                  {selectedAssessment.interviewData?.interviewType && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      📋 Type: <strong>{selectedAssessment.interviewData.interviewType.replace(/_/g, ' ')}</strong>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
          <Button
            onClick={() => setDetailsDialogOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: GREEN_MAIN,
              '&:hover': { backgroundColor: '#6a0dad' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(PostInterviewAssessments);
