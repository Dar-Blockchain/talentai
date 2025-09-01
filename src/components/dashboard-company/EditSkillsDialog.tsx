import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EditSkillsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (skills: string, experienceLevel: string) => void;
}

const EditSkillsDialog: React.FC<EditSkillsDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave(skills, experienceLevel);
    }
    onClose();
  };

  const handleClose = () => {
    setSkills('');
    setExperienceLevel('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        pb: 2,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Required Skills</Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Add Required Skills
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter skills (comma separated)"
          variant="outlined"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            }
          }}
        />

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Required Experience Level
        </Typography>
        <TextField
          fullWidth
          select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          SelectProps={{
            native: true,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.9)'
            }
          }}
        >
          <option value="">Select Level</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Junior+">Junior+</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior">Senior</option>
          <option value="Expert">Expert</option>
        </TextField>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }}>
        <Button
          onClick={handleClose}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        {onSave && (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
              }
            }}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditSkillsDialog;
