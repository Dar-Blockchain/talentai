import React, { useMemo }  from "react";
import { useTranslation }   from "react-i18next";
import { AlertTriangle }    from "lucide-react";
import { resolveDepartmentApiMessage } from "../../utils/departmentI18n";

interface DepartmentFetchErrorProps {
  error: string | null;
}

const DepartmentFetchError: React.FC<DepartmentFetchErrorProps> = ({ error }) => {
  const { t }   = useTranslation("dashboard");
  const message = useMemo(() => resolveDepartmentApiMessage(error, t), [error, t]);

  if (!message) return null;

  return (
    <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
      <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
};

export default DepartmentFetchError;
