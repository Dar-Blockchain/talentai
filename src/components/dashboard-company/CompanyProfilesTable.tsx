import React from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

interface Assessment {
  _id: string;
  condidateId: { userId: { username: string } };
  timestamp: string;
  analysis: {
    overallScore: number;
    jobMatch: { status: string };
  };
}

interface CompanyProfilesTableProps {
  isLoading: boolean;
  error: string | null;
  companyProfiles: Assessment[];
  displayedAssessments: number;
  onShowMore: () => void;
  handleViewDetails: (assessment: Assessment) => void;
  renderDetailsModal: () => React.ReactNode;
}

export const CompanyProfilesTable: React.FC<CompanyProfilesTableProps> = ({
  isLoading,
  error,
  companyProfiles,
  displayedAssessments,
  onShowMore,
  handleViewDetails,
  renderDetailsModal
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  if (!companyProfiles.length) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, px: 3, backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(2,226,255,0.1)', textAlign: 'center' }}>
        <BusinessIcon sx={{ fontSize: 48, color: '#02E2FF', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
          No Assessments Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'black', maxWidth: '400px' }}>
          There are no assessments available at the moment.
        </Typography>
      </Box>
    );
  }

  const visible = companyProfiles.slice(0, displayedAssessments);
  const hasMore = companyProfiles.length > displayedAssessments;

  return (
    <>
      <TableContainer component={Paper} sx={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#000', fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 600 }}>Assessment Date</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 600 }}>Overall Score</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 600 }}>Job Match</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((a) => (
              <TableRow key={a._id} sx={{ '&:hover': { backgroundColor: 'rgba(2,226,255,0.05)' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                    <Typography>{a.condidateId.userId.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(a.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {a.analysis.overallScore}%
                </TableCell>
                <TableCell>
                  <Chip label={a.analysis.jobMatch.status} size="small" sx={{
                    backgroundColor: a.analysis.jobMatch.status === 'match' ? 'rgba(0,255,195,0.13)' : 'rgba(255,59,48,0.13)',
                    color: a.analysis.jobMatch.status === 'match' ? '#00FFC3' : '#ff3b30',
                    fontWeight: 600
                  }} />
                </TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleViewDetails(a)} sx={{ backgroundColor: 'rgba(0, 255, 157, 1)', color: 'black' }}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={onShowMore} sx={{ color: '#02E2FF', borderColor: '#02E2FF', '&:hover': { backgroundColor: 'rgba(2, 226, 255, 0.04)' } }}>
            View More
          </Button>
        </Box>
      )}

      {renderDetailsModal()}
    </>
  );
};
