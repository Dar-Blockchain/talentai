import React from "react";
import { useTranslation } from "react-i18next";
import { Users as PeopleAltOutlined } from "lucide-react";

interface Props {
  hasFilters: boolean;
}

const ApplicationsEmptyState: React.FC<Props> = ({ hasFilters }) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-gray-200 bg-[#FAFAFA] py-20 text-center">
      <PeopleAltOutlined size={44} color="#D1D5DB" className="mx-auto mb-3" />
      <p className="mb-1 text-[14px] font-semibold text-gray-700">
        {hasFilters ? t("pages.applications.empty_filtered_title") : t("pages.applications.empty_no_apps_title")}
      </p>
      <p className="text-[13px] text-gray-400">
        {hasFilters ? t("pages.applications.empty_filtered_sub") : t("pages.applications.empty_no_apps_sub")}
      </p>
    </div>
  );
};

export default ApplicationsEmptyState;
