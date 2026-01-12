import React, { useEffect, useCallback, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import VerifiedIcon from "@mui/icons-material/Verified";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  skillCategories,
  softSkills,
  technicalSkillsList,
} from "@/constants/skills";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { RootState } from "@/store/store";

const languages = [{ value: "English", label: "English" }];

export type AssessmentModalProps = {
  type?: "soft" | "technical" | "";
  open: boolean;
  onClose: () => void;
};

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  type,
  open,
  onClose,
}) => {
  const router = useRouter();

  const profile = useSelector((state: RootState) => state.auth.profile);
  const [skillType, setSkillType] = useState<"soft" | "technical" | "">(
    type ?? ""
  );
  const [selectedSkill, setSelectedSkill] = useState("");
  const [softSkillType, setSoftSkillType] = useState("");
  const [softSkillLanguage, setSoftSkillLanguage] = useState("");
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState("");
  const [softSkillProficiency, setSoftSkillProficiency] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const onSkillTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSkillType(event.target.value as "soft" | "technical" | "");
      setSelectedSkill("");
      setSoftSkillType("");
      setSoftSkillLanguage("");
    },
    []
  );

  const onSoftSkillChange = (value: string) => {
    setSoftSkillType(value);
    setSoftSkillSubcategory("");
    setSoftSkillLanguage("");
    setSoftSkillProficiency(1);
  };

  // Custom filters: prioritize options starting with input, then other contains
  const filterStartsFirstStrings = (
    options: string[],
    { inputValue }: { inputValue: string }
  ) => {
    const q = (inputValue || "").trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const contains = options.filter(
      (o) => o.toLowerCase().includes(q) && !o.toLowerCase().startsWith(q)
    );
    return [...starts, ...contains];
  };

  const filterStartsFirstSoft = (
    options: any[],
    { inputValue }: { inputValue: string }
  ) => {
    const q = (inputValue || "").trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter((o) => o.name.toLowerCase().startsWith(q));
    const contains = options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) && !o.name.toLowerCase().startsWith(q)
    );
    return [...starts, ...contains];
  };

  const profileSkills = profile?.skills || [];
  const profileSoftSkills = profile?.softSkills || [];
  // Filter out skills that user already has
  const existingTechnicalSkillNames = profileSkills.map((s) => s.name);
  const existingSoftSkillNames = profileSoftSkills.map((s) => s.name);

  const availableTechnicalSkills =
    selectedCategory && skillCategories
      ? skillCategories[selectedCategory]?.filter(
          (skill) => !existingTechnicalSkillNames.includes(skill)
        ) || []
      : technicalSkillsList.filter(
          (skill) => !existingTechnicalSkillNames.includes(skill)
        );

  const availableSoftSkills = softSkills.filter(
    (skill) => !existingSoftSkillNames.includes(skill.name)
  );

  const onSoftSkillLanguageChange = (value: string) => {
    setSoftSkillLanguage(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      setSoftSkillProficiency(
        proficiencyMap[existingSkill.experienceLevel] || 1
      );
    } else {
      setSoftSkillProficiency(1);
    }
  };
  const checkExistingSoftSkill = (skillName: string, category?: string) => {
    if (!profile?.softSkills?.length) return null;

    return profile.softSkills.find((skill) => {
      if (skillName === "Communication") {
        // For Communication skills, match both name and language (category)
        return skill.name === skillName && skill.category === category;
      } else {
        // For other skills, match name and subcategory
        return skill.name === skillName && skill.category === category;
      }
    });
  };

  const onSoftSkillSubcategoryChange = (value: string) => {
    setSoftSkillSubcategory(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      setSoftSkillProficiency(
        proficiencyMap[existingSkill.experienceLevel] || 1
      );
    } else {
      setSoftSkillProficiency(1);
    }
  };
  const handleTestSubmit = async () => {
    try {
      let queryParams: Record<string, string> = {};
      if (skillType === "technical" && selectedSkill && selectedCategory) {
        queryParams = {
          type: "technical",
          role: (selectedSkill as string) || "Software Engineer",
          proficiency: "Mid Level",
        };
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
        queryParams = {
          type: "soft",
          skill: (softSkillType as string) || "Communication",
          proficiency: (proficiency.toString() as string) || "3",
          category: (softSkillLanguage as string) || "General",
          subcategory: softSkillSubcategory,
        };
      }
      const queryString = new URLSearchParams(
        queryParams as Record<string, string>
      ).toString();
      router.push(`/interview/hr?${queryString}`);
      onCloseHandler();
    } catch (error) {
      console.error("Error in test submission:", error);
      toast.error("Failed to start test");
    }
  };
  // Add helper function to map proficiency to experience level
  const getExperienceLevelFromProficiency = (
    proficiencyLevel: number
  ): string => {
    switch (proficiencyLevel) {
      case 1:
        return "Entry Level";
      case 2:
        return "Junior";
      case 3:
        return "Mid Level";
      case 4:
        return "Senior";
      case 5:
        return "Expert";
      default:
        return "Entry Level";
    }
  };

  const isSubmitDisabled =
    (skillType === "technical" && (!selectedCategory || !selectedSkill)) ||
    (skillType === "soft" &&
      (!softSkillType ||
        (softSkillType === "Communication" && !softSkillLanguage) ||
        (softSkillType !== "Communication" && !softSkillSubcategory)));

  const onCloseHandler = () => {
    onClose();
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSkillType("");
    setSelectedCategory("");
    setSelectedSkill("");
    setSoftSkillProficiency(1);
    setSoftSkillSubcategory("");
  };
  useEffect(() => {
    if (open) {
      setSkillType(type ?? "");
    }
  }, [type, open]);
  return (
    <Dialog
      open={open}
      onClose={onCloseHandler}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "#ffffff",
          borderRadius: "24px",
          border: `1px solid gray`,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid gray`,
          color: "gray",
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
          <IconButton onClick={onCloseHandler} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ height: "100%", overflow: "auto" }}>
        {!type && (
          <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
            <FormLabel sx={{ color: "gray", mb: 1, mt: 2 }}>
              <Typography variant="h6" sx={{ color: "gray" }}>
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
                        color: "gray",
                      },
                    }}
                  />
                }
                label="Technical Skill"
                sx={{
                  "&.Mui-checked": {
                    color: "gray",
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
                        color: "gray",
                      },
                    }}
                  />
                }
                label="Soft Skill"
                sx={{
                  "&.Mui-checked": {
                    color: "gray",
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
        )}

        {/* Reward Preview Card */}
        {skillType && (selectedSkill || softSkillType) && (
          <Card
            sx={{
              p: 3,
              mb: 3,
              background:
                "linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)",
              color: "#fff",
              borderRadius: 3,
              border: "2px solid rgba(255, 255, 255, 0.2)",
              animation: "fadeIn 0.3s ease-in",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(-10px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EmojiEventsIcon sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Your Rewards for This Test
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Complete this interview to unlock:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <Chip
                icon={
                  <AccountBalanceWalletIcon
                    sx={{ color: "white !important" }}
                  />
                }
                label="Up to 33.33 TAI tokens"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
              <Chip
                icon={<VerifiedIcon sx={{ color: "white !important" }} />}
                label={`Verified ${selectedSkill || softSkillType} Badge`}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
              <Chip
                icon={<EmojiEventsIcon sx={{ color: "white !important" }} />}
                label="Ranking points"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 2,
                opacity: 0.8,
                fontStyle: "italic",
              }}
            >
              💡 Rewards based on your score (higher score = more TAI tokens)
            </Typography>
          </Card>
        )}

        {skillType === "technical" && (
          <Box>
            <Typography sx={{ color: "gray", mb: 1 }}>
              Select Category
            </Typography>

            <Autocomplete
              fullWidth
              options={skillCategories ? Object.keys(skillCategories) : []}
              value={selectedCategory || null}
              onChange={(_, value) => {
                setSelectedCategory(value || "");
                setSelectedSkill(""); // Reset skill when category changes
              }}
              filterOptions={filterStartsFirstStrings}
              sx={{ mb: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ sx: { color: "gray" } }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      color: "#000000",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "gray",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "gray",
                      },
                      "&.Mui-focused": {
                        "& .MuiInputLabel-root": {
                          color: "gray",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        "&.Mui-focused": {
                          color: "gray",
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
                <Typography sx={{ color: "gray", mb: 1 }}>
                  Select Technical Skill
                </Typography>

                {availableTechnicalSkills.length === 0 ? (
                  <Typography
                    sx={{
                      color: "#666",
                      p: 2,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    You already have all skills in this category!
                  </Typography>
                ) : (
                  <Autocomplete
                    fullWidth
                    options={availableTechnicalSkills}
                    value={selectedSkill}
                    onChange={(_, value) => setSelectedSkill(value || "")}
                    filterOptions={filterStartsFirstStrings}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputLabelProps={{ sx: { color: "gray" } }}
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            color: "#000000",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(0,0,0,0.2)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused": {
                              "& .MuiInputLabel-root": {
                                color: "gray",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&.Mui-focused": {
                                color: "gray",
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
            <Typography sx={{ color: "gray" }}>Select Soft Skill</Typography>

            {availableSoftSkills.length === 0 ? (
              <Typography
                sx={{
                  color: "#666",
                  p: 2,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                You already have all soft skills!
              </Typography>
            ) : (
              <>
                <Autocomplete
                  fullWidth
                  options={availableSoftSkills}
                  value={
                    availableSoftSkills.find((s) => s.name === softSkillType) ||
                    null
                  }
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
                            borderColor: "gray",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused": {
                            "& .MuiInputLabel-root": {
                              color: "gray",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            "&.Mui-focused": {
                              color: "gray",
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
                    value={
                      languages.find((l) => l.value === softSkillLanguage) ||
                      null
                    }
                    onChange={(_, value) =>
                      onSoftSkillLanguageChange(value?.value || "")
                    }
                    getOptionLabel={(option) => option.label}
                    sx={{ mt: 2 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputLabelProps={{
                          sx: { color: "gray" },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            color: "#000000",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused": {
                              "& .MuiInputLabel-root": {
                                color: "gray",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&.Mui-focused": {
                                color: "gray",
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
                              backgroundColor: "gray",
                            },
                            "&:hover": {
                              backgroundColor: "gray",
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
                      availableSoftSkills.find((s) => s.name === softSkillType)
                        ?.subcategories || []
                    }
                    value={
                      availableSoftSkills
                        .find((s) => s.name === softSkillType)
                        ?.subcategories?.find(
                          (sub) => sub.value === softSkillSubcategory
                        ) || null
                    }
                    onChange={(_, value) =>
                      onSoftSkillSubcategoryChange(value?.value || "")
                    }
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
                              borderColor: "gray",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused": {
                              "& .MuiInputLabel-root": {
                                color: "gray",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&.Mui-focused": {
                                color: "gray",
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
                              backgroundColor: "gray",
                            },
                            "&:hover": {
                              backgroundColor: "gray",
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
      <DialogActions
        sx={{ p: 3, borderTop: `1px solid rgba(0, 255, 157, 0.2)` }}
      >
        <Button
          onClick={onCloseHandler}
          sx={{ color: "rgba(0,0,0,0.7)", "&:hover": { color: "#000000" } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleTestSubmit}
          disabled={isSubmitDisabled}
          sx={{
            background: "gray",
            color: "#000000",
            "&:hover": { background: "gray" },
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
};

export default React.memo(AssessmentModal);
