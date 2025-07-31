import React, { useState, useCallback } from 'react';
import { Box, Paper, Typography, Button, Stepper, Step, StepLabel, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ConditionIcon from '@mui/icons-material/AccountTree';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';

const Container = styled(Box)({
  width: '100%',
  height: '100vh',
  backgroundColor: '#f5f7fa',
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled(Box)({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderBottom: '1px solid #e1e5e9',
});

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  position: 'relative',
});

const CanvasArea = styled(Box)({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f8fafc',
  backgroundImage: `
    radial-gradient(circle, #e2e8f0 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px',
});

const Sidebar = styled(Box)({
  width: '80px',
  backgroundColor: 'white',
  borderLeft: '1px solid #e1e5e9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 0',
  gap: '15px',
});

const Footer = styled(Box)({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderTop: '1px solid #e1e5e9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ZoomControls = styled(Box)({
  position: 'absolute',
  top: '20px',
  left: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 10,
});

const ZoomButton = styled(IconButton)({
  backgroundColor: 'white',
  border: '1px solid #e1e5e9',
  width: '36px',
  height: '36px',
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
});

const FlowNode = styled(Paper)<{ nodeType: string }>(({ nodeType }) => ({
  position: 'absolute',
  padding: '16px 24px',
  borderRadius: '12px',
  cursor: 'pointer',
  minWidth: '200px',
  textAlign: 'center',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  ...(nodeType === 'start' && {
    backgroundColor: '#dcfce7',
    border: '2px solid #16a34a',
    color: '#15803d',
  }),
  ...(nodeType === 'email' && {
    backgroundColor: '#dbeafe',
    border: '2px solid #2563eb',
    color: '#1d4ed8',
  }),
  ...(nodeType === 'linkedin' && {
    backgroundColor: '#e0e7ff',
    border: '2px solid #4f46e5',
    color: '#4338ca',
  }),
  ...(nodeType === 'condition' && {
    backgroundColor: '#fce7f3',
    border: '2px solid #ec4899',
    color: '#be185d',
  }),
}));

const ConnectionLine = styled('div')({
  position: 'absolute',
  width: '2px',
  backgroundColor: '#9ca3af',
  zIndex: 1,
});

const ActionButton = styled(IconButton)<{ actionType: string }>(({ actionType }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  border: '1px solid #e1e5e9',
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: '#f8fafc',
    transform: 'scale(1.05)',
  },
  ...(actionType === 'email' && {
    '& .MuiSvgIcon-root': { color: '#2563eb' },
  }),
  ...(actionType === 'linkedin' && {
    '& .MuiSvgIcon-root': { color: '#0077b5' },
  }),
  ...(actionType === 'condition' && {
    '& .MuiSvgIcon-root': { color: '#ec4899' },
  }),
  ...(actionType === 'delay' && {
    '& .MuiSvgIcon-root': { color: '#f59e0b' },
  }),
  ...(actionType === 'goal' && {
    '& .MuiSvgIcon-root': { color: '#8b5cf6' },
  }),
}));

interface FlowNodeType {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
}

const SequenceBuilder: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [nodes, setNodes] = useState<FlowNodeType[]>([
    { id: '1', type: 'start', title: 'Start', x: 400, y: 50 },
    { id: '2', type: 'email', title: 'Email', subtitle: 'Add email content', x: 350, y: 180 },
    { id: '3', type: 'linkedin', title: 'LinkedIn', subtitle: 'Select LinkedIn action', x: 300, y: 310 },
    { id: '4', type: 'condition', title: 'Condition', subtitle: 'Set a condition', x: 250, y: 440 },
  ]);

  const steps = ['Sequence', 'Prospects', 'Sending options', 'Review'];
  const activeStep = 0;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const addNode = useCallback((type: string) => {
    const newNode: FlowNodeType = {
      id: Date.now().toString(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      subtitle: `Add ${type} content`,
      x: 200 + Math.random() * 300,
      y: 100 + Math.random() * 200,
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const renderConnections = () => {
    return nodes.slice(0, -1).map((node, index) => {
      const nextNode = nodes[index + 1];
      const startY = node.y + 60;
      const endY = nextNode.y;
      const height = endY - startY;
      
      return (
        <ConnectionLine
          key={`connection-${node.id}`}
          style={{
            left: `${node.x + 100}px`,
            top: `${startY}px`,
            height: `${height}px`,
          }}
        />
      );
    });
  };

  return (
    <Container>
      <Header>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color: index === activeStep ? '#16a34a' : index < activeStep ? '#16a34a' : '#9ca3af',
                  },
                }}
              >
                <Typography variant="body2" color={index <= activeStep ? 'primary' : 'textSecondary'}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Header>

      <MainContent>
        <CanvasArea>
          <ZoomControls>
            <ZoomButton onClick={handleZoomIn}>
              <AddIcon fontSize="small" />
            </ZoomButton>
            <ZoomButton onClick={handleZoomOut}>
              <RemoveIcon fontSize="small" />
            </ZoomButton>
            <Typography variant="caption" sx={{ textAlign: 'center', mt: 1 }}>
              {zoom}%
            </Typography>
          </ZoomControls>

          <Box sx={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}>
            {renderConnections()}
            
            {nodes.map((node) => (
              <FlowNode key={node.id} nodeType={node.type} style={{ left: node.x, top: node.y }}>
                <Typography variant="h6" fontWeight="bold">
                  {node.title}
                </Typography>
                {node.subtitle && (
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    {node.subtitle}
                  </Typography>
                )}
                {node.type === 'condition' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Button size="small" variant="outlined" color="error">
                      No
                    </Button>
                    <Button size="small" variant="outlined" color="success">
                      Yes
                    </Button>
                  </Box>
                )}
              </FlowNode>
            ))}
          </Box>
        </CanvasArea>

        <Sidebar>
          <Tooltip title="Email" placement="left">
            <ActionButton actionType="email" onClick={() => addNode('email')}>
              <EmailIcon />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="LinkedIn" placement="left">
            <ActionButton actionType="linkedin" onClick={() => addNode('linkedin')}>
              <LinkedInIcon />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Condition" placement="left">
            <ActionButton actionType="condition" onClick={() => addNode('condition')}>
              <ConditionIcon />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Delay" placement="left">
            <ActionButton actionType="delay" onClick={() => addNode('delay')}>
              <TimerIcon />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Goal" placement="left">
            <ActionButton actionType="goal" onClick={() => addNode('goal')}>
              <TrendingUpIcon />
            </ActionButton>
          </Tooltip>
        </Sidebar>
      </MainContent>

      <Footer>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          sx={{ borderRadius: '8px' }}
        >
          Save
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            sx={{ borderRadius: '8px' }}
          >
            Preview messages
          </Button>
          
          <Button
            variant="contained"
            endIcon={<PlayArrowIcon />}
            sx={{ 
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Next
          </Button>
        </Box>
      </Footer>
    </Container>
  );
};

export default SequenceBuilder;