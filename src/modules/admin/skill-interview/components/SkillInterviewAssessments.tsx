import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  EmojiEvents as ExcellentIcon,
  TrendingUp as SatisfactoryIcon,
  TrendingDown as NeedsImprovementIcon,
  Assessment as AllIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { useAdminSkillAssessmentsQuery, useArchiveSkillAssessmentMutation, useUnarchiveSkillAssessmentMutation, useDeleteSkillAssessmentMutation } from '../queries';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { ScoreBadge, scoreTone, ADMIN_NEUTRAL, ADMIN_RADIUS, ADMIN_TABLE_HEAD_CELL_SX, ADMIN_TABLE_ROW_SX, AdminPageHeading, AdminTableErrorRow, ConfirmDialog, PillTabs, PillTab } from '@/modules/admin/shared';

// Types based on SkillInterviewAssessmentModel and actual API response
interface IndicatorData {
  name: string;
  covered: boolean;
  evidence: string[];
  quality: number;
  aiGenerated: boolean;
  reasoning?: string;
}

interface AreaData {
  percentage: number;
  indicators: IndicatorData[];
  weight: number;
  depth?: string;
  completed: boolean;
  lastUpdated?: string;
  aiAnalysis?: {
    qualityScore?: number;
    reasoning?: string;
    indicators?: string[];
  };
  questionsAsked: number;
  lastQuestionTime?: string;
}

interface CandidateSkill {
  name: string;
  proficiencyLevel?: number;
  experienceLevel?: string;
  ScoreTest?: number;
  Levelconfirmed?: number;
  NumberTestPassed?: number;
}

interface CandidateData {
  _id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
  user_image?: string;
  age?: string;
  gender?: string;
  educationLevel?: string;
  targetRole?: string;
  country?: string;
  language?: string;
  skills?: CandidateSkill[];
  softSkills?: CandidateSkill[];
  contactInformation?: {
    email?: string;
    phone?: string;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    personalWebsite?: string;
    location?: string;
  };
}

interface SkillInterviewAssessmentData {
  _id: string;
  candidateId: CandidateData;
  interviewerId?: {
    _id: string;
    username?: string;
    email?: string;
  };
  exportedAt?: string;
  type?: string;
  skill?: string;
  role?: string;
  category?: string;
  proficiency?: string;
  interviewData?: {
    finalReport?: {
      summary?: string;
      coverage?: {
        overall?: number;
        areas?: {
          technical_depth?: AreaData;
          problem_approach?: AreaData;
          learning_ability?: AreaData;
          practical_experience?: AreaData;
        };
      };
      completedAreas?: string[];
      nextRecommendedArea?: string;
      lastUpdated?: string;
      aiAnalysis?: {
        totalCoverage?: number;
        strongestAreas?: string[];
        weakestAreas?: string[];
        recommendedFocus?: string[];
      };
      recommendations?: string[];
      scores?: {
        communication?: number;
        technical_depth?: number;
        problem_approach?: number;
        learning_ability?: number;
        overall?: number;
      };
      timestamp?: string;
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      silenceEvents?: number;
      coveragePercentage?: number;
      completedAreas?: number;
      totalAreas?: number;
      averageResponseLength?: number;
      interactionStyle?: string;
    };
    sessionId?: string;
    interviewType?: string;
    timestamp?: string;
  };
  createdAt: string;
  updatedAt?: string;
  archived?: boolean;
}

interface SkillInterviewAssessmentsProps {
  autoFetch?: boolean;
}

