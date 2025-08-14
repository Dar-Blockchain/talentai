import React from 'react';
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Box, CircularProgress, Select, MenuItem, TextField, InputAdornment, Button, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Tooltip from '@mui/material/Tooltip';

interface ProjectsTableProps {
  projects: any[];
  loading: boolean;
  error: string | null;
  tracks: string[];
  trackFilter: string;
  onTrackFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenTeamModal: (project: any) => void;
  onOpenDetails: (project: any) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  loading,
  error,
  tracks,
  trackFilter,
  onTrackFilterChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onOpenTeamModal,
  onOpenDetails,
}) => (
  <Paper sx={{ borderRadius: 4, p: 2, mb: 4 }}>
    <Typography variant="h6" fontWeight={700} mb={2}>Projects Table</Typography>
    {/* Filters/Search/Sort + Pagination */}
    <Paper elevation={3} sx={{ mb: 4, p: 2, borderRadius: 5, background: 'linear-gradient(90deg, #f8fafc 0%, #e3e7ed 100%)', boxShadow: '0 2px 12px 0 rgba(124,77,255,0.08)' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
        <TextField
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          size="small"
          placeholder="Search by project name"
          variant="outlined"
          label="Search"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            sx: { bgcolor: '#fff', borderRadius: 999, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' },
          }}
          sx={{ minWidth: 220, borderRadius: 999, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
        />
        <Box sx={{ height: 36, mx: 1, display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ borderLeft: '1.5px solid #e0e0e0', height: '100%' }} />
        </Box>
        <TextField
          select
          value={trackFilter}
          onChange={e => onTrackFilterChange(e.target.value)}
          size="small"
          label="Track"
          variant="outlined"
          InputProps={{ sx: { bgcolor: '#fff', borderRadius: 999, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' } }}
          sx={{ minWidth: 160, borderRadius: 999, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
        >
          {tracks.map(track => <MenuItem key={track} value={track}>{track}</MenuItem>)}
        </TextField>
        <Box sx={{ height: 36, mx: 1, display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ borderLeft: '1.5px solid #e0e0e0', height: '100%' }} />
        </Box>
        <TextField
          select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          size="small"
          label="Sort By"
          variant="outlined"
          InputProps={{ sx: { bgcolor: '#fff', borderRadius: 999, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' } }}
          sx={{ minWidth: 180, borderRadius: 999, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
          SelectProps={{
            startAdornment: <InputAdornment position="start"><SortIcon /> </InputAdornment>,
          }}
        >
          <MenuItem value={"-createdAt"}>Newest</MenuItem>
          <MenuItem value={"createdAt"}>Oldest</MenuItem>
          <MenuItem value={"-overallScore"}>Highest Score</MenuItem>
          <MenuItem value={"overallScore"}>Lowest Score</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            onSearchChange('');
            onTrackFilterChange('');
            onSortChange('-overallScore');
          }}
          sx={{
            borderRadius: 999,
            px: 3,
            fontWeight: 700,
            ml: { xs: 0, md: 2 },
            boxShadow: '0 1px 4px 0 rgba(124,77,255,0.08)',
            textTransform: 'none',
            height: 40,
            background: '#fff',
            '&:hover': {
              background: '#f3e8ff',
              borderColor: '#7C4DFF',
            },
          }}
          startIcon={<AutorenewIcon />}
        >
          Reset Filters
        </Button>
      </Box>
    </Paper>
    {!loading && <><TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Track</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project: any) => (
            <TableRow key={project._id} hover>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.track}</TableCell>
              <TableCell>
                {(() => {
                  const status = project.assessment?.status;
                  let chipProps: any = { label: status || 'N/A', size: 'small' };
                  if (status === 'pending') {
                    chipProps.sx = { bgcolor: '#ff9800', color: '#fff', fontWeight: 700 };
                  } else if (status === 'done') {
                    chipProps.sx = { bgcolor: '#43e97b', color: '#fff', fontWeight: 700 };
                  } else if (status === 'inProgress') {
                    chipProps.sx = { bgcolor: '#2979ff', color: '#fff', fontWeight: 700 };
                  } else if (status === 'rejected') {
                    chipProps.sx = { bgcolor: '#e53935', color: '#fff', fontWeight: 700 };
                  } else {
                    chipProps.sx = { bgcolor: '#bdbdbd', color: '#fff', fontWeight: 700 };
                  }
                  return <Chip {...chipProps} />;
                })()}
              </TableCell>
              <TableCell>
                {(() => {
                  const status = project.assessment?.status;
                  const score = project.assessment?.overallScore;
                  if (status === "pending" || status === "inProgress" || score === undefined || score === null) {
                    return (
                      <Chip
                        label="N/A"
                        size="medium"
                        sx={{
                          bgcolor: '#e0e0e0',
                          color: '#757575',
                          fontWeight: 700,
                          fontSize: 16,
                          px: 2,
                          borderRadius: 2,
                          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                          border: '1.5px solid #e0e0e0',
                        }}
                      />
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
                })()}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  startIcon={<GroupIcon />}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                    color: '#fff',
                    textTransform: 'none',
                    minWidth: 0,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                    },
                  }}
                  onClick={() => onOpenTeamModal(project)}
                >
                  {Array.isArray(project.team) ? project.team.length : 0}
                </Button>
              </TableCell>
              <TableCell>
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}
              </TableCell>
              <TableCell>
                <Button
                  size="medium"
                  startIcon={<AssessmentIcon />}
                  onClick={() => onOpenDetails(project)}
                  sx={{
                    background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    boxShadow: '0 2px 8px 0 rgba(124,77,255,0.10)',
                    textTransform: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                      boxShadow: '0 4px 16px 0 rgba(124,77,255,0.18)',
                    },
                  }}
                >
                  Assessment
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPageOptions={[6, 12, 24]}
      component="div"
      count={total}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    /></>}
    {loading && (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
        <CircularProgress />
      </Box>
    )}
    {error && (
      <Box sx={{ color: 'red', textAlign: 'center', my: 2 }}>{error}</Box>
    )}
  </Paper>
);

export default ProjectsTable; 