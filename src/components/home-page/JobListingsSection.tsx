import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton, Chip, CircularProgress } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/router';

interface Job {
  id: string;
  title: string;
  type: string;
  salary: string;
  company: string;
  location: string;
  logo: string;
}

const JobListingsSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from API
  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const apiUrl = `${baseUrl}post/search?limit=9&sortBy=createdAt&sortOrder=desc`;
        
        console.log('🔍 Fetching latest jobs for landing page');
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();

        if (data.success && data.results) {
          // Transform API data to match component interface
          const transformedJobs = data.results.map((job: any) => {
            const companyName = job.user?.companyDetails?.companyName || job.user?.username || 'Company';
            return {
              id: job._id,
              title: job.jobDetails?.title || 'Untitled Position',
              type: job.jobDetails?.employmentType?.toUpperCase() || 'FULL-TIME',
              salary: job.jobDetails?.salary?.min && job.jobDetails?.salary?.max
                ? `${job.jobDetails.salary.currency || '$'}${job.jobDetails.salary.min.toLocaleString()} - ${job.jobDetails.salary.currency || '$'}${job.jobDetails.salary.max.toLocaleString()}`
                : 'Salary not specified',
              company: companyName,
              location: job.jobDetails?.location || 'Location not specified',
              logo: companyName.charAt(0).toUpperCase(),
            };
          });

          setJobs(transformedJobs);
          console.log('✅ Loaded', transformedJobs.length, 'jobs');
        }
      } catch (error) {
        console.error('Error fetching latest jobs:', error);
        // Keep empty array to show no jobs
      } finally {
        setLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

  const jobsPerSlide = 3;
  const totalSlides = Math.ceil(jobs.length / jobsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentJobs = jobs.slice(
    currentSlide * jobsPerSlide,
    (currentSlide + 1) * jobsPerSlide
  );

  return (
    <Box sx={{ py: 6 }}>
      {/* Promotional Banner */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 8,
          maxWidth: 1300,
          mx: 'auto',
          px: 4,
          minHeight: 300
        }}
      >
        {/* Centered Card */}
        <Card
          sx={{
            width: '100%',
            p: 6,
            borderRadius: '24px',
            backgroundColor: 'rgba(248, 250, 252, 1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'left'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: { xs: '24px', md: '32px' },
              color: '#000000',
              mb: 2,
              lineHeight: 1.2
            }}
          >
            Ready to Take the Next Step in Your Career?
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Poppins',
              fontSize: '16px',
              color: '#666666',
              mb: 3,
              lineHeight: 1.6
            }}
          >
            Join thousands of job seekers who have found success with TalentAI. Sign up today to unlock personalized job recommendations, expert resources, and invaluable support to guide you towards your dream job.
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push('/jobs')}
            sx={{
              backgroundColor: '#8310FF',
              color: '#ffffff',
              px: 4,
              py: 1,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#6b0db8'
              }
            }}
          >
            Search Job
          </Button>
        </Card>
      </Box>

      {/* Job Listings Section */}
      {jobs.length > 0 && 
      <Box sx={{ maxWidth: 1300, mx: 'auto', px: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: { xs: '24px', md: '48px' },
            color: '#333',
            mb: 6,
            textAlign: 'left'
          }}
        >
          Latest job listings
        </Typography>

        {/* Job Cards Carousel */}
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Navigation Arrows */}
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <ArrowBackIosIcon sx={{ color: '#666' }} />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <ArrowForwardIosIcon sx={{ color: '#666' }} />
          </IconButton>

          {/* Job Cards */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress sx={{ color: '#8310FF' }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                overflow: 'hidden',
                px: 2,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {currentJobs.map((job, index) => (
                <Card
                  key={job.id || index}
                  onClick={() => router.push(`/job/${job.id}`)}
                  sx={{
                    minWidth: 320,
                    flex: '0 0 320px',
                    borderRadius: '8px',
                    border: '1px solid rgba(228, 229, 232, 1)',
                    boxShadow: '0px 2px 18px 0px rgba(24, 25, 28, 0.03)',
                    transition: 'transform 0.3s ease',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                <CardContent sx={{ p: 3 }}>
                  {/* Job Title and Arrow */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '16px',
                        color: '#333',
                        flex: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {job.title}
                    </Typography>
                    <ArrowForwardIosIcon sx={{ color: '#ccc', fontSize: '14px', ml: 1 }} />
                  </Box>

                  {/* Job Type and Salary */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Chip
                      label={job.type}
                      size="small"
                      sx={{
                        backgroundColor: '#e8f5e8',
                        color: '#2e7d32',
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontSize: '13px',
                        fontWeight: 400
                      }}
                    >
                      Salary: {job.salary}
                    </Typography>
                  </Box>

                  {/* Company Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#8310FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        flexShrink: 0
                      }}
                    >
                      {job.logo}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                          fontSize: '13px',
                          mb: 0.5
                        }}
                      >
                        {job.company}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ color: '#666', fontSize: '14px' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666',
                            fontSize: '11px'
                          }}
                        >
                          {job.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          )}

          {/* Pagination Dots */}
          {!loading && jobs.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1.5, 
              mt: 6,
              mb: 2
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => goToSlide(index)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: index === currentSlide ? '#8310FF' : '#ddd',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: index === currentSlide ? '#8310FF' : '#bbb',
                      transform: 'scale(1.2)'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    }
    </Box>
  );
};

export default JobListingsSection;
