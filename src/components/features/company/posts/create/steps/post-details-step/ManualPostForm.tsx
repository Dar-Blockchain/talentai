import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "@/lib/dayjs";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  contractTypes,
  workModes,
} from "@/constants/candidate";
import SalaryRange from "./SalaryRange";
import {
  updateJobDetails,
  updateLinkedinPost,
  setManualExpirationDate,
} from "@/store/slices/manualPostSlice";
import { useEffect } from "react";
import SectionCard from "@/components/ui/SectionCard";
import { useTranslation } from "react-i18next";
import { EMPLOYMENT_OPTION_KEY, WORK_MODE_OPTION_KEY, optionLabel } from "@/utils/postFormI18n";

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
  const { t } = useTranslation("posts");
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
              {t("create.post_form.manual.header_title")}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
              {t("create.post_form.manual.header_subtitle")}
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Job details card */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>
          {t("create.post_form.manual.section_job_info")}
        </Typography>

        {/* Title */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>
            {t("create.post_form.manual.job_title")}
          </Typography>
          <TextField
            fullWidth value={title}
            onChange={(e) => dispatch(updateJobDetails({ title: e.target.value }))}
            placeholder={t("create.post_form.manual.job_title_placeholder")}
            sx={inputSx}
          />
        </Box>

        {/* Employment + Work mode */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={labelSx}>
              <WorkOutlined sx={{ fontSize: 14 }} />
              {t("create.post_form.labels.employment_type")}
            </Typography>
            <TextField
              select fullWidth value={employmentType}
              onChange={(e) => dispatch(updateJobDetails({ employmentType: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem disabled value="" sx={{ fontSize: "13px" }}>{t("create.post_form.placeholders.select_employment_type")}</MenuItem>
              {contractTypes.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={labelSx}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              {t("create.post_form.labels.work_mode")}
            </Typography>
            <TextField
              select fullWidth value={location}
              onChange={(e) => dispatch(updateJobDetails({ location: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem disabled value="" sx={{ fontSize: "13px" }}>{t("create.post_form.placeholders.select_work_mode")}</MenuItem>
              {workModes.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</MenuItem>
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
            {t("create.post_form.manual.expiration_date")}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={expirationDate ? dayjs(expirationDate) : null}
              onChange={(date) => { if (date) dispatch(setManualExpirationDate(date.toISOString())); }}
              minDate={dayjs()}
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
            {t("create.post_form.manual.next_step_hint")}
          </Typography>
        </Box>
      </SectionCard>
    </Box>
  );
};

export default ManualPostForm;
