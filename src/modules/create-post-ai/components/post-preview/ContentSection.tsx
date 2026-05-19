import { Box, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateJobField, updateRequirements, updateResponsibilities } from "@/store/slices/postGenerationSlice";
import SectionCard from "@/components/ui/SectionCard";
import { labelSx, textareaSx } from "./styles";

interface Props {
  description: string;
  requirements: string[];
  responsibilities: string[];
}

const ContentSection = ({ description, requirements, responsibilities }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <SectionCard>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>{t("create.preview.section_content")}</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography sx={labelSx}>{t("create.preview.label_description")}</Typography>
        <TextField value={description} multiline minRows={4} fullWidth onChange={(e) => dispatch(updateJobField({ field: "description", value: e.target.value }))} sx={textareaSx} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={labelSx}>{t("create.preview.label_requirements")}</Typography>
        <TextField value={requirements.join("\n")} multiline minRows={4} fullWidth onChange={(e) => dispatch(updateRequirements(e.target.value))} sx={textareaSx} />
      </Box>

      <Box>
        <Typography sx={labelSx}>{t("create.preview.label_responsibilities")}</Typography>
        <TextField value={responsibilities.join("\n")} multiline minRows={4} fullWidth onChange={(e) => dispatch(updateResponsibilities(e.target.value))} sx={textareaSx} />
      </Box>
    </SectionCard>
  );
};

export default ContentSection;
