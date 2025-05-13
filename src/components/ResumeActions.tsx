import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TemplateIcon from '@mui/icons-material/Dashboard';
import UndoIcon from '@mui/icons-material/Undo';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
// import LinkedInIcon from '@mui/icons-material/LinkedIn';
// import LinkIcon from '@mui/icons-material/Link';
import ActionButton from './ActionButton';
import { useState, useEffect } from 'react';

const ActionsContainer = styled('div')({
  position: 'fixed',
  top: '16px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1000,
  padding: '12px',
  background: 'linear-gradient(180deg, rgba(19, 19, 66, 0.95) 0%, rgba(37, 37, 93, 0.95) 100%)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(4px)',
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
  width: '180px'
});

const ActionTitle = styled('div')({
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '8px',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  paddingBottom: '8px'
});

const ButtonGroup = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
});

interface ResumeActionsProps {
  onSaveDraft: () => void;
  onExportPDF: () => void;
  onChangeTemplate?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  sectionsCount: number;
  onRegenerate?: () => void;
  onShareLinkedIn?: () => void;
  linkedInConnected?: boolean;
}

export default function ResumeActions({
  onSaveDraft,
  onExportPDF,
  onChangeTemplate,
  onUndo,
  canUndo = false,
  sectionsCount,
  onRegenerate,
  onShareLinkedIn,
  linkedInConnected
}: ResumeActionsProps) {
  const noSections = sectionsCount === 0;
  
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);

  useEffect(() => {
    if (typeof linkedInConnected !== 'undefined') {
      setIsLinkedInConnected(linkedInConnected);
    } else {
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('linkedin_token');
      setIsLinkedInConnected(hasToken);
    }
  }, [linkedInConnected]);

  const handleConnectLinkedIn = () => {
    window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
  };

  useEffect(() => {
    if (typeof linkedInConnected !== 'undefined') {
      return;
    }
    
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'AUTH_SUCCESS' && event.data?.provider === 'linkedin') {
        console.log('Received auth success message from popup');
        
        if (event.data?.token) {
          console.log('Saving LinkedIn token from popup message');
          localStorage.setItem('linkedin_token', event.data.token);
          setIsLinkedInConnected(true);
        }
      }
    };
    
    window.addEventListener('message', handleAuthMessage);
    
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [linkedInConnected]);

  return (
    <ActionsContainer>
      <ButtonGroup>
        <ActionButton
          icon={<SaveIcon style={{ color: '#4caf50' }} />}
          label="Save Draft"
          tooltip="Save your resume draft"
          onClick={onSaveDraft}
          disabled={noSections}
        />
        <ActionButton
          icon={<UndoIcon style={{ color: '#fff' }} />}
          label="Undo"
          tooltip="Undo last action"
          onClick={onUndo || (() => {})}
          disabled={!canUndo || !onUndo}
        />
        <ActionButton
          icon={<PictureAsPdfIcon style={{ color: '#e85852' }} />}
          label="Export PDF"
          tooltip="Export your resume as a PDF file"
          onClick={onExportPDF}
          disabled={noSections}
        />
        {onChangeTemplate && (
          <ActionButton
            icon={<TemplateIcon style={{ color: '#5bb381' }} />}
            label="Templates"
            tooltip="Change template"
            onClick={onChangeTemplate}
          />
        )}
        {/* Temporarily hiding LinkedIn buttons for demo
        {!isLinkedInConnected && (
          <ActionButton
            icon={<LinkIcon style={{ color: '#0077b5' }} />}
            onClick={handleConnectLinkedIn}
            tooltip="Connect to LinkedIn"
            label="Connect LinkedIn"
          />
        )}
        {onShareLinkedIn && isLinkedInConnected && (
          <ActionButton
            icon={<LinkedInIcon style={{ color: '#0077b5' }} />}
            onClick={onShareLinkedIn}
            tooltip="Share to LinkedIn"
            label="Share to LinkedIn"
            disabled={noSections}
          />
        )}
        */}
      </ButtonGroup>
    </ActionsContainer>
  );
} 