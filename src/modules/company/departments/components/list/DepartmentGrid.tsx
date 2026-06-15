import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, Search } from "lucide-react";
import { Department }        from "../../types";
import DepartmentCard        from "./DepartmentCard";
import DepartmentSkeletonCard from "./DepartmentSkeletonCard";

interface DepartmentGridProps {
  departments: Department[];
  total:       number;
  loading:     boolean;
  search:      string;
  onSearch:    (val: string) => void;
  onEdit:      (dept: Department) => void;
  onDelete:    (dept: Department) => void;
  canManage?:  boolean;
}

const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  departments, total, loading, search, onSearch, onEdit, onDelete, canManage = true,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Building2 className="size-3.5 text-primary" />
          <span className="text-[13px] font-bold text-primary">
            {loading ? "—" : t("pages.departments.toolbar.department_count", { count: total })}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={t("pages.departments.toolbar.search_placeholder")}
            className="h-9 w-64 pl-8 pr-3 text-[13px] rounded-lg border border-input bg-white outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <DepartmentSkeletonCard key={i} />)
          : departments.map((dept, idx) => (
              <DepartmentCard
                key={dept._id}
                department={dept}
                index={idx}
                onEdit={onEdit}
                onDelete={onDelete}
                canManage={canManage}
              />
            ))}
      </div>
    </div>
  );
};

export default DepartmentGrid;
