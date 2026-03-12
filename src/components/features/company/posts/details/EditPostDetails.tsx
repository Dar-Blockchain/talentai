import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Close } from "@mui/icons-material";
import { Add as AddIcon } from "@mui/icons-material";
import { getLevelFromNumber, Skill } from "@/utils/postHelpers";
import { selectCurrentJob, updatePost } from "@/store/slices/postSlice";
import { useToast } from "@/hooks/useToast";
import { validateEditPost } from "@/validations/postValidation";
import SalaryRange from "../create/steps/post-details-step/SalaryRange";
import SkillEditorModal from "../create/steps/post-details-step/SkillEditorModal";
import { contractTypes, experienceLevels, workModes } from "@/constants/candidate";

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": {
    height: 40,
    fontSize: "12px",
    fontWeight: 500,
  },
};

interface EditPostDetailsProps {
  onCancel: () => void;
  onSaveSuccess?: () => void;
}

const EditPostDetails: React.FC<EditPostDetailsProps> = ({ onCancel, onSaveSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const job = useSelector(selectCurrentJob);

  const getInitialValues = (job: any) => ({
    jobDetails: {
      title: job?.jobDetails?.title || "",
      workMode: job?.jobDetails?.workMode || "",
      employmentType: job?.jobDetails?.employmentType || "",
      experienceLevel: job?.jobDetails?.experienceLevel || "",
      description: job?.jobDetails?.description || "",
      requirements: job?.jobDetails?.requirements || [],
      responsibilities: job?.jobDetails?.responsibilities || [],
      salary: job?.jobDetails?.salary || { min: 0, max: 0, currency: "USD" },
    },
    skillAnalysis: job?.skillAnalysis || {},
  });

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  const handleAdd = (type: "hard" | "soft") => {
    setSelectedIndex(null);
    setSelectedType(type);
    setOpen(true);
  };

  const handleEdit = (index: number, type: "hard" | "soft") => {
    setSelectedIndex(index);
    setSelectedType(type);
    setOpen(true);
  };

  const handleDeleteSkill = (index: number, type: "hard" | "soft", values: any, setFieldValue: any) => {
    const field = type === "hard" ? `skillAnalysis.requiredSkills` : `skillAnalysis.softSkills`;
    const updated = type === "hard" ? [...values.skillAnalysis.requiredSkills] : [...values.skillAnalysis.softSkills];
    updated.splice(index, 1);
    setFieldValue(field, updated);
  };

  const handleSaveSkill = (skill: Skill, values: any, setFieldValue: any) => {
    const field = selectedType === "hard" ? `skillAnalysis.requiredSkills` : `skillAnalysis.softSkills`;
    const updated = selectedType === "hard" ? [...values.skillAnalysis.requiredSkills] : [...values.skillAnalysis.softSkills];
    if (selectedIndex === null) {
      updated.push(skill);
    } else {
      updated[selectedIndex] = skill;
    }
    setFieldValue(field, updated);
    setOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Formik
        enableReinitialize
        initialValues={getInitialValues(job)}
        onSubmit={async (values, { resetForm }) => {
          if (!validateEditPost(values, showToast, job?.creationType)) return;
          await dispatch(updatePost({
            jobId: job?._id,
            jobData: {
              jobDetails: values.jobDetails,
              skillAnalysis: values.skillAnalysis,
              linkedinPost: job?.linkedinPost,
            },
          })).unwrap();
          resetForm();
          onCancel();
          showToast({ message: "Post details updated successfully", severity: "success" });
          onSaveSuccess?.();
        }}
      >
        {({ values, handleChange, setFieldValue, handleSubmit, resetForm }) => (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(234, 255, 247, 1)", width: 45, height: 45, borderRadius: "5px" }}>
                  <Image src="/icons/edit.svg" alt="file" width={25} height={25} />
                </Box>
                <Box>
                  <Typography sx={{ color: "rgba(41, 210, 145, 1)", fontWeight: 600, fontSize: "20px" }}>Edit Job Post</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#546274" }}>Update the job details for this position</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" onClick={() => { resetForm(); onCancel(); }}
                  sx={{ border: "none", background: "none", color: "rgba(133, 169, 227, 1)", textDecoration: "none", "&:hover": { background: "none", color: "rgba(133, 169, 227, 0.8)" } }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={() => handleSubmit()}
                  sx={{ textTransform: "none", height: "42px", width: "120px", borderRadius: "38px", background: "rgba(0, 234, 144, 1)", color: "white" }}>
                  Save
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography sx={{ color: "rgba(84, 98, 116, 1)", fontWeight: 600, fontSize: "20px" }}>Job Details</Typography>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Job Title</Typography>
                <TextField fullWidth name="jobDetails.title" variant="outlined" value={values.jobDetails.title} onChange={handleChange} sx={inputStyle} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Work Mode</Typography>
                <TextField select name="jobDetails.workMode" value={values.jobDetails.workMode} onChange={handleChange} fullWidth sx={inputStyle}
                  FormHelperTextProps={{ sx: { marginLeft: 0 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/building3.svg" alt="money" width={16} height={16} /></InputAdornment> }}>
                  <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Work Mode</MenuItem>
                  {workModes.map((mode) => <MenuItem key={mode} value={mode} sx={{ fontSize: "12px", fontWeight: 500 }}>{mode}</MenuItem>)}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Employment Type</Typography>
                  <TextField select name="jobDetails.employmentType" value={values.jobDetails.employmentType} onChange={handleChange} fullWidth sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/bag.svg" alt="money" width={16} height={16} /></InputAdornment> }}
                    FormHelperTextProps={{ sx: { marginLeft: 0 } }}>
                    <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Employment Type</MenuItem>
                    {contractTypes.map((mode) => <MenuItem key={mode} value={mode} sx={{ fontSize: "12px", fontWeight: 500 }}>{mode}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Experience Level</Typography>
                  <TextField select name="jobDetails.experienceLevel" value={values.jobDetails.experienceLevel} onChange={handleChange} fullWidth sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ color: "rgba(98, 111, 134, 1)", width: "16px", height: "14px" }} /></InputAdornment> }}>
                    <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Experience Level</MenuItem>
                    {experienceLevels.map((level) => <MenuItem key={level} value={level} sx={{ fontSize: "12px", fontWeight: 500 }}>{level}</MenuItem>)}
                  </TextField>
                </Box>
              </Box>

              <SalaryRange salaryRange={values.jobDetails.salary} onSalaryChange={(field, value) => setFieldValue(`jobDetails.salary.${field}`, value)} />

              <Box sx={{ mt: 2 }}>
                {job.creationType === "ai" && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
                      <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Required Skills</Typography>
                      <Typography variant="subtitle2" sx={{ color: "rgba(77, 217, 163, 1)", fontSize: "12px" }}>Total: 100%</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1, borderRadius: "12px", background: "rgba(240, 249, 255, 1)", border: "1px solid rgba(122, 200, 240, 1)" }}>
                      <Image src="/icons/lightinfooutline.svg" alt="skills chart" width={18} height={18} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "13px", fontWeight: 600 }}>About Skill Percentages</Typography>
                        <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "12px", fontWeight: 400 }}>
                          The percentages represent the <b>relative importance</b> of each skill for this role. These percentages will be used to <b>match candidates</b> to your job requirements.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Hard Skills</Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {values.skillAnalysis.requiredSkills.map((skill: any, index: number) => (
                          <SkillChip key={index} label={`${skill.name} (${getLevelFromNumber(skill.level)}) - ${skill.percentage}%`}
                            onDelete={() => handleDeleteSkill(index, "hard", values, setFieldValue)} onClick={() => handleEdit(index, "hard")} />
                        ))}
                        <AddSkillButton onClick={() => handleAdd("hard")} />
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Soft Skills</Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {values.skillAnalysis.softSkills.map((skill: any, index: number) => (
                          <SkillChip key={index} label={`${skill.name} (${skill.level}/5) - ${skill.percentage}%`}
                            onDelete={() => handleDeleteSkill(index, "soft", values, setFieldValue)} onClick={() => handleEdit(index, "soft")} />
                        ))}
                        <AddSkillButton onClick={() => handleAdd("soft")} />
                      </Box>
                    </Box>
                  </>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Description</Typography>
                  <TextField name="jobDetails.description" value={values.jobDetails.description} onChange={handleChange} placeholder="Job Description"
                    multiline minRows={4} fullWidth sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }} />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Requirements</Typography>
                  <TextField value={values.jobDetails.requirements.join("\n")}
                    onChange={(e) => setFieldValue("jobDetails.requirements", e.target.value.split("\n"))}
                    placeholder="Job Requirements" multiline minRows={4} fullWidth sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }} />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Responsibilities</Typography>
                  <TextField value={values.jobDetails.responsibilities.join("\n")}
                    onChange={(e) => setFieldValue("jobDetails.responsibilities", e.target.value.split("\n"))}
                    placeholder="Job Responsibilities" multiline minRows={4} fullWidth sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }} />
                </Box>
              </Box>
            </Box>

            {open && (
              <SkillEditorModal
                open={open}
                mode={selectedIndex === null ? "add" : "edit"}
                skillType={selectedType}
                index={selectedIndex}
                skill={selectedIndex !== null ? (selectedType === "hard" ? values.skillAnalysis.requiredSkills[selectedIndex] : values.skillAnalysis.softSkills[selectedIndex]) : null}
                onSave={(skill) => handleSaveSkill(skill, values, setFieldValue)}
                onClose={() => setOpen(false)}
              />
            )}
          </>
        )}
      </Formik>
    </Box>
  );
};

