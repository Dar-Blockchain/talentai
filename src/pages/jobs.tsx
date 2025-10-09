import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import ModernFooter from '@/components/home-page/ModernFooter';

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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  
  // Pagination metadata from API
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const categories = [
    'All Categories',
    'Software Development',
    'Data Science',
    'Design',
    'Product Management',
    'DevOps',
    'Marketing',
    'Sales'
  ];

  const locations = [
    'All Locations',
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Seattle, WA',
    'Denver, CO',
    'Los Angeles, CA',
    'Boston, MA',
    'Chicago, IL',
    'Remote'
  ];

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        status: 'active',
      });

      // Add optional filters
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.append('category', selectedCategory);
      }
      if (selectedLocation && selectedLocation !== 'All Locations') {
        params.append('location', selectedLocation);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const apiUrl = `${baseUrl}post/search?${params}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();

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
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const handleJobClick = (jobId: string) => {
    // Navigate to job details page
    console.log('View job details:', jobId);
  };

  const handleApply = (jobId: string) => {
    // Handle job application
    console.log('Apply for job:', jobId);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header 
        logo="/images/jobseeker_landing/TalentAiPurpleHome.png" 
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
            Discover top jobs from over 22,000 listings across industries and roles. 
            Filter the best remote opportunities by location and category, with thousands 
            of new positions added each month.
          </Typography>
        </Box>

        {/* Search Bar - matches the image design */}
        <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon sx={{ color: '#8310FF' }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>All Location</InputLabel>
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: '#8310FF' }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

        {/* Job Listings - matches the image design */}
        {!loading && !error && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {jobs.map((job) => (
                <Grid size={{ xs: 12 }} key={job.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Header with date */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              color: '#2b2152',
                              mb: 1,
                              lineHeight: 1.3
                            }}
                          >
                            {job.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: '#666', display: 'flex', alignItems: 'center', mb: 1 }}
                          >
                            <BusinessIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {job.company}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#999', 
                            whiteSpace: 'nowrap',
                            ml: 2
                          }}
                        >
                          Date Posted : {formatDate(job.datePosted)}
                        </Typography>
                      </Box>

                      {/* Job Tags - matches the image exactly */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={job.type}
                          size="small"
                          sx={{
                            backgroundColor: getJobTypeColor(job.type),
                            color: getJobTypeTextColor(job.type),
                            fontWeight: 600,
                            border: 'none'
                          }}
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                        />
                        <Chip
                          label={job.employmentType}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                        />
                        <Chip
                          label={formatSalary(job.salary)}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                          icon={<MoneyIcon sx={{ fontSize: 16 }} />}
                        />
                      </Stack>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666', 
                          mb: 3, 
                          flex: 1,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {job.description}
                      </Typography>

                      {/* Action Buttons - matches the image */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJobClick(job.id)}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              borderColor: '#1565c0',
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                          }}
                        >
                          VIEW DETAILS
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleApply(job.id)}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#e0e0e0',
                            color: '#666',
                            '&:hover': {
                              borderColor: '#ccc',
                              backgroundColor: '#f5f5f5',
                            }
                          }}
                        >
                          APPLY
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      '&.Mui-selected': {
                        backgroundColor: '#8310FF',
                        '&:hover': {
                          backgroundColor: '#6B0BC7',
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}

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
      
      <ModernFooter />
    </Box>
  );
};

export default JobSearchPage;
