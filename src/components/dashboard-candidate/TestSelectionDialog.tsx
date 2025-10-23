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

  skillCategories?: { [key: string]: string[] };
  selectedCategory?: string;
  onSelectedCategoryChange?: (value: string) => void;

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
  
  // User's existing skills to filter out
  profileSkills?: Array<{ name: string }>;
  profileSoftSkills?: Array<{ name: string; category?: string }>;
};

function TestSelectionDialogComponent(props: TestSelectionDialogProps) {
  const {
    open,
    onClose,
    primaryAccentColor,
    skillType,
    onSkillTypeChange,
    skillCategories,
    selectedCategory,
    onSelectedCategoryChange,
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
    profileSkills = [],
    profileSoftSkills = [],
  } = props;

  // Filter out skills that user already has
  const existingTechnicalSkillNames = profileSkills.map(s => s.name);
  const existingSoftSkillNames = profileSoftSkills.map(s => s.name);
  
  const availableTechnicalSkills = selectedCategory && skillCategories
    ? skillCategories[selectedCategory]?.filter(skill => !existingTechnicalSkillNames.includes(skill)) || []
    : technicalSkillsList.filter(skill => !existingTechnicalSkillNames.includes(skill));
  
  const availableSoftSkills = softSkills.filter(skill => !existingSoftSkillNames.includes(skill.name));

  const handleTestSubmit = async () => {
    try {
      if (skillType === "technical" && selectedSkill && selectedCategory) {
        const proficiencyMap: { [key: string]: number } = {
          "Entry Level": 1,
          Junior: 2,
          "Mid Level": 3,
          Senior: 4,
          Expert: 5,
        };
        const proficiency = proficiencyMap[getExperienceLevelFromProficiency(softSkillProficiency)] || 3;
        
        // Auto-generate role based on skill (same as config builder)
        const role = `${selectedSkill} Developer`;
        
        router.push(
          `/interview/hr/?type=technical&skill=${selectedSkill}&proficiency=${proficiency}&role=${role}&company=TalentAI&difficulty=intermediate&duration=45`
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

        // Auto-generate role based on soft skill (same as config builder)
        const role = `${softSkillType} Professional`;
        
        const queryParams = new URLSearchParams();
        queryParams.append("type", "soft");
        queryParams.append("skill", softSkillType);
        queryParams.append("proficiency", proficiency.toString());
        queryParams.append("role", role);
        queryParams.append("company", "TalentAI");

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

        router.push(`/interview/hr/?${queryParams.toString()}`);
      }
      onClose();
    } catch (error) {
      console.error("Error in test submission:", error);
      toast.error("Failed to start test");
    }
  };

  const isSubmitDisabled =
    (skillType === "technical" && (!selectedCategory || !selectedSkill)) ||
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
            <Typography sx={{ color: primaryAccentColor, mb: 1 }}>
              Select Category
            </Typography>

            <Autocomplete
              fullWidth
              options={skillCategories ? Object.keys(skillCategories) : []}
              value={selectedCategory || null}
              onChange={(_, value) => {
                if (onSelectedCategoryChange) {
                  onSelectedCategoryChange(value || "");
                  onSelectedSkillChange(""); // Reset skill when category changes
                }
              }}
              filterOptions={filterStartsFirstStrings}
              sx={{ mb: 2 }}
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

            {selectedCategory && (
              <>
                <Typography sx={{ color: primaryAccentColor, mb: 1 }}>
                  Select Technical Skill
                </Typography>

                {availableTechnicalSkills.length === 0 ? (
                  <Typography sx={{ color: '#666', p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                    You already have all skills in this category!
                  </Typography>
                ) : (
                  <Autocomplete
                    fullWidth
                    options={availableTechnicalSkills}
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
                )}
              </>
            )}
          </Box>
        )}

        {skillType === "soft" && (
          <Box>
            <Typography sx={{ color: primaryAccentColor }}>
              Select Soft Skill
            </Typography>

            {availableSoftSkills.length === 0 ? (
              <Typography sx={{ color: '#666', p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                You already have all soft skills!
              </Typography>
            ) : (
              <>
                <Autocomplete
                  fullWidth
                  options={availableSoftSkills}
                  value={availableSoftSkills.find((s) => s.name === softSkillType) || null}
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
                  availableSoftSkills.find((s) => s.name === softSkillType)?.subcategories || []
                }
                value={
                  availableSoftSkills
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
              </>
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


