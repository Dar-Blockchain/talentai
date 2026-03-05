import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import TitleOutlined from "@mui/icons-material/TitleOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  contractTypes,
  workModes,
} from "@/components/features/preferences/data/candidateData";
import SalaryRange from "./SalaryRange";
import {
  updateJobDetails,
  updateLinkedinPost,
  setManualExpirationDate,
} from "@/store/slices/manualPostSlice";
import { useEffect } from "react";
import SectionCard from "@/components/ui/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const INDIGO      = "#6366F1";

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

const ManualPostForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const manualPost = useSelector((state: any) => state.manualPost);
  const {
    jobDetails: { title, employmentType, location, salary },
    expirationDate,
  } = manualPost;

  const handleSalaryChange = (field: "min" | "max" | "currency", value: number | string) => {
    dispatch(updateJobDetails({ salary: { ...salary, [field]: value } }));
  };

  useEffect(() => {
    dispatch(updateJobDetails({
      description: `${title} - ${employmentType} position. ${location} work arrangement. Competitive salary package offered.`,
    }));
    dispatch(updateLinkedinPost({
      formattedContent: {
        headline: `We're Hiring: ${title}`,
        introduction: `Exciting opportunity for a ${title}`,
        companyPitch: "Join our innovative team",
        roleOverview: `As a ${title}, you'll be at the heart of our team`,
        keyPoints: [
          `${location} work`,
          `${employmentType} position`,
          `Salary: ${salary?.currency}${salary?.min?.toLocaleString()} - ${salary?.currency}${salary?.max?.toLocaleString()}`,
        ],
        skillsRequired: "To be defined in recruitment pipeline",
        benefitsSection: "Competitive salary and benefits package",
        callToAction: "Apply now to join our team!",
      },
      hashtags: ["#Hiring", "#JobOpening", `#${title.replace(/\s+/g, "")}`],
      formatting: {
        emojis: { company: "🏢", location: "📍", salary: "💰", requirements: "📋", skills: "💻", benefits: "🎯", apply: "✨" },
      },
      finalPost: `We're Hiring: ${title}\n\n${location} | ${employmentType}\nSalary: ${salary?.currency}${salary?.min?.toLocaleString()} - ${salary?.currency}${salary?.max?.toLocaleString()}`,
    }));
  }, [title, employmentType, location, salary]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 720, mx: "auto" }}>
      {/* Header */}
      <SectionCard sx={{ borderLeft: `4px solid ${INDIGO}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#EEF2FF", border: "1px solid #C7D2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AccountTreeOutlined sx={{ fontSize: 20, color: INDIGO }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              Custom Pipeline Post
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
              Fill in your job details — you'll build the recruitment flow in the next step
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Job details card */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>
          Job Information
        </Typography>

        {/* Title */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>
            <TitleOutlined sx={{ fontSize: 14 }} />
            Job Title
          </Typography>
          <TextField
            fullWidth value={title}
            onChange={(e) => dispatch(updateJobDetails({ title: e.target.value }))}
            placeholder="e.g. Senior Frontend Developer"
            sx={inputSx}
          />
        </Box>

        {/* Employment + Work mode */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={labelSx}>
              <WorkOutlined sx={{ fontSize: 14 }} />
              Employment Type
            </Typography>
            <TextField
              select fullWidth value={employmentType}
              onChange={(e) => dispatch(updateJobDetails({ employmentType: e.target.value }))}
              sx={inputSx}
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
              select fullWidth value={location}
              onChange={(e) => dispatch(updateJobDetails({ location: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem disabled value="" sx={{ fontSize: "13px" }}>Select mode</MenuItem>
              {workModes.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Salary */}
        <SalaryRange salaryRange={salary} onSalaryChange={handleSalaryChange} />

        {/* Expiration date */}
        <Box sx={{ mt: 2 }}>
          <Typography sx={labelSx}>
            <CalendarTodayOutlined sx={{ fontSize: 14 }} />
            Expiration Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={expirationDate ? new Date(expirationDate) : null}
              onChange={(date) => { if (date) dispatch(setManualExpirationDate(date.toISOString())); }}
              minDate={new Date()}
              slotProps={{ textField: { fullWidth: true, sx: inputSx } }}
            />
          </LocalizationProvider>
        </Box>
      </SectionCard>

      {/* Next step hint */}
      <SectionCard sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AccountTreeOutlined sx={{ fontSize: 20, color: TEAL }} />
          <Typography sx={{ fontSize: "12px", color: "#0F766E" }}>
            After saving, you'll design your custom recruitment pipeline with evaluation steps.
          </Typography>
        </Box>
      </SectionCard>
    </Box>
  );
};

export default ManualPostForm;
