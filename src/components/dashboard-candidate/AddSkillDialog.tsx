import React, { useMemo, useCallback } from "react";
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

/* -------------------------
   TypeScript Interfaces
------------------------- */
interface Skill {
  name: string;
  [key: string]: any;
}

interface Notification {
  open: boolean;
  message: string;
  severity: 'error' | 'success' | 'info' | 'warning';
}

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
  profileSkills?: Skill[];

  // Router for navigation
  router: any;

  // Notification state and setter
  setNotification: (notification: Notification) => void;
};

/* -------------------------
   Style Constants
------------------------- */
const DIALOG_STYLES = {
  paper: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    position: "relative" as const,
    zIndex: 1300,
  },
  title: {
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    color: "#000000",
    padding: "16px 24px",
  },
  content: {
    mt: 2,
    padding: "24px",
  },
  actions: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  cancelButton: {
    color: "rgba(0,0,0,0.8)",
    mr: 1,
  },
  emptyState: {
    color: '#666',
    p: 2,
    textAlign: 'center' as const,
    fontStyle: 'italic',
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
  },
} as const;

const getTextFieldStyles = (primaryAccentColor: string) => ({
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
});

const AUTOCOMPLETE_PAPER_STYLES = {
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
} as const;

/* -------------------------
   Utility Functions
------------------------- */
const filterSkillsByInput = (options: string[], { inputValue }: { inputValue: string }): string[] => {
  const query = (inputValue || '').trim().toLowerCase();
  if (!query) return options;

  const startsWith = options.filter(option => option.toLowerCase().startsWith(query));
  const contains = options.filter(
    option => option.toLowerCase().includes(query) && !option.toLowerCase().startsWith(query)
  );

  return [...startsWith, ...contains];
};

const checkDuplicate = (skillName: string, profileSkills?: Skill[]): boolean => {
  return profileSkills?.some(
    (skill) => skill.name.toLowerCase() === skillName.toLowerCase()
  ) ?? false;
};

/* -------------------------
   Custom Components
------------------------- */
const AutocompletePaper = React.memo((props: any) => (
  <Paper {...props} sx={AUTOCOMPLETE_PAPER_STYLES} />
));
AutocompletePaper.displayName = 'AutocompletePaper';

/* -------------------------
   Main Component
------------------------- */
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

  /* -------------------------
     Memoized Values
  ------------------------- */
  const categoryOptions = useMemo(
    () => Object.keys(skillCategories || {}),
    [skillCategories]
  );

  const existingSkillNames = useMemo(
    () => (profileSkills || []).map(skill => skill.name.toLowerCase()),
    [profileSkills]
  );

  const skillOptions = useMemo(() => {
    const allSkills = selectedCategory
      ? skillCategories[selectedCategory] || []
      : technicalSkillsList;

    return allSkills.filter(
      skill => !existingSkillNames.includes(skill.toLowerCase())
    );
  }, [selectedCategory, skillCategories, technicalSkillsList, existingSkillNames]);

  const textFieldStyles = useMemo(
    () => getTextFieldStyles(primaryAccentColor),
    [primaryAccentColor]
  );

  const addButtonStyles = useMemo(
    () => ({
      background: primaryAccentColor,
      color: "#000000",
      "&:hover": { background: primaryAccentColor },
      "&.Mui-disabled": {
        background: "rgba(0,0,0,0.1)",
        color: "rgba(0,0,0,0.3)",
      },
    }),
    [primaryAccentColor]
  );

  /* -------------------------
     Callbacks
  ------------------------- */
  const handleAddSkill = useCallback(async () => {
    try {
      const selectedSkill = newSkillName;

      const isDuplicate = checkDuplicate(selectedSkill, profileSkills);

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
          `/interview?type=technicalSkill&skill=${encodeURIComponent(selectedSkill)}`
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
  }, [newSkillName, profileSkills, router, setNotification]);

  const handleCategoryChange = useCallback(
    (_: any, value: string | null) => {
      onSelectedCategoryChange(value || "");
    },
    [onSelectedCategoryChange]
  );

  const handleSkillChange = useCallback(
    (_: any, value: string | null) => {
      onSkillSelection(value);
    },
    [onSkillSelection]
  );

  /* -------------------------
     Render
  ------------------------- */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: DIALOG_STYLES.paper }}
    >
      <DialogTitle sx={DIALOG_STYLES.title}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Add New Skill</Typography>
          <IconButton onClick={onClose} sx={{ color: "rgba(0,0,0,0.7)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={DIALOG_STYLES.content}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Autocomplete<string>
            fullWidth
            options={categoryOptions}
            value={selectedCategory || null}
            onChange={handleCategoryChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                sx={textFieldStyles}
              />
            )}
            PaperComponent={AutocompletePaper}
          />

          {selectedCategory && skillOptions.length === 0 ? (
            <Typography sx={DIALOG_STYLES.emptyState}>
              You already have all skills in this category!
            </Typography>
          ) : (
            <Autocomplete<string>
              fullWidth
              options={skillOptions}
              value={newSkillName}
              onChange={handleSkillChange}
              filterOptions={filterSkillsByInput}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skill Name"
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                  sx={textFieldStyles}
                />
              )}
              PaperComponent={AutocompletePaper}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={DIALOG_STYLES.actions}>
        <Button onClick={onClose} sx={DIALOG_STYLES.cancelButton}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAddSkill}
          disabled={!newSkillName}
          sx={addButtonStyles}
        >
          Add Skill
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AddSkillDialogComponent);
