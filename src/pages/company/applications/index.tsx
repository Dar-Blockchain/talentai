import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { Box, Skeleton, Pagination, Typography } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  fetchCompanyApplications,
  fetchCompanyApplicationMetrics,
  selectApplications,
  selectAllApplications,
  selectApplicationMetrics,
  selectApplicationsLoading,
} from "@/store/slices/jobApplicationSlice";
import ApplicationMetrics from "@/components/features/company/applications/ApplicationMetrics";
import ApplicationFilters from "@/components/features/company/applications/ApplicationFilters";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";

const PAGE_SIZE = 8;

const ApplicationsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const applications = useSelector(selectApplications);
  const allApplications = useSelector(selectAllApplications);
  const metrics = useSelector(selectApplicationMetrics);
  const loading = useSelector(selectApplicationsLoading);

  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [postFilter, setPostFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchCompanyApplicationMetrics());
    dispatch(fetchCompanyApplications({}));
  }, [dispatch]);

  useEffect(() => {
    const params: { candidateName?: string; skill?: string; postId?: string } = {};
    if (nameSearch.trim()) params.candidateName = nameSearch.trim();
    if (skillSearch.trim()) params.skill = skillSearch.trim();
    if (postFilter !== "all") params.postId = postFilter;

    const timer = setTimeout(() => {
      dispatch(fetchCompanyApplications(params));
      setPage(1);
    }, nameSearch || skillSearch ? 400 : 0);

    return () => clearTimeout(timer);
  }, [nameSearch, skillSearch, postFilter, dispatch]);

  const postOptions = useMemo(() => {
    const seen = new Map<string, string>();
    allApplications.forEach((a) => {
      if (a.post?._id) seen.set(a.post._id, a.post.jobDetails?.title || a.post.title || a.post._id);
    });
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [allApplications]);

  const totalPages = Math.ceil(applications.length / PAGE_SIZE);
  const paged = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleClear = () => { setNameSearch(""); setSkillSearch(""); setPostFilter("all"); setPage(1); };

  return (
    <DashboardLayout>
      <PageHeader
        title="Applications"
        subtitle={loading ? "Loading..." : `${applications.length} applicant${applications.length !== 1 ? "s" : ""}`}
      />

      <ApplicationMetrics metrics={metrics} />

      <ApplicationFilters
        nameSearch={nameSearch}
        skillSearch={skillSearch}
        postFilter={postFilter}
        postOptions={postOptions}
        resultCount={applications.length}
        onNameChange={(v) => { setNameSearch(v); setPage(1); }}
        onSkillChange={(v) => { setSkillSearch(v); setPage(1); }}
        onPostChange={(v) => { setPostFilter(v); setPage(1); }}
        onClear={handleClear}
      />

      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={52} height={52} />
                <Box><Skeleton variant="text" width={130} height={18} /><Skeleton variant="text" width={90} height={13} /></Box>
              </Box>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1.5 }} />
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      ) : paged.length === 0 ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", py: 12, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WorkOutlineOutlined sx={{ fontSize: 32, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#374151", mb: 0.5 }}>No applications found</Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>Try adjusting your filters</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            {paged.map((app: any, i: number) => (
              <ApplicationCard
                key={app._id || i}
                app={app}
                index={(page - 1) * PAGE_SIZE + i}
                onClick={() => router.push(`/company/applications/${app._id}`)}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 500,
                    "&.Mui-selected": { bgcolor: "rgba(13,148,136,0.1)", color: "#0D9488", fontWeight: 700 },
                    "&:hover": { bgcolor: "#F3F4F6" },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ApplicationsPage;
