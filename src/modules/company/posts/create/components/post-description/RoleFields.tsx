import { Briefcase as WorkOutlined, MapPin as LocationOnOutlined, Calendar as CalendarTodayOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { contractTypes, workModes } from "@/modules/company/posts/shared/constants";
import { DatePicker } from "@/modules/shared/ui/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import { EMPLOYMENT_OPTION_KEY, optionLabel, WORK_MODE_OPTION_KEY } from "../../utils";
import FieldLabel from "./FieldLabel";
import SectionLabel from "./SectionLabel";

interface Props {
  employmentType: string;
  workMode: string;
  expirationDate: string | null;
  errors: { employmentType: string; workMode: string };
  onEmploymentChange: (val: string) => void;
  onWorkModeChange: (val: string) => void;
  onExpirationChange: (val: string) => void;
}

const RoleFields = ({ employmentType, workMode, expirationDate, errors, onEmploymentChange, onWorkModeChange, onExpirationChange }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <div>
      <SectionLabel>{t("create.form.section_role")}</SectionLabel>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel icon={WorkOutlined} label={t("create.post_form.labels.employment_type")} />
          <Select value={employmentType || undefined} onValueChange={onEmploymentChange}>
            <SelectTrigger className={cn("w-full", errors.employmentType && "border-red-500")}>
              <SelectValue placeholder={t("create.post_form.placeholders.select_employment_type")} />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((c) => (
                <SelectItem key={c} value={c}>{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employmentType && <p className="mt-0.5 text-[10.5px] text-[#EF4444]">{errors.employmentType}</p>}
        </div>

        <div>
          <FieldLabel icon={LocationOnOutlined} label={t("create.post_form.labels.work_mode")} />
          <Select value={workMode || undefined} onValueChange={onWorkModeChange}>
            <SelectTrigger className={cn("w-full", errors.workMode && "border-red-500")}>
              <SelectValue placeholder={t("create.post_form.placeholders.select_work_mode")} />
            </SelectTrigger>
            <SelectContent>
              {workModes.map((m) => (
                <SelectItem key={m} value={m}>{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.workMode && <p className="mt-0.5 text-[10.5px] text-[#EF4444]">{errors.workMode}</p>}
        </div>

        <div>
          <FieldLabel icon={CalendarTodayOutlined} label={t("create.post_form.labels.expires")} />
          <DatePicker
            value={expirationDate ?? ""}
            onChange={onExpirationChange}
            minDate={new Date()}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleFields;
