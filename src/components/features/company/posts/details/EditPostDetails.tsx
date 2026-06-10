import React, { memo, useCallback, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "@/lib/dayjs";
import {
  Box, Button, Chip, MenuItem, Slider, TextField, Typography,
} from "@mui/material";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Close } from "@mui/icons-material";
import { Add as AddIcon } from "@mui/icons-material";
import { getLevelFromNumber } from "@/utils/postHelpers";
import { selectCurrentJob, updatePost } from "@/store/slices/postSlice";
import { useToast } from "@/hooks/useToast";
import { validateEditPost } from "@/validations/postValidation";
import SalaryRange from "@/modules/posts/create/components/SalaryRange";
import SkillEditorModal from "@/modules/posts/create/components/SkillEditorModal";
import { contractTypes, experienceLevels, workModes } from "@/constants/candidate";

// ─── Static sx constants ──────────────────────────────────────────────────────

const INPUT_SX = {
  height: 40,
  "& .MuiInputBase-root": { height: 40, fontSize: "12px", fontWeight: 500 },
} as const;

const HEADER_ICON_SX  = { display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(13,148,136,0.1)", width: 45, height: 45, borderRadius: "5px" } as const;
const THRESH_ICON_SX  = { fontSize: 16, color: "#0D9488" } as const;
const BADGE_VAL_SX    = { fontSize: "16px", fontWeight: 800 } as const;
const SLIDER_MARK_SX  = { "& .MuiSlider-thumb": { width: 18, height: 18 }, "& .MuiSlider-markLabel": { fontSize: "11px", color: "#9CA3AF" } } as const;
const CANCEL_BTN_SX   = { border: "none", background: "none", color: "rgba(133, 169, 227, 1)", textDecoration: "none", "&:hover": { background: "none", color: "rgba(133, 169, 227, 0.8)" } } as const;
const SAVE_BTN_SX     = { textTransform: "none", height: "42px", width: "120px", borderRadius: "38px", background: "#0D9488", color: "white" } as const;
const ADD_SKILL_BTN_SX = {
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
} as const;

const SLIDER_MARKS = [
  { value: 0,   label: "0%" },
  { value: 50,  label: "50%" },
  { value: 100, label: "100%" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  expirationDate: job?.expirationDate || "",
  thresholdScore: job?.thresholdScore ?? 50,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const AddSkillButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button variant="outlined" startIcon={<AddIcon sx={{ color: "rgba(98, 111, 134, 1)", width: "16px", height: "16px" }} />} onClick={onClick} sx={ADD_SKILL_BTN_SX}>
    Add Skill
  </Button>
));
AddSkillButton.displayName = "AddSkillButton";

export const SkillChip = memo(({ label, onDelete, onClick, sx }: { label: string; onDelete?: () => void; onClick?: () => void; sx?: any }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={onDelete ? <Close sx={{ color: "rgba(6, 65, 96, 1)", fontSize: "16px", transition: "transform 0.2s ease", cursor: "pointer", "&:hover": { transform: "scale(1.2)" } }} /> : undefined}
    sx={{ backgroundColor: "rgba(96, 140, 163, 1)", color: "rgba(255, 255, 255, 1)", fontSize: "13px", fontWeight: 500, height: "29px", px: 0.5, "&:hover": { backgroundColor: "rgba(96, 140, 163, 0.8)" }, ...sx }}
  />
));
SkillChip.displayName = "SkillChip";

// ─── EditPostDetails ──────────────────────────────────────────────────────────

interface EditPostDetailsProps {
  onCancel: () => void;
  onSaveSuccess?: () => void;
}

const EditPostDetails = memo<EditPostDetailsProps>(({ onCancel, onSaveSuccess }) => {
  const dispatch   = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const job        = useSelector(selectCurrentJob);

  const [open,          setOpen]          = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedType,  setSelectedType]  = useState<"soft" | "hard">("hard");

  const { register, handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: getInitialValues(job),
  });

  useEffect(() => {
    if (job) reset(getInitialValues(job));
  }, [job, reset]);

  const salary: any        = watch("jobDetails.salary");
  const requiredSkills: any[] = watch("skillAnalysis.requiredSkills") || [];
  const softSkills: any[]     = watch("skillAnalysis.softSkills")     || [];

  const handleAdd = useCallback((type: "hard" | "soft") => {
    setSelectedIndex(null);
    setSelectedType(type);
    setOpen(true);
  }, []);

  const handleEdit = useCallback((index: number, type: "hard" | "soft") => {
    setSelectedIndex(index);
    setSelectedType(type);
    setOpen(true);
  }, []);

  const handleDeleteSkill = useCallback((index: number, type: "hard" | "soft") => {
    const field   = type === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = type === "hard" ? [...requiredSkills] : [...softSkills];
    updated.splice(index, 1);
    setValue(field as any, updated);
  }, [requiredSkills, softSkills, setValue]);

  const handleSaveSkill = useCallback((skill: any) => {
    const field   = selectedType === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = selectedType === "hard" ? [...requiredSkills] : [...softSkills];
    if (selectedIndex === null) updated.push(skill);
    else updated[selectedIndex] = skill;
    setValue(field as any, updated);
    setOpen(false);
  }, [selectedType, selectedIndex, requiredSkills, softSkills, setValue]);

  const handleCloseSkillModal = useCallback(() => setOpen(false), []);

  const handleAddHard = useCallback(() => handleAdd("hard"), [handleAdd]);
  const handleAddSoft = useCallback(() => handleAdd("soft"), [handleAdd]);

  const handleSalaryChange = useCallback(
    (field: string, value: any) => setValue(`jobDetails.salary.${field}` as any, value),
    [setValue],
  );

  const handleCancel = useCallback(() => {
    reset(getInitialValues(job));
    onCancel();
  }, [reset, job, onCancel]);

  const onSubmit = useCallback(async (values: any) => {
    if (!validateEditPost(values, showToast, job?.creationType)) return;
    try {
      await dispatch(updatePost({
        jobId: job?._id,
        jobData: {
          jobDetails:     values.jobDetails,
          skillAnalysis:  values.skillAnalysis,
          expirationDate: values.expirationDate || undefined,
          thresholdScore: values.thresholdScore,
        },
      })).unwrap();
      reset();
      onCancel();
      showToast({ message: "Post details updated successfully", severity: "success" });
      onSaveSuccess?.();
    } catch (err: any) {
      showToast({ message: err || "Failed to update post. Please try again.", severity: "error" });
    }
  }, [dispatch, job, reset, onCancel, onSaveSuccess, showToast]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={HEADER_ICON_SX}>
            <Image src="/icons/edit.svg" alt="file" width={25} height={25} />
          </Box>
          <Box>
            <Typography sx={{ color: "#0D9488", fontWeight: 600, fontSize: "20px" }}>Edit Job Post</Typography>
            <Typography sx={{ fontSize: "12px", color: "#546274" }}>Update the job details for this position</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography sx={{ color: "rgba(84, 98, 116, 1)", fontWeight: 600, fontSize: "20px" }}>Job Details</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Job Title</Typography>
            <TextField fullWidth variant="outlined" sx={INPUT_SX} {...register("jobDetails.title")} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Expiration Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="expirationDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                    minDate={dayjs()}
                    maxDate={job?.expirationDate ? dayjs(job.expirationDate) : undefined}
                    slotProps={{ textField: { fullWidth: true, sx: INPUT_SX } }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Work Mode</Typography>
          <Controller
            name="jobDetails.workMode"
            control={control}
            render={({ field }) => (
              <TextField select {...field} fullWidth sx={INPUT_SX}
                FormHelperTextProps={{ sx: { marginLeft: 0 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/building3.svg" alt="money" width={16} height={16} /></InputAdornment> }}>
                <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Work Mode</MenuItem>
                {workModes.map((mode) => <MenuItem key={mode} value={mode} sx={{ fontSize: "12px", fontWeight: 500 }}>{mode}</MenuItem>)}
              </TextField>
            )}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Employment Type</Typography>
            <Controller
              name="jobDetails.employmentType"
              control={control}
              render={({ field }) => (
                <TextField select {...field} fullWidth sx={INPUT_SX}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/bag.svg" alt="money" width={16} height={16} /></InputAdornment> }}
                  FormHelperTextProps={{ sx: { marginLeft: 0 } }}>
                  <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Employment Type</MenuItem>
                  {contractTypes.map((mode) => <MenuItem key={mode} value={mode} sx={{ fontSize: "12px", fontWeight: 500 }}>{mode}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: "42px", fontWeight: 500, fontSize: "12px", color: "rgba(84, 98, 116, 0.53)" }}>Experience Level</Typography>
            <Controller
              name="jobDetails.experienceLevel"
              control={control}
              render={({ field }) => (
                <TextField select {...field} fullWidth sx={INPUT_SX}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ color: "rgba(98, 111, 134, 1)", width: "16px", height: "14px" }} /></InputAdornment> }}>
                  <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Experience Level</MenuItem>
                  {experienceLevels.map((level) => <MenuItem key={level} value={level} sx={{ fontSize: "12px", fontWeight: 500 }}>{level}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>
        </Box>

        <SalaryRange
          salaryRange={salary}
          onSalaryChange={handleSalaryChange}
          employmentType={watch("jobDetails.employmentType")}
        />

        <Box sx={{ mt: 2 }}>
          {job?.creationType === "ai" && (
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
                  {requiredSkills.map((skill: any, index: number) => (
                    <SkillChip
                      key={index}
                      label={`${skill.name} (${getLevelFromNumber(skill.level)}) - ${skill.percentage}%`}
                      onDelete={() => handleDeleteSkill(index, "hard")}
                      onClick={() => handleEdit(index, "hard")}
                    />
                  ))}
                  <AddSkillButton onClick={handleAddHard} />
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Soft Skills</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {softSkills.map((skill: any, index: number) => (
                    <SkillChip
                      key={index}
                      label={`${skill.name} (${skill.level}/5) - ${skill.percentage}%`}
                      onDelete={() => handleDeleteSkill(index, "soft")}
                      onClick={() => handleEdit(index, "soft")}
                    />
                  ))}
                  <AddSkillButton onClick={handleAddSoft} />
                </Box>
              </Box>
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Description</Typography>
            <TextField placeholder="Job Description" multiline minRows={4} fullWidth
              sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }}
              {...register("jobDetails.description")} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Requirements</Typography>
            <Controller
              name="jobDetails.requirements"
              control={control}
              render={({ field }) => (
                <TextField
                  value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                  placeholder="Job Requirements" multiline minRows={4} fullWidth
                  sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "20px", fontWeight: 600 }}>Responsibilities</Typography>
            <Controller
              name="jobDetails.responsibilities"
              control={control}
              render={({ field }) => (
                <TextField
                  value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                  placeholder="Job Responsibilities" multiline minRows={4} fullWidth
                  sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      {/* Threshold Score */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TrackChangesOutlined sx={THRESH_ICON_SX} />
          <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "16px", fontWeight: 600 }}>
            Threshold Score
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "12px", color: "rgba(84, 98, 116, 0.7)", mb: 2 }}>
          Candidates scoring below this threshold are automatically flagged for review.
        </Typography>
        <Controller
          name="thresholdScore"
          control={control}
          render={({ field }) => {
            const color = field.value >= 70 ? "#16A34A" : field.value >= 40 ? "#D97706" : "#DC2626";
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Slider
                    value={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    min={0} max={100} step={5}
                    marks={SLIDER_MARKS}
                    sx={{ color, ...SLIDER_MARK_SX }}
                  />
                </Box>
                <Box sx={{ minWidth: 52, textAlign: "center", bgcolor: `${color}15`, border: `1px solid ${color}40`, borderRadius: 2, px: 1.5, py: 0.75 }}>
                  <Typography sx={{ ...BADGE_VAL_SX, color }}>{field.value}%</Typography>
                </Box>
              </Box>
            );
          }}
        />
      </Box>

      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedIndex === null ? "add" : "edit"}
          skillType={selectedType}
          index={selectedIndex}
          skill={selectedIndex !== null ? (selectedType === "hard" ? requiredSkills[selectedIndex] : softSkills[selectedIndex]) : null}
          onSave={handleSaveSkill}
          onClose={handleCloseSkillModal}
        />
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 4, pt: 3, borderTop: "1px solid #E5E7EB" }}>
        <Button variant="outlined" onClick={handleCancel} sx={CANCEL_BTN_SX}>Cancel</Button>
        <Button type="submit" variant="contained" sx={SAVE_BTN_SX}>Save</Button>
      </Box>
    </Box>
  );
});
EditPostDetails.displayName = "EditPostDetails";

export default EditPostDetails;
