import React from "react";
import { Chip } from "@mui/material";
import { X as Close } from "lucide-react";

interface Props {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: object;
}

const EditSkillChip: React.FC<Props> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={
      onDelete ? (
        <Close
          size={16}
          color="rgba(6,65,96,1)"
          className="cursor-pointer transition-transform duration-200 hover:scale-125"
        />
      ) : undefined
    }
    sx={{
      backgroundColor: "rgba(96,140,163,1)", color: "#fff",
      fontSize: "13px", fontWeight: 500, height: "29px", px: 0.5,
      "&:hover": { backgroundColor: "rgba(96,140,163,0.8)" },
      ...sx,
    }}
  />
);

export default EditSkillChip;
