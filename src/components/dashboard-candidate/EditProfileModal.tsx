import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  formData: {
    username: string;
    email: string;
    experienceLevel: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  primaryColor?: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  open, 
  onClose, 
  formData, 
  onChange, 
  onSubmit,
  primaryColor = "#8310FF"
}) => {
  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid Level",
    "Senior",
    "Expert",
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          color: "#000000",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Edit Profile</Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: "rgba(0,0,0,0.7)" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            name="username"
            label="Username"
            value={formData.username}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
            InputProps={{
              sx: {
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.3)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
                },
              },
            }}
          />
          
          <TextField
            name="email"
            label="Email"
            value={formData.email}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
            InputProps={{
              sx: {
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.3)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
                },
              },
            }}
          />
          
          <TextField
            select
            name="experienceLevel"
            label="Experience Level"
            value={formData.experienceLevel}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
            InputProps={{
              sx: {
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.3)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
                },
              },
            }}
            SelectProps={{
              sx: { color: "#000000" },
            }}
          >
            {experienceLevels.map((level) => (
              <MenuItem
                key={level}
                value={level}
                sx={{
                  backgroundColor: "rgba(30,41,59,0.98)",
                  "&:hover": { backgroundColor: "rgba(30,41,59,1)" },
                }}
              >
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      
      <DialogActions
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "rgba(0,0,0,0.7)",
            "&:hover": { color: "#000000" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={onSubmit}
          sx={{
            background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
            color: "#000000",
            "&:hover": {
              background: "linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)",
            },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
