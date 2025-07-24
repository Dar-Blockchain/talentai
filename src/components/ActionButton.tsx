import { ReactNode, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const StyledButton = styled('button')<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 15px',
  backgroundColor: disabled ? '#222' : '#222',
  border: 'none',
  borderRadius: '8px',
  color: disabled ? 'rgba(255,255,255,0.5)' : '#fff',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  transition: 'background 0.15s',
  width: '100%',
  justifyContent: 'center',
  opacity: disabled ? 0.6 : 1,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: disabled ? '#222' : '#333',
    transform: 'none',
    boxShadow: 'none',
  },
  '&:active': {
    backgroundColor: '#181818',
    transform: 'none',
    boxShadow: 'none',
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