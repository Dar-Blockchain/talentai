import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Stack } from '@mui/material';

const HowItWorksSection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: 'Create your free account',
      step: 1,
      color: '#8310FF'
    },
    {
      title: 'Define your skills',
      step: 2,
      color: '#10B981'
    },
    {
      title: 'Take AI interview',
      step: 3,
      color: '#F59E0B'
    },
    {
      title: 'Apply for relevant jobs',
      step: 4,
      color: '#EF4444'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const element = scrollContainerRef.current;
      if (!element) return;

      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      // Calculate scroll progress within the image container
      const scrollProgress = scrollTop / (scrollHeight - clientHeight);
      
      // Determine which step to show based on scroll progress
      const stepIndex = Math.floor(scrollProgress * 4);
      const newStep = Math.min(Math.max(stepIndex + 1, 1), 4);
      
      console.log('Scroll progress:', scrollProgress, 'New step:', newStep, 'Current step:', currentStep);
      
      if (newStep !== currentStep) {
        setCurrentStep(newStep);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [currentStep]);


  const currentStepData = steps.find(step => step.step === currentStep);
  const leftSideColor = currentStepData?.color || '#8310FF';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '600px',
        backgroundColor: '#000',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Side - Fixed Dynamic Background with Steps */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#000',
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 2,
          transition: 'background 0.5s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: { xs: '32px', md: '48px' },
            mb: 6,
            color: '#fff'
          }}
        >
          How it works
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Vertical line connecting steps */}
          <Box
            sx={{
              position: 'absolute',
              left: 20,
              top: 20,
              bottom: 20,
              width: '2px',
              backgroundColor: '#666',
              zIndex: 1
            }}
          />
          
          <Stack spacing={6}>
            {steps.map((step, index) => (
              <Box 
                key={step.step}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  position: 'relative', 
                  zIndex: 2
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: currentStep === step.step ? '#fff' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Typography sx={{ 
                    color: currentStep === step.step ? '#000' : '#fff', 
                    fontWeight: 700, 
                    fontSize: '18px' 
                  }}>
                    {step.step}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: currentStep === step.step ? 600 : 500,
                    fontSize: { xs: '16px', md: '18px' },
                    color: '#fff',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {step.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right Side - Scrollable Images */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#000',
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Scroll Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 2,
              height: 40,
              backgroundColor: '#333',
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: `${((currentStep - 1) / 3) * 100}%`,
                backgroundColor: leftSideColor,
                borderRadius: 1,
                transition: 'height 0.3s ease'
              }}
            />
          </Box>
        </Box>

        {/* All Images Display Container */}
        <Box
          ref={scrollContainerRef}
          onWheel={(e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
              setCurrentStep(prev => Math.min(prev + 1, 4));
            } else if (e.deltaY < 0) {
              setCurrentStep(prev => Math.max(prev - 1, 1));
            }
          }}
          sx={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
            position: 'relative',
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing'
            },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#000',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#000',
              borderRadius: '4px',
              '&:hover': {
                background: '#333',
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minHeight: 'fit-content',
              width: '100%',
              alignItems: 'center',
              py: 6
            }}
          >
            {steps.map((step, index) => (
              <Box
                key={step.step}
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#000',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  border: '2px solid transparent'
                }}
              >
                <img
                  src={`/images/jobseeker_landing/howitswork${step.step}.png`}
                  alt={`Step ${step.step} Image`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '10px'
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
