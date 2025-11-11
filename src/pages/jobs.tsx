import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  Autocomplete,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';
import { JOB_LOCATIONS } from '@/constants/jobConstants';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'On-Site' | 'Remote' | 'Hybrid';
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  datePosted: string;
  skills: string[];
  logo?: string;
}

const JobSearchPage: React.FC = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  
  // Pagination metadata from API
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  
  // Track if URL params have been initialized
  const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);

  // Job details state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [jobDetailsError, setJobDetailsError] = useState<string | null>(null);


  // Fetch jobs from backend API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        // Temporarily removed status filter to see all posts
        // status: 'active',
      });

      // Add optional filters - use current state values
      if (searchQuery) params.append('search', searchQuery);
      // Don't send category to backend - we'll filter on frontend
      if (selectedLocation && selectedLocation !== 'All Locations') {
        params.append('location', selectedLocation);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const apiUrl = `${baseUrl}post/search?${params}`;  // ⚠️ SLASH IS REQUIRED!
      
      console.log('🔍 Fetching jobs from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data);
      console.log('📊 Total posts found:', data.total);
      console.log('📄 Posts in this page:', data.results?.length || 0);

      if (data.success) {
        // Transform backend data to match frontend Job interface
        const transformedJobs = (data.results || []).map((job: any) => ({
          id: job._id,
          title: job.jobDetails?.title || 'Untitled Position',
          company: job.user?.companyDetails?.companyName || 'Company',
          location: job.jobDetails?.location || 'Location not specified',
          type: job.jobDetails?.workType || job.jobDetails?.type || 'On-Site',
          employmentType: job.jobDetails?.employmentType || 'Full-Time',
          salary: {
            min: job.jobDetails?.salary?.min || 0,
            max: job.jobDetails?.salary?.max || 0,
            currency: job.jobDetails?.salary?.currency || 'USD',
          },
          description: job.jobDetails?.description || 'No description available',
          datePosted: job.createdAt || new Date().toISOString(),
          skills: job.skillAnalysis?.requiredSkills?.map((skill: any) =>
            typeof skill === 'string' ? skill : skill.name
          ) || [],
          logo: job.user?.companyDetails?.logo || undefined,
        }));

        setJobs(transformedJobs);
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.total || 0);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Error loading jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedLocation]);

  // Initialize search params from URL on page load ONCE
  useEffect(() => {
    if (router.isReady && !urlParamsLoaded) {
      const { search, location } = router.query;

      // Set state from URL parameters only on initial load
      if (search && typeof search === 'string') {
        setSearchQuery(search);
      }
      if (location && typeof location === 'string') {
        setSelectedLocation(location);
      }

      // Mark URL params as loaded
      setUrlParamsLoaded(true);
    } else if (router.isReady && urlParamsLoaded === false) {
      // No URL params, mark as loaded anyway
      setUrlParamsLoaded(true);
    }
  }, [router.isReady, urlParamsLoaded]);

  // Fetch jobs whenever search parameters or page changes, but ONLY after URL params are loaded
  useEffect(() => {
    if (router.isReady && urlParamsLoaded) {
      fetchJobs();
    }
  }, [router.isReady, urlParamsLoaded, fetchJobs]);

  const handleSearch = () => {
    // If already on page 1, force a fetch. Otherwise, set to page 1 which will trigger fetch
    if (currentPage === 1) {
      fetchJobs();
    } else {
      setCurrentPage(1);
    }
  };

  // Fetch job details
  const fetchJobDetails = async (jobId: string) => {
    setJobDetailsLoading(true);
    setJobDetailsError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const apiUrl = `${baseUrl}post/details/${jobId}`;
      
      console.log('🔍 Fetching job details from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();

      if (data.success) {
        setJobDetails(data.data);
      } else {
        setJobDetailsError(data.error || 'Failed to fetch job details');
      }
    } catch (err) {
      setJobDetailsError('Error loading job details. Please try again later.');
      console.error('Error fetching job details:', err);
    } finally {
      setJobDetailsLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    // Find the selected job
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      fetchJobDetails(jobId);
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.currency} ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'On-Site': return '#e3f2fd';
      case 'Remote': return '#e8f5e8';
      case 'Hybrid': return '#fff3e0';
      default: return '#f5f5f5';
    }
  };

  const getJobTypeTextColor = (type: string) => {
    switch (type) {
      case 'On-Site': return '#1976d2';
      case 'Remote': return '#2e7d32';
      case 'Hybrid': return '#f57c00';
      default: return '#666';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa'
    }}>
      <Header 
        logo="/images/home/logocandidate.png" 
        type="jobseeker" 
        color="#8310FF" 
        link="Are you hiring?" 
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section - matches the image exactly */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#2b2152',
              mb: 2,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Your next job starts here
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666', 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Discover top jobs from over {totalJobs > 0 ? totalJobs.toLocaleString() : '22,000'} listings across industries and roles. 
            Filter the best remote opportunities by location and category, with thousands 
            of new positions added each month.
          </Typography>
        </Box>

        {/* Search Bar - matches the image design */}
        <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                placeholder="Job Title"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8310FF' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Autocomplete
                value={selectedLocation}
                onChange={(event, newValue) => {
                  setSelectedLocation(newValue || '');
                }}
                options={JOB_LOCATIONS}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    placeholder="Search countries..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon sx={{ color: '#8310FF' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                )}
                PaperComponent={({ children, ...other }) => (
                  <Paper
                    {...other}
                    sx={{
                      maxHeight: 300,
                      '& .MuiAutocomplete-listbox': {
                        maxHeight: 300,
                        '& .MuiAutocomplete-option': {
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          '&:hover': {
                            backgroundColor: 'rgba(131, 16, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(131, 16, 255, 0.12)',
                          }
                        }
                      }
                    }}
                  >
                    {children}
                  </Paper>
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ color: '#8310FF', mr: 1, fontSize: 16 }} />
                    {option}
                  </Box>
                )}
                noOptionsText="No countries found"
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '14px !important',
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{
                  backgroundColor: '#8310FF',
                  color: 'white',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#6B0BC7',
                  }
                }}
              >
                Search Job
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Results Header - matches the image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Discover {totalJobs} job listings :
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Two Column Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Job Listings */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Job Listings - matches the image design */}
            {!loading && !error && (
              <>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {jobs.map((job) => (
                    <Grid size={{ xs: 12 }} key={job.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          border: selectedJob?.id === job.id ? '2px solid #8310FF' : '1px solid #e0e0e0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)',
                          }
                        }}
                        onClick={() => handleJobClick(job.id)}
                      >
                        <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {/* Header with logo, title, company and date */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                            {/* Company Logo */}
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              backgroundColor: '#f5f5f5', 
                              borderRadius: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 1.5,
                              flexShrink: 0
                            }}>
                              {job.logo ? (
                                <Box
                                  component="img"
                                  src={job.logo}
                                  alt={job.company}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 1
                                  }}
                                />
                              ) : (
                                <BusinessIcon sx={{ color: '#666', fontSize: 20 }} />
                              )}
                            </Box>

                            {/* Job Title, Company and Date */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      color: '#333',
                                      mb: 0.25,
                                      lineHeight: 1.2,
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {job.title}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#666', 
                                      fontSize: '0.8rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {job.company}
                                  </Typography>
                                </Box>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#999', 
                                    whiteSpace: 'nowrap',
                                    ml: 1.5,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {formatDate(job.datePosted)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* Job Tags - matches the image exactly with light blue color */}
                          <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip
                              label={job.type}
                              size="small"
                              sx={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500,
                                border: 'none',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                              icon={<LocationIcon sx={{ fontSize: 12, color: '#1976d2' }} />}
                            />
                            <Chip
                              label={job.employmentType}
                              size="small"
                              sx={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500,
                                border: 'none',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                              icon={<WorkIcon sx={{ fontSize: 12, color: '#1976d2' }} />}
                            />
                            <Chip
                              label={formatSalary(job.salary)}
                              size="small"
                              sx={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500,
                                border: 'none',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                              icon={<MoneyIcon sx={{ fontSize: 12, color: '#1976d2' }} />}
                            />
                          </Stack>

                          {/* Description */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#666', 
                              mb: 2, 
                              flex: 1,
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.8rem'
                            }}
                          >
                            {job.description}
                          </Typography>

                          {/* Action Buttons - matches the image */}
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click when button is clicked
                              handleJobClick(job.id);
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              backgroundColor: '#8310FF',
                              color: 'white',
                              borderRadius: 1.5,
                              py: 0.75,
                              fontSize: '0.8rem',
                              '&:hover': {
                                backgroundColor: '#6B0BC7',
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, value) => setCurrentPage(value)}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          margin: '0 2px',
                          minWidth: 40,
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          '&.Mui-selected': {
                            backgroundColor: 'white',
                            borderColor: '#8310FF',
                            color: '#8310FF',
                            '&:hover': {
                              backgroundColor: 'rgba(131, 16, 255, 0.04)',
                            }
                          },
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          }
                        },
                        '& .MuiPaginationItem-previousNext': {
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: '#e0e0e0',
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Right Column - Job Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Job Details Panel */}
            {jobDetailsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#8310FF' }} />
              </Box>
            )}

            {jobDetailsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {jobDetailsError}
              </Alert>
            )}

            {!jobDetailsLoading && !jobDetailsError && jobDetails && (
              <Card sx={{ 
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Visible Title Only */}
                  <Box sx={{ p: 4, pb: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                      {jobDetails.jobDetails.title}
                    </Typography>
                  </Box>

                  {/* Everything else blurred */}
                  <Box sx={{ position: 'relative', mt: 1 }}>
                    <Box sx={{ p: 4, filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }} aria-hidden>
                  {/* Company Logo and Title */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    {jobDetails.user?.companyDetails?.logo && (
                      <Box
                        component="img"
                        src={jobDetails.user.companyDetails.logo}
                        // alt={jobDetails.user.companyDetails.companyName}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          mr: 2,
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2b2152', mb: 1 }}>
                        {jobDetails.jobDetails.title}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Job Tags */}
                  <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={jobDetails.jobDetails.workType || jobDetails.jobDetails.type || 'On-Site'}
                      size="small"
                      sx={{
                        backgroundColor: getJobTypeColor(jobDetails.jobDetails.workType || jobDetails.jobDetails.type || 'On-Site'),
                        color: getJobTypeTextColor(jobDetails.jobDetails.workType || jobDetails.jobDetails.type || 'On-Site'),
                        fontWeight: 600,
                        border: 'none'
                      }}
                      icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    />
                    <Chip
                      label={`${jobDetails.jobDetails.salary.currency} ${jobDetails.jobDetails.salary.min.toLocaleString()} - ${jobDetails.jobDetails.salary.currency} ${jobDetails.jobDetails.salary.max.toLocaleString()}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                      icon={<MoneyIcon sx={{ fontSize: 16 }} />}
                    />
                    <Chip
                      label={jobDetails.jobDetails.employmentType}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                      icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    />
                  </Stack>

                  {/* Required Skills */}
                  {jobDetails.skillAnalysis?.requiredSkills?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                        Required Skills
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {jobDetails.skillAnalysis.requiredSkills.map((skill: any, index: number) => (
                          <Chip
                            key={index}
                            label={typeof skill === 'string' ? skill : `${skill.name}${skill.level ? ` (${skill.level})` : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#f5f5f5',
                              color: '#2b2152',
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {jobDetails.jobDetails.description}
                    </Typography>
                  </Box>

                  {/* Requirements */}
                  {jobDetails.jobDetails.requirements && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                        What are we looking for?
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {jobDetails.jobDetails.requirements}
                      </Typography>
                    </Box>
                  )}

                  {/* Benefits */}
                  {jobDetails.jobDetails.benefits && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                        What do we have to offer you?
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {jobDetails.jobDetails.benefits}
                      </Typography>
                    </Box>
                  )}

                  {/* Responsibilities */}
                  {jobDetails.jobDetails.responsibilities && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}>
                        What makes us different?
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {jobDetails.jobDetails.responsibilities}
                      </Typography>
                    </Box>
                  )}

                    </Box>
                    <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)' }} />
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* No Job Selected State */}
            {!jobDetailsLoading && !jobDetailsError && !jobDetails && (
              <Card sx={{ 
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                    Select a job to view details
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    Click on any job listing to see the full job description and requirements.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* No Results */}
        {!loading && !error && jobs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
              No jobs found matching your criteria
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}
      </Container>
      
      <SimpleFooter />
    </Box>
  );
};

export default JobSearchPage;
