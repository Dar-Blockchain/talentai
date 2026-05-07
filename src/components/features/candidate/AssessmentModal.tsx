// 🔽 same imports as before (unchanged)
import React, { useEffect, useState } from "react";
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
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  skillCategories,
  softSkills,
} from "@/constants/skills";

const languages = [{ value: "English", label: "English" }];

const AssessmentModal = ({ type, open, onClose }: any) => {
  const router = useRouter();
  const profile = useSelector(
    (state: RootState) => state.user.connectedUser.profile
  );

  const [step, setStep] = useState<number>(1);
  const [skillType, setSkillType] = useState<"soft" | "technical" | "">("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [softSkillType, setSoftSkillType] = useState("");
  const [softSkillLanguage, setSoftSkillLanguage] = useState("");
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState("");

  useEffect(() => {
    if (open) {
      setSkillType(type ?? "");
      setStep(type ? 2 : 1);
    }
  }, [open, type]);

  /* ---------------- Validation ---------------- */
  const isStep1Invalid = !skillType;

  const isStep2Invalid =
    (skillType === "technical" && (!selectedCategory || !selectedSkill)) ||
    (skillType === "soft" &&
      (!softSkillType ||
        (softSkillType === "Communication" && !softSkillLanguage) ||
        (softSkillType !== "Communication" && !softSkillSubcategory)));

  /* ---------------- Submit ---------------- */
  const handleSubmit = () => {
    const query =
      skillType === "technical"
        ? {
            type: "technical",
            role: selectedSkill,
            proficiency: "Mid Level",
          }
        : {
            type: "soft",
            skill: softSkillType,
            category:
              softSkillType === "Communication"
                ? softSkillLanguage
                : softSkillSubcategory,
            proficiency: "3",
          };

    handleClose();
    router.push(`/candidate/interview/hr?${new URLSearchParams(query)}`);
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setSkillType("");
    setSelectedCategory("");
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
              m: 0,
              color: "rgba(131, 16, 255, 1)",
            }}
          >
            Start New Test
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pb: 0 }}>
        {/* STEP 1 */}
        {step === 1 && (
          <FormControl fullWidth>
            <FormLabel>
              <Typography
                sx={{
                  mb: 1,
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "16px",
                  lineHeight: "34px",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                  color: "rgba(0, 0, 0, 1)",
                }}
              >
                Which skill do you want to master today?
              </Typography>
            </FormLabel>
            <RadioGroup
              value={skillType}
              onChange={(e) =>
                setSkillType(e.target.value as "soft" | "technical")
              }
            >
              <FormControlLabel
                value="technical"
                control={
                  <Radio
                    sx={{
                      color: "rgba(228, 229, 232, 1)",
                      "&.Mui-checked": {
                        color: "rgba(131, 16, 255, 1)",
                      },
                    }}
                  />
                }
                label="Technical Skills (Coding, Tools, & Knowledge)"
              />
              <FormControlLabel
                value="soft"
                control={
                  <Radio
                    sx={{
                      color: "rgba(228, 229, 232, 1)",
                      "&.Mui-checked": {
                        color: "rgba(131, 16, 255, 1)",
                      },
                    }}
                  />
                }
                label="Soft Skills (Communication, Leadership, & More)"
              />
            </RadioGroup>
          </FormControl>
        )}

        {/* STEP 2 */}
        {step === 2 && skillType === "technical" && (
          <>
            <Typography
              sx={{
                mb: 1,
                fontFamily: "Poppins",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "34px",
                letterSpacing: "0px",
                verticalAlign: "middle",
                color: "rgba(0, 0, 0, 1)",
              }}
            >
              Pick a skill category to get started
            </Typography>
            <Autocomplete
              fullWidth
              options={Object.keys(skillCategories)}
              value={selectedCategory || null}
              onChange={(_, v) => {
                setSelectedCategory(v || "");
                setSelectedSkill("");
              }}
              renderInput={(params) => <TextField {...params} />}
            />

            {selectedCategory && (
              <>
                <Typography
                  sx={{
                    mt: 2,
                    mb: 1,
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "34px",
                    letterSpacing: "0px",
                    verticalAlign: "middle",
                    color: "rgba(0, 0, 0, 1)",
                  }}
                >
                  Which technical skill would you like to shine at?
                </Typography>
                <Autocomplete
                  fullWidth
                  options={
                    skillCategories[selectedCategory]?.filter(
                      (s) => !profile?.skills?.some((p) => p.name === s)
                    ) || []
                  }
                  value={selectedSkill}
                  onChange={(_, v) => setSelectedSkill(v || "")}
                  renderInput={(params) => <TextField {...params} />}
                />
              </>
            )}
          </>
        )}

        {step === 2 && skillType === "soft" && (
          <>
            <Typography
              sx={{
                mb: 1,
                fontFamily: "Poppins",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "34px",
                letterSpacing: "0px",
                verticalAlign: "middle",
                color: "rgba(0, 0, 0, 1)",
              }}
            >
              Which soft skill would you like to shine at?
            </Typography>
            <Autocomplete
              fullWidth
              options={softSkills}
              getOptionLabel={(o) => o.name}
              value={softSkills.find((s) => s.name === softSkillType) || null}
              onChange={(_, v) => setSoftSkillType(v?.name || "")}
              renderInput={(params) => <TextField {...params} />}
            />

            {softSkillType === "Communication" && (
              <Autocomplete
                fullWidth
                sx={{ mt: 2 }}
                options={languages}
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => setSoftSkillLanguage(v?.value || "")}
                renderInput={(params) => <TextField {...params} />}
              />
            )}

            {softSkillType && softSkillType !== "Communication" && (
              <Autocomplete
                fullWidth
                sx={{ mt: 2 }}
                options={
                  softSkills.find((s) => s.name === softSkillType)
                    ?.subcategories || []
                }
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => setSoftSkillSubcategory(v?.value || "")}
                renderInput={(params) => <TextField {...params} />}
              />
            )}
          </>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {step > 1 && (
          <Button
            sx={{
              backgroundColor: "white",
              color: "rgba(131, 16, 255, 1)",
              textTransform: "none",
              "&:hover": {
                color: "rgba(131, 16, 255, 0.5)",
              },
              "&:disabled": {
                color: "rgba(0, 0, 0, 0.26)",
                border: "none",
              },
            }}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        {step === 1 && (
          <Button
            variant="contained"
            disabled={isStep1Invalid}
            onClick={() => setStep(2)}
            sx={{
              height: 42,
              backgroundColor: "rgba(131, 16, 255, 1)",
              color: "white",
              minWidth: "130px",
              borderRadius: "38px",
              textTransform: "none",
              "&:hover": {
                boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
                backgroundColor: "rgba(131, 16, 255, 0.5)",
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
                border: "none",
              },
            }}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            variant="contained"
            disabled={isStep2Invalid}
            onClick={handleSubmit}
            sx={{
              height: 42,
              backgroundColor: "rgba(131, 16, 255, 1)",
              color: "white",
              minWidth: "130px",
              borderRadius: "38px",
              textTransform: "none",
              "&:hover": {
                boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
                backgroundColor: "rgba(131, 16, 255, 0.5)",
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
                border: "none",
              },
            }}
          >
            Start Test
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AssessmentModal);
