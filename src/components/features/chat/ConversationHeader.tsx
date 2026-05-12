import React from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Participant, getParticipantDisplayName, getParticipantInitial } from './helpers';

const TEAL = '#0D9488';

interface ConversationHeaderProps {
  otherUser: Participant | undefined;
  isCompany: boolean;
  onDeleteConversation: () => void;
  enableDeletes?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUser,
  isCompany,
  onDeleteConversation,
  enableDeletes = true,
}) => {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: '#fff',
      }}
    >
      <Avatar
        sx={{
          width: 40, height: 40,
          bgcolor: TEAL,
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        {getParticipantInitial(otherUser)}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px', lineHeight: 1.3 }}>
          {getParticipantDisplayName(otherUser)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isCompany && enableDeletes && (
          <IconButton
            onClick={onDeleteConversation}
            size="small"
            sx={{
              color: '#DC2626',
              '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' },
            }}
          >
            <DeleteOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ConversationHeader;
