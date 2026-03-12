"use client";

import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  contractTypes,
  workModes,
} from "@/constants/candidate
import SalaryRange from "./SalaryRange";
import {
  generatePost,
  setEmploymentType,
  setExpirationDate,
  setPromptDescription,
  setWorkMode,
  updateSalaryField,
} from "@/store/slices/postGenerationSlice";
import { AppDispatch } from "@/store/store";
import SectionCard from "@/components/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const labelSx = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  mb: 0.5,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

const inputSx = {
  "& .MuiInputBase-root": {
    height: 40,
    fontSize: "13px",
    borderRadius: "8px",
    bgcolor: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
};

const PostDescription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { promptDescription, salary, workMode, employmentType, expirationDate } = useSelector(
    (state: any) => state.postGeneration
  );

  const [errors, setErrors] = useState({
    promptDescription: "",
    salary: "",
    employmentType: "",
    workMode: "",
  });

  const validateFields = () => {
    const newErrors: any = {};
    if (!promptDescription.trim()) newErrors.promptDescription = "Description is required";
    if (!salary.min || !salary.max || !salary.currency) {
      newErrors.salary = "Salary range is required";
    } else if (Number(salary.max) <= Number(salary.min)) {
      newErrors.salary = "Max salary must be greater than min salary";
    }
    if (!employmentType) newErrors.employmentType = "Employment type is required";
    if (!workMode) newErrors.workMode = "Work mode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validateFields()) return;
    dispatch(generatePost({ jobDescription: promptDescription, salary, workMode, contractType: employmentType }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <SectionCard sx={{ borderLeft: `4px solid ${TEAL}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <AutoAwesomeOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              AI Job Generator
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
              Describe your ideal candidate and let AI craft the perfect job post
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Prompt textarea */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Job Description Prompt
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#6B7280", mb: 1.5 }}>
          Describe the role, responsibilities, and ideal candidate in detail
        </Typography>
        <TextField
          value={promptDescription}
          onChange={(e) => {
            dispatch(setPromptDescription(e.target.value));
            if (errors.promptDescription) setErrors({ ...errors, promptDescription: "" });
          }}
          placeholder={`Example:\nWe are seeking a Senior Full Stack Developer.\n- 5+ years of React.js and Node.js\n- Strong TypeScript proficiency\n- Lead core product development`}
          multiline
          minRows={9}
          fullWidth
          error={!!errors.promptDescription}
          helperText={errors.promptDescription}
          sx={{
            "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px", bgcolor: "#FAFAFA" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
          }}
          FormHelperTextProps={{ sx: { ml: 0 } }}
        />
      </SectionCard>

      {/* Job settings */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>
          Job Settings
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={labelSx}>
              <WorkOutlined sx={{ fontSize: 14 }} />
              Employment Type
            </Typography>
            <TextField
              select fullWidth
              value={employmentType}
              onChange={(e) => {
                dispatch(setEmploymentType(e.target.value));
                if (errors.employmentType) setErrors({ ...errors, employmentType: "" });
              }}
              error={!!errors.employmentType}
              helperText={errors.employmentType}
              sx={inputSx}
              FormHelperTextProps={{ sx: { ml: 0 } }}
            >
              <MenuItem disabled value="" sx={{ fontSize: "13px" }}>Select type</MenuItem>
              {contractTypes.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{c}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={labelSx}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              Work Mode
            </Typography>
            <TextField
              select fullWidth
              value={workMode}
              onChange={(e) => {
                dispatch(setWorkMode(e.target.value));
                if (errors.workMode) setErrors({ ...errors, workMode: "" });
              }}
              error={!!errors.workMode}
              helperText={errors.workMode}
              sx={inputSx}
              FormHelperTextProps={{ sx: { ml: 0 } }}
            >
              <MenuItem disabled value="" sx={{ fontSize: "13px" }}>Select mode</MenuItem>
              {workModes.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <SalaryRange
          salaryRange={salary}
          onSalaryChange={(field, value) => {
            dispatch(updateSalaryField({ field, value }));
            if (errors.salary) setErrors({ ...errors, salary: "" });
          }}
        />
        {errors.salary && (
          <Typography sx={{ fontSize: "12px", color: "#EF4444", mt: 0.5 }}>{errors.salary}</Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography sx={labelSx}>
            <CalendarTodayOutlined sx={{ fontSize: 14 }} />
            Expiration Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={expirationDate ? new Date(expirationDate) : null}
              onChange={(date) => { if (date) dispatch(setExpirationDate(date.toISOString())); }}
              minDate={new Date()}
              slotProps={{ textField: { fullWidth: true, sx: inputSx } }}
            />
          </LocalizationProvider>
        </Box>
      </SectionCard>

      {/* Generate CTA */}
      <Button
        variant="contained"
        onClick={handleGenerate}
        startIcon={<AutoAwesomeOutlined />}
        sx={{
          textTransform: "none", fontWeight: 700, fontSize: "14px",
          borderRadius: "38px", height: 44,
          bgcolor: TEAL, boxShadow: "none",
          "&:hover": { bgcolor: "#0F766E" },
        }}
      >
        Generate Job Post with AI
      </Button>
    </Box>
  );
};

export default PostDescription;
