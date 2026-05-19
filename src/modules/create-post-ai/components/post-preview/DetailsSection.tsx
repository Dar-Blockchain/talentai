import { Box, MenuItem, TextField, Typography } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateJobField, updateJobSalaryField } from "../../store/createPostSlice";
import { contractTypes, workModes, experienceLevels } from "@/constants/candidate";
import { EMPLOYMENT_OPTION_KEY, EXPERIENCE_OPTION_KEY, WORK_MODE_OPTION_KEY, optionLabel } from "@/utils/postFormI18n";
import SectionCard from "@/components/ui/SectionCard";
import SalaryRange from "../SalaryRange";
import { labelSx, inputSx } from "./styles";

interface Props {
  title: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salary: { min: number | string; max: number | string; currency: string };
  labelT: (key: string) => string;
}

const DetailsSection = ({ title, employmentType, workMode, experienceLevel, salary, labelT }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <SectionCard>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>{t("create.preview.section_details")}</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography sx={labelSx}>{t("create.preview.label_title")}</Typography>
        <TextField fullWidth value={title} onChange={(e) => dispatch(updateJobField({ field: "title", value: e.target.value }))} sx={inputSx} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
        <Box>
          <Typography sx={labelSx}><WorkOutlined sx={{ fontSize: 14 }} />{t("create.post_form.labels.employment_type")}</Typography>
          <TextField select fullWidth value={employmentType} onChange={(e) => dispatch(updateJobField({ field: "employmentType", value: e.target.value }))} sx={inputSx}>
            <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_employment_type")}</Typography></MenuItem>
            {contractTypes.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{optionLabel(labelT as any, c, EMPLOYMENT_OPTION_KEY)}</MenuItem>)}
          </TextField>
        </Box>
        <Box>
          <Typography sx={labelSx}><LocationOnOutlined sx={{ fontSize: 14 }} />{t("create.post_form.labels.work_mode")}</Typography>
          <TextField select fullWidth value={workMode} onChange={(e) => dispatch(updateJobField({ field: "workMode", value: e.target.value }))} sx={inputSx}>
            <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_work_mode")}</Typography></MenuItem>
            {workModes.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{optionLabel(labelT as any, m, WORK_MODE_OPTION_KEY)}</MenuItem>)}
          </TextField>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={labelSx}><TrendingUpIcon sx={{ fontSize: 14 }} />{t("create.post_form.labels.experience_level")}</Typography>
        <TextField select fullWidth value={experienceLevel} onChange={(e) => dispatch(updateJobField({ field: "experienceLevel", value: e.target.value }))} sx={inputSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment> }}
        >
          <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_experience_level")}</Typography></MenuItem>
          {experienceLevels.map((l) => <MenuItem key={l} value={l} sx={{ fontSize: "13px" }}>{optionLabel(labelT as any, l, EXPERIENCE_OPTION_KEY)}</MenuItem>)}
        </TextField>
      </Box>

      <SalaryRange salaryRange={salary as any} onSalaryChange={(field, value) => dispatch(updateJobSalaryField({ field, value }))} />
    </SectionCard>
  );
};

export default DetailsSection;
