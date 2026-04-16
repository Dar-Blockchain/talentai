import React, { useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchAdminSkillAssessments,
  selectAdminSkillAssessments,
  selectAdminSkillAssessmentsLoading,
  selectAdminSkillAssessmentsTotal,
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
}

interface SkillInterviewAssessmentsProps {
  autoFetch?: boolean;
}

const SkillInterviewAssessments: React.FC<SkillInterviewAssessmentsProps> = ({ autoFetch = true }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const results = useSelector(selectAdminSkillAssessments) as SkillInterviewAssessmentData[];
  const loading = useSelector(selectAdminSkillAssessmentsLoading);
  const totalCount = useSelector(selectAdminSkillAssessmentsTotal);

  // Filter state
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreTab, setScoreTab] = useState(0);

  // Dialog state
  const [selectedAssessment, setSelectedAssessment] = useState<SkillInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (autoFetch) {
      dispatch(
        fetchAdminSkillAssessments({
          page,
          limit: rowsPerPage,
          skill: selectedSkill || undefined,
        })
      );
    }
  }, [autoFetch, page, rowsPerPage, selectedSkill, dispatch]);

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

  const handleSkillChange = (event: SelectChangeEvent<string>) => {
    setSelectedSkill(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (assessment: SkillInterviewAssessmentData) => {
    setSelectedAssessment(assessment);
    setDetailsDialogOpen(true);
  };

  const handleScoreTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setScoreTab(newValue);
  };

  const getOverallScore = (assessment: SkillInterviewAssessmentData): number => {
    if (assessment.interviewData?.finalReport?.scores?.overall !== undefined) {
      return assessment.interviewData.finalReport.scores.overall;
    }
    if (assessment.interviewData?.finalReport?.coverage?.overall !== undefined) {
      return assessment.interviewData.finalReport.coverage.overall;
    }
    return 0;
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
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

  // Client-side filtering
  const filteredResults = results.filter((assessment) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
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
  });

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 3 }}>
        Skill Interview Assessments
      </Typography>

      {/* Filters */}
      <Paper sx={{ mb: 3, borderRadius: '12px', border: '1px solid #ece6fa', boxShadow: 'none', overflow: 'hidden' }}>
        {/* Search & Skill filter */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search candidate, skill..."
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
              <TableCell sx={{ fontWeight: 600 }}>Skill</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Proficiency</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                          {getCandidateName(assessment)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {getCandidateEmail(assessment)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assessment.skill || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: '#ece6fa',
                          color: PRIMARY,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assessment.proficiency || 'N/A'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${score.toFixed(1)}%`}
                        color={getScoreColor(score)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                        {assessment.interviewData?.interviewType?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                      </Typography>
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
                  Skill Interview Assessment
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mt: 0.5, pr: 4 }}>
                  {selectedAssessment.skill || 'Assessment Review'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {selectedAssessment.proficiency && (
                    <Chip label={selectedAssessment.proficiency} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                  )}
                  {selectedAssessment.category && (
                    <Chip label={selectedAssessment.category} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', height: 22 }} />
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
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem' }}>Messages</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', backgroundColor: '#f5f3ff', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                        {selectedAssessment.interviewData.analytics.coveragePercentage || 0}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem' }}>Coverage</Typography>
                    </Box>
                  </Box>
                )}

                {/* Candidate */}
                <Box sx={{ px: 3, mt: 2 }}>
                  <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Candidate</Typography>
                  <Box sx={{ mt: 0.5, p: 1.5, borderRadius: '10px', border: '1px solid #ece6fa' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>{getCandidateName(selectedAssessment)}</Typography>
                    <Typography variant="caption" sx={{ color: '#6c6c80' }}>{getCandidateEmail(selectedAssessment)}</Typography>
                    {(selectedAssessment.candidateId?.targetRole || selectedAssessment.candidateId?.educationLevel || getCandidateLocation(selectedAssessment) !== 'Unknown') && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        {selectedAssessment.candidateId?.targetRole && (
                          <Chip label={selectedAssessment.candidateId.targetRole} size="small" sx={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', height: 22 }} />
                        )}
                        {selectedAssessment.candidateId?.educationLevel && (
                          <Chip label={selectedAssessment.candidateId.educationLevel} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80', fontSize: '0.7rem', height: 22 }} />
                        )}
                        {getCandidateLocation(selectedAssessment) !== 'Unknown' && (
                          <Chip label={getCandidateLocation(selectedAssessment)} size="small" variant="outlined" sx={{ borderColor: '#ece6fa', color: '#6c6c80', fontSize: '0.7rem', height: 22 }} />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Scores Breakdown */}
                {selectedAssessment.interviewData?.finalReport?.scores && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Score Breakdown</Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        { label: 'Communication', value: selectedAssessment.interviewData.finalReport.scores.communication },
                        { label: 'Technical Depth', value: selectedAssessment.interviewData.finalReport.scores.technical_depth },
                        { label: 'Problem Approach', value: selectedAssessment.interviewData.finalReport.scores.problem_approach },
                        { label: 'Learning Ability', value: selectedAssessment.interviewData.finalReport.scores.learning_ability },
                      ].filter(s => s.value !== undefined).map(({ label, value: v }) => {
                        const c = (v ?? 0) >= 70 ? '#10b981' : (v ?? 0) >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: '8px', backgroundColor: '#fafafa' }}>
                            <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 500, fontSize: '0.85rem' }}>{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: c }}>{v}%</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Coverage Areas */}
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Coverage Areas</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]) => {
                        const pct = (areaData as AreaData).percentage || 0;
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

                {/* AI Analysis */}
                {selectedAssessment.interviewData?.finalReport?.aiAnalysis && (
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas?.length ?? 0) > 0 ||
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas?.length ?? 0) > 0
                ) && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>AI Analysis</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.strongestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.length > 0 && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>Strengths</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.map((area, idx) => (
                              <Chip key={idx} label={area.replace(/_/g, ' ')} size="small" sx={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', height: 22 }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.weakestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.length > 0 && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>Improve</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.map((area, idx) => (
                              <Chip key={idx} label={area.replace(/_/g, ' ')} size="small" sx={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', height: 22 }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Summary */}
                {selectedAssessment.interviewData?.finalReport?.summary && (
                  <Box sx={{ px: 3, mt: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Summary</Typography>
                    <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.7, mt: 0.5 }}>
                      {selectedAssessment.interviewData.finalReport.summary}
                    </Typography>
                  </Box>
                )}

                {/* Recommendations */}
                {selectedAssessment.interviewData?.finalReport?.recommendations && selectedAssessment.interviewData.finalReport.recommendations.length > 0 && (
                  <Box sx={{ px: 3, mt: 2, pb: 2 }}>
                    <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.65rem' }}>Recommendations</Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {selectedAssessment.interviewData.finalReport.recommendations.map((rec, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: '#444', display: 'flex', alignItems: 'flex-start', gap: 1, lineHeight: 1.5 }}>
                          <span style={{ color: PRIMARY, fontWeight: 700 }}>•</span> {rec}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

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

export default React.memo(SkillInterviewAssessments);
