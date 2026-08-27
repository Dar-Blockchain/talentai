import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import {
  fetchPermissionsMatrix, CATEGORY_ORDER, CATEGORY_META, CoverageCell,
  type MatrixEmployee,
} from "@/modules/company/dashboard/components/team/permissionsMatrixShared";

const PAGE_SIZE = 20;

const PermissionsMatrixPage: NextPageWithLayout = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 350);
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["permissionsMatrixPage", page, debouncedSearch],
    queryFn: () => fetchPermissionsMatrix(page, PAGE_SIZE, debouncedSearch),
    staleTime: 30_000,
  });

  const employees: MatrixEmployee[] = data?.employees ?? [];
  const pagination = data?.pagination as { total: number; page: number; limit: number; pages: number } | undefined;
  const isEmpty = !isLoading && employees.length === 0;

  return (
    <>
      <PageHeader
        title={t("pages.permissions_matrix.title", "Permissions Matrix")}
        subtitle={t("pages.permissions_matrix.subtitle", "Access coverage by category, across every employee")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.permissions_matrix.title", "Permissions Matrix") },
        ]}
      />

      <div className="w-full">
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("pages.permissions_matrix.search_placeholder", "Search by name or email…")}
            className="pl-8 h-9 text-[13px]"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((k) => <Skeleton key={k} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : isEmpty ? (
          <div className="h-[240px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <span className="text-[0.85rem] text-slate-400">
              {debouncedSearch
                ? t("pages.permissions_matrix.no_results", "No employees match your search")
                : t("team.permissions_matrix.empty", "No employees yet")}
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide py-2.5 px-3">
                    {t("team.permissions_matrix.employee", "Employee")}
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide py-2.5 px-2">
                    {t("pages.permissions_matrix.role", "Role")}
                  </th>
                  {CATEGORY_ORDER.map((cat) => (
                    <th key={cat} className="text-center text-[10.5px] font-semibold text-slate-400 py-2.5 px-1 whitespace-nowrap">
                      {t(CATEGORY_META[cat].shortKey, CATEGORY_META[cat].shortFallback)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.userId ?? emp.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3 max-w-[180px]">
                      <button
                        type="button"
                        onClick={() => emp.userId && router.push(`/company/employees/${emp.userId}`)}
                        className="cursor-pointer text-[12.5px] font-semibold text-slate-700 hover:text-indigo-600 hover:underline underline-offset-2 truncate block max-w-full text-left"
                        title={emp.name}
                      >
                        {emp.name}
                      </button>
                    </td>
                    <td className="py-2 px-2 text-[11.5px] text-slate-500 whitespace-nowrap">{emp.role}</td>
                    {CATEGORY_ORDER.map((cat) => (
                      <td key={cat} className="py-2 px-1">
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

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-[12px] text-slate-500">
              {t("pages.permissions_matrix.page_of", "Page {{page}} of {{pages}} · {{total}} employees", {
                page: pagination.page, pages: pagination.pages, total: pagination.total,
              })}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline" size="icon-sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} />
              </Button>
              <Button
                variant="outline" size="icon-sm"
                disabled={page >= pagination.pages || isFetching}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              >
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
PermissionsMatrixPage.getLayout = getDashboardLayout;

export default PermissionsMatrixPage;
