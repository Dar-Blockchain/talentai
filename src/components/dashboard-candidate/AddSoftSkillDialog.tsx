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
type LanguageOption = { label: string; value: string };
type SoftSkillSubcategory = { label: string; value: string };
type SoftSkill = {
  name: string;
  subcategories?: SoftSkillSubcategory[];
};

export type AddSoftSkillDialogProps = {
  open: boolean;
  onClose: () => void;
  primaryAccentColor: string;

  softSkills: SoftSkill[];
  languages: LanguageOption[];

  softSkillType: string;
  onSoftSkillChange: (value: string) => void;
  softSkillLanguage: string;
  onSoftSkillLanguageChange: (value: string) => void;
  softSkillSubcategory: string;
  onSoftSkillSubcategoryChange: (value: string) => void;

  softSkillProficiency: number;
  router: any;
};

/* -------------------------
   Style Constants
------------------------- */
const DIALOG_STYLES = {
  paper: {
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #FF6B6B",
  },
  title: {
    borderBottom: "1px solid #FF6B6B",
  },
  actions: {
    p: 3,
    borderTop: "1px solid rgba(255, 107, 107, 0.2)",
  },
  cancelButton: {
    color: "rgba(0,0,0,0.7)",
    "&:hover": { color: "#000000" },
  },
} as const;

const getTextFieldStyles = (primaryAccentColor: string) => ({
  color: "#000000",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.2)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryAccentColor,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryAccentColor,
  },
  "&.Mui-focused": {
    "& .MuiInputLabel-root": {
      color: primaryAccentColor,
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: primaryAccentColor,
    },
  },
});

const getTextFieldStylesAccent = (primaryAccentColor: string) => ({
  color: "#000000",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryAccentColor,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryAccentColor,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryAccentColor,
  },
  "&.Mui-focused": {
    "& .MuiInputLabel-root": {
      color: primaryAccentColor,
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: primaryAccentColor,
    },
  },
});

