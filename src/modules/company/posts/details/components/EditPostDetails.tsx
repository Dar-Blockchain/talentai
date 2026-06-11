import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "@/lib/dayjs";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { selectCurrentJob, updatePost } from "@/store/slices/postSlice";
import { useToast } from "@/hooks/useToast";
import { validateEditPost } from "@/validations/postValidation";
import SalaryRange from "@/modules/company/posts/create/components/SalaryRange";
import SkillEditorModal from "@/modules/company/posts/create/components/SkillEditorModal";
import { contractTypes, experienceLevels, workModes } from "@/constants/candidate";
import AppButton from "@/components/ui/AppButton";
import EditSkillsSection from "./edit/EditSkillsSection";
import EditThresholdScore from "./edit/EditThresholdScore";

// ── Styles ────────────────────────────────────────────────────────────────────

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": { height: 40, fontSize: "12px", fontWeight: 500 },
};

const labelSx = {
  lineHeight: "42px", fontWeight: 500, fontSize: "12px",
  color: "rgba(84,98,116,0.53)",
} as const;

const sectionTitleSx = {
  color: "rgba(84,98,116,1)", fontWeight: 600, fontSize: "20px",
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const getInitialValues = (job: any) => ({
  jobDetails: {
    title:           job?.jobDetails?.title           || "",
    workMode:        job?.jobDetails?.workMode        || "",
    employmentType:  job?.jobDetails?.employmentType  || "",
    experienceLevel: job?.jobDetails?.experienceLevel || "",
    description:     job?.jobDetails?.description     || "",
    requirements:    job?.jobDetails?.requirements    || [],
    responsibilities: job?.jobDetails?.responsibilities || [],
    salary:          job?.jobDetails?.salary          || { min: 0, max: 0, currency: "USD" },
  },
  skillAnalysis:  job?.skillAnalysis  || {},
  expirationDate: job?.expirationDate || "",
  thresholdScore: job?.thresholdScore ?? 50,
});

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onCancel: () => void;
  onSaveSuccess?: () => void;
}