export default EditPostDetails;

const addSkillBtnSx = {
  height: "29px",
  border: "0.5px solid rgba(98, 111, 134, 1)",
  borderStyle: "dashed",
  backgroundColor: "rgba(48, 185, 216, 0.06)",
  color: "rgba(95, 168, 211, 1)",
  fontWeight: 500,
  borderRadius: "15px",
  py: 1.5,
  textTransform: "none",
  fontSize: "13px",
  "&:hover": { backgroundColor: "rgba(77, 217, 163, 0.08)" },
  "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
};

const AddSkillButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button variant="outlined" startIcon={<AddIcon sx={{ color: "rgba(98, 111, 134, 1)", width: "16px", height: "16px" }} />} onClick={onClick} sx={addSkillBtnSx}>
    Add Skill
  </Button>
);

export const SkillChip: React.FC<{ label: string; onDelete?: () => void; onClick?: () => void; sx?: any }> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={onDelete ? <Close sx={{ color: "rgba(6, 65, 96, 1)", fontSize: "16px", transition: "transform 0.2s ease", cursor: "pointer", "&:hover": { transform: "scale(1.2)" } }} /> : undefined}
    sx={{ backgroundColor: "rgba(96, 140, 163, 1)", color: "rgba(255, 255, 255, 1)", fontSize: "13px", fontWeight: 500, height: "29px", px: 0.5, "&:hover": { backgroundColor: "rgba(96, 140, 163, 0.8)" }, ...sx }}
  />
);
