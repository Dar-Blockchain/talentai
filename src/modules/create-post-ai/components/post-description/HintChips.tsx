import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const HINT_CHIPS = [
  { icon: "🏢", key: "hint_company" },
  { icon: "🎯", key: "hint_role" },
  { icon: "📋", key: "hint_requirements" },
  { icon: "✅", key: "hint_responsibilities" },
  { icon: "💰", key: "hint_benefits" },
] as const;

const HintChips = () => {
  const { t } = useTranslation("posts");
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
      {HINT_CHIPS.map(({ icon, key }) => (
        <Box
          key={key}
          sx={{
            display: "flex", alignItems: "center", gap: 0.5,
            px: 1, py: 0.4,
            bgcolor: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: "20px", fontSize: "11px", color: "#166534",
            fontWeight: 500, whiteSpace: "nowrap",
          }}
        >
          <span>{icon}</span> {t(`create.form.${key}`)}
        </Box>
      ))}
    </Box>
  );
};

export default HintChips;
