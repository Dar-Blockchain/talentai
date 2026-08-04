import React from "react";
import { useTranslation } from "react-i18next";
import { Label }    from "@/modules/shared/ui/shadcn/label";
import { Input }    from "@/modules/shared/ui/shadcn/input";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { cn }       from "@/lib/utils";

export interface DeptFormFieldsProps {
  name:         string;
  description:  string;
  nameError:    string;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  apiError:     string | null;
}

const DeptFormFields: React.FC<DeptFormFieldsProps> = ({
  name, description, nameError, onNameChange, onDescChange, apiError,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const inputLang = i18n.language.startsWith("fr") ? "fr" : "en";

  return (
    <div className="flex flex-col gap-5">

      {apiError && (
        <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dept-name" className="text-sm font-semibold text-gray-700">
          {t("pages.departments.form.name_label")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dept-name"
          placeholder={t("pages.departments.form.name_placeholder")}
          value={name}
          onChange={e => onNameChange(e.target.value)}
          lang={inputLang}
          spellCheck
          className={cn(nameError && "border-destructive focus-visible:ring-destructive/30")}
        />
        {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dept-desc" className="text-sm font-semibold text-gray-700">
          {t("pages.departments.form.description_label")}
        </Label>
        <Textarea
          id="dept-desc"
          rows={3}
          placeholder={t("pages.departments.form.description_placeholder")}
          value={description}
          onChange={e => onDescChange(e.target.value)}
          maxLength={500}
          lang={inputLang}
          spellCheck
        />
        <p className="text-xs text-muted-foreground text-right">
          {t("pages.departments.form.character_count", { current: description.length })}
        </p>
      </div>

    </div>
  );
};

export default DeptFormFields;
