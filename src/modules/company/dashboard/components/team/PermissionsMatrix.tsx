"use client";
import React, { memo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { KpiCard } from "../KpiAtoms";
import { fetchPermissionsMatrix, CATEGORY_ORDER, CATEGORY_META, CoverageCell, type MatrixEmployee } from "./permissionsMatrixShared";

const STALE = 60_000;
const WIDGET_LIMIT = 5;

const PermissionsMatrix = memo(() => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["teamDashboard", "permissionsMatrix"],
    queryFn: () => fetchPermissionsMatrix(1, WIDGET_LIMIT, ""),
    staleTime: STALE,
  });

  const employees: MatrixEmployee[] = data?.employees ?? [];
  const total = data?.pagination?.total ?? employees.length;
  const isEmpty = !isLoading && employees.length === 0;

  return (
    <KpiCard
      title={t("team.permissions_matrix.title", "Permissions Matrix")}
      subtitle={t("team.permissions_matrix.subtitle", "Access coverage by category, per employee")}
      headerFilter={!isEmpty && (
        <Button
          variant="ghost" size="xs"
          onClick={() => router.push("/company/permissions")}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
        >
          {t("team.permissions_matrix.show_all", "Show all ({{count}})", { count: total })}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-8 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
          <span className="text-[0.82rem] text-slate-400">{t("team.permissions_matrix.empty", "No employees yet")}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide pb-1.5 pr-2">
                  {t("team.permissions_matrix.employee", "Employee")}
                </th>
                {CATEGORY_ORDER.map((cat) => (
                  <th key={cat} className="text-center text-[9.5px] font-semibold text-slate-400 pb-1.5 px-0.5 whitespace-nowrap">
                    {t(CATEGORY_META[cat].shortKey, CATEGORY_META[cat].shortFallback)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.userId ?? emp.name} className="group">
                  <td className="py-1 pr-2 max-w-[120px]">
                    <button
                      type="button"
                      onClick={() => emp.userId && router.push(`/company/employees/${emp.userId}`)}
                      className="cursor-pointer text-[11.5px] font-semibold text-slate-700 hover:text-indigo-600 hover:underline underline-offset-2 truncate block max-w-full text-left"
                      title={emp.name}
                    >
                      {emp.name}
                    </button>
                  </td>
                  {CATEGORY_ORDER.map((cat) => (
                    <td key={cat} className="py-1 px-0.5">
                      <div className="flex justify-center">
                        <CoverageCell category={cat} coverage={emp.categories[cat]} flags={emp.flags} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </KpiCard>
  );
});
PermissionsMatrix.displayName = "PermissionsMatrix";
export default PermissionsMatrix;
