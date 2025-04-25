import { ReactNode, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const StyledButton = styled('button')<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: disabled ? 'rgba(255, 255, 255, 0.5)' : '#fff',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
  width: '140px',
  justifyContent: 'flex-start',
  opacity: disabled ? 0.6 : 1,
  '&:hover': {
    backgroundColor: disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    transform: disabled ? 'none' : 'translateX(-2px)',
    boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: disabled ? 'none' : 'translateX(0)',
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
  disabled?: boolean;
}

export default function ActionButton({ 
  icon, 
  label, 
  tooltip, 
  onClick, 
  className,
  disabled = false 
}: ActionButtonProps) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      // Hide tooltip when button is clicked
      setOpen(false);
      onClick();
    }
  };

  return (
    <Tooltip 
      title={tooltip} 
      arrow 
      placement="bottom"
      enterDelay={300}
      leaveDelay={100}
      open={open}
      onClose={handleTooltipClose}
      onOpen={handleTooltipOpen}
      disableFocusListener={disabled}
      disableHoverListener={disabled}
      disableTouchListener={disabled}
    >
      <StyledButton 
        onClick={handleClick} 
        className={className}
        disabled={disabled}
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
      >
        {icon}
        {label}
      </StyledButton>
    </Tooltip>
  );
} 