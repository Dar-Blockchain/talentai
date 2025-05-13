import { ReactNode, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const StyledButton = styled('button')<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 15px',
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.22)',
  borderRadius: '8px',
  color: disabled ? 'rgba(255, 255, 255, 0.5)' : '#fff',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
  backdropFilter: 'blur(12px)',
  width: '100%',
  justifyContent: 'flex-start',
  opacity: disabled ? 0.6 : 1,
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: disabled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.25)',
    transform: disabled ? 'none' : 'translateY(-2px)',
    boxShadow: disabled ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: disabled ? 'none' : 'translateY(0)',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.15)',
  },
  '& svg': {
    width: '18px',
    height: '18px',
    marginRight: '4px'
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