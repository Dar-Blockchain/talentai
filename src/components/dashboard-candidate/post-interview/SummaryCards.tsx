import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Grid, Grow } from '@mui/material';
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
      color: '#667eea',
      label: 'TOTAL',
    },
    {
      title: 'Passed Interviews',
      value: passedInterviews,
      icon: CheckCircleIcon,
      color: '#4caf50',
      label: 'PASSED',
    },
    {
      title: 'Active Applications',
      value: activeApplications,
      icon: AssignmentIcon,
      color: '#4facfe',
      label: 'ACTIVE',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index}>
          <Grow in timeout={800 + index * 200}>
            <Card
              sx={{
                height: '100%',
                minHeight: '160px',
                borderRadius: 4,
                background: '#ffffff',
                border: '2px solid #f0f0f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.25)',
                  border: `2px solid ${card.color}`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '140px',
                  height: '140px',
                  background: `radial-gradient(circle at top right, ${card.color}15 0%, transparent 70%)`,
                  pointerEvents: 'none',
                },
              }}
            >
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: `${card.color}18`,
                    color: card.color,
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    boxShadow: `0 6px 16px ${card.color}30`,
                  }}
                >
                  <card.icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      {card.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 0.5,
                      color: card.color,
                      lineHeight: 1,
                      fontSize: { xs: '2.5rem', md: '3rem' },
                    }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(SummaryCards);
