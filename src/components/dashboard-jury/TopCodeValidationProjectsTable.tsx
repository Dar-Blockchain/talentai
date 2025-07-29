import React from 'react';
import { Paper, Typography, Box, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, Chip, Tooltip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CodeIcon from '@mui/icons-material/Code';

interface TopCodeValidationProjectsTableProps {
  data: any[];
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDetails: (project: any) => void;
}

const TopCodeValidationProjectsTable: React.FC<TopCodeValidationProjectsTableProps> = ({
  data,
  loading,
  error,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onOpenDetails,
}) => (
  <Paper sx={{ flex: 1, p: 2, borderRadius: 4 , mb: 2 }}>
    <Typography variant="h6" fontWeight={700} mb={2}>Top Projects by Code Validation Score</Typography>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
        <CircularProgress />
      </Box>
    ) : error ? (
      <Typography color="error">{error}</Typography>
    ) : (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Track</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code Validation Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.length > 0 && data.map((project: any) => (
                <TableRow key={project._id} hover>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.track}</TableCell>
                  <TableCell>{(() => {
                    // Try different possible paths for code analysis score
                    const score = project.assessment?.codeAnalysis?.analysis?.overallScore || 
                                 project.assessment?.codeAnalysis?.overallScore ||
                                 project.assessment?.codeAnalysis?.analysis?.quality?.overall ||
                                 project.assessment?.codeAnalysis?.finalScore;
                    
                    // Debug: Log the project structure to understand what's available
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Project:', project.name);
                      console.log('Project assessment structure:', project.assessment);
                      console.log('Code analysis data:', project.assessment?.codeAnalysis);
                      console.log('Assessment ID:', project.assessment?._id);
                    }
                    if (score === undefined || score === null) {
                      return (
                        <Tooltip title="Code analysis has not been performed for this project" arrow>
                          <Chip
                            label="No Code Analysis"
                            size="medium"
                            sx={{
                              bgcolor: '#e0e0e0',
                              color: '#757575',
                              fontWeight: 700,
                              fontSize: 14,
                              px: 2,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                              border: '1.5px solid #e0e0e0',
                            }}
                          />
                        </Tooltip>
                      );
                    }
                    let chipGradient = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
                    let chipText = '#fff';
                    let icon = <StarIcon sx={{ color: chipText, fontSize: 22, ml: 1 }} />;
                    let tooltip = 'Excellent';
                    if (score < 50) {
                      chipGradient = 'linear-gradient(90deg, #e53935 0%, #ff6a00 100%)';
                      icon = <WarningAmberIcon sx={{ color: chipText, fontSize: 22, ml: 1 }} />;
                      tooltip = 'Needs Improvement';
                    } else if (score < 80) {
                      chipGradient = 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)';
                      icon = <TrendingUpIcon sx={{ color: chipText, fontSize: 22, ml: 1 }} />;
                      tooltip = 'Good';
                    }
                    return (
                      <Tooltip title={tooltip} arrow>
                        <Chip
                          icon={icon}
                          label={<span style={{ fontWeight: 700, fontSize: 15 }}>{score}%</span>}
                          size="medium"
                          sx={{
                            background: chipGradient,
                            color: chipText,
                            fontWeight: 700,
                            fontSize: 15,
                            px: 2.5,
                            borderRadius: 3,
                            boxShadow: '0 4px 16px 0 rgba(67,233,123,0.18)',
                            minWidth: 60,
                            justifyContent: 'left',
                            border: '2px solid #fff',
                          }}
                        />
                      </Tooltip>
                    );
                  })()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<CodeIcon />}
                      onClick={() => onOpenDetails(project)}
                      sx={{
                        background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 3,
                        px: 2,
                        py: 0.5,
                        boxShadow: '0 2px 8px 0 rgba(124,77,255,0.10)',
                        textTransform: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                          boxShadow: '0 4px 16px 0 rgba(124,77,255,0.18)',
                        },
                      }}
                    >
                      Code Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </>
    )}
  </Paper>
);

export default TopCodeValidationProjectsTable; 