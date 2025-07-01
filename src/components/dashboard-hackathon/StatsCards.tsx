import { Box, Card, CardContent, Avatar, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import React from 'react';

interface TeamMember {
  name: string;
  email?: string;
  role: string;
}

interface ProjectData {
  teamMembers: TeamMember[];
  createdAt: string;
}

const StatsCards: React.FC<{ projectData: ProjectData }> = ({ projectData }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
    <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #7C4DFF 0%, #2196F3 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #7C4DFF33' }}>
            <PersonIcon sx={{ color: '#fff' }} />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography sx={{ color: '#8F9BB3' }} variant="body2">Team Size</Typography>
            <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
              {projectData.teamMembers.length} Members
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #E040FB 0%, #4CAF50 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #E040FB33' }}>
            <CalendarTodayIcon sx={{ color: '#fff' }} />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography sx={{ color: '#8F9BB3' }} variant="body2">Project Created</Typography>
            <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
              {new Date(projectData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #FFD600 0%, #7C4DFF 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #FFD60033' }}>
            <WorkIcon sx={{ color: '#7C4DFF' }} />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography sx={{ color: '#8F9BB3' }} variant="body2">AI Meetings</Typography>
            <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
              2 Available
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

export default StatsCards; 