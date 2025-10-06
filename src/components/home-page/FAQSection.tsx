import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const FAQSection: React.FC = () => {
  const [expanded, setExpanded] = useState<number | false>(0);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 0,
      question: "Lorem ipsum dolor sit amet?",
      answer: "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore ismod nulla."
    },
    {
      id: 1,
      question: "Lorem ipsum dolor sit amet?",
      answer: "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore ismod nulla."
    },
    {
      id: 2,
      question: "Lorem ipsum dolor sit amet?",
      answer: "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore ismod nulla."
    },
    {
      id: 3,
      question: "Lorem ipsum dolor sit amet?",
      answer: "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore ismod nulla."
    }
  ];

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
          FAQ
        </Typography>

        {/* FAQ Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleChange(faq.id)}
                sx={{
                  boxShadow: 'none',
                  '&:before': {
                    display: 'none'
                  },
                  '&:not(:last-child)': {
                    borderBottom: '1px solid #e0e0e0'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <IconButton
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: expanded === faq.id ? '#1a1a1a' : '#f5f5f5',
                        color: expanded === faq.id ? '#ffffff' : '#1a1a1a',
                        '&:hover': {
                          backgroundColor: expanded === faq.id ? '#333333' : '#e0e0e0'
                        }
                      }}
                    >
                      {expanded === faq.id ? (
                        <CloseIcon sx={{ fontSize: '16px' }} />
                      ) : (
                        <AddIcon sx={{ fontSize: '16px' }} />
                      )}
                    </IconButton>
                  }
                  sx={{
                    px: 4,
                    py: 3,
                    minHeight: 'auto',
                    '& .MuiAccordionSummary-content': {
                      margin: 0,
                      alignItems: 'center'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {/* FAQ Number */}
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#999999',
                        mr: 3,
                        minWidth: '40px'
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>

                    {/* Question */}
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        flex: 1
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    px: 4,
                    pb: 3,
                    pt: 0
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: '#666666',
                      ml: 7
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FAQSection;
