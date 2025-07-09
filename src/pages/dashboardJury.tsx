import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, AppBar, Toolbar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProjects,
  selectTotalProjects,
  selectTotalPages,
  getProjectStats,
  selectProjectStats,
  getProjectTracks,
  selectProjectTracks,
  getProjectsByTrack,
  selectProjectsByTrack,
  getProjectsCreatedPerDay,
  selectProjectsCreatedPerDay,
  getProjectsCountByStatus,
  selectProjectsCountByStatus,
  getTopTechnicalProjects,
  getTopBusinessProjects,
  selectTopTechnicalProjects,
  selectTopBusinessProjects,
} from "../store/slices/projectSlice";
import { RootState } from "../store/store";

import TopTechnicalProjectsTable from "../components/dashboard-jury/TopTechnicalProjectsTable";
import TopBusinessProjectsTable from "../components/dashboard-jury/TopBusinessProjectsTable";
import StatsCards from "../components/dashboard-jury/StatsCards";
import ChartsSection from "../components/dashboard-jury/ChartsSection";
import ProjectsTable from "../components/dashboard-jury/ProjectsTable";
import DetailsModal from "../components/dashboard-jury/DetailsModal";
import TeamModal from "../components/dashboard-jury/TeamModal";

const JuryDashboard = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.project
  );
  const totalProjects = useSelector(selectTotalProjects);
  const totalPages = useSelector(selectTotalPages);
  const stats = useSelector(selectProjectStats);
  const tracksFromApi = useSelector(selectProjectTracks);
  const projectsByTrack = useSelector(selectProjectsByTrack);
  const projectsCreatedPerDay = useSelector(selectProjectsCreatedPerDay);
  const projectsCountByStatus = useSelector(selectProjectsCountByStatus);
  const [trackFilter, setTrackFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("-overallScore");
  const [page, setPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsProject, setDetailsProject] = useState<any>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [statusPieData, setStatusPieData] = useState<any>([]);
  const [isPieDataEmpty, setIsPieDataEmpty] = useState<boolean>(true);
  // --- Enhanced Stats ---

  const allScores = projects
    .map(
      (p: any) =>
        p.assessment?.technicalData?.overallScore ||
        p.assessment?.businessData?.overallScore
    )
    .filter(Boolean);
  const avgScore =
    typeof stats?.averageScore === "number"
      ? stats.averageScore.toFixed(2)
      : allScores.length
      ? (
          allScores.reduce((a: any, b: any) => a + b, 0) / allScores.length
        ).toFixed(2)
      : "N/A";
  const evaluatedCount =
    stats?.evaluatedProjects ??
    projects.filter((p: any) => p.status === "Evaluated").length;

  // --- Bar Chart: Projects per Track (prefer API, fallback to computed) ---
  const projectsPerTrack = projectsByTrack.length
    ? projectsByTrack
    : Array.from(new Set(projects.map((p: any) => p.track))).map((track) => ({
        track,
        count: projects.filter((p: any) => p.track === track).length,
      }));

  // --- Pie Chart: Evaluation Status (prefer API, fallback to computed) ---
  const statusColors: Record<string, string> = {
    done: "#43e97b",
    pending: "#FFD600",
    inProgress: "#7C4DFF",
    // Add more status colors as needed
  };

  useEffect(() => {
    const statusData =
      projectsCountByStatus && Object.keys(projectsCountByStatus).length
        ? projectsCountByStatus.map((item) => ({
            name: item.status,
            value: Number(item.count),
            color: statusColors[item.status] || "#8884d8",
          }))
        : [];

    // Helper to check if PieChart data is empty or all values are zero
    const isDataEmpty =
      !statusData.length || statusData.every((d) => !d.value || d.value === 0);

    setIsPieDataEmpty(isDataEmpty);
    setStatusPieData(statusData);
  }, [projectsCountByStatus]);

  // --- Line Chart: Submissions Over Time (prefer API, fallback to computed) ---
  const lineChartData = projectsCreatedPerDay.length
    ? projectsCreatedPerDay
    : (() => {
        const submissionsByDate = projects.reduce((acc: any, p: any) => {
          const date = p.createdAt
            ? new Date(p.createdAt).toLocaleDateString()
            : "Unknown";
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(submissionsByDate).map(([date, count]) => ({
          date,
          count,
        }));
      })();

  const topTechnicalProjects = useSelector(selectTopTechnicalProjects);
  const topBusinessProjects = useSelector(selectTopBusinessProjects);

  // Pagination state for top technical projects
  const [topTechPage, setTopTechPage] = useState(0);
  const [topTechRowsPerPage, setTopTechRowsPerPage] = useState(5);
  // Pagination state for top business projects
  const [topBizPage, setTopBizPage] = useState(0);
  const [topBizRowsPerPage, setTopBizRowsPerPage] = useState(5);

  // Pagination state for main projects table
  const [mainPage, setMainPage] = useState(0);
  const [mainRowsPerPage, setMainRowsPerPage] = useState(6);

  // Use Redux state for paginated projects
  const mainProjects = projects;
  const mainTotal = totalProjects;

  useEffect(() => {
    const params = {
      page: mainPage + 1,
      limit: mainRowsPerPage,
      name: search,
      track: trackFilter === "All" ? undefined : trackFilter,
      sort: sort,
    };
    dispatch(getAllProjects(params) as any);
    dispatch(getProjectStats() as any);
    dispatch(getProjectTracks() as any);
    dispatch(getProjectsByTrack() as any);
    dispatch(getProjectsCreatedPerDay() as any);
    dispatch(getProjectsCountByStatus() as any);
  }, [dispatch, search, mainPage, mainRowsPerPage, trackFilter, sort]);

  // Fetch top technical projects with its own pagination
  useEffect(() => {
    const params = {
      page: topTechPage + 1,
      limit: topTechRowsPerPage,
      sort: "-overallScoreTechnical",
    };
    dispatch(getTopTechnicalProjects(params) as any);
  }, [dispatch, topTechPage, topTechRowsPerPage]);

  // Fetch top business projects with its own pagination
  useEffect(() => {
    const params = {
      page: topBizPage + 1,
      limit: topBizRowsPerPage,
      sort: "-overallScoreBusiness",
    };
    dispatch(getTopBusinessProjects(params) as any);
  }, [dispatch, topBizPage, topBizRowsPerPage]);

  // Track list for filter (prefer API, fallback to computed)
  const tracks: string[] = [
    "All",
    ...(tracksFromApi.length
      ? tracksFromApi
      : Array.from(new Set(projects.map((p: any) => p.track)))),
  ];

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  // Global stats (prefer backend stats, fallback to computed)
  const uniqueTracks =
    stats?.totalTracks ??
    Array.from(new Set(projects.map((p: any) => p.track))).length;
  const totalProjectsStat = stats?.totalProjects ?? totalProjects;
  const totalTeamMembers =
    stats?.totalTeamMembers ??
    projects.reduce(
      (acc: number, p: any) =>
        acc + (Array.isArray(p.team) ? p.team.length : 0),
      0
    );

  const handleOpenDetails = (project: any) => {
    setDetailsProject(project);
    setDetailsModalOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setDetailsProject(null);
  };

  const handleOpenTeamModal = (project: any) => {
    setTeamMembers(
      Array.isArray(project.team) ? project.team.map((m: any) => m.email) : []
    );
    setTeamModalOpen(true);
  };

  const handleCloseTeamModal = () => {
    setTeamModalOpen(false);
    setTeamMembers([]);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #f7faff 0%, #e3f2fd 100%)",
        p: { xs: 1, md: 4 },
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "rgba(124,77,255,0.07)", color: "#7C4DFF", mb: 4 }}
      >
        <Toolbar>
          <EmojiEventsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0.5 }}>
            Jury Project Evaluation
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Enhanced Global Stats */}
      <StatsCards
        totalProjects={totalProjectsStat}
        uniqueTracks={uniqueTracks}
        avgScore={avgScore}
        evaluatedCount={evaluatedCount}
        totalTeamMembers={totalTeamMembers}
      />
      {/* Charts Section */}
      <ChartsSection
        projectsPerTrack={projectsPerTrack}
        statusPieData={statusPieData}
        isPieDataEmpty={isPieDataEmpty}
        lineChartData={lineChartData}
      />
      {/* Top Projects Tables */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={5}>
        <TopTechnicalProjectsTable
          data={topTechnicalProjects.data}
          loading={topTechnicalProjects.loading}
          error={topTechnicalProjects.error}
          page={topTechPage}
          rowsPerPage={topTechRowsPerPage}
          total={topTechnicalProjects.total}
          onPageChange={(_, newPage) => setTopTechPage(newPage)}
          onRowsPerPageChange={(e) => {
            setTopTechRowsPerPage(parseInt(e.target.value, 10));
            setTopTechPage(0);
          }}
          onOpenDetails={handleOpenDetails}
        />
        <TopBusinessProjectsTable
          data={topBusinessProjects.data}
          loading={topBusinessProjects.loading}
          error={topBusinessProjects.error}
          page={topBizPage}
          rowsPerPage={topBizRowsPerPage}
          total={topBusinessProjects.total}
          onPageChange={(_, newPage) => setTopBizPage(newPage)}
          onRowsPerPageChange={(e) => {
            setTopBizRowsPerPage(parseInt(e.target.value, 10));
            setTopBizPage(0);
          }}
          onOpenDetails={handleOpenDetails}
        />
      </Stack>
      {/* Projects Table */}
      <ProjectsTable
        projects={mainProjects}
        loading={loading}
        error={error}
        tracks={tracks}
        trackFilter={trackFilter}
        onTrackFilterChange={setTrackFilter}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        page={mainPage}
        rowsPerPage={mainRowsPerPage}
        total={mainTotal}
        onPageChange={(_, newPage) => setMainPage(newPage)}
        onRowsPerPageChange={(e) => {
          setMainRowsPerPage(parseInt(e.target.value, 10));
          setMainPage(0);
        }}
        onOpenTeamModal={handleOpenTeamModal}
        onOpenDetails={handleOpenDetails}
      />
      {/* Details Modal */}
      <DetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        detailsProject={detailsProject}
      />
      {/* Team Modal */}
      <TeamModal
        open={teamModalOpen}
        onClose={handleCloseTeamModal}
        teamMembers={teamMembers}
      />
    </Box>
  );
};

export default JuryDashboard;