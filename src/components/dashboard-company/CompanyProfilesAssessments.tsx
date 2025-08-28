import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
  }
}));

interface CompanyProfilesAssessmentsProps {
  companyProfiles: any[];
  isLoadingProfiles: boolean;
  profilesError: string | null;
  onViewAssessmentDetails: (assessment: any) => void;
}

const CompanyProfilesAssessments: React.FC<CompanyProfilesAssessmentsProps> = ({
  companyProfiles,
  isLoadingProfiles,
  profilesError,
  onViewAssessmentDetails
}) => {
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('all');
  const [assessmentSort, setAssessmentSort] = useState('date_desc');
  const [assessmentView, setAssessmentView] = useState<'table' | 'cards'>('table');

  const renderCompanyProfilesTable = () => {
    if (isLoadingProfiles) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      );
    }

    if (profilesError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>{profilesError}</Alert>
      );
    }

    if (!companyProfiles || companyProfiles.length === 0) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(2,226,255,0.1)',
          textAlign: 'center'
        }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#02E2FF', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, mb: 1 }}>
            No Assessments Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: '400px' }}>
            There are no assessments available at the moment.
          </Typography>
        </Box>
      );
    }

    // Apply search, filter, and sort
    const normalizedSearch = assessmentSearch.toLowerCase().trim();
    const filteredAssessments = companyProfiles.filter((assessment: any) => {
      const candidateName = assessment?.condidateId?.userId?.username?.toLowerCase?.() || '';
      const jobTitle = assessment?.jobId?.jobDetails?.title?.toLowerCase?.() || '';
      const matchesSearch = !normalizedSearch || candidateName.includes(normalizedSearch) || jobTitle.includes(normalizedSearch);
      const status = assessment?.analysis?.jobMatch?.status || '';
      const matchesStatus = assessmentStatusFilter === 'all' || status === assessmentStatusFilter;
      return matchesSearch && matchesStatus;
    });

    const sortedAssessments = [...filteredAssessments].sort((a: any, b: any) => {
      const scoreA = Number(a?.analysis?.overallScore) || 0;
      const scoreB = Number(b?.analysis?.overallScore) || 0;
      const nameA = (a?.condidateId?.userId?.username || '').toLowerCase();
      const nameB = (b?.condidateId?.userId?.username || '').toLowerCase();
      const jobA = (a?.jobId?.jobDetails?.title || '').toLowerCase();
      const jobB = (b?.jobId?.jobDetails?.title || '').toLowerCase();
      const dateA = new Date(a?.timestamp || 0).getTime();
      const dateB = new Date(b?.timestamp || 0).getTime();
      switch (assessmentSort) {
        case 'date_asc':
          return dateA - dateB;
        case 'score_desc':
          return scoreB - scoreA;
        case 'score_asc':
          return scoreA - scoreB;
        case 'candidate_asc':
          return nameA.localeCompare(nameB);
        case 'candidate_desc':
          return nameB.localeCompare(nameA);
        case 'job_asc':
          return jobA.localeCompare(jobB);
        case 'job_desc':
          return jobB.localeCompare(jobA);
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

    const visibleAssessments = sortedAssessments.slice(0, displayedAssessments);
    const hasMore = companyProfiles.length > displayedAssessments;

    return (
      <>
        {assessmentView === 'table' ? (
          <TableContainer component={Paper} sx={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Candidate</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Job Title</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Assessment Date</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Overall Score</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Job Match</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleAssessments.map((assessment) => (
                  <TableRow key={assessment._id} sx={{ '&:hover': { backgroundColor: 'rgba(2,226,255,0.05)' } }}>
                    <TableCell sx={{ color: '#000' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 28, height: 28, fontSize: 14, fontWeight: 700 }}>
                          {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, lineHeight: 1 }}>
                            {assessment.condidateId.userId.username}
                          </Typography>
                          {assessment?.condidateId?.userId?.email && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {assessment.condidateId.userId.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#000' }}>
                      {assessment.jobId.jobDetails.title}
                    </TableCell>
                    <TableCell sx={{ color: '#000' }}>
                      {new Date(assessment.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: '#000', minWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, minWidth: 40 }}>{assessment.analysis.overallScore}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Number(assessment.analysis.overallScore) || 0}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: 'rgba(2,226,255,0.08)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)`
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <Chip
                        label={assessment.analysis.jobMatch.status}
                        size="small"
                        sx={{
                          backgroundColor: assessment.analysis.jobMatch.status === 'match'
                            ? 'rgba(0,255,195,0.13)'
                            : 'rgba(255,59,48,0.13)',
                          color: assessment.analysis.jobMatch.status === 'match'
                            ? '#00FFC3'
                            : '#ff3b30',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onViewAssessmentDetails(assessment)}
                        sx={{
                          background: 'linear-gradient(90deg, rgba(0,255,157,1) 0%, rgba(2,226,255,1) 100%)',
                          color: '#0f172a',
                          fontWeight: 800,
                          borderRadius: '999px',
                          px: 2,
                          height: 34,
                          textTransform: 'none',
                          boxShadow: '0 2px 10px rgba(2,226,255,0.25)',
                          transition: 'all .2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(0,255,157,0.9) 0%, rgba(2,226,255,0.9) 100%)',
                            boxShadow: '0 4px 16px rgba(2,226,255,0.35)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {visibleAssessments.map((assessment: any) => {
              const score = Number(assessment?.analysis?.overallScore) || 0;
              const match = assessment?.analysis?.jobMatch?.status === 'match';
              return (
                <Box key={assessment._id} sx={{ width: { xs: '100%', sm: '50%', md: '33.3333%' } }}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(2,226,255,0.1)', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 36, height: 36, fontWeight: 700 }}>
                        {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>
                          {assessment?.condidateId?.userId?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                          {assessment?.condidateId?.userId?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#111827', mb: 1 }} noWrap>
                      {assessment?.jobId?.jobDetails?.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={score} size={64} thickness={5} sx={{ color: match ? '#00C48C' : '#7C4DFF' }} />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" sx={{ fontWeight: 700 }}>
                            {score}%
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={match ? <CheckCircleIcon sx={{ fontSize: 18, color: '#00FFC3' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#ff3b30' }} />}
                        label={match ? 'Job match' : 'No match'}
                        size="small"
                        sx={{
                          pl: 0.5,
                          pr: 1.25,
                          height: 30,
                          borderRadius: '999px',
                          fontWeight: 800,
                          letterSpacing: 0.2,
                          color: match ? '#065f46' : '#7f1d1d',
                          background: match
                            ? 'linear-gradient(90deg, rgba(0,255,195,0.16) 0%, rgba(2,226,255,0.12) 100%)'
                            : 'linear-gradient(90deg, rgba(255,59,48,0.16) 0%, rgba(255,59,48,0.10) 100%)',
                          border: '1px solid',
                          borderColor: match ? 'rgba(0,255,195,0.35)' : 'rgba(255,59,48,0.35)',
                          boxShadow: match
                            ? '0 2px 10px rgba(0,255,195,0.15)'
                            : '0 2px 10px rgba(255,59,48,0.12)'
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onViewAssessmentDetails(assessment)}
                        sx={{
                          background: 'linear-gradient(90deg, rgba(0,255,157,1) 0%, rgba(2,226,255,1) 100%)',
                          color: '#0f172a',
                          fontWeight: 800,
                          borderRadius: '999px',
                          px: 2,
                          height: 34,
                          boxShadow: '0 2px 10px rgba(2,226,255,0.25)',
                          textTransform: 'none',
                          transition: 'all .2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(0,255,157,0.9) 0%, rgba(2,226,255,0.9) 100%)',
                            boxShadow: '0 4px 16px rgba(2,226,255,0.35)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Details
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5 }}>
                      {new Date(assessment?.timestamp).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        )}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              endIcon={<ExpandMoreIcon />}
              onClick={() => setDisplayedAssessments(prev => prev + 10)}
              sx={{
                background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: '999px',
                px: 2.5,
                height: 40,
                textTransform: 'none',
                boxShadow: '0 2px 12px rgba(2,226,255,0.25)',
                transition: 'all .2s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(2,226,255,0.9) 0%, rgba(0,255,195,0.9) 100%)',
                  boxShadow: '0 6px 18px rgba(2,226,255,0.35)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              View More
            </Button>
          </Box>
        )}
      </>
    );
  };

  return (
    <StyledCard sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ color: 'black', fontWeight: 800, letterSpacing: 0.2 }}>
          Company Profiles & Assessments
        </Typography>
      </Box>
      {renderCompanyProfilesTable()}
    </StyledCard>
  );
};

export default CompanyProfilesAssessments;
