import { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const StyledButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
  width: '140px',
  justifyContent: 'flex-start',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateX(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateX(0)',
  },
  '& svg': {
    width: '16px',
    height: '16px',
  }
}));

type ActionButtonProps = {
  icon: ReactNode;
  label: string;
  tooltip: string;
  onClick: () => void;
  className?: string;
}

export default function ActionButton({ icon, label, tooltip, onClick, className }: ActionButtonProps) {
  return (
    <Tooltip 
      title={tooltip} 
      arrow 
      placement="bottom"
      enterDelay={300}
      leaveDelay={200}
    >
      <StyledButton onClick={onClick} className={className}>
        {icon}
        {label}
      </StyledButton>
    </Tooltip>
  );
} 