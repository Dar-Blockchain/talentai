import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Building2, SearchX } from "lucide-react";
import { Button }         from "@/modules/shared/ui/shadcn/button";
import { Department }     from "../../types";

interface DepartmentEmptyStateProps {
  departments:   Department[];
  loading:       boolean;
  search:        string;
  onCreateClick: () => void;
  canManage?:    boolean;
}

const DepartmentEmptyState: React.FC<DepartmentEmptyStateProps> = ({
  departments, loading, search, onCreateClick, canManage = true,
}) => {
  const { t } = useTranslation("dashboard");

  if (loading || departments.length > 0) return null;

  const isFiltered = Boolean(search);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-dashed border-gray-200 rounded-2xl text-center">
      <div className={`size-16 rounded-2xl flex items-center justify-center mb-5 ${
        isFiltered ? "bg-secondary/10 border border-secondary/20" : "bg-primary/10 border border-primary/20"
      }`}>
        {isFiltered
          ? <SearchX className="size-7 text-secondary" />
          : <Building2 className="size-7 text-primary" />
        }
      </div>

      <p className="text-base font-bold text-foreground mb-1.5">
        {isFiltered
          ? t("pages.departments.empty.title_filtered")
          : t("pages.departments.empty.title_none")}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        {isFiltered
          ? t("pages.departments.empty.hint_filtered", { query: search })
          : t("pages.departments.empty.hint_none")}
      </p>

      {!isFiltered && canManage && (
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          {t("pages.departments.empty.create_cta")}
        </Button>
      )}
    </div>
  );
};

export default DepartmentEmptyState;