const EditPostDetails: React.FC<Props> = ({ onCancel, onSaveSuccess }) => {
  const dispatch      = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const job           = useSelector(selectCurrentJob);

  // Skill editor modal state
  const [open,          setOpen]          = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedType,  setSelectedType]  = useState<"soft" | "hard">("hard");

  const { register, handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: getInitialValues(job),
  });

  useEffect(() => { if (job) reset(getInitialValues(job)); }, [job, reset]);

  const salary:         any   = watch("jobDetails.salary");
  const requiredSkills: any[] = watch("skillAnalysis.requiredSkills") || [];
  const softSkills:     any[] = watch("skillAnalysis.softSkills")     || [];

  // ── Skill handlers ───────────────────────────────────────────────────────────

  const handleAdd = (type: "hard" | "soft") => {
    setSelectedIndex(null); setSelectedType(type); setOpen(true);
  };

  const handleEdit = (index: number, type: "hard" | "soft") => {
    setSelectedIndex(index); setSelectedType(type); setOpen(true);
  };

  const handleDelete = (index: number, type: "hard" | "soft") => {
    const field   = type === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = [...(type === "hard" ? requiredSkills : softSkills)];
    updated.splice(index, 1);
    setValue(field as any, updated);
  };

  const handleSaveSkill = (skill: any) => {
    const field   = selectedType === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = [...(selectedType === "hard" ? requiredSkills : softSkills)];
    if (selectedIndex === null) updated.push(skill);
    else updated[selectedIndex] = skill;
    setValue(field as any, updated);
    setOpen(false);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async (values: any) => {
    if (!validateEditPost(values, showToast, job?.creationType)) return;
    try {
      await dispatch(updatePost({
        jobId:   job?._id,
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
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box sx={{
          display: "flex", justifyContent: "center", alignItems: "center",
          background: "rgba(13,148,136,0.1)", width: 45, height: 45, borderRadius: "5px",
        }}>
          <Image src="/icons/edit.svg" alt="edit" width={25} height={25} />
        </Box>
        <Box>
          <Typography sx={{ color: "#0D9488", fontWeight: 600, fontSize: "20px" }}>Edit Job Post</Typography>
          <Typography sx={{ fontSize: "12px", color: "#546274" }}>Update the job details for this position</Typography>
        </Box>
      </Box>

      {/* ── Job Details Section ── */}
      <Box sx={{ mt: 1 }}>
        <Typography sx={sectionTitleSx}>Job Details</Typography>

        {/* Title + Expiration */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>Job Title</Typography>
            <TextField fullWidth variant="outlined" sx={inputStyle} {...register("jobDetails.title")} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>Expiration Date</Typography>
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
                    slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Work Mode */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={labelSx}>Work Mode</Typography>
          <Controller
            name="jobDetails.workMode"
            control={control}
            render={({ field }) => (
              <TextField select {...field} fullWidth sx={inputStyle}
                FormHelperTextProps={{ sx: { marginLeft: 0 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/building3.svg" alt="work mode" width={16} height={16} /></InputAdornment> }}
              >
                <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Work Mode</MenuItem>
                {workModes.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "12px", fontWeight: 500 }}>{m}</MenuItem>)}
              </TextField>
            )}
          />
        </Box>

        {/* Employment Type + Experience Level */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={labelSx}>Employment Type</Typography>
            <Controller
              name="jobDetails.employmentType"
              control={control}
              render={({ field }) => (
                <TextField select {...field} fullWidth sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Image src="/icons/bag.svg" alt="employment" width={16} height={16} /></InputAdornment> }}
                  FormHelperTextProps={{ sx: { marginLeft: 0 } }}
                >
                  <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Employment Type</MenuItem>
                  {contractTypes.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: "12px", fontWeight: 500 }}>{c}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={labelSx}>Experience Level</Typography>
            <Controller
              name="jobDetails.experienceLevel"
              control={control}
              render={({ field }) => (
                <TextField select {...field} fullWidth sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ color: "rgba(98,111,134,1)", width: 16, height: 14 }} /></InputAdornment> }}
                >
                  <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>Experience Level</MenuItem>
                  {experienceLevels.map((l) => <MenuItem key={l} value={l} sx={{ fontSize: "12px", fontWeight: 500 }}>{l}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>
        </Box>

        <SalaryRange
          salaryRange={salary}
          onSalaryChange={(field, value) => setValue(`jobDetails.salary.${field}` as any, value)}
          employmentType={watch("jobDetails.employmentType")}
        />

        {/* Skills (AI posts only) */}
        {job?.creationType === "ai" && (
          <Box sx={{ mt: 2 }}>
            <EditSkillsSection
              requiredSkills={requiredSkills}
              softSkills={softSkills}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        )}

        {/* Description */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>Description</Typography>
          <TextField
            placeholder="Job Description"
            multiline minRows={4} fullWidth
            sx={{ mt: 2, "& .MuiInputBase-root": { fontSize: "12px", fontWeight: 500 } }}
            {...register("jobDetails.description")}
          />
        </Box>

        {/* Requirements */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>Requirements</Typography>
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

        {/* Responsibilities */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>Responsibilities</Typography>
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

      {/* Threshold Score */}
      <EditThresholdScore control={control} />

      {/* Skill Editor Modal */}
      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedIndex === null ? "add" : "edit"}
          skillType={selectedType}
          index={selectedIndex}
          skill={selectedIndex !== null
            ? (selectedType === "hard" ? requiredSkills[selectedIndex] : softSkills[selectedIndex])
            : null}
          onSave={handleSaveSkill}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 4, pt: 3, borderTop: "1px solid #E5E7EB" }}>
        <AppButton
          label="Cancel"
          variant="text"
          onClick={() => { reset(getInitialValues(job)); onCancel(); }}
          sx={{ color: "rgba(133,169,227,1)", "&:hover": { bgcolor: "transparent", color: "rgba(133,169,227,0.8)" } }}
        />
        <AppButton
          label="Save"
          variant="contained"
          type="submit"
          sx={{ height: "42px", width: "120px", borderRadius: "38px" }}
        />
      </Box>
    </Box>
  );
};

export default EditPostDetails;

// ── Re-export SkillChip for backward compat (used by other files) ─────────────
export { default as SkillChip } from "./edit/EditSkillChip";
