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
  onSubmit: () => void;
  primaryAccentColor: string;

  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  newSkillName: string;
  onSkillSelection: (value: string | null) => void;

  skillCategories: Record<string, string[]>;
  technicalSkillsList: string[];
};

export default function AddSkillDialog(props: AddSkillDialogProps) {
  const {
    open,
    onClose,
    onSubmit,
    primaryAccentColor,
    selectedCategory,
    onSelectedCategoryChange,
    newSkillName,
    onSkillSelection,
    skillCategories,
    technicalSkillsList,
  } = props;

  const categoryOptions = Object.keys(skillCategories || {});
  const skillOptions = selectedCategory
    ? skillCategories[selectedCategory] || []
    : technicalSkillsList;

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

          <Autocomplete<string>
            fullWidth
            options={skillOptions}
            value={newSkillName}
            onChange={(_, value: string | null) => onSkillSelection(value)}
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
          onClick={onSubmit}
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


