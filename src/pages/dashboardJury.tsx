import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, AppBar, Toolbar, Button, Avatar } from "@mui/material";
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
import { logout } from "../store/slices/authSlice";
import { useRouter } from "next/router";

import TopTechnicalProjectsTable from "../components/dashboard-jury/TopTechnicalProjectsTable";
import TopBusinessProjectsTable from "../components/dashboard-jury/TopBusinessProjectsTable";
import StatsCards from "../components/dashboard-jury/StatsCards";
import ChartsSection from "../components/dashboard-jury/ChartsSection";
import ProjectsTable from "../components/dashboard-jury/ProjectsTable";
import DetailsModal from "../components/dashboard-jury/DetailsModal";
import TeamModal from "../components/dashboard-jury/TeamModal";

const JuryDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
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

  // Navbar logout handler
  const handleLogout = () => {
    dispatch(logout());
    router.replace('/signin?source=hackathon');
  };

  useEffect(() => {
    if (user && user.role !== 'jury') {
      router.replace('/signin?source=hackathon');
    }
    if (!user) {
      router.replace('/signin?source=hackathon');
    }
  }, [user, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #f7faff 0%, #e3f2fd 100%)",
        p: { xs: 1, md: 4 },
      }}
    >
      {/* Jury Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.7)",
          color: "#191919",
          boxShadow: "0 4px 24px 0 rgba(124,77,255,0.10)",
          mb: 3,
          borderRadius: 3,
          backdropFilter: "blur(16px)",
          px: { xs: 1, sm: 3 },
          py: 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 56, sm: 72 },
            px: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="TalentAI Logo"
              sx={{ height: { xs: 28, sm: 32 }, mr: 1, cursor: "pointer", transition: "transform 0.2s", '&:hover': { transform: 'scale(1.07)' } }}
              onClick={() => router.push("/")}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.5,
                fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                color: "#7C4DFF",
                textShadow: "0 2px 8px #7C4DFF11",
                display: { xs: "none", sm: "block" },
              }}
            >
              Hackathon Jury Dashboard
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
              <Avatar
                sx={{
                  bgcolor: "linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: 22,
                  boxShadow: "0 2px 8px #7C4DFF22",
                  border: "2px solid #fff",
                }}
              >
                {user.FirstName?.[0] || user.firstName?.[0] || user.firstname?.[0] || user.email?.[0] || "U"}
              </Avatar>
              <Box sx={{ textAlign: "right", minWidth: 120 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#222", fontSize: 17, lineHeight: 1.1 }}>
                  {user.LastName || user.lastName || user.lastname || ""} {user.FirstName || user.firstName || user.firstname || ""}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ mx: 1, height: 36, borderLeft: "1.5px solid #E0E0E0" }} />
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  boxShadow: "0 2px 8px #00B8D422",
                  textTransform: "none",
                  fontSize: 16,
                  letterSpacing: 0.2,
                  transition: "background 0.2s, box-shadow 0.2s",
                  '&:hover': {
                    background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                    boxShadow: "0 4px 16px #00B8D433",
                  },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {/* Header - removed duplicate Jury Project Evaluation */}
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