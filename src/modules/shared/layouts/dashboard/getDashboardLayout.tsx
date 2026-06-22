import type { ReactElement } from "react";
import DashboardLayout from "./DashboardLayout";

/**
 * Shared `getLayout` implementation for every page that uses the company/employee
 * dashboard shell. Pages assign this directly:
 *
 *   MyPage.getLayout = getDashboardLayout;
 *
 * Using the SAME function reference (not a new arrow function per page) means
 * `_app.tsx` calls an identical `getLayout`, so the `<DashboardLayout>` element
 * it returns has a stable type + position across navigations. React reconciles
 * it as the same component instance instead of unmounting/remounting it —
 * only `children` (the page content) changes.
 */
export function getDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}
