import { Chip } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { TEAL } from "./styles";

interface Props {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: any;
}

const SkillChip: React.FC<Props> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={onDelete ? <CloseOutlined sx={{ fontSize: "14px !important", color: "rgba(255,255,255,0.8)" }} /> : undefined}
    sx={{
      bgcolor: TEAL, color: "#fff",
      fontSize: "12px", fontWeight: 500,
      height: 28, borderRadius: "14px",
      "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } },
      "&:hover": { bgcolor: "#0F766E" },
      ...sx,
    }}
  />
);

export default SkillChip;
