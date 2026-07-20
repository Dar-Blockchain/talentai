import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateJobField, updateRequirements, updateResponsibilities } from "../../store/createPostSlice";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";

interface Props {
  description: string;
  requirements: string[];
  responsibilities: string[];
}

const ContentSection = ({ description, requirements, responsibilities }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <Card className="p-6 gap-0">
      <p className="mb-4 text-[13px] font-bold text-[#111827]">{t("create.preview.section_content")}</p>

      <div className="mb-4">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">{t("create.preview.label_description")}</p>
        <Textarea
          value={description}
          rows={4}
          onChange={(e) => dispatch(updateJobField({ field: "description", value: e.target.value }))}
          className="text-[13px]"
        />
      </div>

      <div className="mb-4">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">{t("create.preview.label_requirements")}</p>
        <Textarea
          value={requirements.join("\n")}
          rows={4}
          onChange={(e) => dispatch(updateRequirements(e.target.value))}
          className="text-[13px]"
        />
      </div>

      <div>
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#374151]">{t("create.preview.label_responsibilities")}</p>
        <Textarea
          value={responsibilities.join("\n")}
          rows={4}
          onChange={(e) => dispatch(updateResponsibilities(e.target.value))}
          className="text-[13px]"
        />
      </div>
    </Card>
  );
};

export default ContentSection;
