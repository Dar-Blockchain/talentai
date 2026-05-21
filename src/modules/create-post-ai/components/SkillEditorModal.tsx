"use client";
import React from "react";
import { Dialog, DialogContent, Box } from "@mui/material";
import { useDispatch } from "react-redux";
import { editHardSkill, editSoftSkill, addHardSkill, addSoftSkill } from "../store/createPostSlice";
import ModalHeader from "./skill-editor/ModalHeader";
import SkillNameField from "./skill-editor/SkillNameField";
import LevelField from "./skill-editor/LevelField";
import PercentageField from "./skill-editor/PercentageField";
import ModalActions from "./skill-editor/ModalActions";

interface LocalSkill {
  name: string;
  level: string | number | null;
  percentage: number;
}

const DEFAULT_SKILL: LocalSkill = { name: "", level: null, percentage: 0 };

interface SkillEditorModalProps {
  open: boolean;
  mode: "add" | "edit";
  skillType: "hard" | "soft";
  skill?: LocalSkill;
  index?: number;
  onClose: () => void;
  onSave?: (skill: LocalSkill) => void;
}

const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  open, mode, skill, index, skillType, onClose, onSave,
}) => {
  const dispatch = useDispatch();
  const [localSkill, setLocalSkill] = React.useState<LocalSkill>(
    skill ?? DEFAULT_SKILL
  );

  React.useEffect(() => {
    setLocalSkill(skill ?? DEFAULT_SKILL);
  }, [open, skill]);

  const handleChange = (field: keyof LocalSkill, value: LocalSkill[keyof LocalSkill]) => {
    setLocalSkill((prev) => ({ ...prev, [field]: value }));
  };

  const isSaveDisabled =
    !localSkill.name?.trim() || !localSkill.level || localSkill.percentage == null;

  const handleSave = () => {
    const numericLevel = Number(localSkill.level);
    if (onSave) {
      onSave({ ...localSkill, level: numericLevel });
      onClose();
      return;
    }
    if (skillType === "hard") {
      const hardSkill = { name: localSkill.name, level: numericLevel, percentage: localSkill.percentage, category: "" };
      mode === "edit"
        ? dispatch(editHardSkill({ index: index!, updated: hardSkill }))
        : dispatch(addHardSkill(hardSkill));
    } else {
      const softSkill = { name: localSkill.name, level: numericLevel, percentage: localSkill.percentage };
      mode === "edit"
        ? dispatch(editSoftSkill({ index: index!, updated: softSkill }))
        : dispatch(addSoftSkill(softSkill));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <ModalHeader skillType={skillType} mode={mode} onClose={onClose} />

      <DialogContent sx={{ mt: 1 }}>
        <SkillNameField
          skillType={skillType}
          value={localSkill.name}
          onChange={(v) => handleChange("name", v)}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <LevelField
            skillType={skillType}
            value={localSkill.level}
            onChange={(v) => handleChange("level", v)}
          />
          <PercentageField
            value={localSkill.percentage}
            onChange={(v) => handleChange("percentage", v)}
          />
        </Box>
      </DialogContent>

      <ModalActions mode={mode} disabled={isSaveDisabled} onClose={onClose} onSave={handleSave} />
    </Dialog>
  );
};

export default SkillEditorModal;
