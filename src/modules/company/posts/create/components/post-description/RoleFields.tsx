import { Briefcase as WorkOutlined, MapPin as LocationOnOutlined, Calendar as CalendarTodayOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { contractTypes, workModes } from "@/modules/company/posts/shared/constants";
import { DatePicker } from "@/modules/shared/ui/DatePicker";
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

const selectClasses =
  "h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-[12.5px] outline-none transition-colors hover:border-[#0D9488] focus:border-[#0D9488]";

const RoleFields = ({ employmentType, workMode, expirationDate, errors, onEmploymentChange, onWorkModeChange, onExpirationChange }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <div>
      <SectionLabel>{t("create.form.section_role")}</SectionLabel>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel icon={WorkOutlined} label={t("create.post_form.labels.employment_type")} />
          <select
            value={employmentType}
            onChange={(e) => onEmploymentChange(e.target.value)}
            className={cn(selectClasses, errors.employmentType && "border-red-500")}
          >
            <option disabled value="" className="text-[12px]">{t("create.post_form.placeholders.select_employment_type")}</option>
            {contractTypes.map((c) => (
              <option key={c} value={c} className="text-[12px]">{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</option>
            ))}
          </select>
          {errors.employmentType && <p className="mt-0.5 text-[10.5px] text-[#EF4444]">{errors.employmentType}</p>}
        </div>

        <div>
          <FieldLabel icon={LocationOnOutlined} label={t("create.post_form.labels.work_mode")} />
          <select
            value={workMode}
            onChange={(e) => onWorkModeChange(e.target.value)}
            className={cn(selectClasses, errors.workMode && "border-red-500")}
          >
            <option disabled value="" className="text-[12px]">{t("create.post_form.placeholders.select_work_mode")}</option>
            {workModes.map((m) => (
              <option key={m} value={m} className="text-[12px]">{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</option>
            ))}
          </select>
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