const AUTOCOMPLETE_PAPER_STYLES = {
  backgroundColor: "white",
  color: "black",
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

const getAutocompletePaperStylesAccent = (primaryAccentColor: string) => ({
  backgroundColor: "white",
  color: "black",
  "& .MuiAutocomplete-option": {
    color: "black",
    '&[aria-selected="true"]': {
      backgroundColor: primaryAccentColor,
    },
    "&:hover": {
      backgroundColor: primaryAccentColor,
    },
  },
});

/* -------------------------
   Utility Functions
------------------------- */
const PROFICIENCY_MAP: { [key: number]: string } = {
  1: "Entry Level",
  2: "Junior",
  3: "Mid Level",
  4: "Senior",
  5: "Expert",
};

const PROFICIENCY_VALUE_MAP: { [key: string]: number } = {
  "Entry Level": 1,
  "Junior": 2,
  "Mid Level": 3,
  "Senior": 4,
  "Expert": 5,
};

const getExperienceLevelFromProficiency = (proficiency: number): string => {
  return PROFICIENCY_MAP[proficiency] || "Entry Level";
};

const filterSoftSkills = (options: SoftSkill[], { inputValue }: { inputValue: string }): SoftSkill[] => {
  const query = (inputValue || '').trim().toLowerCase();
  if (!query) return options;

  const starts = options.filter(option => option.name.toLowerCase().startsWith(query));
  const contains = options.filter(
    option => option.name.toLowerCase().includes(query) && !option.name.toLowerCase().startsWith(query)
  );

  return [...starts, ...contains];
};

const filterLanguages = (options: LanguageOption[], { inputValue }: { inputValue: string }): LanguageOption[] => {
  const query = (inputValue || '').trim().toLowerCase();
  if (!query) return options;

  const starts = options.filter(option => option.label.toLowerCase().startsWith(query));
  const contains = options.filter(
    option => option.label.toLowerCase().includes(query) && !option.label.toLowerCase().startsWith(query)
  );

  return [...starts, ...contains];
};

const filterSubcategories = (options: SoftSkillSubcategory[], { inputValue }: { inputValue: string }): SoftSkillSubcategory[] => {
  const query = (inputValue || '').trim().toLowerCase();
  if (!query) return options;

  const starts = options.filter(option => option.label.toLowerCase().startsWith(query));
  const contains = options.filter(
    option => option.label.toLowerCase().includes(query) && !option.label.toLowerCase().startsWith(query)
  );

  return [...starts, ...contains];
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
function AddSoftSkillDialogComponent(props: AddSoftSkillDialogProps) {
  const {
    open,
    onClose,
    primaryAccentColor,
    softSkills,
    languages,
    softSkillType,
    onSoftSkillChange,
    softSkillLanguage,
    onSoftSkillLanguageChange,
    softSkillSubcategory,
    onSoftSkillSubcategoryChange,
    softSkillProficiency,
    router,
  } = props;

  /* -------------------------
     Memoized Values
  ------------------------- */
  const currentSoftSkill = useMemo(
    () => softSkills.find((s) => s.name === softSkillType) || null,
    [softSkills, softSkillType]
  );

  const currentLanguage = useMemo(
    () => languages.find((l) => l.value === softSkillLanguage) || null,
    [languages, softSkillLanguage]
  );

  const subcategoryOptions = useMemo(
    () => currentSoftSkill?.subcategories || [],
    [currentSoftSkill]
  );

  const currentSubcategory = useMemo(
    () => subcategoryOptions.find((sub) => sub.value === softSkillSubcategory) || null,
    [subcategoryOptions, softSkillSubcategory]
  );

  const submitDisabled = useMemo(
    () =>
      !softSkillType ||
      (softSkillType === "Communication" && !softSkillLanguage) ||
      (softSkillType !== "Communication" && !softSkillSubcategory),
    [softSkillType, softSkillLanguage, softSkillSubcategory]
  );

  const textFieldStyles = useMemo(
    () => getTextFieldStyles(primaryAccentColor),
    [primaryAccentColor]
  );

  const textFieldStylesAccent = useMemo(
    () => getTextFieldStylesAccent(primaryAccentColor),
    [primaryAccentColor]
  );

  const submitButtonStyles = useMemo(
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

  const autocompletePaperStylesAccent = useMemo(
    () => getAutocompletePaperStylesAccent(primaryAccentColor),
    [primaryAccentColor]
  );

  /* -------------------------
     Callbacks
  ------------------------- */
  const handleSoftSkillAddSubmit = useCallback(async () => {
    try {
      if (!softSkillType) {
        console.error("Please select a soft skill");
        return;
      }

      const proficiency =
        PROFICIENCY_VALUE_MAP[
          getExperienceLevelFromProficiency(softSkillProficiency)
        ] || 1;

      const queryParams = new URLSearchParams();
      queryParams.append("type", "soft");
      queryParams.append("skill", softSkillType);
      queryParams.append("proficiency", proficiency.toString());

      if (softSkillType === "Communication") {
        if (!softSkillLanguage) {
          console.error("Please select a language for Communication skill");
          return;
        }
        queryParams.append("language", softSkillLanguage);
      } else {
        if (!softSkillSubcategory) {
          console.error("Please select a subcategory");
          return;
        }
        queryParams.append("subcategory", softSkillSubcategory);
      }

      router.push(`/interview?${queryParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Error in soft skill submission:", error);
      console.error("Failed to start test");
    }
  }, [softSkillType, softSkillProficiency, softSkillLanguage, softSkillSubcategory, router, onClose]);

  const handleSoftSkillChange = useCallback(
    (_: any, value: SoftSkill | null) => {
      onSoftSkillChange(value?.name || "");
    },
    [onSoftSkillChange]
  );

  const handleLanguageChange = useCallback(
    (_: any, value: LanguageOption | null) => {
      onSoftSkillLanguageChange(value?.value || "");
    },
    [onSoftSkillLanguageChange]
  );

  const handleSubcategoryChange = useCallback(
    (_: any, value: SoftSkillSubcategory | null) => {
      onSoftSkillSubcategoryChange(value?.value || "");
    },
    [onSoftSkillSubcategoryChange]
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
          <Typography variant="h6" sx={{ color: "black" }}>
            Add Soft Skill
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box>
          <Typography sx={{ color: primaryAccentColor, mb: 1, mt: 2 }}>
            Select Soft Skill
          </Typography>
          <Autocomplete
            fullWidth
            options={softSkills}
            value={currentSoftSkill}
            onChange={handleSoftSkillChange}
            getOptionLabel={(option) => option.name}
            filterOptions={filterSoftSkills}
            renderInput={(params) => (
              <TextField
                {...params}
                InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                InputProps={{
                  ...params.InputProps,
                  sx: textFieldStyles,
                }}
              />
            )}
            PaperComponent={AutocompletePaper}
          />

          {softSkillType === "Communication" && (
            <Autocomplete
              fullWidth
              options={languages}
              value={currentLanguage}
              onChange={handleLanguageChange}
              getOptionLabel={(option) => option.label}
              filterOptions={filterLanguages}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: primaryAccentColor } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: textFieldStylesAccent,
                  }}
                />
              )}
              PaperComponent={(paperProps) => (
                <Paper {...paperProps} sx={autocompletePaperStylesAccent} />
              )}
            />
          )}

          {softSkillType && softSkillType !== "Communication" && (
            <Autocomplete
              fullWidth
              options={subcategoryOptions}
              value={currentSubcategory}
              onChange={handleSubcategoryChange}
              getOptionLabel={(option) => option.label}
              filterOptions={filterSubcategories}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: textFieldStyles,
                  }}
                />
              )}
              PaperComponent={(paperProps) => (
                <Paper {...paperProps} sx={autocompletePaperStylesAccent} />
              )}
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
          onClick={handleSoftSkillAddSubmit}
          disabled={submitDisabled}
          sx={submitButtonStyles}
        >
          Start Test
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AddSoftSkillDialogComponent);
