import React from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendOutlined from '@mui/icons-material/SendOutlined';

const TEAL = '#0D9488';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  sending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  sending,
}) => {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        borderTop: '1px solid #E5E7EB',
        bgcolor: '#fff',
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-end',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message… (Enter to send)"
        disabled={sending}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#F9FAFB',
            fontSize: '13px',
            '& fieldset': { borderColor: '#E5E7EB' },
            '&:hover fieldset': { borderColor: TEAL },
            '&.Mui-focused fieldset': { borderColor: TEAL, borderWidth: '1.5px' },
          },
        }}
      />
      <IconButton
        onClick={onSend}
        disabled={!value.trim() || sending}
        sx={{
          bgcolor: TEAL,
          color: '#fff',
          width: 40,
          height: 40,
          borderRadius: '12px',
          flexShrink: 0,
          '&:hover': { bgcolor: '#0F766E' },
          '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
        }}
      >
        {sending
          ? <CircularProgress size={16} sx={{ color: '#fff' }} />
          : <SendOutlined sx={{ fontSize: 18 }} />
        }
      </IconButton>
    </Box>
  );
};

export default MessageInput;
