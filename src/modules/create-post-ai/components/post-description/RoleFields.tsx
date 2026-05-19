import { Box, MenuItem, TextField, Typography } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { useTranslation } from "react-i18next";
import { contractTypes, workModes } from "@/constants/candidate";
import { EMPLOYMENT_OPTION_KEY, optionLabel, WORK_MODE_OPTION_KEY } from "@/utils/postFormI18n";
import FieldLabel from "./FieldLabel";
import SectionLabel from "./SectionLabel";
import { fieldSx } from "./styles";

interface Props {
  employmentType: string;
  workMode: string;
  expirationDate: string | null;
  errors: { employmentType: string; workMode: string };
  onEmploymentChange: (val: string) => void;
  onWorkModeChange: (val: string) => void;
  onExpirationChange: (val: string) => void;
}

const RoleFields = ({ employmentType, workMode, expirationDate, errors, onEmploymentChange, onWorkModeChange, onExpirationChange }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <Box>
      <SectionLabel>{t("create.form.section_role")}</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
        <Box>
          <FieldLabel icon={WorkOutlined} label={t("create.post_form.labels.employment_type")} />
          <TextField select fullWidth value={employmentType} onChange={(e) => onEmploymentChange(e.target.value)} error={!!errors.employmentType} sx={fieldSx}>
            <MenuItem disabled value="" sx={{ fontSize: "12px" }}>{t("create.post_form.placeholders.select_employment_type")}</MenuItem>
            {contractTypes.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: "12px" }}>{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</MenuItem>)}
          </TextField>
          {errors.employmentType && <Typography sx={{ fontSize: "10.5px", color: "#EF4444", mt: 0.25 }}>{errors.employmentType}</Typography>}
        </Box>

        <Box>
          <FieldLabel icon={LocationOnOutlined} label={t("create.post_form.labels.work_mode")} />
          <TextField select fullWidth value={workMode} onChange={(e) => onWorkModeChange(e.target.value)} error={!!errors.workMode} sx={fieldSx}>
            <MenuItem disabled value="" sx={{ fontSize: "12px" }}>{t("create.post_form.placeholders.select_work_mode")}</MenuItem>
            {workModes.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "12px" }}>{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</MenuItem>)}
          </TextField>
          {errors.workMode && <Typography sx={{ fontSize: "10.5px", color: "#EF4444", mt: 0.25 }}>{errors.workMode}</Typography>}
        </Box>

        <Box>
          <FieldLabel icon={CalendarTodayOutlined} label={t("create.post_form.labels.expires")} />
          <TextField
            type="date" fullWidth
            value={expirationDate ? new Date(expirationDate).toISOString().split("T")[0] : ""}
            onChange={(e) => { if (e.target.value) onExpirationChange(new Date(e.target.value).toISOString()); }}
            slotProps={{ htmlInput: { min: new Date().toISOString().split("T")[0] } }}
            sx={fieldSx}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RoleFields;