const SkillInterviewAssessments: React.FC<SkillInterviewAssessmentsProps> = ({ autoFetch = true }) => {
  // Filter state
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [scoreTab, setScoreTab] = useState(0);

  // Dialog state
  const [selectedAssessment, setSelectedAssessment] = useState<SkillInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Row actions menu (archive/unarchive/delete)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuAssessment, setMenuAssessment] = useState<SkillInterviewAssessmentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SkillInterviewAssessmentData | null>(null);
  const archiveMutation = useArchiveSkillAssessmentMutation();
  const unarchiveMutation = useUnarchiveSkillAssessmentMutation();
  const deleteMutation = useDeleteSkillAssessmentMutation();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading: loading, isError, refetch } = useAdminSkillAssessmentsQuery(
    { page, limit: rowsPerPage, skill: selectedSkill || undefined },
    autoFetch,
  );
  const results = (data?.results ?? []) as SkillInterviewAssessmentData[];
  const totalCount = data?.total ?? 0;

  // Debounce the client-side filter pass so typing doesn't re-filter (and
  // re-render the whole table) on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Extract unique skills for the dropdown on first successful load
  useEffect(() => {
    if (!skillsLoaded && results.length > 0) {
      const uniqueSkills = new Set<string>();
      results.forEach((assessment) => {
        if (assessment.skill) {
          uniqueSkills.add(assessment.skill);
        }
      });
      setSkills(Array.from(uniqueSkills).sort());
      setSkillsLoaded(true);
    }
  }, [results, skillsLoaded]);

  const handleSkillChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedSkill(event.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleViewDetails = useCallback((assessment: SkillInterviewAssessmentData) => {
    setSelectedAssessment(assessment);
    setDetailsDialogOpen(true);
  }, []);

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>, assessment: SkillInterviewAssessmentData) => {
    setMenuAnchor(event.currentTarget);
    setMenuAssessment(assessment);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuAssessment(null);
  }, []);

  const handleArchiveToggle = useCallback(() => {
    if (!menuAssessment) return;
    if (menuAssessment.archived) {
      unarchiveMutation.mutate(menuAssessment._id);
    } else {
      archiveMutation.mutate(menuAssessment._id);
    }
    closeMenu();
  }, [menuAssessment, archiveMutation, unarchiveMutation, closeMenu]);

  const handleDeleteRequest = useCallback(() => {
    if (!menuAssessment) return;
    setDeleteTarget(menuAssessment);
    closeMenu();
  }, [menuAssessment, closeMenu]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteMutation]);

  const handleScoreTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setScoreTab(newValue);
  }, []);

  const getOverallScore = (assessment: SkillInterviewAssessmentData): number => {
    if (assessment.interviewData?.finalReport?.scores?.overall !== undefined) {
      return assessment.interviewData.finalReport.scores.overall;
    }
    if (assessment.interviewData?.finalReport?.coverage?.overall !== undefined) {
      return assessment.interviewData.finalReport.coverage.overall;
    }
    return 0;
  };

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

  const getCandidateName = (assessment: SkillInterviewAssessmentData): string => {
    if (assessment.candidateId?.firstName || assessment.candidateId?.lastName) {
      return `${assessment.candidateId.firstName || ''} ${assessment.candidateId.lastName || ''}`.trim();
    }
    return 'Unknown Candidate';
  };

  const getCandidateEmail = (assessment: SkillInterviewAssessmentData): string => {
    return assessment.candidateId?.contactInformation?.email || 'No email';
  };

  const getCandidateLocation = (assessment: SkillInterviewAssessmentData): string => {
    return assessment.candidateId?.contactInformation?.location ||
           assessment.candidateId?.country ||
           'Unknown';
  };

  // Client-side filtering — memoized so it only recomputes when the debounced
  // search term, score tab, or the underlying page of results actually change.
  const filteredResults = useMemo(() => results.filter((assessment) => {
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      const matchesName = getCandidateName(assessment).toLowerCase().includes(q);
      const matchesEmail = getCandidateEmail(assessment).toLowerCase().includes(q);
      const matchesSkill = assessment.skill?.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesSkill) return false;
    }
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
      <AdminPageHeading title="Skill Interview Assessments" subtitle={`${totalCount.toLocaleString()} assessments recorded`} />

      {/* Filters */}
      <Card className="mb-6 overflow-hidden py-0 gap-0">
        {/* Search & Skill filter */}
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search candidate, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
           />
          </div>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="skill-filter-label">Skill</InputLabel>
            <Select
              labelId="skill-filter-label"
              id="skill-filter"
              value={selectedSkill}
              label="Skill"
              onChange={handleSkillChange}
            >
              <MenuItem value="">
                <em>All Skills</em>
              </MenuItem>
              {skills.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
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
          <PillTabs value={scoreTab} onChange={handleScoreTabChange}>
            <PillTab icon={<AllIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All" />
            <PillTab icon={<ExcellentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Excellent (70%+)" />
            <PillTab icon={<SatisfactoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Satisfactory" />
            <PillTab icon={<NeedsImprovementIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Needs Work" />
          </PillTabs>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Candidate</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Skill</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Proficiency</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Score</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Type</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Date</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <AdminTableErrorRow message="Failed to load assessments." onRetry={() => refetch()} />
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                          <div className="text-[13px] font-medium text-slate-900">{getCandidateName(assessment)}</div>
                          <div className="text-[11px] text-slate-400">{getCandidateEmail(assessment)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold text-slate-700">
                          {assessment.skill || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-200 text-slate-500">
                          {assessment.proficiency || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={score} />
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-500 capitalize">
                          {assessment.interviewData?.interviewType?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                        </span>
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
                        <IconButton size="small" onClick={(e) => openMenu(e, assessment)} sx={{ color: ADMIN_NEUTRAL }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
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
        PaperProps={{ sx: { borderRadius: ADMIN_RADIUS, overflow: 'hidden', boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' } }}
      >
        {selectedAssessment && (() => {
          const score = getOverallScore(selectedAssessment);
          const tone = scoreTone(score);
          return (
            <>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ position: 'absolute', top: 12, right: 12, color: '#94A3B8', '&:hover': { color: '#475569' } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                <span className="text-[11px] uppercase tracking-[1.5px] text-slate-400">Skill Interview Assessment</span>
                <h2 className="text-[1.35rem] font-semibold text-slate-900 mt-1 pr-8">
                  {selectedAssessment.skill || 'Assessment Review'}
                </h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedAssessment.proficiency && (
                    <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold text-slate-600">
                      {selectedAssessment.proficiency}
                    </Badge>
                  )}
                  {selectedAssessment.category && (
                    <Badge variant="outline" className="border-transparent bg-slate-100 text-slate-500">
                      {selectedAssessment.category}
                    </Badge>
                  )}
                </div>
              </div>

              <DialogContent sx={{ p: 0 }}>
                {/* Score Card */}
                <div className="px-6">
                  <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-slate-100 flex items-center gap-5">
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
                      <div className="text-[11px] text-slate-500">Messages</div>
                    </div>
                    <div className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                      <div className="text-[1.1rem] font-bold text-slate-900">
                        {selectedAssessment.interviewData.analytics.coveragePercentage || 0}%
                      </div>
                      <div className="text-[11px] text-slate-500">Coverage</div>
                    </div>
                  </div>
                )}

                {/* Candidate */}
                <div className="px-6 mt-5">
                  <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Candidate</span>
                  <div className="mt-1.5 p-3 rounded-[10px] border border-slate-200">
                    <div className="text-[13px] font-semibold text-slate-900">{getCandidateName(selectedAssessment)}</div>
                    <div className="text-[11px] text-slate-500">{getCandidateEmail(selectedAssessment)}</div>
                    {(selectedAssessment.candidateId?.targetRole || selectedAssessment.candidateId?.educationLevel || getCandidateLocation(selectedAssessment) !== 'Unknown') && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {selectedAssessment.candidateId?.targetRole && (
                          <Badge variant="outline" className="border-transparent bg-emerald-50 text-emerald-600">
                            {selectedAssessment.candidateId.targetRole}
                          </Badge>
                        )}
                        {selectedAssessment.candidateId?.educationLevel && (
                          <Badge variant="outline" className="border-slate-200 text-slate-500">
                            {selectedAssessment.candidateId.educationLevel}
                          </Badge>
                        )}
                        {getCandidateLocation(selectedAssessment) !== 'Unknown' && (
                          <Badge variant="outline" className="border-slate-200 text-slate-500">
                            {getCandidateLocation(selectedAssessment)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scores Breakdown */}
                {selectedAssessment.interviewData?.finalReport?.scores && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Score Breakdown</span>
                    <div className="mt-1.5 flex flex-col gap-2">
                      {[
                        { label: 'Communication', value: selectedAssessment.interviewData.finalReport.scores.communication },
                        { label: 'Technical Depth', value: selectedAssessment.interviewData.finalReport.scores.technical_depth },
                        { label: 'Problem Approach', value: selectedAssessment.interviewData.finalReport.scores.problem_approach },
                        { label: 'Learning Ability', value: selectedAssessment.interviewData.finalReport.scores.learning_ability },
                      ].filter(s => s.value !== undefined).map(({ label, value: v }) => {
                        const c = (v ?? 0) >= 70 ? '#10b981' : (v ?? 0) >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                            <span className="text-[13px] font-medium text-slate-900">{label}</span>
                            <span className="text-[13px] font-bold" style={{ color: c }}>{v}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coverage Areas */}
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Coverage Areas</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]) => {
                        const pct = (areaData as AreaData).percentage || 0;
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

                {/* AI Analysis */}
                {selectedAssessment.interviewData?.finalReport?.aiAnalysis && (
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas?.length ?? 0) > 0 ||
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas?.length ?? 0) > 0
                ) && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">AI Analysis</span>
                    <div className="flex gap-4 mt-1.5">
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.strongestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.length > 0 && (
                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-emerald-600">Strengths</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.map((area, idx) => (
                              <Badge key={idx} variant="outline" className="border-transparent bg-emerald-50 text-emerald-600">
                                {area.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.weakestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.length > 0 && (
                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-red-600">Improve</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.map((area, idx) => (
                              <Badge key={idx} variant="outline" className="border-transparent bg-red-50 text-red-600">
                                {area.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedAssessment.interviewData?.finalReport?.summary && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Summary</span>
                    <p className="text-[13px] text-slate-600 leading-[1.7] mt-1.5">
                      {selectedAssessment.interviewData.finalReport.summary}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAssessment.interviewData?.finalReport?.recommendations && selectedAssessment.interviewData.finalReport.recommendations.length > 0 && (
                  <div className="px-6 mt-5 pb-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Recommendations</span>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {selectedAssessment.interviewData.finalReport.recommendations.map((rec, idx) => (
                        <p key={idx} className="text-[13px] text-slate-600 flex items-start gap-2 leading-[1.5]">
                          <span className="font-bold text-slate-500">&bull;</span> {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleArchiveToggle}>
          <ListItemIcon>
            {menuAssessment?.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{menuAssessment?.archived ? 'Unarchive' : 'Archive'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteRequest} sx={{ color: '#DC2626' }}>
          <ListItemIcon sx={{ color: '#DC2626' }}>
            <DeleteForeverIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete permanently</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete assessment permanently?"
        description="This will permanently delete this skill interview assessment. This cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default React.memo(SkillInterviewAssessments);
