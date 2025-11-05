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
  Card,
  InputAdornment,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import { JOB_CATEGORIES } from '@/constants/jobConstants';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  formData: {
    username: string;
    email: string;
    experienceLevel: string;
    targetRole: string;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid Level",
    "Senior",
    "Expert",
  ];

  const handleTargetRoleChange = (event: any, newValue: string | null) => {
    const syntheticEvent = {
      target: {
        name: 'targetRole',
        value: newValue || ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "32px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "radial-gradient(circle at top right, rgba(131, 16, 255, 0.03) 0%, transparent 70%)",
            zIndex: 1,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #8310FF 0%, #7C4DFF 100%)",
          color: "#ffffff",
          padding: theme.spacing(3, 4),
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <PersonIcon sx={{ color: "#ffffff", fontSize: "1.5rem" }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ffffff" }}>
                Edit Profile
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Update your personal information and preferences
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: "#ffffff",
              background: "rgba(255, 255, 255, 0.1)",
              "&:hover": { 
                background: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)"
              },
              transition: "all 0.2s ease"
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: "relative", zIndex: 2 }}>
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ p: theme.spacing(4) }}
        >
          {/* Personal Information Card */}
          <Card
            sx={{
              p: theme.spacing(3),
              mb: theme.spacing(3),
              borderRadius: "20px",
              background: "#ffffff",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#191919",
                mb: theme.spacing(3),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon sx={{ color: primaryColor }} />
              Personal Information
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: theme.spacing(3) }}>
              <TextField
                name="username"
                label="Username"
                value={formData.username}
                onChange={onChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: primaryColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                      borderWidth: 2,
                    },
                  },
                }}
              />
              
              <TextField
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={onChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: primaryColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>
          </Card>

          {/* Professional Information Card */}
          <Card
            sx={{
              p: theme.spacing(3),
              borderRadius: "20px",
              background: "#ffffff",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#191919",
                mb: theme.spacing(3),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WorkIcon sx={{ color: primaryColor }} />
              Professional Information
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: theme.spacing(3) }}>
              <TextField
                select
                name="experienceLevel"
                label="Experience Level"
                value={formData.experienceLevel}
                onChange={onChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon sx={{ color: primaryColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                      borderWidth: 2,
                    },
                  },
                }}
              >
                {experienceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                value={formData.targetRole}
                onChange={handleTargetRoleChange}
                options={JOB_CATEGORIES.filter(category => category !== 'All Categories')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Role"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon sx={{ color: primaryColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: primaryColor,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: primaryColor,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                )}
                sx={{
                  "& .MuiAutocomplete-popper": {
                    "& .MuiPaper-root": {
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    },
                  },
                }}
              />
            </Box>
          </Card>
        </Box>
      </DialogContent>
      
      <DialogActions
        sx={{
          padding: theme.spacing(3, 4),
          background: "rgba(248, 250, 252, 0.8)",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "16px",
            px: theme.spacing(3),
            py: theme.spacing(1.5),
            borderColor: "rgba(0, 0, 0, 0.2)",
            color: "rgba(0, 0, 0, 0.7)",
            fontWeight: 600,
            "&:hover": {
              borderColor: "rgba(0, 0, 0, 0.4)",
              color: "#000000",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={onSubmit}
          sx={{
            borderRadius: "16px",
            px: theme.spacing(4),
            py: theme.spacing(1.5),
            background: `linear-gradient(135deg, ${primaryColor} 0%, #7C4DFF 100%)`,
            color: "#ffffff",
            fontWeight: 700,
            boxShadow: "0 8px 32px rgba(131, 16, 255, 0.3)",
            "&:hover": {
              background: `linear-gradient(135deg, #7C4DFF 0%, ${primaryColor} 100%)`,
              transform: "translateY(-2px)",
              boxShadow: "0 12px 40px rgba(131, 16, 255, 0.4)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
