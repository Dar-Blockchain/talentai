import React, { memo } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';

interface DeleteMemberDialogProps {
  open: boolean;
  memberName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteMemberDialog: React.FC<DeleteMemberDialogProps> = ({ open, memberName, onCancel, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        },
      },
    }}
  >
    <DialogContent sx={{ p: 0 }}>

      {/* Top danger zone */}
      <Box sx={{
        bgcolor: '#FFF5F5',
        borderBottom: '1px solid #FEE2E2',
        px: 3, pt: 3.5, pb: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
      }}>
        {/* Icon */}
        <Box sx={{
          width: 56, height: 56, borderRadius: '16px',
          bgcolor: '#FEE2E2', border: '1.5px solid #FECACA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(239,68,68,0.15)',
        }}>
          <DeleteOutlineOutlined sx={{ fontSize: 26, color: '#EF4444' }} />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', lineHeight: 1.3 }}>
            Remove Team Member
          </Typography>
          <Typography sx={{ fontSize: '0.775rem', color: '#94A3B8', mt: 0.4 }}>
            This action is permanent and cannot be undone
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Typography sx={{ fontSize: '0.875rem', color: '#475569', textAlign: 'center', lineHeight: 1.65 }}>
          You're about to remove{' '}
          <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{memberName}</Box>
          {' '}from your team. They will lose access to all resources immediately.
        </Typography>

        {/* Warning callout */}
        <Box sx={{
          mt: 2, px: 1.75, py: 1.25, borderRadius: '12px',
          bgcolor: '#FFFBEB', border: '1px solid #FEF08A',
          display: 'flex', alignItems: 'flex-start', gap: 1,
        }}>
          <WarningAmberOutlined sx={{ fontSize: 15, color: '#CA8A04', mt: '1px', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#92400E', lineHeight: 1.5 }}>
            Any pending tasks or assignments linked to this member will remain but become unassigned.
          </Typography>
        </Box>
      </Box>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
      <Button
        onClick={onCancel}
        fullWidth
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
          color: '#64748B', borderRadius: '12px', py: 1.25,
          border: '1px solid #E2E8F0', bgcolor: '#F8FAFC',
          '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
          transition: 'all 0.15s',
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        fullWidth
        variant="contained"
        sx={{
          textTransform: 'none', fontWeight: 700, fontSize: '0.875rem',
          borderRadius: '12px', py: 1.25,
          bgcolor: '#EF4444',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
          '&:hover': { bgcolor: '#DC2626', boxShadow: '0 6px 20px rgba(239,68,68,0.45)' },
          transition: 'all 0.15s',
        }}
      >
        Yes, Remove Member
      </Button>
    </DialogActions>
  </Dialog>
);

export default memo(DeleteMemberDialog);
