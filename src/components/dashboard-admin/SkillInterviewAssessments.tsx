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
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
              Skill Interview Assessment Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedAssessment?.skill || 'Assessment Review'}
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
                  {selectedAssessment.skill && (
                    <Chip
                      label={selectedAssessment.skill}
                      sx={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                    />
                  )}
                  {selectedAssessment.proficiency && (
                    <Chip label={selectedAssessment.proficiency} variant="outlined" />
                  )}
                </Box>
              </Box>

              {/* Two Column Layout */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Left Column */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, borderRight: { md: '1px solid #e0e0e0' } }}>
                  {/* Candidate Info */}
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                      Candidate
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getCandidateName(selectedAssessment)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getCandidateEmail(selectedAssessment)}
                      </Typography>
                      {selectedAssessment.candidateId?.contactInformation?.phone && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {selectedAssessment.candidateId.contactInformation.phone}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {selectedAssessment.candidateId?.targetRole && (
                          <Chip label={selectedAssessment.candidateId.targetRole} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />
                        )}
                        {selectedAssessment.candidateId?.educationLevel && (
                          <Chip label={selectedAssessment.candidateId.educationLevel} size="small" variant="outlined" />
                        )}
                        {getCandidateLocation(selectedAssessment) !== 'Unknown' && (
                          <Chip label={getCandidateLocation(selectedAssessment)} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Candidate Skills */}
                  {selectedAssessment.candidateId?.skills && selectedAssessment.candidateId.skills.length > 0 && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                        Candidate Skills
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedAssessment.candidateId.skills.slice(0, 6).map((skill, idx) => (
                          <Chip
                            key={idx}
                            label={`${skill.name}${skill.proficiencyLevel ? ` (L${skill.proficiencyLevel})` : ''}`}
                            size="small"
                            sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
                          />
                        ))}
                        {selectedAssessment.candidateId.skills.length > 6 && (
                          <Chip
                            label={`+${selectedAssessment.candidateId.skills.length - 6} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Interview Info */}
                  <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                      Interview Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Type:</strong> {selectedAssessment.interviewData?.interviewType?.replace(/_/g, ' ') || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Category:</strong> {selectedAssessment.category || 'N/A'}
                      </Typography>
                      {selectedAssessment.interviewerId?.username && (
                        <Typography variant="body2">
                          <strong>Interviewer:</strong> {selectedAssessment.interviewerId.username}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                  {/* Scores Breakdown */}
                  {selectedAssessment.interviewData?.finalReport?.scores && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                        Scores Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {selectedAssessment.interviewData.finalReport.scores.communication !== undefined && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Communication</Typography>
                            <Chip
                              label={`${selectedAssessment.interviewData.finalReport.scores.communication}%`}
                              size="small"
                              color={getScoreColor(selectedAssessment.interviewData.finalReport.scores.communication)}
                            />
                          </Box>
                        )}
                        {selectedAssessment.interviewData.finalReport.scores.technical_depth !== undefined && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Technical Depth</Typography>
                            <Chip
                              label={`${selectedAssessment.interviewData.finalReport.scores.technical_depth}%`}
                              size="small"
                              color={getScoreColor(selectedAssessment.interviewData.finalReport.scores.technical_depth)}
                            />
                          </Box>
                        )}
                        {selectedAssessment.interviewData.finalReport.scores.problem_approach !== undefined && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Problem Approach</Typography>
                            <Chip
                              label={`${selectedAssessment.interviewData.finalReport.scores.problem_approach}%`}
                              size="small"
                              color={getScoreColor(selectedAssessment.interviewData.finalReport.scores.problem_approach)}
                            />
                          </Box>
                        )}
                        {selectedAssessment.interviewData.finalReport.scores.learning_ability !== undefined && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Learning Ability</Typography>
                            <Chip
                              label={`${selectedAssessment.interviewData.finalReport.scores.learning_ability}%`}
                              size="small"
                              color={getScoreColor(selectedAssessment.interviewData.finalReport.scores.learning_ability)}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Analytics */}
                  {selectedAssessment.interviewData?.analytics && (
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                        Interview Analytics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5', minWidth: 80 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                            {Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Duration
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5', minWidth: 80 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                            {selectedAssessment.interviewData.analytics.messageCount || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Messages
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5', minWidth: 80 }}>
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
                </Box>
              </Box>

              {/* Coverage Areas */}
              {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                    Coverage Areas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([areaName, areaData]) => (
                      <Box key={areaName} sx={{
                        flex: { xs: '1 1 45%', md: '1 1 22%' },
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: (areaData as AreaData).percentage >= 70 ? '#e8f5e9' : (areaData as AreaData).percentage >= 50 ? '#fff3e0' : '#f5f5f5',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          color: (areaData as AreaData).percentage >= 70 ? '#2e7d32' : (areaData as AreaData).percentage >= 50 ? '#f57c00' : '#666'
                        }}>
                          {(areaData as AreaData).percentage || 0}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                          {areaName.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontSize: '0.65rem' }}>
                          Weight: {((areaData as AreaData).weight * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* AI Analysis */}
              {selectedAssessment.interviewData?.finalReport?.aiAnalysis && (
                selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas?.length > 0 ||
                selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas?.length > 0
              ) && (
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                    AI Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.length > 0 && (
                      <Box sx={{ flex: '1 1 200px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}>
                          Strongest Areas
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.map((area, idx) => (
                            <Chip key={idx} label={area.replace(/_/g, ' ')} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas && selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.length > 0 && (
                      <Box sx={{ flex: '1 1 200px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#c62828' }}>
                          Areas for Improvement
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.map((area, idx) => (
                            <Chip key={idx} label={area.replace(/_/g, ' ')} size="small" sx={{ backgroundColor: '#ffebee', color: '#c62828' }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Summary */}
              {selectedAssessment.interviewData?.finalReport?.summary && (
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                    Summary
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {selectedAssessment.interviewData.finalReport.summary}
                  </Typography>
                </Box>
              )}

              {/* Recommendations */}
              {selectedAssessment.interviewData?.finalReport?.recommendations && selectedAssessment.interviewData.finalReport.recommendations.length > 0 && (
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                    Recommendations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {selectedAssessment.interviewData.finalReport.recommendations.map((rec, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <span style={{ color: PRIMARY }}>•</span> {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Timestamps */}
              <Box sx={{ p: 3, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Created: <strong>{formatDate(selectedAssessment.createdAt)}</strong>
                </Typography>
                {selectedAssessment.interviewData?.sessionId && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    Session: {selectedAssessment.interviewData.sessionId}
                  </Typography>
                )}
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

export default React.memo(SkillInterviewAssessments);
