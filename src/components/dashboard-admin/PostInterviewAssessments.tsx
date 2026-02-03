import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  styled,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  EmojiEvents as ExcellentIcon,
  TrendingUp as SatisfactoryIcon,
  TrendingDown as NeedsImprovementIcon,
  Assessment as AllIcon,
} from '@mui/icons-material';
import { AppDispatch } from '@/store/store';
import {
  fetchAdminPostAssessments,
  selectAdminAssessments,
  selectAdminAssessmentsLoading,
  selectAdminAssessmentsTotal,
} from '@/store/slices/adminSlice';

const PRIMARY = '#8310FF';

const StyledTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    backgroundColor: PRIMARY,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
});

const StyledTab = styled(Tab)({
  minHeight: 40,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#6c6c80',
  padding: '8px 16px',
  '&.Mui-selected': {
    color: PRIMARY,
  },
});

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
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const results = useSelector(selectAdminAssessments) as PostInterviewAssessmentData[];
  const loading = useSelector(selectAdminAssessmentsLoading);
  const totalCount = useSelector(selectAdminAssessmentsTotal);

  // Filter state
  const [companies, setCompanies] = useState<{ _id: string; username: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreTab, setScoreTab] = useState(0);

  // Dialog state for viewing details
  const [selectedAssessment, setSelectedAssessment] = useState<PostInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Extract unique companies from results
  useEffect(() => {
    if (!selectedCompany && results.length > 0) {
      const uniqueCompanies = new Map<string, { _id: string; username: string }>();
      results.forEach((assessment: PostInterviewAssessmentData) => {
        if (assessment.company?._id && assessment.company?.username) {
          uniqueCompanies.set(assessment.company._id, {
            _id: assessment.company._id,
            username: assessment.company.username,
          });
        }
      });
      setCompanies(Array.from(uniqueCompanies.values()));
    }
  }, [results, selectedCompany]);

  // Fetch on mount and when pagination/filter changes
  useEffect(() => {
    if (autoFetch) {
      dispatch(
        fetchAdminPostAssessments({
          page: page + 1,
          limit: rowsPerPage,
          company: selectedCompany || undefined,
        })
      );
    }
  }, [dispatch, autoFetch, page, rowsPerPage, selectedCompany]);

  /**
   * Handle company filter change
   */
  const handleCompanyChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedCompany(event.target.value);
    setPage(0);
  }, []);

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

  const handleScoreTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setScoreTab(newValue);
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

  // Client-side filtering
  const filteredResults = results.filter((assessment) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesCandidate = assessment.candidate?.username?.toLowerCase().includes(q) || assessment.candidate?.email?.toLowerCase().includes(q);
      const matchesJob = assessment.post?.jobDetails?.title?.toLowerCase().includes(q);
      const matchesCompanyName = assessment.company?.username?.toLowerCase().includes(q);
      if (!matchesCandidate && !matchesJob && !matchesCompanyName) return false;
    }
    // Score tab filter
    if (scoreTab > 0) {
      const score = getOverallScore(assessment);
      if (scoreTab === 1 && score < 70) return false;
      if (scoreTab === 2 && (score < 50 || score >= 70)) return false;
      if (scoreTab === 3 && score >= 50) return false;
    }
    return true;
  });

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 3 }}>
        Post Interview Assessments
      </Typography>

      {/* Filters */}
      <Paper sx={{ mb: 3, borderRadius: '12px', border: '1px solid #ece6fa', boxShadow: 'none', overflow: 'hidden' }}>
        {/* Search & Company filter */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search candidate, job, company..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6c6c80', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 220px' }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="company-filter-label">Company</InputLabel>
            <Select
              labelId="company-filter-label"
              id="company-filter"
              value={selectedCompany}
              label="Company"
              onChange={handleCompanyChange}
            >
              <MenuItem value="">
                <em>All Companies</em>
              </MenuItem>
              {companies.map((company) => (
                <MenuItem key={company._id} value={company._id}>
                  {company.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loading && <CircularProgress size={20} sx={{ color: PRIMARY }} />}
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ color: '#6c6c80' }}>
            {filteredResults.length} of {totalCount}
          </Typography>
        </Box>
        {/* Score Tabs */}
        <Box sx={{ borderTop: '1px solid #ece6fa', px: 2 }}>
          <StyledTabs value={scoreTab} onChange={handleScoreTabChange}>
            <StyledTab icon={<AllIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All" />
            <StyledTab icon={<ExcellentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Excellent (70%+)" />
            <StyledTab icon={<SatisfactoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Satisfactory" />
            <StyledTab icon={<NeedsImprovementIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Needs Work" />
          </StyledTabs>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #ece6fa', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f3ff' }}>
              <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Post/Job</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No assessments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((assessment) => {
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
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {assessment.post?.jobDetails?.title || 'Untitled Post'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {assessment.company?.username || 'Unknown Company'}
                      </Typography>
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
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(assessment)}
                          sx={{ color: PRIMARY }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

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
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
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
                background: '#f5f3ff',
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📊 Interview Statistics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                            {Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Duration
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                            {selectedAssessment.interviewData.analytics.messageCount || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Responses
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ✅ Job Requirements
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {selectedAssessment.post.jobDetails.requirements.slice(0, 4).map((req: string, idx: number) => (
                          <Typography key={idx} variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <span style={{ color: PRIMARY }}>•</span> {req}
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
              backgroundColor: PRIMARY,
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
