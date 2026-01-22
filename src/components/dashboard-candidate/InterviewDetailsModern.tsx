import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import {
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Card,
  CardContent,
  Fade,
  Grid,
  Avatar,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimelineIcon from "@mui/icons-material/Timeline";
import PostInterviewTab from "@/components/dashboard-candidate/PostInterviewTab";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";


const INTERVIEW_TYPES = [
  {
    label: "Applications",
    value: "application",
    icon: <AssignmentTurnedInIcon />,
    color: "#667eea",
  },
  {
    label: "Technical Skills",
    value: "technical",
    icon: <CalendarTodayIcon />,
    color: "#f093fb",
  },
  {
    label: "Soft Skills",
    value: "soft",
    icon: <TrendingUpIcon />,
    color: "#43e97b",
  },
];

export default function InterviewDetailsModern() {
  const { profile } = useSelector(
    (state: RootState) => state.user.connectedUser
  );
  const [tab, setTab] = useState("post_interview");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const router = useRouter();

  const profileIdRef = useRef(profile?._id);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    profileIdRef.current = profile?._id;
  }, [profile]);

  const fetchData = useCallback(
    async (type: string, currentPage: number, signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("api_token");
        const realProfileId = profileIdRef.current;
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}skill-interview-assessments?page=${currentPage}&limit=${limit}&candidateId=${realProfileId}`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch interview details: ${res.status}`);
        }

        const json = await res.json();
        const results = Array.isArray(json.results)
          ? json.results
          : Array.isArray(json.data)
          ? json.data
          : [];
        const inferredTotal =
          json.total !== undefined ? json.total : results.length;

        if (requestIdRef.current === requestId) {
          setData(results);
          setTotal(inferredTotal);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "An error occurred");
          setData([]);
          setTotal(0);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [limit]
  );

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchData(tab, page, controller.signal);

    return () => {
      controller.abort();
    };
  }, [tab, page, fetchData]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setPage(1); // Reset to page 1 when changing tabs
  };

  const normalizedTab = useMemo(() => {
    if (tab === "technical") return "technical";
    if (tab === "soft") return "soft";
    return "application";
  }, [tab]);

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        bg: "#f3e7ff",
      };
    if (score >= 70)
      return {
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        bg: "#e3f2fd",
      };
    if (score >= 60)
      return {
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        bg: "#e8f5e9",
      };
    return {
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      bg: "#fff3e0",
    };
  };

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: "#000000",
          fontSize: "20px",
          mb: 3,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-4px",
            left: 0,
            width: "38px",
            height: "5px",
            background: "#8310FF",
            borderRadius: "2px",
          },
        }}
      >
        Interviews & Skills assessments
      </Typography>
      <Box>
        <Box
          sx={{
            mb: 4,
            backgroundColor: "rgba(250, 246, 255, 1)",
            borderRadius: "12px",
            px: 1,
            height: "60px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => handleTabChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              width: "100%",
              "& .MuiTab-root": {
                flex: 1,
                mr: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "16px",
                borderRadius: "12px",
                height: 45,
                color: "rgba(189, 133, 255, 1)",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(244, 235, 255, 1)",
                "&:hover": {
                  backgroundColor: "rgba(189, 133, 255, 1)",
                  color: "white"
                },
                "&.Mui-selected": {
                  color: "white",
                  backgroundColor: "rgba(189, 133, 255, 1)",
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            {INTERVIEW_TYPES.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t.label}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: "#667eea",
                mb: 3,
              }}
            />
            <Typography variant="h6" color="textSecondary">
              Loading your interview data...
            </Typography>
          </Box>
        ) :  (
          <>
            {normalizedTab === "application" ? (
              <PostInterviewTab data={data} loading={loading} error={error} />
            ) : (
              <Fade in timeout={500}>
                <Box>
                  {/* Header with count */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#1a1a1a" }}
                    >
                      {
                        INTERVIEW_TYPES.find((t) => t.value === normalizedTab)
                          ?.label
                      }{" "}
                      Assessments
                    </Typography>
                    <Chip
                      label={`${total} result${total === 1 ? "" : "s"}`}
                      sx={{
                        backgroundColor: "#667eea20",
                        color: "#667eea",
                        fontWeight: 600,
                        px: 2,
                      }}
                    />
                  </Stack>

                  {data.length === 0 ? (
                    <Paper
                      sx={{
                        p: 8,
                        textAlign: "center",
                        borderRadius: 4,
                        background:
                          "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
                        border: "2px dashed #e0e0e0",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: "#f3e7ff",
                          margin: "0 auto 16px",
                        }}
                      >
                        <AssignmentTurnedInIcon
                          sx={{ fontSize: 40, color: "#667eea" }}
                        />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        No assessments found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Assessments you complete will appear here
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={3}>
                      {data.map((row: any, index) => {
                        const metadata = row.metadata || {};
                        const interviewData = row.interviewData || {};
                        const finalReport = interviewData.finalReport || {};
                        const coverage = finalReport.coverage || {};
                        const areas = coverage.areas || {};
                        const technicalDepth = areas.technical_depth || {};
                        const problemApproach = areas.problem_approach || {};

                        const qualityScore =
                          technicalDepth.aiAnalysis?.qualityScore ||
                          problemApproach.aiAnalysis?.qualityScore;
                        const overallCoverage =
                          coverage.overall !== undefined ? coverage.overall : 0;
                        const score =
                          coverage.overall !== undefined
                            ? overallCoverage
                            : qualityScore !== undefined
                            ? qualityScore * 20
                            : 0;

                        let level = "Beginner";
                        if (score >= 80) level = "Expert";
                        else if (score >= 70) level = "Advanced";
                        else if (score >= 60) level = "Intermediate";

                        const skillName =
                          metadata.skill || row.skillDetails?.[0]?.name;
                        const title =
                          skillName ||
                          row.post?.jobDetails?.title ||
                          "Skill Assessment";
                        const dateLabel = metadata.exportedAt
                          ? new Date(metadata.exportedAt).toLocaleDateString()
                          : row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
                          : null;

                        const { gradient, bg } = getScoreColor(score);

                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={row._id || index}>
                            <Card
                              sx={{
                                height: "100%",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                width: "100%",
                                borderRadius: 4,
                                border: "2px solid #f0f0f0",
                                transition:
                                  "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "visible",
                                "&:hover": {
                                  transform: "translateY(-8px) scale(1.02)",
                                  boxShadow:
                                    "0 20px 40px rgba(102, 126, 234, 0.25)",
                                  border: "2px solid #667eea",
                                },
                              }}
                              onClick={() => {
                                if (row._id) {
                                  router.push(`/interview/report/${row._id}`);
                                }
                              }}
                            >
                              {/* Gradient Top Bar */}

                              <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                  {/* Title and Badge */}
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 700,
                                        color: "#1a1a1a",
                                        flex: 1,
                                        pr: 1,
                                      }}
                                    >
                                      {title}
                                    </Typography>
                                    <Chip
                                      label={level}
                                      size="small"
                                      sx={{
                                        background: bg,
                                        color: "#1a1a1a",
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                      }}
                                    />
                                  </Stack>

                                  {/* Date */}
                                  {dateLabel && (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <CalendarTodayIcon
                                        sx={{ fontSize: 16, color: "#9e9e9e" }}
                                      />
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        {dateLabel}
                                      </Typography>
                                    </Stack>
                                  )}

                                  {/* Score Circle */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      py: 2,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: "relative",
                                        display: "inline-flex",
                                      }}
                                    >
                                      <CircularProgress
                                        variant="determinate"
                                        value={100}
                                        size={100}
                                        thickness={5}
                                        sx={{ color: "#f0f0f0" }}
                                      />
                                      <CircularProgress
                                        variant="determinate"
                                        value={score}
                                        size={100}
                                        thickness={5}
                                        sx={{
                                          position: "absolute",
                                          left: 0,
                                          color: "#667eea",
                                        }}
                                      />
                                      <Box
                                        sx={{
                                          top: 0,
                                          left: 0,
                                          bottom: 0,
                                          right: 0,
                                          position: "absolute",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <Typography
                                          variant="h4"
                                          sx={{
                                            fontWeight: 800,
                                            color: "#667eea",
                                          }}
                                        >
                                          {Math.round(score)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#9e9e9e",
                                            fontWeight: 600,
                                          }}
                                        >
                                          SCORE
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* View Details Button */}
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<TimelineIcon />}
                                    sx={{
                                      borderColor: "#667eea",
                                      color: "#667eea",
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      py: 1.5,
                                      textTransform: "none",
                                      "&:hover": {
                                        borderColor: "#667eea",
                                        backgroundColor: "#f3e7ff",
                                      },
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}

                  {/* Pagination */}
                  {data.length > 0 && total > limit && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        pb: 2,
                      }}
                    >
                      <Pagination
                        count={Math.ceil(total / limit)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            fontWeight: 600,
                            fontSize: "1rem",
                            "&.Mui-selected": {
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "#fff",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Fade>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
