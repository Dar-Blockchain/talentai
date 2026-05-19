"use client";
import React from "react";
import { Dialog, DialogContent, Box } from "@mui/material";
import { useDispatch } from "react-redux";
import { editHardSkill, editSoftSkill, addHardSkill, addSoftSkill } from "@/store/slices/postGenerationSlice";
import ModalHeader from "./skill-editor/ModalHeader";
import SkillNameField from "./skill-editor/SkillNameField";
import LevelField from "./skill-editor/LevelField";
import PercentageField from "./skill-editor/PercentageField";
import ModalActions from "./skill-editor/ModalActions";

interface SkillEditorModalProps {
  open: boolean;
  mode: "add" | "edit";
  skillType: "hard" | "soft";
  skill?: any;
  index?: number;
  onClose: () => void;
  onSave?: (skill: any) => void;
}

const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  open, mode, skill, index, skillType, onClose, onSave,
}) => {
  const dispatch = useDispatch();
  const [localSkill, setLocalSkill] = React.useState<any>(
    skill || { name: "", level: null, percentage: 0 }
  );

  React.useEffect(() => {
    if (skill) setLocalSkill(skill);
  }, [skill]);

  const handleChange = (field: string, value: any) => {
    setLocalSkill((prev: any) => ({ ...prev, [field]: value }));
  };

  const isSaveDisabled =
    !localSkill.name?.trim() || !localSkill.level || localSkill.percentage <= 0;

  const handleSave = () => {
    if (onSave) {
      onSave(localSkill);
      onClose();
      return;
    }
    if (skillType === "hard") {
      mode === "edit"
        ? dispatch(editHardSkill({ index: index!, updated: localSkill }))
        : dispatch(addHardSkill(localSkill));
    } else {
      mode === "edit"
        ? dispatch(editSoftSkill({ index: index!, updated: localSkill }))
        : dispatch(addSoftSkill(localSkill));
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
