import { Card, CardHeader, Divider, CardContent, Button, Box, Tooltip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import React from 'react';
import { useRouter } from 'next/router';
import GitHubIcon from '@mui/icons-material/GitHub';

interface QuickActionsProps {
  projectId?: string;
  disableBusiness?: boolean;
  disableTechnical?: boolean;
  onEvaluateCode: () => void;
  disableEvaluateCode?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ projectId, disableBusiness, disableTechnical, onEvaluateCode, disableEvaluateCode }) => {
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
        <Tooltip title={disableBusiness ? 'Business evaluation already submitted' : 'Evaluate business'}>
          <span>
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
              onClick={() => !disableBusiness && goToInterview('business')}
              disabled={disableBusiness}
            >
              Business Meeting
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={disableTechnical ? 'Technical evaluation already submitted' : 'Evaluate technical'}>
          <span>
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
              onClick={() => !disableTechnical && goToInterview('technical')}
              disabled={disableTechnical || !disableBusiness}
            >
              Technical Meeting
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Evaluate your project's code quality from a GitHub repository">
          <Button
            variant="outlined"
            startIcon={<GitHubIcon sx={{ color: '#333' }} />}
            size="small"
            sx={{
              borderColor: '#333',
              color: '#333',
              fontWeight: 700,
              borderRadius: 2,
              fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
              boxShadow: '0 1px 4px #33333322',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#000',
                bgcolor: 'rgba(51, 51, 51, 0.04)',
                color: '#000',
                boxShadow: '0 2px 8px #33333344',
                transform: 'scale(1.05)',
              },
            }}
            onClick={onEvaluateCode}
            disabled={disableEvaluateCode || !disableTechnical}
          >
            Evaluate Code
          </Button>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 