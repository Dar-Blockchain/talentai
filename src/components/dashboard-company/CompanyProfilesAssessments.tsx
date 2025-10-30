import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import AssessmentDetailsModal from './AssessmentDetailsModal';

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
}));

interface CompanyProfilesAssessmentsProps {
  profile: any;
}

const CompanyProfilesAssessments: React.FC<CompanyProfilesAssessmentsProps> = ({
  profile
}) => {
  const [companyProfiles, setCompanyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('all');
  const [assessmentSort, setAssessmentSort] = useState('date_desc');
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  // Add function to fetch company profiles
  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem('api_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getCompanyWithAssessments`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch company profiles');
      }

      const data = await response.json();
      setCompanyProfiles(data);
    } catch (error) {
      setProfilesError('Failed to fetch company profiles');
      console.error('Error fetching company profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Add useEffect to fetch profiles when component mounts
  useEffect(() => {
    // Only fetch company profiles if user is a company
    if (
      profile &&
      (profile.userId.role === 'Company' || profile.userId.role === 'company')
    ) {
      fetchCompanyProfiles();
    }
  }, [profile]);

  const handleViewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssessmentModalOpen(true);
  };

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
      const score = Number(assessment?.analysis?.overallScore) || 0;
      const computedStatus = score >= 70 ? 'good' : 'poor';
      const matchesStatus = assessmentStatusFilter === 'all' || assessmentStatusFilter === computedStatus;
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
        <TableContainer component={Paper} sx={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: 'none'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Candidate
                </TableCell>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Job Title
                </TableCell>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Assessment Date
                </TableCell>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Overall Score
                </TableCell>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Job Match
                </TableCell>
                <TableCell sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleAssessments.map((assessment, index) => {
                const score = Number(assessment.analysis?.overallScore) || 0;
                const isGoodMatch = score >= 70;
                
                return (
                  <TableRow 
                    key={assessment._id} 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell sx={{ color: '#111827', borderBottom: '1px solid #e5e7eb' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#f3f4f6', 
                            color: '#111827', 
                            width: 40, 
                            height: 40, 
                            fontSize: 16, 
                            fontWeight: 600,
                            border: '2px solid #e5e7eb'
                          }}
                        >
                          {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                            {assessment.condidateId?.userId?.username || 'Unknown User'}
                          </Typography>
                          {assessment?.condidateId?.userId?.email && (
                            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              {assessment.condidateId.userId.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#111827', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                      {assessment.jobId?.jobDetails?.title || 'Unknown Job'}
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                      {new Date(assessment.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                      {score}%
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e5e7eb' }}>
                      <Chip
                        label={isGoodMatch ? 'Good Match' : 'Poor Match'}
                        size="small"
                        sx={{
                          backgroundColor: isGoodMatch ? '#d1fae5' : '#fee2e2',
                          color: isGoodMatch ? '#065f46' : '#991b1b',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: 'none',
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e5e7eb' }}>
                      <IconButton
                        onClick={() => handleViewAssessmentDetails(assessment)}
                        sx={{
                          color: '#10b981',
                          '&:hover': {
                            backgroundColor: '#d1fae5'
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {visibleAssessments.length === 0 && !isLoadingProfiles && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              No assessments found
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <StyledCard sx={{ mt: 6, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700 }}>
          Company Profiles & Assessments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search Candidates"
            value={assessmentSearch}
            onChange={(e) => setAssessmentSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              width: 280,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  borderColor: '#d1d5db',
                }
              }
            }}
          />
          <Select
            size="small"
            value={assessmentStatusFilter}
            onChange={(e) => setAssessmentStatusFilter(e.target.value as string)}
            displayEmpty
            sx={{
              minWidth: 160,
              backgroundColor: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e5e7eb' }
            }}
          >
            <MenuItem value="all">All matches</MenuItem>
            <MenuItem value="good">Good match (&gt;= 70)</MenuItem>
            <MenuItem value="poor">Poor match (&lt; 70)</MenuItem>
          </Select>
          <Select
            size="small"
            value={assessmentSort}
            onChange={(e) => setAssessmentSort(e.target.value as string)}
            sx={{
              minWidth: 200,
              backgroundColor: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e5e7eb' }
            }}
          >
            <MenuItem value="date_desc">Newest first</MenuItem>
            <MenuItem value="date_asc">Oldest first</MenuItem>
            <MenuItem value="score_desc">Highest score</MenuItem>
            <MenuItem value="score_asc">Lowest score</MenuItem>
            <MenuItem value="candidate_asc">Candidate A→Z</MenuItem>
            <MenuItem value="candidate_desc">Candidate Z→A</MenuItem>
            <MenuItem value="job_asc">Job A→Z</MenuItem>
            <MenuItem value="job_desc">Job Z→A</MenuItem>
          </Select>
        </Box>
      </Box>
      
      {renderCompanyProfilesTable()}

      {/* Assessment Details Modal */}
      <AssessmentDetailsModal
        open={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        assessment={selectedAssessment}
      />
    </StyledCard>
  );
};

export default CompanyProfilesAssessments;

