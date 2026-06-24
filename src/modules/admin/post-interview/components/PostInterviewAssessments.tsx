import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
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
  DialogContent,
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
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' } }}
      >
        {selectedAssessment && (() => {
          const score = getOverallScore(selectedAssessment);
          const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const scoreLabel = score >= 70 ? 'Excellent' : score >= 50 ? 'Satisfactory' : 'Needs Work';
          return (
            <>
              {/* Header */}
              <Box sx={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`, px: 3, pt: 3, pb: 4, position: 'relative' }}>
                <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
                  Post Interview Assessment
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mt: 0.5, pr: 4 }}>
                  {selectedAssessment.post?.jobDetails?.title || 'Assessment Review'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {selectedAssessment.status && (
                    <Chip label={selectedAssessment.status} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }} />
                  )}
                  {selectedAssessment.stage && (
                    <Chip label={selectedAssessment.stage} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }} />
                  )}
                </Box>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                {/* Score Card */}
                <Box sx={{ px: 3, mt: -2.5 }}>
                  <Box sx={{ background: 'white', borderRadius: '12px', p: 2.5, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #ece6fa', display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '12px', background: `${scoreColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: scoreColor }}>{score.toFixed(0)}%</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>Overall Score</Typography>
                        <Chip label={scoreLabel} size="small" sx={{ backgroundColor: `${scoreColor}14`, color: scoreColor, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Stats Row */}
                {selectedAssessment.interviewData?.analytics && (
                  <Box sx={{ display: 'flex', gap: 1.5, px: 3, mt: 2 }}>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', backgroundColor: '#f5f3ff', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                        {Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem' }}>Duration</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', backgroundColor: '#f5f3ff', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                        {selectedAssessment.interviewData.analytics.messageCount || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem' }}>Responses</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', backgroundColor: '#f5f3ff', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                        {selectedAssessment.interviewData.analytics.coveragePercentage || 0}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem' }}>Coverage</Typography>
                    </Box>
                  </Box>
                )}

                {/* People */}
                <Box sx={{ px: 3, mt: 2 }}>
                  <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>People</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', border: '1px solid #ece6fa' }}>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.65rem', textTransform: 'uppercase' }}>Candidate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedAssessment.candidate?.username || 'Unknown'}</Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80' }}>{selectedAssessment.candidate?.email || ''}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', border: '1px solid #ece6fa' }}>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.65rem', textTransform: 'uppercase' }}>Company</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedAssessment.company?.username || 'Unknown'}</Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80' }}>{selectedAssessment.company?.email || ''}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Skills */}
                {selectedAssessment.metadata && (selectedAssessment.metadata.skill || selectedAssessment.metadata.proficiency) && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Skills</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      {selectedAssessment.metadata.skill && (
                        <Chip label={selectedAssessment.metadata.skill} size="small" sx={{ backgroundColor: '#ece6fa', color: PRIMARY, fontWeight: 600 }} />
                      )}
                      {selectedAssessment.metadata.proficiency && (
                        <Chip label={selectedAssessment.metadata.proficiency} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80' }} />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Coverage Areas */}
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Coverage Areas</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]: [string, any]) => {
                        const pct = areaData.percentage || 0;
                        const c = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <Box key={areaName} sx={{ flex: '1 1 45%', p: 1.5, borderRadius: '10px', backgroundColor: `${c}0a`, border: `1px solid ${c}20`, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: c }}>{pct}%</Typography>
                            <Typography variant="caption" sx={{ color: '#6c6c80', textTransform: 'capitalize', fontSize: '0.7rem' }}>{areaName.replace(/_/g, ' ')}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Job chips */}
                <Box sx={{ px: 3, mt: 2, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedAssessment.post?.jobDetails?.location && (
                    <Chip label={selectedAssessment.post.jobDetails.location} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80', fontSize: '0.75rem' }} />
                  )}
                  {selectedAssessment.post?.jobDetails?.employmentType && (
                    <Chip label={selectedAssessment.post.jobDetails.employmentType} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80', fontSize: '0.75rem', textTransform: 'capitalize' }} />
                  )}
                  {selectedAssessment.interviewData?.interviewType && (
                    <Chip label={selectedAssessment.interviewData.interviewType.replace(/_/g, ' ')} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80', fontSize: '0.75rem', textTransform: 'capitalize' }} />
                  )}
                </Box>

                {/* Footer */}
                <Box sx={{ px: 3, py: 1.5, backgroundColor: '#fafafa', borderTop: '1px solid #ece6fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.65rem' }}>ID: {selectedAssessment._id}</Typography>
                  <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem' }}>{formatDate(selectedAssessment.createdAt)}</Typography>
                </Box>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default React.memo(PostInterviewAssessments);
