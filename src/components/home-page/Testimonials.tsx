import React, { useState } from "react";
import { Box, Button, Typography, Avatar } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  company: string;
  dark?: boolean;
};

const items: Testimonial[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
    name: "Luke McKinley",
    title: "VP of Finance",
    company: "fountain",
    dark: true,
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod.",
    name: "Marisol Jiménez",
    title: "Head of People",
    company: "REVERSE TECH",
    dark: false,
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
    name: "John Smith",
    title: "CEO",
    company: "EMRUSH",
    dark: false,
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
    name: "Sarah Johnson",
    title: "CTO",
    company: "TECH CORP",
    dark: true,
  },
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - 2); // Maximum index to show 2 cards

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <Box sx={{ 
      backgroundColor: '#F9FAFB', 
      py: { xs: 6, md: 10 }, 
      px: 3, 
      mb: { xs: 6, md: 8 } 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 6,
            color: '#111827'
          }}
        >
          A word from our customers
        </Typography>

        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* Carousel Container */}
          <Box sx={{
            display: 'flex',
            transform: `translateX(-${currentIndex * 50}%)`,
            transition: 'transform 0.3s ease-in-out',
            width: `${items.length * 50}%`
          }}>
            {items.map((testimonial, index) => (
              <Box 
                key={index}
                sx={{
                  width: '50%',
                  px: 2,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{
                  width: { xs: '100%', md: 500 },
                  maxWidth: 500,
                  bgcolor: testimonial.dark ? '#1F2937' : '#E5E7EB',
                  color: testimonial.dark ? '#fff' : '#111827',
                  borderRadius: 2,
                  p: 4,
                  position: 'relative',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {/* Quote */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3, 
                      color: testimonial.dark ? '#D1D5DB' : '#374151',
                      lineHeight: 1.6,
                      fontSize: '1rem'
                    }}
                  >
                    {testimonial.quote}
                  </Typography>

                  {/* Read full story link */}
                  <Button 
                    variant="text" 
                    sx={{ 
                      textTransform: 'none', 
                      color: testimonial.dark ? '#fff' : '#3B82F6',
                      alignSelf: 'flex-start',
                      p: 0,
                      mb: 3,
                      '&:hover': { backgroundColor: 'transparent' }
                    }} 
                    endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  >
                    Read full customer story
                  </Button>

                  {/* Customer info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: testimonial.dark ? '#374151' : '#9CA3AF'
                        }}
                      />
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: testimonial.dark ? '#fff' : '#111827'
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: testimonial.dark ? '#9CA3AF' : '#6B7280',
                            display: 'block'
                          }}
                        >
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Company logo */}
                    <Box sx={{ 
                      bgcolor: testimonial.dark ? '#374151' : '#fff',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      border: testimonial.dark ? '1px solid #4B5563' : '1px solid #D1D5DB'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: testimonial.dark ? '#fff' : '#111827',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Navigation Indicators */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1, 
            mt: 4 
          }}>
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: currentIndex === index ? 1 : '50%',
                  bgcolor: currentIndex === index ? '#111827' : '#D1D5DB',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Testimonials;


