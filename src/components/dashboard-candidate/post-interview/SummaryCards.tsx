import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface SummaryCardsProps {
  totalApplications: number;
  passedInterviews: number;
  activeApplications: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalApplications,
  passedInterviews,
  activeApplications,
}) => {
  const cards = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: AssessmentIcon,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      label: 'TOTAL',
    },
    {
      title: 'Passed Interviews',
      value: passedInterviews,
      icon: CheckCircleIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      label: 'PASSED',
    },
    {
      title: 'Active Applications',
      value: activeApplications,
      icon: AssignmentIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      label: 'ACTIVE',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
      {cards.map((card, index) => (
        <Box key={index} sx={{ flex: '1 1 280px', minWidth: '280px' }}>
          <Card
            sx={{
              height: '100%',
              background: card.gradient,
              position: 'relative',
              overflow: 'visible',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                pointerEvents: 'none',
              },
            }}
          >
            <CardContent sx={{ color: 'white', position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <card.icon sx={{ fontSize: 32 }} />
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {card.label}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, mb: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
              >
                {card.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '1rem', fontWeight: 500 }}>
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(SummaryCards);
