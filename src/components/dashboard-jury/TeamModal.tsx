import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Avatar, ListItemAvatar, Typography, Paper, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  teamMembers: string[];
}

const TeamModal: React.FC<TeamModalProps> = ({ open, onClose, teamMembers }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ bgcolor: '#7C4DFF', width: 32, height: 32, fontWeight: 700 }}>👥</Avatar>
        Team Members
      </Box>
      <IconButton aria-label="close" onClick={onClose} size="large" sx={{ ml: 2 }}>
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: '#f7faff' }}>
        <List>
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member, idx) => (
              <ListItem key={idx} sx={{ mb: 1, borderRadius: 2, bgcolor: '#fff', boxShadow: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', fontWeight: 700 }}>
                    {typeof member === 'string' && member.length > 0 ? member[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={<Typography fontWeight={600}>{member}</Typography>} />
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: '#bdbdbd', width: 48, height: 48, mb: 2 }}>?</Avatar>
              <Typography variant="body1" color="text.secondary">No team members found.</Typography>
            </Box>
          )}
        </List>
      </Paper>
    </DialogContent>
  </Dialog>
);

export default TeamModal; 