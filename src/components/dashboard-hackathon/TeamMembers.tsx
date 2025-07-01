import { Card, CardHeader, Divider, CardContent, Box, Avatar, Typography, Tooltip } from '@mui/material';
import React from 'react';

interface TeamMember {
  name: string;
  email?: string;
  role: string;
}

const TeamMembers: React.FC<{ teamMembers: TeamMember[] }> = ({ teamMembers }) => (
  <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
    <CardHeader 
      title="Team Members" 
      titleTypographyProps={{ 
        variant: 'subtitle1', 
        fontWeight: 700,
        color: '#7C4DFF',
        fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
      }}
      sx={{ pb: 1 }}
    />
    <Divider sx={{ borderColor: '#EDE7F6' }} />
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
      {teamMembers.map((member, index) => (
        <Box key={index}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={member.email || ''} placement="top" arrow>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'linear-gradient(135deg, #7C4DFF 0%, #2196F3 100%)',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                  boxShadow: '0 2px 8px #7C4DFF33',
                }}
              >
                {member.name[0].toUpperCase()}
              </Avatar>
            </Tooltip>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: '#2E3A59', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                {member.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#8F9BB3', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                  {member.role}
                </Typography>
                {member.email && (
                  <Box sx={{ ml: 1, px: 1, py: 0.2, bgcolor: '#E3F2FD', borderRadius: 1, fontSize: '0.8rem', color: '#2196F3', fontWeight: 600, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                    Email
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          {index < teamMembers.length - 1 && (
            <Divider sx={{ borderColor: '#EDE7F6' }} />
          )}
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default TeamMembers; 