import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import axiosInstance from "@/utils/axiosInstance";
import {
  useApplicationsSummaryQuery,
  useApplicationMetricsQuery,
} from "../queries";

const PAGE_SIZE = 15;

export function useApplicationsList() {
  const { t } = useTranslation("dashboard");
  const router = useRouter();

  const [searchInput, setSearchInput]     = useState("");
  const [search, setSearch]               = useState("");
  const [status, setStatus]               = useState("");
  const [postId, setPostId]               = useState("");
  const [postTitle, setPostTitle]         = useState("");
  const [sort, setSort]                   = useState("appliedAt_desc");
  const [page, setPage]                   = useState(1);
  const [downloading, setDownloading]     = useState(false);
  const [actionFilter, setActionFilter]   = useState("");

  // Deep-link support — e.g. arriving from the dashboard's "Take Action"
  // widget via /company/applications?actionFilter=pending_shortlist&postId=...
  useEffect(() => {
    if (!router.isReady) return;
    const { postId: qPostId, actionFilter: qActionFilter } = router.query;
    if (typeof qPostId === "string" && qPostId) setPostId(qPostId);
    if (typeof qActionFilter === "string" && qActionFilter) setActionFilter(qActionFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, status, postId, sort, actionFilter]);

  const params = {
    search: search || undefined, status: status || undefined, postId: postId || undefined,
    actionFilter: actionFilter || undefined, sort, page, limit: PAGE_SIZE,
  };

  const { data: summaryData, isLoading: loading } = useApplicationsSummaryQuery(params);
  const { data: metrics }                         = useApplicationMetricsQuery();

  const rows       = summaryData?.data       ?? [];
  const pagination = summaryData?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 };

  const handleDownloadCVs = useCallback(async () => {
    setDownloading(true);
    try {
      const p = new URLSearchParams();
      if (search)  p.set("search",  search);
      if (status)  p.set("status",  status);
      if (postId)  p.set("postId",  postId);
      const res = await axiosInstance.get(
        `job-applications/company/my/cvs/download${p.toString() ? `?${p}` : ""}`,
        { responseType: "blob" },
      );
      const url  = URL.createObjectURL(new Blob([res.data], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href     = url;
      link.download = "candidates_cvs.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t("pages.applications.no_cv_alert"));
    } finally {
      setDownloading(false);
    }
  }, [search, status, postId, t]);

  const clearPost = useCallback(() => { setPostId(""); setPostTitle(""); }, []);

  return {
    // filter state
    searchInput, setSearchInput,
    search, status, setStatus,
    postId, postTitle, setPostId, setPostTitle, clearPost,
    sort, setSort,
    page, setPage,
    actionFilter, setActionFilter,
    // data
    rows, pagination, metrics, loading,
    // actions
    downloading, handleDownloadCVs,
  };
}
