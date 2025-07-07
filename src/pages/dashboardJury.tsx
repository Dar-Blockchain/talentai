import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Collapse,
  InputAdornment,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
  Pagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkIcon from '@mui/icons-material/Link';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CodeIcon from '@mui/icons-material/Code';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects, selectTotalProjects, selectTotalPages, getProjectStats, selectProjectStats } from '../store/slices/projectSlice';
import { RootState } from '../store/store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const initialForm = { innovation: '', usability: '', technical: '', impact: '', comments: '' };

const JuryDashboard = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state: RootState) => state.project);
  const totalProjects = useSelector(selectTotalProjects);
  const totalPages = useSelector(selectTotalPages);
  const stats = useSelector(selectProjectStats);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [form, setForm] = useState(initialForm);
  const [trackFilter, setTrackFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<string>('createdAt');
  const [page, setPage] = useState(1);
  const projectsPerPage = 6;
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsProject, setDetailsProject] = useState<any>(null);

  // --- Enhanced Stats ---
  const pendingCount = projects.filter((p: any) => p.status !== 'Evaluated').length;
  const allScores = projects.map((p: any) => p.assessment?.technicalData?.overallScore || p.assessment?.businessData?.overallScore).filter(Boolean);
  const avgScore = typeof stats?.averageScore === 'number' ? stats.averageScore.toFixed(2) : (allScores.length ? (allScores.reduce((a: any, b: any) => a + b, 0) / allScores.length).toFixed(2) : 'N/A');
  const evaluatedCount = stats?.evaluatedProjects ?? projects.filter((p: any) => p.status === 'Evaluated').length;

  // --- Bar Chart: Projects per Track ---
  const projectsPerTrack = Array.from(new Set(projects.map((p: any) => p.track))).map(track => ({
    track,
    count: projects.filter((p: any) => p.track === track).length
  }));

  // --- Pie Chart: Evaluation Status ---
  const statusPieData = [
    { name: 'Evaluated', value: evaluatedCount, color: '#43e97b' },
    { name: 'Pending', value: pendingCount, color: '#7C4DFF' },
  ];

  // --- Line Chart: Submissions Over Time ---
  const submissionsByDate = projects.reduce((acc: any, p: any) => {
    const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Unknown';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const lineChartData = Object.entries(submissionsByDate).map(([date, count]) => ({ date, count }));

  // --- DataTable State ---
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [tablePage, setTablePage] = useState(0);
  const handleChangePage = (_: any, newPage: number) => setTablePage(newPage);
  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e.target.value, 10)); setTablePage(0); };
  const paginatedProjects = projects.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage);

  useEffect(() => {
    const params = {
      page,
      limit: 6,
      name: search,
      track: trackFilter === 'All' ? null : trackFilter,
      sort
    }
    dispatch(getAllProjects(params) as any);
    dispatch(getProjectStats() as any);
  }, [dispatch, search, page, trackFilter, sort]);  
  
  useEffect(() => {
    console.log(detailsProject, "detailsProject")
  }, [detailsProject]);

  // Track list for filter
  const tracks = ['All', ...Array.from(new Set(projects.map((p: any) => p.track)))];

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  // Global stats (prefer backend stats, fallback to computed)
  const uniqueTracks = stats?.totalTracks ?? Array.from(new Set(projects.map((p: any) => p.track))).length;
  const totalProjectsStat = stats?.totalProjects ?? totalProjects;
  const totalTeamMembers = stats?.totalTeamMembers ?? projects.reduce((acc: number, p: any) => acc + (Array.isArray(p.team) ? p.team.length : 0), 0);

  const handleExpand = (id: string) => setExpanded(expanded === id ? null : id);
  const handleOpenDetails = (project: any) => { setDetailsProject(project); setDetailsModalOpen(true); };
  const handleCloseDetails = () => { setDetailsModalOpen(false); setDetailsProject(null); };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here (API call)
    handleCloseDetails();
  };

  // Helper to calculate project score
  const getProjectScore = (project: any) => {
    const tech = project.assessment?.technicalData?.overallScore;
    const biz = project.assessment?.businessData?.overallScore;
    if (typeof tech === 'number' && typeof biz === 'number') {
      return ((tech + biz) / 2).toFixed(2);
    } else if (typeof tech === 'number') {
      return tech.toFixed(2);
    } else if (typeof biz === 'number') {
      return biz.toFixed(2);
    }
    return 'N/A';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f7faff 0%, #e3f2fd 100%)', p: { xs: 1, md: 4 } }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'rgba(124,77,255,0.07)', color: '#7C4DFF', mb: 4 }}>
        <Toolbar>
          <EmojiEventsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0.5 }}>
            Jury Project Evaluation
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Enhanced Global Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={5} justifyContent="center" alignItems="stretch">
        <Paper
          sx={{
            flex: 1,
            minWidth: 220,
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(120deg, #7C4DFF 0%, #00B8D4 100%)',
            color: '#fff',
            boxShadow: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.04)', boxShadow: 8 },
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 36, mb: 1, color: '#FFD600' }} />
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{totalProjectsStat}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Projects</Typography>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            minWidth: 220,
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(120deg, #00B8D4 0%, #7C4DFF 100%)',
            color: '#fff',
            boxShadow: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.04)', boxShadow: 8 },
          }}
        >
          <CategoryIcon sx={{ fontSize: 32, mb: 1, color: '#fff' }} />
          <Chip label={uniqueTracks} sx={{ fontSize: 22, fontWeight: 700, bgcolor: '#fff', color: '#00B8D4', mb: 1 }} />
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Unique Tracks</Typography>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            minWidth: 220,
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(120deg, #43e97b 0%, #38f9d7 100%)',
            color: '#222',
            boxShadow: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.04)', boxShadow: 8 },
          }}
        >
          <StarIcon sx={{ fontSize: 32, mb: 1, color: '#FFD600' }} />
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{avgScore}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Average Score</Typography>
        </Paper>
        <Paper
          sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #00B8D4 0%, #43e97b 100%)', color: '#fff', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}
        >
          <CheckCircleIcon sx={{ fontSize: 32, mb: 1, color: '#fff' }} />
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{evaluatedCount}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Evaluated Projects</Typography>
        </Paper>
        <Paper
          sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #FFD600 0%, #7C4DFF 100%)', color: '#222', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}
        >
          <BusinessCenterIcon sx={{ fontSize: 32, mb: 1, color: '#7C4DFF' }} />
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{totalTeamMembers}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Team Members</Typography>
        </Paper>
      </Stack>
      {/* Filters/Search/Sort + Pagination */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
          <Select value={trackFilter} onChange={e => setTrackFilter(e.target.value)} size="small" sx={{ minWidth: 120, bgcolor: '#fff' }}>
            {tracks.map(track => <MenuItem key={track} value={track}>{track}</MenuItem>)}
          </Select>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            placeholder="Search by project name"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              sx: { bgcolor: '#fff' },
            }}
          />
          <Button
            startIcon={<SortIcon />}
            onClick={() => setSort(s => (s === 'createdAt' ? '-createdAt' : 'createdAt'))}
            sx={{ bgcolor: '#fff', fontWeight: 600 }}
          >
            {sort === 'createdAt' ? 'Newest' : 'Oldest'}
          </Button>
        </Stack>
        <Box sx={{ mt: { xs: 2, md: 0 }, ml: { md: 2 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, alignItems: 'center' }}>
          <Paper
            elevation={6}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #f7faff 60%, #e3f2fd 100%)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.10)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}
            />
          </Paper>
        </Box>
      </Stack>
      {/* Charts Section */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={5}>
        {/* Bar Chart: Projects per Track */}
        <Paper sx={{ flex: 2, p: 3, borderRadius: 4, minWidth: 320, mb: { xs: 3, md: 0 } }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Projects per Track</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={projectsPerTrack} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="track" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#7C4DFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        {/* Pie Chart: Evaluation Status */}
        <Paper sx={{ flex: 1, p: 3, borderRadius: 4, minWidth: 240 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Evaluation Status</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusPieData.map((entry, idx) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        {/* Line Chart: Submissions Over Time */}
        <Paper sx={{ flex: 2, p: 3, borderRadius: 4, minWidth: 320 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Project Submissions Over Time</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="count" stroke="#00B8D4" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>
      {/* DataTable: Modern, sortable, paginated */}
      <Paper sx={{ borderRadius: 4, p: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Projects Table</Typography>
        <TableContainer>
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
              {paginatedProjects.map((project: any) => (
                <TableRow key={project._id} hover>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.track}</TableCell>
                  <TableCell>
                    <Chip label={project.assessment ? 'Evaluated' : 'Pending'} color={project.assessment ? 'success' : 'warning'} size="small" />
                  </TableCell>
                  <TableCell>{getProjectScore(project)}</TableCell>
                  <TableCell>{Array.isArray(project.team) ? project.team.length : 0}</TableCell>
                  <TableCell>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDetails(project)}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={tablePage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Loading/Error State */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>}
      {error && <Box sx={{ color: 'red', textAlign: 'center', my: 2 }}>{error}</Box>}
      {/* Project List */}
      {!loading && !error && <Stack spacing={3}>
        {projects.map((project: any) => (
          <Card key={project._id} sx={{ borderRadius: 4, boxShadow: 2, p: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={700}>{project.name}</Typography>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>{project.team && Array.isArray(project.team) ? project.team.map((m: any) => m.email).join(', ') : ''}</Typography>
                  <Typography variant="body1" mb={1}>{project.description}</Typography>
                  <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    <Chip label={project.track} color="primary" size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Submitted: {project.createdAt ? new Date(project.createdAt).toLocaleString() : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" onClick={() => handleOpenDetails(project)} sx={{ fontWeight: 700 }}>View Details</Button>
                  <IconButton onClick={() => handleExpand(project._id)}>
                    {expanded === project._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>
              </Stack>
              <Collapse in={expanded === project._id} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>{project.details || ''}</Typography>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Stack>}
      {/* Details Modal: Show AI assessment results only */}
      <Dialog open={detailsModalOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Project Assessment Details</DialogTitle>
        <DialogContent>
          {detailsProject && detailsProject.assessment ? (
            <Box>
              <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
                Combined Score: <b>{getProjectScore(detailsProject)}</b>
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Technical Test</Typography>
              {detailsProject.assessment.technicalData ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Track: {detailsProject.assessment.technicalData.track}</Typography>
                  <Typography variant="body2">Overall Score: {detailsProject.assessment.technicalData.overallScore ?? 'N/A'}</Typography>
                  <Typography variant="body2">Summary: {detailsProject.assessment.technicalData.summary ?? 'N/A'}</Typography>
                </Box>
              ) : <Typography variant="body2">No technical test data.</Typography>}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Business Test</Typography>
              {detailsProject.assessment.businessData ? (
                <Box>
                  <Typography variant="subtitle2">Problem: {detailsProject.assessment.businessData.problem}</Typography>
                  <Typography variant="body2">Overall Score: {detailsProject.assessment.businessData.overallScore ?? 'N/A'}</Typography>
                  <Typography variant="body2">Summary: {detailsProject.assessment.businessData.summary ?? 'N/A'}</Typography>
                </Box>
              ) : <Typography variant="body2">No business test data.</Typography>}
            </Box>
          ) : <Typography>No AI assessment data available for this project.</Typography>}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default JuryDashboard; 