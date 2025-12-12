"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { experienceLevels } from "@/components/preferences/data/candidateData";
import { useDispatch } from "react-redux";

import {
  editHardSkill,
  editSoftSkill,
  addHardSkill,
  addSoftSkill,
} from "@/store/slices/postGenerationSlice";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CloseIcon from "@mui/icons-material/Close";


interface SkillEditorModalProps {
  open: boolean;
  mode: "add" | "edit";
  skillType: "hard" | "soft";
  skill?: any;
  index?: number;
  onClose: () => void;
}

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": {
    height: 40,
  },
};

const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  open,
  mode,
  skill,
  index,
  skillType,
  onClose,
}) => {
  const dispatch = useDispatch();

  const [localSkill, setLocalSkill] = React.useState<any>(
    skill || { name: "", importance: "", percentage: 0 }
  );

  React.useEffect(() => {
    if (skill) setLocalSkill(skill);
  }, [skill]);

  const handleChange = (field: keyof any, value: any) => {
    setLocalSkill((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (skillType === "hard") {
      if (mode === "edit") {
        dispatch(
          editHardSkill({
            index: index!,
            updated: localSkill,
          })
        );
      } else {
        dispatch(addHardSkill(localSkill));
      }
    } else {
      if (mode === "edit") {
        dispatch(
          editSoftSkill({
            index: index!,
            updated: localSkill,
          })
        );
      } else {
        dispatch(addSoftSkill(localSkill));
      }
    }

    onClose();
  };

const titleText = `${mode === "edit" ? "Edit" : "Add New"} ${
  skillType === "hard" ? "Hard Skill" : "Soft Skill"
}`;

  const buttonText = mode === "edit" ? "Edit Skill" : "Add Skill";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(227, 229, 233, 1)",
          color: "black",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "rgba(41, 210, 145, 1)",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            {titleText}
          </Typography>

          <IconButton onClick={onClose} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        {/* Skill Name */}
        <Box sx={{ flex: 1, mb: 1 }}>
          <Typography
            sx={{
              lineHeight: "42px",
              fontWeight: 500,
              fontSize: "12px",
              color: "rgba(84, 98, 116, 0.53)",
            }}
          >
            Skill Name
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            value={localSkill.name}
            onChange={(e) => handleChange("name", e.target.value)}
            sx={inputStyle}
          />
        </Box>

        {/* Row */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Experience Level */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                lineHeight: "42px",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(84, 98, 116, 0.53)",
              }}
            >
              Experience Level
            </Typography>

            <TextField
              select
              value={localSkill.importance}
              onChange={(e) => handleChange("importance", e.target.value)}
              fullWidth
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUpIcon
                      sx={{
                        color: "rgba(98, 111, 134, 1)",
                        width: "16px",
                        height: "14px",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem disabled value="">
                Experience Level
              </MenuItem>

              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Percentage */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                lineHeight: "42px",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(84, 98, 116, 0.53)",
              }}
            >
              Percentage (%)
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              value={localSkill.percentage}
              onChange={(e) =>
                handleChange("percentage", Number(e.target.value))
              }
              sx={inputStyle}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            border: "none",
            background: "none",
            color: "rgba(133, 169, 227, 1)",
            "&:hover": {
              background: "none",
              color: "rgba(133, 169, 227, 0.8)",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="outlined"
          onClick={handleSave}
          sx={{
            width: 130,
            borderColor: "rgba(77, 217, 163, 1)",
            color: "rgba(77, 217, 163, 1)",
            fontWeight: 600,
            borderRadius: "38px",
            py: 1.5,
            height: "42px",
            textTransform: "none",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: "rgba(77, 217, 163, 0.08)",
            },
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkillEditorModal;
