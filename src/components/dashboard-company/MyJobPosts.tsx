import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteJobPostDialog from '@/components/dashboard-company/DeleteJobPostDialog';
import JobDetailsDialog from '@/components/dashboard-company/JobDetailsDialog';
// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
}));

const JobCard = styled(Box)(({ theme }) => ({
  background: 'white',
  borderRadius: '12px',
  padding: theme.spacing(3),
  border: '1px solid #e5e7eb',
  marginBottom: theme.spacing(2),
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: '#d1d5db',
  },
}));

interface MyJobPostsProps {
  myJobs: any[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  displayCount: number;
  onViewMatches: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onLoadMore: () => void;
  onCreateNewJob: () => void;
  // Delete dialog control from parent
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  jobToDelete: string;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

const MyJobPosts: React.FC<MyJobPostsProps> = ({
  myJobs,
  isLoadingJobs,
  jobsError,
  displayCount,
  onViewMatches,
  onDeleteJob,
  onLoadMore,
  onCreateNewJob,
  deleteDialogOpen,
  isDeleting,
  jobToDelete,
  onCancelDelete,
  onConfirmDelete,
}) => {
  // State for job details modal
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 2;
  
  // Filter and sort jobs
  const filteredAndSortedJobs = myJobs
    .filter((job: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        job.jobDetails.title?.toLowerCase().includes(query) ||
        job.jobDetails.location?.toLowerCase().includes(query) ||
        job.jobDetails.employmentType?.toLowerCase().includes(query) ||
        job.jobDetails.description?.toLowerCase().includes(query)
      );
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.jobDetails.title.localeCompare(b.jobDetails.title);
        case 'title-desc':
          return b.jobDetails.title.localeCompare(a.jobDetails.title);
        default:
          return 0;
      }
    });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredAndSortedJobs.slice(startIndex, endIndex);

  // Handlers for job details modal
  const handleViewJobDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setJobDetailsModalOpen(true);
  };

  const handleCloseJobDetailsModal = () => {
    setJobDetailsModalOpen(false);
    setSelectedJobForDetails(null);
  };
  
  // Handler for pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  
  // Handlers for sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };
  
  const handleSortChange = (sortOption: 'newest' | 'oldest' | 'title-asc' | 'title-desc') => {
    setSortBy(sortOption);
    setCurrentPage(1); // Reset to first page when sorting
    handleSortMenuClose();
  };
  
  // Reset to first page when search changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <StyledCard>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700 }}>
          Our Job Posts
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search Jobs"
            value={searchQuery}
            onChange={handleSearchChange}
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
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={handleSortMenuOpen}
            sx={{
              borderColor: '#e5e7eb',
              color: '#6b7280',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '12px',
              px: 2.5,
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            SORT
          </Button>
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={handleSortMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => handleSortChange('newest')}
              selected={sortBy === 'newest'}
              sx={{ fontSize: '0.875rem' }}
            >
              Newest First
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortChange('oldest')}
              selected={sortBy === 'oldest'}
              sx={{ fontSize: '0.875rem' }}
            >
              Oldest First
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortChange('title-asc')}
              selected={sortBy === 'title-asc'}
              sx={{ fontSize: '0.875rem' }}
            >
              Title (A-Z)
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortChange('title-desc')}
              selected={sortBy === 'title-desc'}
              sx={{ fontSize: '0.875rem' }}
            >
              Title (Z-A)
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Job Cards */}
      {isLoadingJobs ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : jobsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>{jobsError}</Alert>
      ) : myJobs.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No job posts found.</Alert>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No jobs match your search criteria. Try a different search term.
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {currentJobs.map((job: any) => (
              <JobCard key={job._id}>
                {/* Header with Title and Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, flex: 1 }}>
                    {job.jobDetails.title}
                  </Typography>
                  {job.createdAt && (
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap', ml: 2 }}>
                      Date Posted : {new Date(job.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </Typography>
                  )}
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Chip
                    icon={<LocationOnIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                    label={job.jobDetails.location}
                    size="small"
                    sx={{ 
                      backgroundColor: '#f0fdf4', 
                      color: '#166534', 
                      fontWeight: 500, 
                      border: '1px solid #bbf7d0',
                      '& .MuiChip-icon': { color: '#10b981' }
                    }}
                  />
                  <Chip
                    icon={<WorkOutlineIcon sx={{ fontSize: 16, color: '#3b82f6' }} />}
                    label={job.jobDetails.employmentType}
                    size="small"
                    sx={{ 
                      backgroundColor: '#eff6ff', 
                      color: '#1e40af', 
                      fontWeight: 500, 
                      border: '1px solid #bfdbfe',
                      '& .MuiChip-icon': { color: '#3b82f6' }
                    }}
                  />
                  <Chip
                    icon={<AttachMoneyIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                    label={`${job.jobDetails.salary.currency} ${job.jobDetails.salary.min} - ${job.jobDetails.salary.currency} ${job.jobDetails.salary.max}`}
                    size="small"
                    sx={{ 
                      backgroundColor: '#fffbeb', 
                      color: '#92400e', 
                      fontWeight: 500, 
                      border: '1px solid #fde68a',
                      '& .MuiChip-icon': { color: '#f59e0b' }
                    }}
                  />
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    mb: 3,
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {job.jobDetails.description}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleViewJobDetails(job)}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      py: 1.25,
                      '&:hover': {
                        borderColor: '#2563eb',
                        backgroundColor: '#eff6ff'
                      }
                    }}
                  >
                    VIEW DETAILS
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => onViewMatches(job._id)}
                    sx={{
                      borderColor: '#e5e7eb',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      py: 1.25,
                      '&:hover': {
                        borderColor: '#d1d5db',
                        backgroundColor: '#f9fafb'
                      }
                    }}
                  >
                    VIEW MATCHES
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onDeleteJob(job._id)}
                    sx={{
                      borderColor: '#fecaca',
                      color: '#dc2626',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      py: 1.25,
                      '&:hover': {
                        borderColor: '#fca5a5',
                        backgroundColor: '#fef2f2'
                      }
                    }}
                  >
                    Delete Job
                  </Button>
                </Box>
              </JobCard>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      fontWeight: 600,
                    },
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    }
                  }
                }}
              />
            </Box>
          )}
        </>
      )}

      <JobDetailsDialog open={jobDetailsModalOpen} onClose={handleCloseJobDetailsModal} job={selectedJobForDetails} />

      {/* Delete Job Post Dialog */}
      <DeleteJobPostDialog
        open={deleteDialogOpen}
        onClose={onCancelDelete}
        onDelete={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </StyledCard>
  );
};

export default MyJobPosts;
