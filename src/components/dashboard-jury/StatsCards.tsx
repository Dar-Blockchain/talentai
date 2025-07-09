import React from 'react';
import { Stack, Paper, Typography, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

interface StatsCardsProps {
  totalProjects: number | string;
  uniqueTracks: number | string;
  avgScore: number | string;
  evaluatedCount: number | string;
  totalTeamMembers: number | string;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalProjects,
  uniqueTracks,
  avgScore,
  evaluatedCount,
  totalTeamMembers,
}) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={5} justifyContent="center" alignItems="stretch">
    <Paper sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #7C4DFF 0%, #00B8D4 100%)', color: '#fff', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
      <EmojiEventsIcon sx={{ fontSize: 36, mb: 1, color: '#FFD600' }} />
      <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{totalProjects}</Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Projects</Typography>
    </Paper>
    <Paper sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #00B8D4 0%, #7C4DFF 100%)', color: '#fff', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
      <CategoryIcon sx={{ fontSize: 32, mb: 1, color: '#fff' }} />
      <Chip label={uniqueTracks} sx={{ fontSize: 22, fontWeight: 700, bgcolor: '#fff', color: '#00B8D4', mb: 1 }} />
      <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Unique Tracks</Typography>
    </Paper>
    <Paper sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #43e97b 0%, #38f9d7 100%)', color: '#222', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
      <StarIcon sx={{ fontSize: 32, mb: 1, color: '#FFD600' }} />
      <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{avgScore}</Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Average Score</Typography>
    </Paper>
    <Paper sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #00B8D4 0%, #43e97b 100%)', color: '#fff', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
      <CheckCircleIcon sx={{ fontSize: 32, mb: 1, color: '#fff' }} />
      <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{evaluatedCount}</Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Evaluated Projects</Typography>
    </Paper>
    <Paper sx={{ flex: 1, minWidth: 220, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #FFD600 0%, #7C4DFF 100%)', color: '#222', boxShadow: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
      <BusinessCenterIcon sx={{ fontSize: 32, mb: 1, color: '#7C4DFF' }} />
      <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{totalTeamMembers}</Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Team Members</Typography>
    </Paper>
  </Stack>
);

export default StatsCards; 