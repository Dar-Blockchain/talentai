import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
    Box,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Typography,
    Chip,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PostInterviewTab from "@/components/dashboard-candidate/PostInterviewTab";

const INTERVIEW_TYPES = [
    { label: "Post Interview", value: "post_interview", icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} /> },
    { label: "Onboarding", value: "onboarding", icon: <CalendarTodayIcon sx={{ fontSize: 18 }} /> },
    { label: "HR", value: "hr", icon: <PersonOutlineIcon sx={{ fontSize: 18 }} /> },
    { label: "Technical", value: "skill", icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
    { label: "Soft Skills", value: "soft", icon: <PsychologyIcon sx={{ fontSize: 18 }} /> },
];

export type InterviewDetailsTabsProps = {
    profile: any; // Replace 'any' with a concrete Profile type if available
};

export default function InterviewDetailsTabs({ profile }: InterviewDetailsTabsProps) {
    const [tab, setTab] = useState("post_interview");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    // Use ref to store profile ID to prevent unnecessary re-fetches
    const profileIdRef = useRef(profile?._id);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const componentIdRef = useRef(Math.random().toString(36).substring(7));
    
    console.log(`🎭 [InterviewDetailsTabs-${componentIdRef.current}] Component render`);
    
    // Update ref when profile changes, but don't trigger re-fetch
    useEffect(() => {
        profileIdRef.current = profile?._id;
    }, [profile]);

    const fetchData = useCallback(
        async (type: string, pageNum: number, limit: number, signal?: AbortSignal) => {
            const requestId = ++requestIdRef.current;
            const componentId = componentIdRef.current;
            
            console.log(`🚀 [Comp-${componentId}][Req-${requestId}] STARTING fetch:`, { type, page: pageNum + 1, limit });
            
            setLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem("api_token");
                const realProfileId = profileIdRef.current;

                // All tabs use InterviewAssessment API
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}InterviewAssessment/?page=${pageNum + 1}&limit=${limit}&type=${type}&candidateId=${realProfileId}`;

                console.log(`📡 [Comp-${componentId}][Req-${requestId}] Making HTTP request to:`, url);

                const res = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    signal: signal, // Support cancellation
                });
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`❌ [Comp-${componentId}][Req-${requestId}] API Error ${res.status}:`, errorText);
                    throw new Error(`Failed to fetch interview details: ${res.status}`);
                }

                const json = await res.json();
                console.log(`📦 [Comp-${componentId}][Req-${requestId}] Raw API Response:`, json);

                const results = Array.isArray(json.results) ? json.results : (Array.isArray(json.data) ? json.data : []);
                const inferredTotal =
                    (typeof json.total === 'number' && json.total >= 0) ? json.total :
                    (typeof json.count === 'number' && json.count >= 0) ? json.count :
                    (typeof json.totalCount === 'number' && json.totalCount >= 0) ? json.totalCount :
                    results.length;

                console.log(`📊 [Comp-${componentId}][Req-${requestId}] Parsed results:`, {
                    resultsCount: results.length,
                    total: inferredTotal,
                    hasResults: results.length > 0,
                    firstItem: results[0] || 'No items'
                });

                setData(results);
                setTotal(inferredTotal);

                console.log(`✅ [Comp-${componentId}][Req-${requestId}] SUCCESS - Data loaded:`, results.length, 'items');
            } catch (e: any) {
                // Don't show error if request was aborted
                if (e.name === 'AbortError') {
                    console.log(`⏭️ [Comp-${componentId}][Req-${requestId}] CANCELLED`);
                    return;
                }
                console.error(`❌ [Comp-${componentId}][Req-${requestId}] ERROR:`, e);
                setError(e.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        },
        [] // Remove profile dependency - use ref instead
    );

    useEffect(() => {
        const componentId = componentIdRef.current;
        console.log(`🔵 [Comp-${componentId}] useEffect TRIGGERED - dependencies:`, { tab, page, rowsPerPage });
        
        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log(`🚫 [Comp-${componentId}] Cancelling previous request`);
        }
        
        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        
        console.log(`🔄 [Comp-${componentId}] Calling fetchData...`);
        fetchData(tab, page, rowsPerPage, abortController.signal);
        
        // Cleanup function to cancel request on unmount or when dependencies change
        return () => {
            console.log(`🧹 [Comp-${componentId}] useEffect CLEANUP called`);
            abortController.abort();
        };
    }, [tab, page, rowsPerPage, fetchData]);

    const handleTabChange = (_: any, newValue: string) => {
        setTab(newValue);
        setPage(0);
    };
    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: any) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const normalizedTab = (tab || "").toString().toLowerCase();

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1,
                        py: 1,
                        backgroundColor: "#f8f9fc",
                        borderRadius: 2,
                        boxShadow: "inset 0 0 0 1px rgba(131,16,255,0.08)",
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "13.5px",
                            minHeight: 44,
                            minWidth: 120,
                            color: "#555",
                            borderRadius: 1.5,
                            mx: 0.5,
                            px: 1.5,
                            transition: "all .2s ease",
                            "&:hover": {
                                backgroundColor: "#ffffff",
                                boxShadow: "0 6px 18px rgba(0,0,0,.06)",
                            },
                            "&.Mui-selected": {
                                color: "#2b2152",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 8px 22px rgba(131,16,255,.15)",
                            },
                        },
                        "& .MuiTabs-indicator": {
                            height: 0,
                            background: "linear-gradient(90deg,#8310FF 0%,#02E2FF 100%)",
                            borderRadius: 2,
                        },
                    }}
                >
                    {INTERVIEW_TYPES.map((t) => (
                        <Tab
                            key={t.value}
                            value={t.value}
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {t.icon}
                                    <Typography sx={{ fontWeight: 800 }}>{t.label}</Typography>
                                   
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "#8310FF" }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : (
                <>
                    {normalizedTab === "post_interview" ? (
                        <PostInterviewTab data={data} loading={loading} error={error} />
                    ) : normalizedTab === "skill" ? (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Skill Assessments</Typography>
                                <Typography variant="body2" sx={{ color: "#666" }}>{total} result{total === 1 ? "" : "s"}</Typography>
                            </Stack>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                                {data.length === 0 ? (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                                        <Typography sx={{ fontWeight: 600 }}>No skill assessments found</Typography>
                                        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>Assessments you complete will appear here.</Typography>
                                    </Paper>
                                ) : (
                                    data.map((row: any) => {
                                        // Extract data directly from the structure
                                        const metadata = row.metadata || {};
                                        const interviewData = row.interviewData || {};
                                        const finalReport = interviewData.finalReport || {};
                                        const coverage = finalReport.coverage || {};
                                        const areas = coverage.areas || {};
                                        const technicalDepth = areas.technical_depth || {};
                                        const problemApproach = areas.problem_approach || {};

                                        // Get quality score directly (0-10 scale)
                                        const qualityScore = technicalDepth.aiAnalysis?.qualityScore || problemApproach.aiAnalysis?.qualityScore;

                                        // Get overall coverage percentage directly from coverage.overall
                                        const overallCoverage = coverage.overall !== undefined ? coverage.overall : 0;
                                        const technicalDepthPercentage = technicalDepth.percentage;
                                        const problemApproachPercentage = problemApproach.percentage;

                                        // Use quality score as display value or fall back to old structure
                                        const score = qualityScore || row.skillDetails?.[0]?.confidenceScore || row?.overallScore || null;

                                        // Simple level based on quality score
                                        let level: string = "Unknown";
                                        let color: "default" | "success" | "warning" | "error" = "default";
                                        if (qualityScore) {
                                            if (qualityScore >= 8) { level = "Expert"; color = "success"; }
                                            else if (qualityScore >= 6) { level = "Advanced"; color = "success"; }
                                            else if (qualityScore >= 4) { level = "Intermediate"; color = "warning"; }
                                            else { level = "Beginner"; color = "error"; }
                                        }

                                        const skillName = metadata.skill || row.skillDetails?.[0]?.name;
                                        const title = skillName || row.post?.jobDetails?.title || row.skillName || "Skill Assessment";
                                        const dateLabel = metadata.exportedAt ? new Date(metadata.exportedAt).toLocaleDateString() :
                                                         (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null);
                                        const skillType = metadata.type || row.skillDetails?.[0]?.type || "technical";
                                        const proficiencyLevel = metadata.proficiency || row.skillDetails?.[0]?.proficiencyLevel;
                                        const totalQuestions = row.skillDetails?.[0]?.questionAnswerList?.length || 0;
                                        const correctAnswers = row.skillDetails?.[0]?.questionAnswerList?.filter((qa: any) => qa.status === "correct").length || 0;

                                        // Count covered indicators
                                        const technicalIndicators = technicalDepth.indicators?.filter((i: any) => i.covered) || [];
                                        const problemIndicators = problemApproach.indicators?.filter((i: any) => i.covered) || [];
                                        const totalIndicatorsCovered = technicalIndicators.length + problemIndicators.length;
                                        return (
                                            <Paper
                                                key={row._id || row.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    borderColor: "#E0E0E0",
                                                    transition: "all .2s ease",
                                                    "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,.08)", transform: "translateY(-2px)" },
                                                }}
                                            >
                                                <Stack spacing={1.25}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                                                        {score !== null && (
                                                            <Chip size="small" color={color} label={level} sx={{ fontWeight: 700 }} />
                                                        )}
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#7a7a7a" }}>
                                                        <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />
                                                        <Typography variant="body2">{skillType}</Typography>
                                                        {dateLabel && (
                                                            <>
                                                                <Typography variant="body2" sx={{ mx: 0.5 }}>•</Typography>
                                                                <Typography variant="body2">{dateLabel}</Typography>
                                                            </>
                                                        )}
                                                    </Stack>

                                                    {score !== null ? (
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                                                                <CircularProgress variant="determinate" value={overallCoverage || technicalDepthPercentage || problemApproachPercentage || 0} size={64} thickness={5} sx={{
                                                                    color: "#ece7fb",
                                                                }} />
                                                                <CircularProgress variant="determinate" value={overallCoverage || technicalDepthPercentage || problemApproachPercentage || 0} size={64} thickness={5} sx={{
                                                                    position: "absolute",
                                                                    left: 0,
                                                                    top: 0,
                                                                    color: "#8310FF",
                                                                }} />
                                                                <Box sx={{
                                                                    top: 0,
                                                                    left: 0,
                                                                    bottom: 0,
                                                                    right: 0,
                                                                    position: "absolute",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#333" }}>{`${overallCoverage || technicalDepthPercentage || problemApproachPercentage || 0}%`}</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                {qualityScore ? (
                                                                    <>
                                                                        <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 0.5 }}>Quality Score</Typography>
                                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#333", mb: 0.5 }}>{qualityScore}/10</Typography>
                                                                        {totalIndicatorsCovered > 0 && (
                                                                            <Typography variant="caption" sx={{ color: "#666" }}>{totalIndicatorsCovered} indicators covered</Typography>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                                            <Typography variant="caption" sx={{ color: "#666" }}>Overall Score</Typography>
                                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                                <Tooltip title="Relative standing">
                                                                                    <TrendingUpIcon sx={{ fontSize: 16, color: "#8310FF" }} />
                                                                                </Tooltip>
                                                                                <Typography variant="caption" sx={{ color: "#333", fontWeight: 700 }}>{level}</Typography>
                                                                            </Stack>
                                                                        </Stack>
                                                                        <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 6, "& .MuiLinearProgress-bar": { backgroundColor: "#8310FF" } }} />
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#666" }}>No score available</Typography>
                                                    )}

                                                    <Divider sx={{ my: 1 }} />
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                                        {skillType && (
                                                            <Chip 
                                                                size="small" 
                                                                label={`${skillType} skill`} 
                                                                variant="outlined" 
                                                                sx={{ textTransform: "capitalize", fontWeight: 600 }} 
                                                            />
                                                        )}
                                                        {proficiencyLevel && (
                                                            <Chip 
                                                                size="small" 
                                                                label={`Level ${proficiencyLevel}`} 
                                                                variant="outlined" 
                                                                color="primary"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                     
                                                        {totalQuestions > 0 && (
                                                            <Chip 
                                                                size="small" 
                                                                label={`${correctAnswers}/${totalQuestions} correct`} 
                                                                variant="outlined"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                    </Stack>

                                                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                                        <Button
                                                            onClick={() => router.push(`/interview/report/${row._id || row.id}`)}
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                px: 2,
                                                                backgroundColor: "#8310FF",
                                                                color: "#fff",
                                                                borderRadius: 2,
                                                                "&:hover": {
                                                                    backgroundColor: "#6B0BC7",
                                                                },
                                                            }}
                                                        >
                                                            View details
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Box>
                        </Box>
                    ) : normalizedTab === "hr" ? (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>HR Interviews</Typography>
                                <Typography variant="body2" sx={{ color: "#666" }}>{total} result{total === 1 ? "" : "s"}</Typography>
                            </Stack>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                                {data.length === 0 ? (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                                        <Typography sx={{ fontWeight: 600 }}>No HR interviews found</Typography>
                                        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>Your HR interviews will appear here.</Typography>
                                    </Paper>
                                ) : (
                                    data.map((row: any) => {
                                        // Extract data from new structure (metadata + interviewData)
                                        const metadata = row.metadata || {};
                                        const interviewData = row.interviewData || {};
                                        const finalReport = interviewData.finalReport || {};
                                        const coverage = finalReport.coverage || {};

                                        // Get overall coverage score
                                        const overallCoverage = coverage.overall !== undefined ? coverage.overall : null;

                                        // Use overall coverage as score, fallback to old structure
                                        const score = overallCoverage !== null ? overallCoverage :
                                                     (typeof row?.overallScore === "number" ? Math.max(0, Math.min(100, row.overallScore)) : null);

                                        let statusLabel: string = "Pending";
                                        let statusColor: "default" | "success" | "warning" | "error" = "default";
                                        if (score !== null) {
                                            if (score >= 80) { statusLabel = "Strong fit"; statusColor = "success"; }
                                            else if (score >= 60) { statusLabel = "Good fit"; statusColor = "success"; }
                                            else if (score >= 40) { statusLabel = "Consider"; statusColor = "warning"; }
                                            else { statusLabel = "Not a fit"; statusColor = "error"; }
                                        }

                                        const skillName = metadata.skill || metadata.role;
                                        const title = skillName || row.post?.jobDetails?.title || row.position || "HR Interview";
                                        const candidateName = row.candidateId?.firstName && row.candidateId?.lastName
                                                            ? `${row.candidateId.firstName} ${row.candidateId.lastName}`
                                                            : (row.candidate?.name || row.profile?.fullName || "Candidate");
                                        const dateLabel = metadata.exportedAt ? new Date(metadata.exportedAt).toLocaleDateString() :
                                                         (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null);
                                        const proficiencyLevel = metadata.proficiency;
                                        const interviewType = metadata.type || "hr";
                                        const notes = row.notes || row.summary || row.hrNotes || "";
                                        return (
                                            <Paper
                                                key={row._id || row.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    borderColor: "#E0E0E0",
                                                    transition: "all .2s ease",
                                                    "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,.08)", transform: "translateY(-2px)" },
                                                }}
                                            >
                                                <Stack spacing={1.5}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                                                        <Chip label={statusLabel} color={statusColor} size="small" sx={{ fontWeight: 700 }} />
                                                    </Stack>
                                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ color: "#7a7a7a" }}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <PersonOutlineIcon sx={{ fontSize: 18 }} />
                                                            <Typography variant="body2">{candidateName}</Typography>
                                                        </Stack>
                                                        {dateLabel && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                                                <Typography variant="body2">{dateLabel}</Typography>
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                    {score !== null && (
                                                        <Box>
                                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                                <Typography variant="caption" sx={{ color: "#666" }}>Overall Evaluation</Typography>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Tooltip title="Relative standing">
                                                                        <TrendingUpIcon sx={{ fontSize: 16, color: "#8310FF" }} />
                                                                    </Tooltip>
                                                                    <Typography variant="caption" sx={{ color: "#333", fontWeight: 700 }}>{statusLabel}</Typography>
                                                                </Stack>
                                                            </Stack>
                                                            <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 6, "& .MuiLinearProgress-bar": { backgroundColor: "#8310FF" } }} />
                                                        </Box>
                                                    )}
                                                    {notes && (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ color: "#666" }}>Notes</Typography>
                                                            <Typography variant="body2" sx={{ color: "#333", mt: 0.5 }} noWrap title={notes}>{notes}</Typography>
                                                        </Box>
                                                    )}
                                                    {(interviewType || proficiencyLevel) && (
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                            {interviewType && (
                                                                <Chip
                                                                    size="small"
                                                                    label={interviewType}
                                                                    variant="outlined"
                                                                    sx={{ textTransform: "capitalize", fontWeight: 600, fontSize: "0.7rem" }}
                                                                />
                                                            )}
                                                            {proficiencyLevel && (
                                                                <Chip
                                                                    size="small"
                                                                    label={proficiencyLevel}
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                                />
                                                            )}
                                                        </Stack>
                                                    )}
                                                    <Stack direction="row" justifyContent="flex-end">
                                                        <Button
                                                            onClick={() => router.push(`/interview/report/${row._id || row.id}`)}
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                px: 2,
                                                                backgroundColor: "#8310FF",
                                                                color: "#fff",
                                                                borderRadius: 2,
                                                                "&:hover": {
                                                                    backgroundColor: "#6B0BC7",
                                                                },
                                                            }}
                                                        >
                                                            View details
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Box>
                        </Box>
                    ) : normalizedTab === "onboarding" ? (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Onboarding</Typography>
                                <Typography variant="body2" sx={{ color: "#666" }}>{total} result{total === 1 ? "" : "s"}</Typography>
                            </Stack>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                                {data.length === 0 ? (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                                        <Typography sx={{ fontWeight: 600 }}>No onboarding items yet</Typography>
                                        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>Onboarding items will appear here.</Typography>
                                    </Paper>
                                ) : (
                                    data.map((row: any) => {
                                        // Extract data from new structure (metadata + interviewData)
                                        const metadata = row.metadata || {};
                                        const interviewData = row.interviewData || {};
                                        const finalReport = interviewData.finalReport || {};
                                        const coverage = finalReport.coverage || {};
                                        const areas = coverage.areas || {};
                                        const technicalDepth = areas.technical_depth || {};
                                        const problemApproach = areas.problem_approach || {};

                                        // Get overall coverage score
                                        const overallCoverage = coverage.overall !== undefined ? coverage.overall : null;
                                        const qualityScore = technicalDepth.aiAnalysis?.qualityScore || problemApproach.aiAnalysis?.qualityScore;

                                        // Use overall coverage as score, fallback to old structure
                                        const score = overallCoverage !== null ? overallCoverage : (row?.overallScore || null);

                                        const skillName = metadata.skill || row.skillDetails?.[0]?.name;
                                        const title = skillName || row.title || row.post?.jobDetails?.title || "Onboarding";
                                        const dateLabel = metadata.exportedAt ? new Date(metadata.exportedAt).toLocaleDateString() :
                                                         (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null);
                                        const updatedLabel = row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : null;

                                        // Score-based level
                                        let level: string = "Not Started";
                                        let levelColor: "default" | "success" | "warning" | "error" = "default";
                                        if (score !== null) {
                                            if (score >= 85) { level = "Excellent"; levelColor = "success"; }
                                            else if (score >= 70) { level = "Good"; levelColor = "success"; }
                                            else if (score >= 50) { level = "Average"; levelColor = "warning"; }
                                            else { level = "Needs Work"; levelColor = "error"; }
                                        }

                                        // Extract additional data
                                        const skillDetails = row.skillDetails?.[0];
                                        const proficiencyLevel = metadata.proficiency || skillDetails?.proficiencyLevel;
                                        const totalQuestions = skillDetails?.questionAnswerList?.length || 0;
                                        const correctAnswers = skillDetails?.questionAnswerList?.filter((qa: any) => qa.status === "correct").length || 0;
                                        const partialAnswers = skillDetails?.questionAnswerList?.filter((qa: any) => qa.status === "partial_correct").length || 0;
                                        const recommendationsCount = row.recommendations?.length || 0;

                                        // Count covered indicators from new structure
                                        const technicalIndicators = technicalDepth.indicators?.filter((i: any) => i.covered) || [];
                                        const problemIndicators = problemApproach.indicators?.filter((i: any) => i.covered) || [];
                                        const totalIndicatorsCovered = technicalIndicators.length + problemIndicators.length;
                                        return (
                                            <Paper
                                                key={row._id || row.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    borderColor: "#E0E0E0",
                                                    transition: "all .2s ease",
                                                    "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,.08)", transform: "translateY(-2px)" },
                                                }}
                                            >
                                                <Stack spacing={1.25}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                        <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{title}</Typography>
                                                        {score !== null && (
                                                            <Chip size="small" color={levelColor} label={level} sx={{ fontWeight: 700 }} />
                                                        )}
                                                    </Stack>
                                                    
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#7a7a7a", flexWrap: "wrap" }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption">{dateLabel || "—"}</Typography>
                                                        {updatedLabel && updatedLabel !== dateLabel && (
                                                            <>
                                                                <Typography variant="caption" sx={{ mx: 0.5 }}>•</Typography>
                                                                <Typography variant="caption">Updated: {updatedLabel}</Typography>
                                                            </>
                                                        )}
                                                    </Stack>

                                                    {score !== null ? (
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                                                                <CircularProgress variant="determinate" value={score} size={56} thickness={5} sx={{
                                                                    color: "#ece7fb",
                                                                }} />
                                                                <CircularProgress variant="determinate" value={score} size={56} thickness={5} sx={{
                                                                    position: "absolute",
                                                                    left: 0,
                                                                    top: 0,
                                                                    color: "#8310FF",
                                                                }} />
                                                                <Box sx={{
                                                                    top: 0,
                                                                    left: 0,
                                                                    bottom: 0,
                                                                    right: 0,
                                                                    position: "absolute",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#333" }}>{`${score}%`}</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                {qualityScore ? (
                                                                    <>
                                                                        <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 0.5 }}>Quality Score</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#333", mb: 0.5 }}>{qualityScore}/10</Typography>
                                                                        {totalIndicatorsCovered > 0 && (
                                                                            <Typography variant="caption" sx={{ color: "#666" }}>{totalIndicatorsCovered} indicators covered</Typography>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                                            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Overall Score</Typography>
                                                                            <Typography variant="caption" sx={{ color: "#333", fontWeight: 700 }}>{level}</Typography>
                                                                        </Stack>
                                                                        <LinearProgress variant="determinate" value={score} sx={{ height: 6, borderRadius: 4, "& .MuiLinearProgress-bar": { backgroundColor: "#8310FF" } }} />
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic" }}>No score available</Typography>
                                                    )}

                                                    <Divider sx={{ my: 0.5 }} />

                                                    {/* Skill Details Section */}
                                                    {(totalQuestions > 0 || proficiencyLevel || metadata.type) && (
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Assessment Details:</Typography>
                                                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                                {metadata.type && (
                                                                    <Chip
                                                                        size="small"
                                                                        label={metadata.type}
                                                                        variant="outlined"
                                                                        sx={{ fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize" }}
                                                                    />
                                                                )}
                                                                {proficiencyLevel && (
                                                                    <Chip
                                                                        size="small"
                                                                        label={proficiencyLevel}
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                                    />
                                                                )}
                                                                {totalQuestions > 0 && (
                                                                    <Chip
                                                                        size="small"
                                                                        label={`${totalQuestions} questions`}
                                                                        variant="outlined"
                                                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                                    />
                                                                )}
                                                                {correctAnswers > 0 && (
                                                                    <Chip 
                                                                        size="small" 
                                                                        label={`${correctAnswers} correct`} 
                                                                        variant="outlined"
                                                                        color="success"
                                                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                                    />
                                                                )}
                                                                {partialAnswers > 0 && (
                                                                    <Chip 
                                                                        size="small" 
                                                                        label={`${partialAnswers} partial`} 
                                                                        variant="outlined"
                                                                        color="warning"
                                                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                    )}

                                                    {/* Recommendations */}
                                                    {recommendationsCount > 0 && (
                                                        <Box sx={{ backgroundColor: "#f8f9fc", p: 1.5, borderRadius: 2 }}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <TrendingUpIcon sx={{ fontSize: 16, color: "#8310FF" }} />
                                                                <Typography variant="caption" sx={{ color: "#333", fontWeight: 700 }}>
                                                                    {recommendationsCount} Recommendation{recommendationsCount > 1 ? 's' : ''} Available
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                                        <Button
                                                            onClick={() => router.push(`/interview/report/${row._id || row.id}`)}
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                px: 2,
                                                                backgroundColor: "#8310FF",
                                                                color: "#fff",
                                                                borderRadius: 2,
                                                                "&:hover": {
                                                                    backgroundColor: "#6B0BC7",
                                                                },
                                                            }}
                                                        >
                                                            View details
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Box>
                        </Box>
                    ) : normalizedTab === "soft" ? (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Soft Skills Assessments</Typography>
                                <Typography variant="body2" sx={{ color: "#666" }}>{total} result{total === 1 ? "" : "s"}</Typography>
                            </Stack>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                                {data.length === 0 ? (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                                        <Typography sx={{ fontWeight: 600 }}>No soft skills assessments found</Typography>
                                        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>Soft skills assessments you complete will appear here.</Typography>
                                    </Paper>
                                ) : (
                                    data.map((row: any) => {
                                        // Extract data from new structure (metadata + interviewData)
                                        const metadata = row.metadata || {};
                                        const interviewData = row.interviewData || {};
                                        const finalReport = interviewData.finalReport || {};
                                        const coverage = finalReport.coverage || {};

                                        // Get overall coverage score
                                        const overallCoverage = coverage.overall !== undefined ? coverage.overall : null;

                                        // Use overall coverage as score, fallback to old structure
                                        const score = overallCoverage !== null ? overallCoverage :
                                                     (typeof row.skillDetails?.[0]?.confidenceScore === "number"
                                                         ? Math.max(0, Math.min(100, row.skillDetails[0].confidenceScore))
                                                         : typeof row?.overallScore === "number"
                                                         ? Math.max(0, Math.min(100, row.overallScore))
                                                         : null);

                                        let level: string = "Unknown";
                                        let color: "default" | "success" | "warning" | "error" = "default";
                                        if (score !== null) {
                                            if (score >= 85) { level = "Excellent"; color = "success"; }
                                            else if (score >= 70) { level = "Good"; color = "success"; }
                                            else if (score >= 50) { level = "Average"; color = "warning"; }
                                            else { level = "Needs Improvement"; color = "error"; }
                                        }

                                        const skillName = metadata.skill || row.skillDetails?.[0]?.name;
                                        const title = skillName || row.post?.jobDetails?.title || row.skillName || "Soft Skills Assessment";
                                        const dateLabel = metadata.exportedAt ? new Date(metadata.exportedAt).toLocaleDateString() :
                                                         (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null);
                                        const proficiencyLevel = metadata.proficiency || row.skillDetails?.[0]?.proficiencyLevel;
                                        const skillType = metadata.type || "soft skills";
                                        const totalQuestions = row.skillDetails?.[0]?.questionAnswerList?.length || 0;
                                        const correctAnswers = row.skillDetails?.[0]?.questionAnswerList?.filter((qa: any) => qa.status === "correct").length || 0;
                                        return (
                                            <Paper
                                                key={row._id || row.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    borderColor: "#E0E0E0",
                                                    transition: "all .2s ease",
                                                    "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,.08)", transform: "translateY(-2px)" },
                                                }}
                                            >
                                                <Stack spacing={1.25}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                                                        {score !== null && (
                                                            <Chip size="small" color={color} label={level} sx={{ fontWeight: 700 }} />
                                                        )}
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#7a7a7a" }}>
                                                        <PsychologyIcon sx={{ fontSize: 18 }} />
                                                        <Typography variant="body2">{skillType}</Typography>
                                                        {dateLabel && (
                                                            <>
                                                                <Typography variant="body2" sx={{ mx: 0.5 }}>•</Typography>
                                                                <Typography variant="body2">{dateLabel}</Typography>
                                                            </>
                                                        )}
                                                    </Stack>

                                                    {score !== null ? (
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                                                                <CircularProgress variant="determinate" value={score} size={64} thickness={5} sx={{
                                                                    color: "#ece7fb",
                                                                }} />
                                                                <CircularProgress variant="determinate" value={score} size={64} thickness={5} sx={{
                                                                    position: "absolute",
                                                                    left: 0,
                                                                    top: 0,
                                                                    color: "#8310FF",
                                                                }} />
                                                                <Box sx={{
                                                                    top: 0,
                                                                    left: 0,
                                                                    bottom: 0,
                                                                    right: 0,
                                                                    position: "absolute",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#333" }}>{`${score}%`}</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                                    <Typography variant="caption" sx={{ color: "#666" }}>Overall Score</Typography>
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Tooltip title="Relative standing">
                                                                            <TrendingUpIcon sx={{ fontSize: 16, color: "#8310FF" }} />
                                                                        </Tooltip>
                                                                        <Typography variant="caption" sx={{ color: "#333", fontWeight: 700 }}>{level}</Typography>
                                                                    </Stack>
                                                                </Stack>
                                                                <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 6, "& .MuiLinearProgress-bar": { backgroundColor: "#8310FF" } }} />
                                                            </Box>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#666" }}>No score available</Typography>
                                                    )}

                                                    <Divider sx={{ my: 1 }} />
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                                        {metadata.type && (
                                                            <Chip
                                                                size="small"
                                                                label={metadata.type}
                                                                variant="outlined"
                                                                sx={{ textTransform: "capitalize", fontWeight: 600 }}
                                                            />
                                                        )}
                                                        {proficiencyLevel && (
                                                            <Chip
                                                                size="small"
                                                                label={proficiencyLevel}
                                                                variant="outlined"
                                                                color="primary"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                        {totalQuestions > 0 && (
                                                            <Chip
                                                                size="small"
                                                                label={`${correctAnswers}/${totalQuestions} correct`}
                                                                variant="outlined"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                    </Stack>

                                                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                                        <Button
                                                            onClick={() => router.push(`/interview/report/${row._id || row.id}`)}
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                px: 2,
                                                                backgroundColor: "#8310FF",
                                                                color: "#fff",
                                                                borderRadius: 2,
                                                                "&:hover": {
                                                                    backgroundColor: "#6B0BC7",
                                                                },
                                                            }}
                                                        >
                                                            View details
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Table size="small" sx={{ minWidth: 900 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Overall Score</TableCell>
                                        <TableCell>Post Name</TableCell>
                                        <TableCell>Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((row: any) => {
                                            return (
                                                <TableRow key={row._id || row.id}>
                                                    <TableCell>{row.type || "-"}</TableCell>
                                                    <TableCell>{row.overallScore ?? "-"}</TableCell>
                                                    <TableCell>
                                                        {row.post?.jobDetails?.title || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/interview/report/${row._id || row.id}`
                                                                )
                                                            }
                                                        >
                                                            Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                    {data.length > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <TablePagination
                                component="div"
                                count={total}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[3, 5, 10]}
                                sx={
                                    normalizedTab === "post_interview"
                                        ? {
                                            "& .MuiTablePagination-toolbar": {
                                                backgroundColor: "#f8f9fa",
                                                borderRadius: 2,
                                                px: 2,
                                            },
                                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                                            {
                                                color: "#666",
                                                fontWeight: 500,
                                            },
                                        }
                                        : {}
                                }
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}


