import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  HardSkill,
  SoftSkill,
  deleteHardSkill,
  deleteSoftSkill,
  updateJobField,
  updateJobSalaryField,
  updateRequirements,
  updateResponsibilities,
} from "@/store/slices/postGenerationSlice";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Close } from "@mui/icons-material";
import SkillEditorModal from "./SkillEditorModal";
import { Add as AddIcon } from "@mui/icons-material";
import { getLevelFromNumber } from "@/utils/postHelpers";
import { experienceLevels } from "@/constants/candidate";
import {
  contractTypes,
  workModes,
} from "@/components/preferences/data/candidateData";
import SalaryRange from "./SalaryRange";

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": {
    height: 40,
    fontSize: "12px",
    fontWeight: 500,
  },
};

const PostPreview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { generatedPost, loading } = useSelector(
    (state: any) => state.postGeneration
  );

  const {
    title = "",
    description = "",
    experienceLevel = "",
    employmentType = "",
    location = "",
    salary = { min: "", max: "", currency: "USD" },
    requirements = [],
    responsibilities = [],
  } = generatedPost?.jobDetails ?? {};
  const hardSkills = generatedPost?.skillAnalysis?.requiredSkills || [];
  const softSkills = generatedPost?.skillAnalysis?.softSkills || [];

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  const handleEdit = (skill: any, index: number, type: "hard" | "soft") => {
    setSelectedSkill(skill);
    setSelectedIndex(index);
    setSelectedType(type);
    setOpen(true);
  };
  const handleAdd = (type: "hard" | "soft") => {
    setSelectedSkill(null);
    setSelectedIndex(-1);
    setSelectedType(type);
    setOpen(true);
  };

  const handleSalaryChange = (
      field: "min" | "max" | "currency",
      value: number | string
    ) => {
      dispatch(updateJobSalaryField({ field, value }));
    };

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: "50%" },
        minHeight: { xs: 300, lg: "100vh" },
        p: { xs: 1, sm: 2, md: 3 },
        overflowY: { xs: "visible", lg: "auto" },
        boxShadow: "0px 0px 6px rgba(0,0,0,0.06)",
        bgcolor: "rgba(253, 255, 255, 1)",
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
      }}
    >
      {/* ✅ Loading state */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            height: "100%",
          }}
        >
          {" "}
          <CircularProgress sx={{ color: "rgba(19, 163, 108, 0.83)" }} />
          <Typography
            sx={{
              mt: 2,
              color: "rgba(147, 147, 147, 1)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Generating job post... please wait
          </Typography>
        </Box>
      )}

      {/* ✅ No data state */}
      {!loading && !generatedPost && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              background: "rgba(76, 217, 163, 0.2)",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/icons/suitcaselinear.svg"
              alt="suitcaselinear"
              width={44}
              height={44}
            />
          </Box>
          <Typography
            sx={{
              mt: 2,
              color: "rgba(147, 147, 147, 1)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Generated job post will appear here
          </Typography>
        </Box>
      )}

      {/* ✅ Display job data */}
      {!loading && generatedPost && (
        <Box>
          <Typography
            sx={{
              mb: 0.5,
              color: "rgba(84, 98, 116, 1)",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            Job Details
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                lineHeight: "42px",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(84, 98, 116, 0.53)",
              }}
            >
              Job Title
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={title || ""}
              onChange={(e: any) =>
                dispatch(
                  updateJobField({ field: "title", value: e.target.value })
                )
              }
              sx={inputStyle}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                lineHeight: "42px",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(84, 98, 116, 0.53)",
              }}
            >
              Work Mode
            </Typography>

            <TextField
              select
              value={location}
              onChange={(e: any) =>
                dispatch(
                  updateJobField({
                    field: "location",
                    value: e.target.value,
                  })
                )
              }
              fullWidth
              sx={inputStyle}
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image
                      src="/icons/building3.svg"
                      alt="money"
                      width={16}
                      height={16}
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem
                disabled
                value=""
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                Work Mode
              </MenuItem>

              {workModes.map((mode) => (
                <MenuItem
                  key={mode}
                  value={mode}
                  sx={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  lineHeight: "42px",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "rgba(84, 98, 116, 0.53)",
                }}
              >
                Employment Type
              </Typography>

              <TextField
                select
                value={employmentType}
                onChange={(e: any) =>
                  dispatch(
                    updateJobField({
                      field: "employmentType",
                      value: e.target.value,
                    })
                  )
                }
                fullWidth
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image
                        src="/icons/bag.svg"
                        alt="money"
                        width={16}
                        height={16}
                      />
                    </InputAdornment>
                  ),
                }}
                FormHelperTextProps={{
                  sx: {
                    marginLeft: 0,
                  },
                }}
              >
                <MenuItem
                  disabled
                  value=""
                  sx={{ fontSize: "12px", fontWeight: 500 }}
                >
                  Employment Type
                </MenuItem>

                {contractTypes.map((mode) => (
                  <MenuItem
                    key={mode}
                    value={mode}
                    sx={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {mode}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  lineHeight: "42px",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "rgba(84, 98, 116, 0.53)",
                }}
              >
                {" "}
                Experience Level{" "}
              </Typography>

              <TextField
                select
                value={experienceLevel}
                onChange={(e: any) =>
                  dispatch(
                    updateJobField({
                      field: "experienceLevel",
                      value: e.target.value,
                    })
                  )
                }
                fullWidth
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUpIcon
                        sx={{
                          color: "rgba(98, 111, 134, 1)",
                          width: "16px",
                          height: "14px",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem
                  disabled
                  value=""
                  sx={{ fontSize: "12px", fontWeight: 500 }}
                >
                  Experience Level
                </MenuItem>

                {experienceLevels.map((level) => (
                  <MenuItem
                    key={level}
                    value={level}
                    sx={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <SalaryRange salaryRange={salary} onSalaryChange={handleSalaryChange} />

          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Required Skills
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(77, 217, 163, 1)",
                  fontSize: "12px",
                }}
              >
                Total: 100%
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                p: 1,
                borderRadius: "12px",
                background: "rgba(240, 249, 255, 1)",
                border: "1px solid rgba(122, 200, 240, 1)",
              }}
            >
              <Image
                src="/icons/lightinfooutline.svg"
                alt="skills chart"
                width={18}
                height={18}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "rgba(84, 98, 116, 1)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  About Skill Percentages
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "rgba(84, 98, 116, 1)",
                    fontSize: "12px",
                    fontWeight: 400,
                  }}
                >
                  The percentages represent the <b>relative importance</b> of
                  each skill for this role. These percentages will be used to{" "}
                  <b>match candidates</b> to your job requirements. Skills with
                  higher percentages will have more weight in the matching
                  algorittim, helping you find candidates who best fit your most
                  critical skill needs. The total must equal 100% to ensure
                  accurate candidate matching.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Hard Skills
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {hardSkills.map((skill: HardSkill, index: number) => {
                  const label = `${skill.name} (${getLevelFromNumber(
                    skill.level
                  )}) - ${skill.percentage}%`;
                  return (
                    <SkillChip
                      key={index}
                      label={label}
                      onDelete={() => dispatch(deleteHardSkill(index))}
                      onClick={() =>
                        handleEdit(
                          {
                            name: skill.name,
                            level: skill.level,
                            percentage: skill.percentage,
                          },
                          index,
                          "hard"
                        )
                      }
                    />
                  );
                })}
                <Button
                  variant="outlined"
                  startIcon={
                    <AddIcon
                      sx={{
                        color: "rgba(98, 111, 134, 1)",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                  }
                  onClick={() => handleAdd("hard")}
                  sx={{
                    height: "29px",
                    border: "0.5px solid rgba(98, 111, 134, 1)",
                    borderStyle: "dashed",
                    borderDashArray: "6 6",
                    backgroundColor: "rgba(48, 185, 216, 0.06)",
                    color: "rgba(95, 168, 211, 1)",
                    fontWeight: 500,
                    borderRadius: "15px",
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "13px",
                    "&:hover": {
                      backgroundColor: "rgba(77, 217, 163, 0.08)",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#e5e7eb",
                      color: "#9ca3af",
                    },
                  }}
                >
                  Add Skill
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Soft Skills
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {softSkills.map((skill: SoftSkill, index: number) => {
                  const label = `${skill.name} (${skill.level}/5) - ${skill.percentage}%`;

                  return (
                    <SkillChip
                      key={index}
                      label={label}
                      onDelete={() => dispatch(deleteSoftSkill(index))}
                      onClick={() =>
                        handleEdit(
                          {
                            name: skill.name,
                            level: skill.level,
                            percentage: skill.percentage,
                          },
                          index,
                          "soft"
                        )
                      }
                    />
                  );
                })}
                <Button
                  variant="outlined"
                  startIcon={
                    <AddIcon
                      sx={{
                        color: "rgba(98, 111, 134, 1)",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                  }
                  onClick={() => handleAdd("soft")}
                  sx={{
                    height: "29px",
                    border: "0.5px solid rgba(98, 111, 134, 1)",
                    borderStyle: "dashed",
                    borderDashArray: "6 6",
                    backgroundColor: "rgba(48, 185, 216, 0.06)",
                    color: "rgba(95, 168, 211, 1)",
                    fontWeight: 500,
                    borderRadius: "15px",
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "13px",
                    "&:hover": {
                      backgroundColor: "rgba(77, 217, 163, 0.08)",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#e5e7eb",
                      color: "#9ca3af",
                    },
                  }}
                >
                  Add Skill
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Description
              </Typography>
              <TextField
                value={description}
                onChange={(e: any) =>
                  dispatch(
                    updateJobField({
                      field: "description",
                      value: e.target.value,
                    })
                  )
                }
                placeholder="Job Description"
                multiline
                minRows={4}
                fullWidth
                sx={{
                  mt: 2,
                  "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 },
                }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Requirements
              </Typography>
              <TextField
                value={requirements.join("\n")}
                onChange={(e) => dispatch(updateRequirements(e.target.value))}
                placeholder="Job Requirements"
                multiline
                minRows={4}
                fullWidth
                sx={{
                  mt: 2,
                  "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 },
                }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(84, 98, 116, 1)",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                Responsibilities
              </Typography>
              <TextField
                value={responsibilities.join("\n")}
                onChange={(e) =>
                  dispatch(updateResponsibilities(e.target.value))
                }
                placeholder="Job Responsibilities"
                multiline
                minRows={4}
                fullWidth
                sx={{
                  mt: 2,
                  "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedSkill ? "edit" : "add"}
          skill={selectedSkill}
          index={selectedIndex}
          skillType={selectedType}
          onClose={() => {
            setOpen(false);
            setSelectedSkill(null);
          }}
        />
      )}
    </Box>
  );
};

export default PostPreview;

const SkillChip: React.FC<{
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: any;
}> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={
      onDelete ? (
        <Close
          sx={{
            color: "rgba(6, 65, 96, 1)",
            fontSize: "16px",
            transition: "transform 0.2s ease",
            cursor: "pointer",
            "&:hover": {
              transform: "scale(1.2)",
            },
          }}
        />
      ) : undefined
    }
    sx={{
      backgroundColor: "rgba(96, 140, 163, 1)",
      color: "rgba(255, 255, 255, 1)",
      fontSize: "13px",
      fontWeight: 500,
      height: "29px",
      px: 0.5,
      "&:hover": {
        backgroundColor: "rgba(96, 140, 163, 0.8)",
      },
      ...sx,
    }}
  />
);