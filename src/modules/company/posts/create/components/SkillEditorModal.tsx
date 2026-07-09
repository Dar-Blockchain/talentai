"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
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
  }, [open, skill, mode]);

  const handleChange = (field: keyof LocalSkill, value: LocalSkill[keyof LocalSkill]) => {
    setLocalSkill((prev) => ({ ...prev, [field]: value }));
  };

  const isSaveDisabled =
    !localSkill.name?.trim() || !localSkill.level || !localSkill.percentage || localSkill.percentage <= 0;

  const handleSave = () => {
    if (mode === "edit" && index === undefined) return;
    const numericLevel = Number(localSkill.level);
    if (onSave) {
      onSave({ ...localSkill, level: numericLevel });
      onClose();
      return;
    }
    if (skillType === "hard") {
      const hardSkill = { name: localSkill.name, level: numericLevel, percentage: localSkill.percentage, category: "" };
      mode === "edit"
        ? dispatch(editHardSkill({ index: index as number, updated: hardSkill }))
        : dispatch(addHardSkill(hardSkill));
    } else {
      const softSkill = { name: localSkill.name, level: numericLevel, percentage: localSkill.percentage };
      mode === "edit"
        ? dispatch(editSoftSkill({ index: index as number, updated: softSkill }))
        : dispatch(addSoftSkill(softSkill));
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="rounded-2xl p-0 sm:max-w-md">
        <ModalHeader skillType={skillType} mode={mode} />

        <div className="flex flex-col gap-4 px-6 py-5">
          <SkillNameField
            skillType={skillType}
            value={localSkill.name}
            onChange={(v) => handleChange("name", v)}
          />

          <div className="flex gap-4">
            <LevelField
              skillType={skillType}
              value={localSkill.level}
              onChange={(v) => handleChange("level", v)}
            />
            <PercentageField
              value={localSkill.percentage}
              onChange={(v) => handleChange("percentage", v)}
            />
          </div>
        </div>

        <ModalActions mode={mode} disabled={isSaveDisabled} onClose={onClose} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
};

export default SkillEditorModal;
