import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
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

export type TestSelectionDialogProps = {
  open: boolean;
  onClose: () => void;

  // Styling token passed from parent to keep consistent theming
  primaryAccentColor: string;

  // Selections and data sources
  skillType: string;
  onSkillTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  technicalSkillsList: string[];
  selectedSkill: string;
  onSelectedSkillChange: (value: string) => void;

  softSkills: SoftSkill[];
  softSkillType: string;
  onSoftSkillChange: (value: string) => void;

  languages: LanguageOption[];
  softSkillLanguage: string;
  onSoftSkillLanguageChange: (value: string) => void;

  softSkillSubcategory: string;
  onSoftSkillSubcategoryChange: (value: string) => void;

  // Additional props for the submit function
  softSkillProficiency: number;
  router: any;
  toast: any;
  getExperienceLevelFromProficiency: (proficiency: number) => string;
};

function TestSelectionDialogComponent(props: TestSelectionDialogProps) {
  const {
    open,
    onClose,
    primaryAccentColor,
    skillType,
    onSkillTypeChange,
    technicalSkillsList,
    selectedSkill,
    onSelectedSkillChange,
    softSkills,
    softSkillType,
    onSoftSkillChange,
    languages,
    softSkillLanguage,
    onSoftSkillLanguageChange,
    softSkillSubcategory,
    onSoftSkillSubcategoryChange,
    softSkillProficiency,
    router,
    toast,
    getExperienceLevelFromProficiency,
  } = props;

  const handleTestSubmit = async () => {
    try {
      if (skillType === "technical" && selectedSkill) {
        router.push(
          `/interview?type=technicalSkill&skill=${selectedSkill}`
        );
      } else if (skillType === "soft" && softSkillType) {
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
            toast.error("Please select a language for Communication skill");
            return;
          }
          queryParams.append("language", softSkillLanguage);
        } else {
          if (!softSkillSubcategory) {
            toast.error("Please select a subcategory");
            return;
          }
          queryParams.append("subcategory", softSkillSubcategory);
        }

        router.push(`/interview?${queryParams.toString()}`);
      }
      onClose();
    } catch (error) {
      console.error("Error in test submission:", error);
      toast.error("Failed to start test");
    }
  };

  const isSubmitDisabled =
    (skillType === "technical" && !selectedSkill) ||
    (skillType === "soft" &&
      (!softSkillType ||
        (softSkillType === "Communication" && !softSkillLanguage) ||
        (softSkillType !== "Communication" && !softSkillSubcategory)));

  // Custom filters: prioritize options starting with input, then other contains
  const filterStartsFirstStrings = (options: string[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.toLowerCase().includes(q) && !o.toLowerCase().startsWith(q));
    return [...starts, ...contains];
  };

  const filterStartsFirstSoft = (options: SoftSkill[], { inputValue }: { inputValue: string }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.name.toLowerCase().startsWith(q));
    const contains = options.filter(o => o.name.toLowerCase().includes(q) && !o.name.toLowerCase().startsWith(q));
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
          border: `1px solid ${primaryAccentColor}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${primaryAccentColor}`,
          color: primaryAccentColor,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "black" }}>
            Start New Test
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
          <FormLabel sx={{ color: primaryAccentColor, mb: 1, mt: 2 }}>
            <Typography variant="h6" sx={{ color: primaryAccentColor }}>
              Select Skill Type
            </Typography>
          </FormLabel>
          <RadioGroup value={skillType} onChange={onSkillTypeChange}>
            <FormControlLabel
              value="technical"
              control={
                <Radio
                  sx={{
                    color: "rgba(0,0,0,0.6)",
                    "&.Mui-checked": {
                      color: primaryAccentColor,
                    },
                  }}
                />
              }
              label="Technical Skill"
              sx={{
                "&.Mui-checked": {
                  color: primaryAccentColor,
                },
              }}
            />
            <FormControlLabel
              value="soft"
              control={
                <Radio
                  sx={{
                    color: "rgba(0,0,0,0.6)",
                    "&.Mui-checked": {
                      color: primaryAccentColor,
                    },
                  }}
                />
              }
              label="Soft Skill"
              sx={{
                "&.Mui-checked": {
                  color: primaryAccentColor,
                },
              }}
            />
          </RadioGroup>
        </FormControl>

        {skillType === "technical" && (
          <Box>
            <Typography sx={{ color: primaryAccentColor }}>
              Select Technical Skill
            </Typography>

            <Autocomplete
              fullWidth
              options={technicalSkillsList}
              value={selectedSkill}
              onChange={(_, value) => onSelectedSkillChange(value || "")}
              filterOptions={filterStartsFirstStrings}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: primaryAccentColor } }}
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
                        backgroundColor: "rgba(131, 16, 255, 0.05)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(131, 16, 255, 0.05)",
                      },
                    },
                  }}
                />
              )}
            />
          </Box>
        )}

        {skillType === "soft" && (
          <Box>
            <Typography sx={{ color: primaryAccentColor }}>
              Select Soft Skill
            </Typography>

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
                sx={{ mt: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputLabelProps={{
                      sx: { color: primaryAccentColor },
                    }}
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
                options={
                  softSkills.find((s) => s.name === softSkillType)?.subcategories || []
                }
                value={
                  softSkills
                    .find((s) => s.name === softSkillType)
                    ?.subcategories?.find((sub) => sub.value === softSkillSubcategory) || null
                }
                onChange={(_, value) => onSoftSkillSubcategoryChange(value?.value || "")}
                getOptionLabel={(option) => option.label}
                sx={{ mt: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputLabelProps={{
                      sx: { color: "rgba(0,0,0,0.7)" },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        color: "#000000",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(4, 3, 3, 0.2)",
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
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(0, 255, 157, 0.2)` }}>
        <Button
          onClick={onClose}
          sx={{ color: "rgba(0,0,0,0.7)", "&:hover": { color: "#000000" } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleTestSubmit}
          disabled={isSubmitDisabled}
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

export default React.memo(TestSelectionDialogComponent);


