import React from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Participant, getParticipantDisplayName, getParticipantInitial } from './helpers';

interface ConversationHeaderProps {
  otherUser: Participant | undefined;
  isCompany: boolean;
  onDeleteConversation: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUser,
  isCompany,
  onDeleteConversation,
}) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderBottom: '1px solid rgba(84,98,116,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          backgroundColor: '#8310FF',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {getParticipantInitial(otherUser)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: '#000',
            fontSize: '15px',
            lineHeight: 1.3,
          }}
        >
          {getParticipantDisplayName(otherUser)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(84,98,116,0.8)',
            fontSize: '12px',
            filter: 'blur(4px)',
            userSelect: 'none',
          }}
        >
          {otherUser?.email}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 1)',
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(16, 185, 129, 1)', fontWeight: 500, fontSize: '11px' }}>
            Active
          </Typography>
        </Box>
        {isCompany && (
          <IconButton
            onClick={onDeleteConversation}
            size="small"
            sx={{
              color: 'rgba(220, 38, 38, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ConversationHeader;
