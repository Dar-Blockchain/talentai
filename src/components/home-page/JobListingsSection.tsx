import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton, Chip } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const JobListingsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const jobs = [
    {
      title: "Technical Support Specialist",
      type: "PART-TIME",
      salary: "$20,000 - $25,000",
      company: "Google Inc.",
      location: "Tunis, Tunisia",
      logo: "G"
    },
    {
      title: "Frontend Developer",
      type: "FULL-TIME",
      salary: "$30,000 - $40,000",
      company: "Microsoft",
      location: "New York, USA",
      logo: "M"
    },
    {
      title: "UI/UX Designer",
      type: "CONTRACT",
      salary: "$25,000 - $35,000",
      company: "Apple Inc.",
      location: "California, USA",
      logo: "A"
    },
    {
      title: "Data Analyst",
      type: "FULL-TIME",
      salary: "$35,000 - $45,000",
      company: "Amazon",
      location: "Seattle, USA",
      logo: "A"
    },
    {
      title: "Product Manager",
      type: "FULL-TIME",
      salary: "$50,000 - $70,000",
      company: "Meta",
      location: "Menlo Park, USA",
      logo: "M"
    }
  ];

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
    <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
      {/* Promotional Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 8,
          maxWidth: 1200,
          mx: 'auto',
          px: 4,
          minHeight: 400
        }}
      >
        {/* Left Side - Graphic Element */}
        <Box
          sx={{
            flex: 0.6,
            height: 300,
            position: 'relative',
            mr: 4
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 120,
              height: 80,
              backgroundColor: 'rgba(131, 16, 255, 0.1)',
              borderRadius: 3,
              transform: 'rotate(-5deg)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 60,
              left: 80,
              width: 100,
              height: 60,
              backgroundColor: 'rgba(131, 16, 255, 0.15)',
              borderRadius: 3,
              transform: 'rotate(10deg)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 100,
              left: 40,
              width: 140,
              height: 70,
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
              borderRadius: 3,
              transform: 'rotate(-8deg)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 140,
              left: 100,
              width: 90,
              height: 50,
              backgroundColor: 'rgba(131, 16, 255, 0.12)',
              borderRadius: 3,
              transform: 'rotate(5deg)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 180,
              left: 60,
              width: 110,
              height: 65,
              backgroundColor: 'rgba(131, 16, 255, 0.06)',
              borderRadius: 3,
              transform: 'rotate(-3deg)'
            }}
          />
        </Box>

        {/* Right Side - Text and Button */}
        <Box sx={{ flex: 0.4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: { xs: '28px', md: '36px' },
              color: '#333',
              mb: 3,
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
              color: '#666',
              mb: 4,
              lineHeight: 1.6
            }}
          >
            Join thousands of job seekers who have found success with TalentAI. Sign up today to unlock personalized job recommendations, expert resources, and invaluable support to guide you towards your dream job.
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#8310FF',
              color: '#fff',
              px: 4,
              py: 1.5,
              borderRadius: 2,
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
        </Box>
      </Box>

      {/* Job Listings Section */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: { xs: '24px', md: '32px' },
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
                key={index}
                sx={{
                  minWidth: 320,
                  flex: '0 0 320px',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  backgroundColor: '#fff',
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

          {/* Pagination Dots */}
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
        </Box>
      </Box>
    </Box>
  );
};

export default JobListingsSection;
