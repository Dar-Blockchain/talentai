import React from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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
        px: 3,
        py: 2,
        borderTop: '1px solid rgba(84,98,116,0.1)',
        backgroundColor: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
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
          placeholder="Type your message here..."
          disabled={sending}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'rgba(243, 245, 247, 1)',
              fontSize: '13px',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(131, 16, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8310FF',
                borderWidth: '1px',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onSend}
          disabled={!value.trim() || sending}
          sx={{
            backgroundColor: 'rgba(163, 98, 239, 1)',
            borderRadius: '38px',
            px: 3,
            py: 1,
            minWidth: '100px',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 1)',
              boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(200, 200, 200, 1)',
              color: 'white',
            },
          }}
          endIcon={sending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
        >
          {sending ? 'Sending' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default MessageInput;
