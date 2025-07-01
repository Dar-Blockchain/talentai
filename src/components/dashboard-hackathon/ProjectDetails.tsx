import { Card, CardHeader, Divider, CardContent, Typography } from '@mui/material';
import React from 'react';

const ProjectDetails: React.FC<{ projectDescription: string }> = ({ projectDescription }) => (
  <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
    <CardHeader 
      title="Project Details" 
      titleTypographyProps={{ 
        variant: 'subtitle1', 
        fontWeight: 700,
        color: '#7C4DFF',
        fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
      }}
      sx={{ pb: 1 }}
    />
    <Divider sx={{ borderColor: '#EDE7F6' }} />
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="body2" sx={{ color: '#2E3A59', whiteSpace: 'pre-wrap', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
        {projectDescription}
      </Typography>
    </CardContent>
  </Card>
);

export default ProjectDetails; 