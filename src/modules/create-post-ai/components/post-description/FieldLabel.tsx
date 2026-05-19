import { Typography } from "@mui/material";

interface Props {
  icon?: React.ElementType;
  label: string;
}

const FieldLabel = ({ icon: Icon, label }: Props) => (
  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
    {Icon && <Icon sx={{ fontSize: 12 }} />}
    {label}
  </Typography>
);

export default FieldLabel;
