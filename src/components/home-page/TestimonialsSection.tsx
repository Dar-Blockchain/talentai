import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Stack
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const TestimonialsSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
      name: "Luke Mckinlay",
      title: "VP of Finance",
      company: "fountain",
      avatar: "",
      isDark: true
    },
    {
      id: 2,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod.",
      name: "Marisol Jiménez",
      title: "Head of People",
      company: "REVERSE TECH",
      avatar: "",
      isDark: false
    },
    {
      id: 3,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
      name: "Sarah Johnson",
      title: "CTO",
      company: "TECH CORP",
      avatar: "",
      isDark: true
    },
    {
      id: 4,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
      name: "Michael Chen",
      title: "Product Manager",
      company: "INNOVATE",
      avatar: "",
      isDark: false
    },
    {
      id: 5,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
      name: "Emily Rodriguez",
      title: "Head of Design",
      company: "CREATIVE STUDIO",
      avatar: "",
      isDark: true
    }
  ];

  const cardsPerSlide = 2;
  const totalSlides = Math.ceil(testimonials.length / cardsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const currentTestimonials = testimonials.slice(
    currentSlide * cardsPerSlide,
    (currentSlide + 1) * cardsPerSlide
  );

  return (
    <Box
      sx={{
        py: 8,
        px: { xs: 2, md: 4 },
        backgroundColor: '#f8f9fa'
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Section Title */}
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: { xs: '28px', md: '48px' },
            textAlign: 'center',
            mb: 6,
            color: '#1a1a1a'
          }}
        >
          Hear from our talents
        </Typography>

        {/* Testimonials Carousel */}
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
              left: { xs: -20, md: -40 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'white',
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
              right: { xs: -20, md: -40 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <ArrowForwardIosIcon sx={{ color: '#666' }} />
          </IconButton>

          {/* Testimonial Cards */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflow: 'hidden',
              px: 2,
              justifyContent: 'center',
              alignItems: 'stretch',
              width: '100%'
            }}
          >
            {currentTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                sx={{
                  minWidth: 400,
                  maxWidth: 500,
                  flex: 1,
                  backgroundColor: testimonial.isDark ? '#1a1a1a' : '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Quote */}
                  <Typography
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: testimonial.isDark ? '#ffffff' : '#1a1a1a',
                      mb: 3,
                      fontStyle: 'italic'
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>

                  {/* Read More Link */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: testimonial.isDark ? '#ffffff' : '#8310FF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Read full customer story
                      <ArrowForwardIosIcon sx={{ fontSize: '14px' }} />
                    </Typography>
                  </Box>

                  {/* Profile Section */}
                  <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{
                          width: 56,
                          height: 56,
                          border: testimonial.isDark ? '2px solid #333' : '2px solid #e0e0e0'
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: testimonial.isDark ? '#ffffff' : '#1a1a1a',
                            mb: 0.5
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            color: testimonial.isDark ? '#cccccc' : '#666666'
                          }}
                        >
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Company Logo */}
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: testimonial.isDark ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        {testimonial.company}
                      </Typography>
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

export default TestimonialsSection;