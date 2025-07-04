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
import { getAllProjects, selectTotalProjects, selectTotalPages } from '../store/slices/projectSlice';
import { RootState } from '../store/store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

const initialForm = { innovation: '', usability: '', technical: '', impact: '', comments: '' };

const JuryDashboard = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state: RootState) => state.project);
  const totalProjects = useSelector(selectTotalProjects);
  const totalPages = useSelector(selectTotalPages);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [form, setForm] = useState(initialForm);
  const [trackFilter, setTrackFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<string>('createdAt');
  const [page, setPage] = useState(1);
  const projectsPerPage = 6;
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentProject, setAssessmentProject] = useState<any>(null);

  useEffect(() => {
    const params = {
      page,
      limit: 6,
      name: search,
      track: trackFilter === 'All' ? null : trackFilter,
      sort
    }
    dispatch(getAllProjects(params) as any);
  }, [dispatch, search, page, trackFilter, sort]);  
  
  useEffect(() => {
    console.log(assessmentProject, "assessmentProject")
  }, [assessmentProject]);

  // Track list for filter
  const tracks = ['All', ...Array.from(new Set(projects.map((p: any) => p.track)))];

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  // Global stats
  const uniqueTracks = Array.from(new Set(projects.map((p: any) => p.track))).length;
  // For average score, you may need to adjust this if you have scores in your backend
  const avgScore = 'N/A';

  const handleExpand = (id: string) => setExpanded(expanded === id ? null : id);
  const handleOpenModal = (project: any) => { setSelectedProject(project); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setForm(initialForm); };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here (API call)
    handleCloseModal();
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
      {/* Global Stats */}
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
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{totalProjects}</Typography>
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
                  <Button variant="contained" onClick={() => handleOpenModal(project)} sx={{ fontWeight: 700 }}>Evaluate</Button>
                  <Button variant="outlined" onClick={() => { setAssessmentProject(project); setAssessmentModalOpen(true); }} sx={{ fontWeight: 700 }}>Assessment</Button>
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
      {/* Assessment Modal */}
      <Dialog open={assessmentModalOpen} onClose={() => setAssessmentModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Project Assessment</DialogTitle>
        <DialogContent>
          {assessmentProject && assessmentProject.assessment ? (
            <Box>
              <Typography variant="h5" fontWeight={900} mb={3} textAlign="center">{assessmentProject.name}</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Technical Data */}
                <Box flex={1} minWidth={0}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CodeIcon color="primary" />
                        <Typography variant="h6" fontWeight={700} color="primary.main">Technical</Typography>
                      </Stack>
                      {assessmentProject.assessment.technicalData && (
                        <Chip
                          label={`${assessmentProject.assessment.technicalData.overallScore ?? 'N/A'}/100`}
                          sx={{
                            fontSize: 22,
                            fontWeight: 900,
                            bgcolor: '#7C4DFF',
                            color: '#fff',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </Box>
                    {assessmentProject.assessment.technicalData ? (
                      <>
                        <Typography variant="body2" mb={2} color="text.secondary">{assessmentProject.assessment.technicalData.summary ?? 'No summary provided.'}</Typography>
                        <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>Tech Stack</Typography>
                        <Stack spacing={1} mb={2}>
                          {assessmentProject.assessment.technicalData.techStack?.map((t: any, i: number) => (
                            <Paper key={i} sx={{ p: 1, borderRadius: 2, bgcolor: '#f7faff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2"><b>{t.title}</b> ({t.componentType}) - {t.complexity}, {t.modernity}</Typography>
                              </Box>
                              <Chip label={`Score: ${t.score ?? 'N/A'}/100`} size="small" sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700, ml: 2 }} />
                            </Paper>
                          ))}
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={700} mt={2}>Architecture</Typography>

                        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f7faff', borderRadius: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2" color="text.secondary">{assessmentProject.assessment.technicalData.architecture?.title} ({assessmentProject.assessment.technicalData.architecture?.type})</Typography>
                            </Stack>
                            {assessmentProject.assessment.technicalData.architecture?.score !== undefined && (
                              <Chip label={`Score: ${assessmentProject.assessment.technicalData.architecture.score}/100`} size="small" sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700 }} />
                            )}
                          </Box>
                          {assessmentProject.assessment.technicalData.architecture?.strengths?.length > 0 && (
                            <Typography variant="body2" color="success.main" mb={0.5}><b>Strengths:</b> {assessmentProject.assessment.technicalData.architecture.strengths.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.technicalData.architecture?.weaknesses?.length > 0 && (
                            <Typography variant="body2" color="error.main" mb={0.5}><b>Weaknesses:</b> {assessmentProject.assessment.technicalData.architecture.weaknesses.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.technicalData.architecture?.recommendation?.length > 0 && (
                            <Typography variant="body2" color="#7C4DFF"><b>Recommendations:</b> {assessmentProject.assessment.technicalData.architecture.recommendation.join(', ')}</Typography>
                          )}
                        </Paper>
                        <Typography variant="subtitle2" fontWeight={700} mt={2}>Scalability Approach</Typography>
                        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f7faff', borderRadius: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2" color="text.secondary">{assessmentProject.assessment.technicalData.scalabilityApproach?.strategy}</Typography>
                            </Stack>
                            {assessmentProject.assessment.technicalData.scalabilityApproach?.score !== undefined && (
                              <Chip label={`Score: ${assessmentProject.assessment.technicalData.scalabilityApproach.score}/100`} size="small" sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700 }} />
                            )}
                          </Box>
                          {assessmentProject.assessment.technicalData.scalabilityApproach?.strengths?.length > 0 && (
                            <Typography variant="body2" color="success.main" mb={0.5}><b>Strengths:</b> {assessmentProject.assessment.technicalData.scalabilityApproach.strengths.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.technicalData.scalabilityApproach?.weaknesses?.length > 0 && (
                            <Typography variant="body2" color="error.main" mb={0.5}><b>Weaknesses:</b> {assessmentProject.assessment.technicalData.scalabilityApproach.weaknesses.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.technicalData.scalabilityApproach?.recommendation?.length > 0 && (
                            <Typography variant="body2" color="#00B8D4"><b>Recommendations:</b> {assessmentProject.assessment.technicalData.scalabilityApproach.recommendation.join(', ')}</Typography>
                          )}
                        </Paper>
                      </>
                    ) : (
                      <Typography color="text.secondary">No technical data available.</Typography>
                    )}
                  </Paper>
                </Box>
                {/* Business Data */}
                <Box flex={1} minWidth={0} mt={{ xs: 3, md: 0 }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessCenterIcon color="secondary" />
                        <Typography variant="h6" fontWeight={700} color="secondary.main">Business</Typography>
                      </Stack>
                      {assessmentProject.assessment.businessData && (
                        <Chip
                          label={`${assessmentProject.assessment.businessData.overallScore ?? 'N/A'}/100`}
                          sx={{
                            fontSize: 22,
                            fontWeight: 900,
                            bgcolor: '#00B8D4',
                            color: '#fff',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </Box>
                    {assessmentProject.assessment.businessData ? (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}><b>Problem:</b> {assessmentProject.assessment.businessData.problem}</Typography>
                        <Typography variant="body2" mb={2} color="text.secondary">{assessmentProject.assessment.businessData.summary ?? 'No summary provided.'}</Typography>
                        <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>Business Model</Typography>
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f7faff', mb: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="body2"><b>{assessmentProject.assessment.businessData.businessModel?.model}</b></Typography>
                            {assessmentProject.assessment.businessData.businessModel?.score !== undefined && (
                              <Chip label={`Score: ${assessmentProject.assessment.businessData.businessModel.score}/100`} size="small" sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700 }} />
                            )}
                          </Box>
                          {assessmentProject.assessment.businessData.businessModel?.strengths?.length > 0 && (
                            <Typography variant="body2" color="success.main" mb={0.5}><b>Strengths:</b> {assessmentProject.assessment.businessData.businessModel.strengths.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.businessData.businessModel?.weaknesses?.length > 0 && (
                            <Typography variant="body2" color="error.main" mb={0.5}><b>Weaknesses:</b> {assessmentProject.assessment.businessData.businessModel.weaknesses.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.businessData.businessModel?.recommendation?.length > 0 && (
                            <Typography variant="body2" color="#00B8D4"><b>Recommendations:</b> {assessmentProject.assessment.businessData.businessModel.recommendation.join(', ')}</Typography>
                          )}
                        </Paper>
                        <Typography variant="subtitle2" fontWeight={700} mt={2}>Market Potential</Typography>
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f7faff', mb: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">{assessmentProject.assessment.businessData.marketPotential?.range} - {assessmentProject.assessment.businessData.marketPotential?.estimatedMarketSize} ({assessmentProject.assessment.businessData.marketPotential?.targetRegion})</Typography>
                            {assessmentProject.assessment.businessData.marketPotential?.score !== undefined && (
                              <Chip label={`Score: ${assessmentProject.assessment.businessData.marketPotential.score}/100`} size="small" sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700 }} />
                            )}
                          </Box>
                          {assessmentProject.assessment.businessData.marketPotential?.strengths?.length > 0 && (
                            <Typography variant="body2" color="success.main" mb={0.5}><b>Strengths:</b> {assessmentProject.assessment.businessData.marketPotential.strengths.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.businessData.marketPotential?.weaknesses?.length > 0 && (
                            <Typography variant="body2" color="error.main" mb={0.5}><b>Weaknesses:</b> {assessmentProject.assessment.businessData.marketPotential.weaknesses.join(', ')}</Typography>
                          )}
                          {assessmentProject.assessment.businessData.marketPotential?.recommendation?.length > 0 && (
                            <Typography variant="body2" color="#00B8D4"><b>Recommendations:</b> {assessmentProject.assessment.businessData.marketPotential.recommendation.join(', ')}</Typography>
                          )}
                        </Paper>
                      </>
                    ) : (
                      <Typography color="text.secondary">No business data available.</Typography>
                    )}
                  </Paper>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Typography>No assessment data available for this project.</Typography>
          )}
        </DialogContent>
      </Dialog>
      {/* Evaluation Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, bgcolor: '#fff', borderRadius: 3, boxShadow: 4, p: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Evaluate: {selectedProject?.name}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Innovation (1-10)"
                name="innovation"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={form.innovation}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Usability (1-10)"
                name="usability"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={form.usability}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Technical Complexity (1-10)"
                name="technical"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={form.technical}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Impact (1-10)"
                name="impact"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={form.impact}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Comments"
                name="comments"
                multiline
                minRows={2}
                value={form.comments}
                onChange={handleFormChange}
              />
              <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>Submit Evaluation</Button>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default JuryDashboard; 