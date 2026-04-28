import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

const HowItWorksSection = () => {
  const steps = [
    { title: 'Create your free account', img: '/images/jobseeker_landing/howitswork1.png' },
    { title: 'Define your skills', img: '/images/jobseeker_landing/howitswork2.png' },
    { title: 'Take AI interview', img: '/images/jobseeker_landing/howitswork3.png' },
    { title: 'Apply for relevant jobs', img: '/images/jobseeker_landing/howitswork4.png' },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll control (mouse wheel)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      } else {
        setCurrentStep(prev => Math.max(prev - 1, 0));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [steps.length]);

  return (
    <Box
      id="howitworks"
      sx={{
        backgroundColor: '#000',
        color: '#fff',
        py: { xs: 6, md: 10 },
        px: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 1300,
          mx: 'auto',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* LEFT SIDE — Steps */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            width: '100%',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: 'rgba(204, 204, 204, 1)',
              fontWeight: 700,
              fontSize: { xs: '28px', sm: '36px', md: '48px' },
              mb: { xs: 4, md: 6 },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            How it works
          </Typography>

          <Box sx={{ position: 'relative', maxWidth: { xs: 300, md: 'auto' }, mx: { xs: 'auto', md: 0 } }}>
            {/* Vertical line */}
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                top: 20,
                bottom: 20,
                width: '2px',
                backgroundColor: '#666',
                zIndex: 1,
              }}
            />

            <Stack spacing={{ xs: 4, md: 6 }}>
              {steps.map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.02)' },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                  onClick={() => setCurrentStep(index)}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: currentStep === index ? '#fff' : '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Typography sx={{ color: currentStep === index ? '#000' : '#fff', fontWeight: 700 }}>
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: currentStep === index ? 600 : 500,
                      color: currentStep === index ? '#eee' : '#888',
                      fontSize: { xs: '16px', md: '18px' },
                      textAlign: { xs: 'center', md: 'left' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* RIGHT SIDE — Image Carousel */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: { xs: 300, sm: 350, md: 400, lg: 450 },
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: `translateY(${(index - currentStep) * 100}%)`,
                transition: 'transform 0.6s cubic-bezier(0.55, 0.08, 0.68, 0.53)',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              }}
            >
              <img
                src={step.img}
                alt={`Step ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.6s ease',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
