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

type LanguageOption = { label: string; value: string };
type SoftSkillSubcategory = { label: string; value: string };
type SoftSkill = {
  name: string;
  subcategories?: SoftSkillSubcategory[];
};

export type AddSoftSkillDialogProps = {
  open: boolean;
  onClose: () => void;
  primaryAccentColor: string; // use GREEN_MAIN for consistency

  softSkills: SoftSkill[];
  languages: LanguageOption[];

  softSkillType: string;
  onSoftSkillChange: (value: string) => void;
  softSkillLanguage: string;
  onSoftSkillLanguageChange: (value: string) => void;
  softSkillSubcategory: string;
  onSoftSkillSubcategoryChange: (value: string) => void;
  
  // Additional props for the function
  softSkillProficiency: number;
  router: any;
};

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

  const getExperienceLevelFromProficiency = (proficiency: number): string => {
    const proficiencyMap: { [key: number]: string } = {
      1: "Entry Level",
      2: "Junior",
      3: "Mid Level",
      4: "Senior",
      5: "Expert",
    };
    return proficiencyMap[proficiency] || "Entry Level";
  };

  const handleSoftSkillAddSubmit = async () => {
    try {
      if (!softSkillType) {
        // You can use toast here if available, or implement a notification system
        console.error("Please select a soft skill");
        return;
      }
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      const proficiency =
        proficiencyMap[
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

      router.push(`/interview/hr?${queryParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Error in soft skill submission:", error);
      console.error("Failed to start test");
    }
  };

  const submitDisabled =
    !softSkillType ||
    (softSkillType === "Communication" && !softSkillLanguage) ||
    (softSkillType !== "Communication" && !softSkillSubcategory);

  // Custom filters: prioritize options starting with input, then other contains
  const filterStartsFirstSoft = (options: SoftSkill[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.name.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.name.toLowerCase().includes(q) && !o.name.toLowerCase().startsWith(q));
    return [...starts, ...contains];
  };

  const filterStartsFirstLang = (options: LanguageOption[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.label.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.label.toLowerCase().includes(q) && !o.label.toLowerCase().startsWith(q));
    return [...starts, ...contains];
  };

  const filterStartsFirstSub = (options: SoftSkillSubcategory[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.label.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.label.toLowerCase().includes(q) && !o.label.toLowerCase().startsWith(q));
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
          background: "#ffffff",
          borderRadius: "24px",
          border: "1px solid #FF6B6B",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid #FF6B6B",
          color: primaryAccentColor,
        }}
      >
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
          <Typography sx={{ color: primaryAccentColor, mb: 1, mt: 2 }}>Select Soft Skill</Typography>
          <Autocomplete
            fullWidth
            options={softSkills}
            value={softSkills.find((s) => s.name === softSkillType) || null}
            onChange={(_, value) => onSoftSkillChange(value?.name || "")}
            getOptionLabel={(option) => option.name}
            filterOptions={filterStartsFirstSoft}
            renderInput={(params) => (
              <TextField
                {...params}
                InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                InputProps={{
                  ...params.InputProps,
                  sx: {
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
                  },
                }}
              />
            )}
            PaperComponent={(paperProps) => (
              <Paper
                {...paperProps}
                sx={{
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
                }}
              />
            )}
          />

          {softSkillType === "Communication" && (
            <Autocomplete
              fullWidth
              options={languages}
              value={languages.find((l) => l.value === softSkillLanguage) || null}
              onChange={(_, value) => onSoftSkillLanguageChange(value?.value || "")}
              getOptionLabel={(option) => option.label}
              filterOptions={filterStartsFirstLang}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: primaryAccentColor } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
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
                    },
                  }}
                />
              )}
              PaperComponent={(paperProps) => (
                <Paper
                  {...paperProps}
                  sx={{
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
                  }}
                />
              )}
            />
          )}

          {softSkillType && softSkillType !== "Communication" && (
            <Autocomplete
              fullWidth
              options={softSkills.find((s) => s.name === softSkillType)?.subcategories || []}
              value={
                softSkills
                  .find((s) => s.name === softSkillType)
                  ?.subcategories?.find((sub) => sub.value === softSkillSubcategory) || null
              }
              onChange={(_, value) => onSoftSkillSubcategoryChange(value?.value || "")}
              getOptionLabel={(option) => option.label}
              filterOptions={filterStartsFirstSub}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
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
                    },
                  }}
                />
              )}
              PaperComponent={(paperProps) => (
                <Paper
                  {...paperProps}
                  sx={{
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
                  }}
                />
              )}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(255, 107, 107, 0.2)" }}>
        <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.7)", "&:hover": { color: "#000000" } }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSoftSkillAddSubmit}
          disabled={submitDisabled}
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
          Start Test
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default React.memo(AddSoftSkillDialogComponent);


