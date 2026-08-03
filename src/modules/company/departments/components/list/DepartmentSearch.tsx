import React from "react";
import { useTranslation } from "react-i18next";
import { Search }         from "lucide-react";

interface DepartmentSearchProps {
  value:    string;
  onChange: (value: string) => void;
}

const DepartmentSearch: React.FC<DepartmentSearchProps> = ({ value, onChange }) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="mb-4 relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t("pages.departments.toolbar.search_placeholder_detail")}
        className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-input bg-white outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default DepartmentSearch;
