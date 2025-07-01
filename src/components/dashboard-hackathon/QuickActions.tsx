import { Card, CardHeader, Divider, CardContent, Button, Box } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import React from 'react';
import { useRouter } from 'next/router';

interface QuickActionsProps {
  projectId?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ projectId }) => {
  const router = useRouter();
  const goToInterview = (type: string) => {
    let url = `/hackathon-interview?type=${type}`;
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    router.push(url);
  };
  return (
    <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
      <CardHeader 
        title="AI Meetings" 
        titleTypographyProps={{ 
          variant: 'subtitle1', 
          fontWeight: 700,
          color: '#7C4DFF',
          fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
        }}
        sx={{ pb: 1 }}
      />
      <Divider sx={{ borderColor: '#EDE7F6' }} />
      <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
        <Button
          variant="outlined"
          startIcon={<BusinessIcon sx={{ color: '#2196F3' }} />}
          size="small"
          sx={{ 
            borderColor: '#2196F3',
            color: '#2196F3',
            fontWeight: 700,
            borderRadius: 2,
            fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
            boxShadow: '0 1px 4px #2196F322',
            transition: 'all 0.2s',
            '&:hover': { 
              borderColor: '#1976D2', 
              bgcolor: 'rgba(33, 150, 243, 0.04)',
              color: '#1976D2',
              boxShadow: '0 2px 8px #2196F344',
              transform: 'scale(1.05)'
            }
          }}
          onClick={() => goToInterview('business')}
        >
          Business Meeting
        </Button>
        <Button
          variant="outlined"
          startIcon={<CodeIcon sx={{ color: '#673AB7' }} />}
          size="small"
          sx={{ 
            borderColor: '#673AB7',
            color: '#673AB7',
            fontWeight: 700,
            borderRadius: 2,
            fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
            boxShadow: '0 1px 4px #673AB722',
            transition: 'all 0.2s',
            '&:hover': { 
              borderColor: '#5E35B1', 
              bgcolor: 'rgba(103, 58, 183, 0.04)',
              color: '#5E35B1',
              boxShadow: '0 2px 8px #673AB744',
              transform: 'scale(1.05)'
            }
          }}
          onClick={() => goToInterview('technical')}
        >
          Technical Meeting
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 