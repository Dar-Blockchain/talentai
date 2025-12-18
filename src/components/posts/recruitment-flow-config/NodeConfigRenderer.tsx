import React from 'react';
import { Box } from '@mui/material';
import TechnicalSkillsConfigForm from './TechnicalSkillsConfigForm';
import SoftSkillsConfigForm from './SoftSkillsConfigForm';
import HRInterviewConfigForm from './HRInterviewConfigForm';
import TaskConfigForm from './TaskConfigForm';
import EmailConfigForm from './EmailConfigForm';

interface NodeConfigRendererProps {
  nodeType: string;
  initialConfig?: any;
  onSave: (config: any) => void;
  onCancel: () => void;
}

const NodeConfigRenderer: React.FC<NodeConfigRendererProps> = ({
  nodeType,
  initialConfig,
  onSave,
  onCancel,
}) => {
  // Render appropriate form based on node type
  const renderForm = () => {
    switch (nodeType) {
      case 'technical':
        return (
          <TechnicalSkillsConfigForm
            initialConfig={initialConfig}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      case 'soft':
        return (
          <SoftSkillsConfigForm
            initialConfig={initialConfig}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      case 'interview':
        return (
          <HRInterviewConfigForm
            initialConfig={initialConfig}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      case 'task':
        return (
          <TaskConfigForm
            initialConfig={initialConfig}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      case 'email':
        return (
          <EmailConfigForm
            initialConfig={initialConfig}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
            Configuration form not available for this node type.
          </Box>
        );
    }
  };

  return <Box sx={{ height: '100%', overflow: 'auto' }}>{renderForm()}</Box>;
};

export default NodeConfigRenderer;
