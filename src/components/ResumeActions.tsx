import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ActionButton from './ActionButton';

const ActionsContainer = styled('div')({
  position: 'fixed',
  top: '20px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1000,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(8px)',
  padding: '8px',
  borderRadius: '12px',
});

type ResumeActionsProps = {
  onSaveDraft: () => void;
  onExportPDF: () => void;
}

export default function ResumeActions({ onSaveDraft, onExportPDF }: ResumeActionsProps) {
  return (
    <ActionsContainer>
      <ActionButton
        icon={<SaveIcon />}
        label="Save Draft"
        tooltip="Save your resume progress to continue later"
        onClick={onSaveDraft}
      />
      <ActionButton
        icon={<PictureAsPdfIcon />}
        label="Export PDF"
        tooltip="Download your resume as a PDF file"
        onClick={onExportPDF}
      />
    </ActionsContainer>
  );
} 