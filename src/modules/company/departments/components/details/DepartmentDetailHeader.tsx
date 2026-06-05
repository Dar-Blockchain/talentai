import React, { useMemo }  from "react";
import { useRouter }        from "next/router";
import { useTranslation }   from "react-i18next";
import { ArrowLeft, Pencil, Trash2, Building2, Users, Calendar } from "lucide-react";
import { Department }       from "../../types";
import { Skeleton }         from "@/modules/shared/ui/shadcn/skeleton";
import { Button }           from "@/modules/shared/ui/shadcn/button";

const PURPLE = "#BD85FF";

function formatDetailDate(iso: string, locale: string) {
  const loc = locale.startsWith("fr") ? "fr-FR" : "en-US";
  return new Date(iso).toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

interface DepartmentDetailHeaderProps {
  department:     Department | null;
  loading:        boolean;
  membersTotal:   number;
  loadingMembers: boolean;
  onEdit:         () => void;
  onDelete:       () => void;
  canEdit?:       boolean;
  canDelete?:     boolean;
}

const DepartmentDetailHeader: React.FC<DepartmentDetailHeaderProps> = ({
  department, loading, membersTotal, loadingMembers,
  onEdit, onDelete, canEdit = true, canDelete = true,
}) => {
  const router         = useRouter();
  const { t, i18n }   = useTranslation("dashboard");

  const createdLine = useMemo(() => {
    if (!department?.createdAt) return "—";
    const dateStr = formatDetailDate(department.createdAt, i18n.language);
    return t("pages.departments.detail.created", { date: dateStr });
  }, [department?.createdAt, i18n.language, t]);

  const memberLabel = useMemo(
    () => loadingMembers
      ? t("pages.departments.detail.loading_short")
      : t("pages.departments.detail.member_count", { count: membersTotal }),
    [loadingMembers, membersTotal, t],
  );

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-5"
      style={{ background: `linear-gradient(135deg, ${PURPLE}06 0%, transparent 50%)` }}
    >
      <div className="px-6 sm:px-8 pt-5 pb-6">

        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.push("/company/departments")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {t("pages.departments.detail.back")}
          </button>

          {department && (canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  size="sm" variant="ghost"
                  onClick={onEdit}
                  className="gap-1.5 border border-gray-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                >
                  <Pencil className="size-3.5" />
                  {t("pages.departments.detail.edit")}
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm" variant="ghost"
                  onClick={onDelete}
                  className="gap-1.5 border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300"
                >
                  <Trash2 className="size-3.5" />
                  {t("pages.departments.detail.delete")}
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-5">
            <Skeleton className="size-14 rounded-2xl shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-2/5 mb-2" />
              <Skeleton className="h-4 w-3/5 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
            </div>
          </div>
        ) : department && (
          <div className="flex items-center gap-5 flex-wrap">
            <div
              className="size-14 rounded-2xl shrink-0 flex items-center justify-center border"
              style={{ backgroundColor: `${PURPLE}10`, borderColor: `${PURPLE}20` }}
            >
              <Building2 className="size-7" style={{ color: PURPLE }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xl font-extrabold text-slate-900 leading-tight">{department.name}</p>
              {department.description && (
                <p className="text-[13px] text-slate-500 mt-1">{department.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  style={{ backgroundColor: `${PURPLE}0C`, borderColor: `${PURPLE}18`, color: PURPLE }}
                >
                  <Users className="size-2.5" />
                  {memberLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-400 font-medium">
                  <Calendar className="size-2.5" />
                  {createdLine}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDetailHeader;
