import React from "react";
import AppButton from "@/components/ui/AppButton";
import { Add as AddIcon } from "@mui/icons-material";

interface Props {
  onClick: () => void;
}

const btnSx = {
  height: "29px",
  border: "0.5px dashed rgba(98,111,134,1)",
  backgroundColor: "rgba(48,185,216,0.06)",
  color: "rgba(95,168,211,1)",
  fontWeight: 500,
  borderRadius: "15px",
  py: 1.5,
  textTransform: "none" as const,
  fontSize: "13px",
  "&:hover": { backgroundColor: "rgba(77,217,163,0.08)" },
  "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
};

const EditAddSkillButton: React.FC<Props> = ({ onClick }) => (
  <AppButton
    label="Add Skill"
    variant="outlined"
    startIcon={<AddIcon sx={{ color: "rgba(98,111,134,1)", width: "16px", height: "16px" }} />}
    onClick={onClick}
    sx={btnSx}
  />
);

export default EditAddSkillButton;
