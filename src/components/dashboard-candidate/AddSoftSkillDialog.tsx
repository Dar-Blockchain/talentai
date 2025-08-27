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
  onSubmit: () => void;
  primaryAccentColor: string; // use GREEN_MAIN for consistency

  softSkills: SoftSkill[];
  languages: LanguageOption[];

  softSkillType: string;
  onSoftSkillChange: (value: string) => void;
  softSkillLanguage: string;
  onSoftSkillLanguageChange: (value: string) => void;
  softSkillSubcategory: string;
  onSoftSkillSubcategoryChange: (value: string) => void;
};

function AddSoftSkillDialogComponent(props: AddSoftSkillDialogProps) {
  const {
    open,
    onClose,
    onSubmit,
    primaryAccentColor,
    softSkills,
    languages,
    softSkillType,
    onSoftSkillChange,
    softSkillLanguage,
    onSoftSkillLanguageChange,
    softSkillSubcategory,
    onSoftSkillSubcategoryChange,
  } = props;

  const submitDisabled =
    !softSkillType ||
    (softSkillType === "Communication" && !softSkillLanguage) ||
    (softSkillType !== "Communication" && !softSkillSubcategory);

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
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(255, 107, 107, 0.2)" }}>
        <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.7)", "&:hover": { color: "#000000" } }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
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


