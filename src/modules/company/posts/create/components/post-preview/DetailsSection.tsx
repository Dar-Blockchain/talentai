import { TrendingUp as TrendingUpIcon, Briefcase as WorkOutlined, MapPin as LocationOnOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateJobField, updateJobSalaryField } from "../../store/createPostSlice";
import { contractTypes, workModes, experienceLevels } from "@/modules/company/posts/shared/constants";
import { EMPLOYMENT_OPTION_KEY, EXPERIENCE_OPTION_KEY, WORK_MODE_OPTION_KEY, optionLabel } from "../../utils";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import SalaryRange from "../SalaryRange";

interface Props {
  title: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salary: { min: number | string; max: number | string; currency: string };
  labelT: (key: string) => string;
}

const DetailsSection = ({ title, employmentType, workMode, experienceLevel, salary, labelT }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <Card className="p-6 gap-0">
      <p className="mb-4 text-[13px] font-bold text-[#111827]">{t("create.preview.section_details")}</p>

      <div className="mb-4">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">{t("create.preview.label_title")}</p>
        <Input
          value={title}
          onChange={(e) => dispatch(updateJobField({ field: "title", value: e.target.value }))}
          className="h-10 text-[13px]"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">
            <WorkOutlined size={14} />
            {t("create.post_form.labels.employment_type")}
          </p>
          <Select value={employmentType} onValueChange={(v) => dispatch(updateJobField({ field: "employmentType", value: v }))}>
            <SelectTrigger className="h-10 text-[13px]">
              <SelectValue placeholder={t("create.post_form.placeholders.select_employment_type")} />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((c) => (
                <SelectItem key={c} value={c} className="text-[13px]">
                  {optionLabel(labelT as any, c, EMPLOYMENT_OPTION_KEY)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">
            <LocationOnOutlined size={14} />
            {t("create.post_form.labels.work_mode")}
          </p>
          <Select value={workMode} onValueChange={(v) => dispatch(updateJobField({ field: "workMode", value: v }))}>
            <SelectTrigger className="h-10 text-[13px]">
              <SelectValue placeholder={t("create.post_form.placeholders.select_work_mode")} />
            </SelectTrigger>
            <SelectContent>
              {workModes.map((m) => (
                <SelectItem key={m} value={m} className="text-[13px]">
                  {optionLabel(labelT as any, m, WORK_MODE_OPTION_KEY)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">
          <TrendingUpIcon size={14} />
          {t("create.post_form.labels.experience_level")}
        </p>
        <Select value={experienceLevel} onValueChange={(v) => dispatch(updateJobField({ field: "experienceLevel", value: v }))}>
          <SelectTrigger className="h-10 text-[13px]">
            <TrendingUpIcon size={16} className="text-[#9CA3AF]" />
            <SelectValue placeholder={t("create.post_form.placeholders.select_experience_level")} />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((l) => (
              <SelectItem key={l} value={l} className="text-[13px]">
                {optionLabel(labelT as any, l, EXPERIENCE_OPTION_KEY)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SalaryRange salaryRange={salary as any} onSalaryChange={(field, value) => dispatch(updateJobSalaryField({ field, value }))} employmentType={employmentType} />
    </Card>
  );
};

export default DetailsSection;
