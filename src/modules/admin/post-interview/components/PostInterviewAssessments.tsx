import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
import { useAdminPostAssessmentsQuery } from '../queries';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { ScoreBadge, scoreTone, ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_DARK_BANNER, ADMIN_TABLE_HEAD_CELL_SX, ADMIN_TABLE_ROW_SX, AdminPageHeading, AdminTableErrorRow } from '@/modules/admin/shared';

const StyledTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    backgroundColor: ADMIN_NEUTRAL,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
});

const StyledTab = styled(Tab)({
  minHeight: 40,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#64748B',
  padding: '8px 16px',
  '&.Mui-selected': {
    color: ADMIN_NEUTRAL,
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
  // Filter state
  const [companies, setCompanies] = useState<{ _id: string; username: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [scoreTab, setScoreTab] = useState(0);

  // Debounce the client-side filter pass so typing doesn't re-filter (and
  // re-render the whole table) on every keystroke — the input itself stays
  // fully responsive since it's bound to searchQuery, not the debounced value.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Dialog state for viewing details
  const [selectedAssessment, setSelectedAssessment] = useState<PostInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading: loading, isError, refetch } = useAdminPostAssessmentsQuery(
    { page: page + 1, limit: rowsPerPage, company: selectedCompany || undefined },
    autoFetch,
  );
  const results = (data?.items ?? []) as PostInterviewAssessmentData[];
  const totalCount = data?.total ?? 0;

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

  // Client-side filtering — memoized so it only recomputes when the debounced
  // search term, score tab, or the underlying page of results actually change.
  const filteredResults = useMemo(() => results.filter((assessment) => {
    // Search filter
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
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
  }), [results, debouncedSearchQuery, scoreTab]);

  return (
    <div>
      {/* Header */}
      <AdminPageHeading title="Post Interview Assessments" subtitle={`${totalCount.toLocaleString()} assessments recorded`} />

      {/* Filters */}
      <Card className="mb-6 overflow-hidden py-0 gap-0">
        {/* Search & Company filter */}
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search candidate, job, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
           />
          </div>
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
          {loading && <CircularProgress size={20} sx={{ color: ADMIN_NEUTRAL }} />}
          <div className="flex-1" />
          <span className="text-[13px] text-slate-500">
            {filteredResults.length} of {totalCount}
          </span>
        </div>
        {/* Score Tabs */}
        <div className="border-t border-slate-100 px-2">
          <StyledTabs value={scoreTab} onChange={handleScoreTabChange}>
            <StyledTab icon={<AllIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All" />
            <StyledTab icon={<ExcellentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Excellent (70%+)" />
            <StyledTab icon={<SatisfactoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Satisfactory" />
            <StyledTab icon={<NeedsImprovementIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Needs Work" />
          </StyledTabs>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Candidate</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Post/Job</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Company</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Score</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Date</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <AdminTableErrorRow message="Failed to load assessments." onRetry={() => refetch()} />
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">No assessments found</span>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((assessment) => {
                  const score = getOverallScore(assessment);
                  return (
                    <TableRow key={assessment._id} hover sx={ADMIN_TABLE_ROW_SX}>
                      <TableCell>
                        <div>
                          <div className="text-[13px] font-medium text-slate-900">
                            {assessment.candidate?.username || 'Unknown'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {assessment.candidate?.email || assessment.candidate?._id || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] font-medium text-slate-900">
                          {assessment.post?.jobDetails?.title || 'Untitled Post'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] font-medium text-slate-900">
                          {assessment.company?.username || 'Unknown Company'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={score} />
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-500">{formatDate(assessment.createdAt)}</span>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(assessment)}
                            sx={{ color: ADMIN_NEUTRAL }}
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
      </Card>

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
          const tone = scoreTone(score);
          return (
            <>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-8" style={{ backgroundColor: ADMIN_DARK_BANNER }}>
                <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                <span className="text-[11px] uppercase tracking-[1.5px] text-white/70">Post Interview Assessment</span>
                <h2 className="text-[1.5rem] font-bold text-white mt-1 pr-8">
                  {selectedAssessment.post?.jobDetails?.title || 'Assessment Review'}
                </h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedAssessment.status && (
                    <Badge variant="outline" className="border-transparent bg-white/20 font-semibold capitalize text-white">
                      {selectedAssessment.status}
                    </Badge>
                  )}
                  {selectedAssessment.stage && (
                    <Badge variant="outline" className="border-transparent bg-white/15 capitalize text-white/90">
                      {selectedAssessment.stage}
                    </Badge>
                  )}
                </div>
              </div>

              <DialogContent sx={{ p: 0 }}>
                {/* Score Card */}
                <div className="px-6 -mt-5">
                  <div className="bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tone.color}14` }}>
                      <span className="text-[1.15rem] font-extrabold" style={{ color: tone.color }}>{score.toFixed(0)}%</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-slate-900">Overall Score</span>
                      <Badge variant="outline" className="border-transparent font-semibold" style={{ background: `${tone.color}14`, color: tone.color }}>
                        {tone.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                {selectedAssessment.interviewData?.analytics && (
                  <div className="flex gap-3 px-6 mt-5">
                    <div className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                      <div className="text-[1.1rem] font-bold text-slate-900">
                        {Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m
                      </div>
                      <div className="text-[11px] text-slate-500">Duration</div>
                    </div>
                    <div className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                      <div className="text-[1.1rem] font-bold text-slate-900">
                        {selectedAssessment.interviewData.analytics.messageCount || 0}
                      </div>
                      <div className="text-[11px] text-slate-500">Responses</div>
                    </div>
                    <div className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                      <div className="text-[1.1rem] font-bold text-slate-900">
                        {selectedAssessment.interviewData.analytics.coveragePercentage || 0}%
                      </div>
                      <div className="text-[11px] text-slate-500">Coverage</div>
                    </div>
                  </div>
                )}

                {/* People */}
                <div className="px-6 mt-5">
                  <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">People</span>
                  <div className="flex gap-3 mt-2">
                    <div className="flex-1 p-3 rounded-[10px] border border-slate-200">
                      <div className="text-[10.5px] uppercase text-slate-500">Candidate</div>
                      <div className="text-[13px] font-semibold text-slate-900">{selectedAssessment.candidate?.username || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-500">{selectedAssessment.candidate?.email || ''}</div>
                    </div>
                    <div className="flex-1 p-3 rounded-[10px] border border-slate-200">
                      <div className="text-[10.5px] uppercase text-slate-500">Company</div>
                      <div className="text-[13px] font-semibold text-slate-900">{selectedAssessment.company?.username || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-500">{selectedAssessment.company?.email || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedAssessment.metadata && (selectedAssessment.metadata.skill || selectedAssessment.metadata.proficiency) && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Skills</span>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {selectedAssessment.metadata.skill && (
                        <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold text-slate-700">
                          {selectedAssessment.metadata.skill}
                        </Badge>
                      )}
                      {selectedAssessment.metadata.proficiency && (
                        <Badge variant="outline" className="border-slate-200 text-slate-500">
                          {selectedAssessment.metadata.proficiency}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Coverage Areas */}
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Coverage Areas</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]: [string, any]) => {
                        const pct = areaData.percentage || 0;
                        const c = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={areaName} className="flex-[1_1_45%] p-3 rounded-[10px] text-center" style={{ background: `${c}0a`, border: `1px solid ${c}20` }}>
                            <div className="text-[13px] font-bold" style={{ color: c }}>{pct}%</div>
                            <div className="text-[11px] text-slate-500 capitalize">{areaName.replace(/_/g, ' ')}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Job chips */}
                <div className="px-6 mt-5 pb-5 flex gap-2 flex-wrap">
                  {selectedAssessment.post?.jobDetails?.location && (
                    <Badge variant="outline" className="border-slate-200 text-[13px] text-slate-500">
                      {selectedAssessment.post.jobDetails.location}
                    </Badge>
                  )}
                  {selectedAssessment.post?.jobDetails?.employmentType && (
                    <Badge variant="outline" className="border-slate-200 text-[13px] capitalize text-slate-500">
                      {selectedAssessment.post.jobDetails.employmentType}
                    </Badge>
                  )}
                  {selectedAssessment.interviewData?.interviewType && (
                    <Badge variant="outline" className="border-slate-200 text-[13px] capitalize text-slate-500">
                      {selectedAssessment.interviewData.interviewType.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-slate-400">ID: {selectedAssessment._id}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(selectedAssessment.createdAt)}</span>
                </div>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>
    </div>
  );
};

export default React.memo(PostInterviewAssessments);
