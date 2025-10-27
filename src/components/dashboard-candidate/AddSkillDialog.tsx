import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type AddSkillDialogProps = {
  open: boolean;
  onClose: () => void;
  primaryAccentColor: string;

  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  newSkillName: string;
  onSkillSelection: (value: string | null) => void;

  skillCategories: Record<string, string[]>;
  technicalSkillsList: string[];
  
  // Profile data for duplicate checking
  profileSkills?: any[];
  
  // Router for navigation
  router: any;
  
  // Notification state and setter
  setNotification: (notification: any) => void;
};

function AddSkillDialogComponent(props: AddSkillDialogProps) {
  const {
    open,
    onClose,
    primaryAccentColor,
    selectedCategory,
    onSelectedCategoryChange,
    newSkillName,
    onSkillSelection,
    skillCategories,
    technicalSkillsList,
    profileSkills,
    router,
    setNotification,
  } = props;

  const handleAddSkill = async () => {
    try {
      const selectedSkill = newSkillName;

      const isDuplicate = profileSkills?.some(
        (skill: any) => skill.name.toLowerCase() === selectedSkill.toLowerCase()
      );

      if (isDuplicate) {
        console.log("Skill already exists in profile");
        setNotification({
          open: true,
          message: "This skill already exists in your profile!",
          severity: 'error'
        });
        return;
      }

      // Redirect to test for the selected skill
      if (selectedSkill) {
        router.push(
          `/interview?type=technical&skill=${encodeURIComponent(selectedSkill)}`
        );
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      setNotification({
        open: true,
        message: "Failed to add skill. Please try again.",
        severity: 'error'
      });
    }
  };

  const categoryOptions = Object.keys(skillCategories || {});
  
  // Get existing skill names
  const existingSkillNames = (profileSkills || []).map(s => s.name.toLowerCase());
  
  // Filter out skills that user already has
  const allSkillOptions = selectedCategory
    ? skillCategories[selectedCategory] || []
    : technicalSkillsList;
  
  const skillOptions = allSkillOptions.filter(
    skill => !existingSkillNames.includes(skill.toLowerCase())
  );

  const filterSkills = (options: string[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.toLowerCase().includes(q) && !o.toLowerCase().startsWith(q));
    return [...starts, ...contains];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "white",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1300,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          color: "#000000",
          padding: "16px 24px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Add New Skill</Typography>
          <IconButton onClick={onClose} sx={{ color: "rgba(0,0,0,0.7)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2, padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Autocomplete<string>
            fullWidth
            options={categoryOptions}
            value={selectedCategory || null}
            onChange={(_, value) => onSelectedCategoryChange(value || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0,0,0,0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0,0,0,0.3)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryAccentColor,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(0,0,0,0.7)",
                    "&.Mui-focused": {
                      color: primaryAccentColor,
                    },
                  },
                }}
              />
            )}
            PaperComponent={(paperProps) => (
              <Paper
                {...paperProps}
                sx={{
                  backgroundColor: "white",
                  "& .MuiAutocomplete-option": {
                    color: "black",
                    '&[aria-selected="true"]': {
                      backgroundColor: "rgba(0, 255, 157, 0.1)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 255, 157, 0.05)",
                    },
                  },
                }}
              />
            )}
          />

          {selectedCategory && skillOptions.length === 0 ? (
            <Typography sx={{ color: '#666', p: 2, textAlign: 'center', fontStyle: 'italic', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              You already have all skills in this category!
            </Typography>
          ) : (
            <Autocomplete<string>
              fullWidth
              options={skillOptions}
              value={newSkillName}
              onChange={(_, value: string | null) => onSkillSelection(value)}
              filterOptions={filterSkills}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skill Name"
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.3)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: primaryAccentColor,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(0,0,0,0.7)",
                      "&.Mui-focused": {
                        color: primaryAccentColor,
                      },
                    },
                  }}
                />
              )}
              PaperComponent={(paperProps) => (
                <Paper
                  {...paperProps}
                  sx={{
                    backgroundColor: "white",
                    "& .MuiAutocomplete-option": {
                      color: "black",
                      '&[aria-selected="true"]': {
                        backgroundColor: "rgba(0, 255, 157, 0.1)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 255, 157, 0.05)",
                      },
                    },
                  }}
                />
              )}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.1)" }}
      >
        <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.8)", mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAddSkill}
          disabled={!newSkillName}
          sx={{
            background: primaryAccentColor,
            color: "#000000",
            "&:hover": { background: primaryAccentColor },
            "&.Mui-disabled": {
              background: "rgba(0,0,0,0.1)",
              color: "rgba(0,0,0,0.3)",
            },
          }}
        >
          Add Skill
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default React.memo(AddSkillDialogComponent);


