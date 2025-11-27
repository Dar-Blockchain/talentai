import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  Autocomplete,
  Paper,
} from "@mui/material";
import {
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { JOB_LOCATIONS } from "@/constants/jobConstants";
import Image from "next/image";
import Footer from "@/components/home-page/Footer";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "On-Site" | "Remote" | "Hybrid";
  employmentType: "Full-Time" | "Part-Time" | "Contract";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  datePosted: string;
  skills: string[];
  logo?: string;
}

const JobSearchPage: React.FC = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Pagination metadata from API
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Track if URL params have been initialized
  const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);

  // Job details state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [jobDetailsError, setJobDetailsError] = useState<string | null>(null);

  // Fetch jobs from backend API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        // Temporarily removed status filter to see all posts
        // status: 'active',
      });

      // Add optional filters - use current state values
      if (searchQuery) params.append("search", searchQuery);
      // Don't send category to backend - we'll filter on frontend
      if (selectedLocation && selectedLocation !== "All Locations") {
        params.append("location", selectedLocation);
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const apiUrl = `${baseUrl}post/search?${params}`; // ⚠️ SLASH IS REQUIRED!

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `Failed to fetch jobs: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Transform backend data to match frontend Job interface
        const transformedJobs = (data.results || []).map((job: any) => ({
          id: job._id,
          title: job.jobDetails?.title || "Untitled Position",
          company: job.user?.companyDetails?.companyName || "Company",
          location: job.jobDetails?.location || "Location not specified",
          type: job.jobDetails?.workType || job.jobDetails?.type || "On-Site",
          employmentType: job.jobDetails?.employmentType || "Full-Time",
          salary: {
            min: job.jobDetails?.salary?.min || 0,
            max: job.jobDetails?.salary?.max || 0,
            currency: job.jobDetails?.salary?.currency || "USD",
          },
          description:
            job.jobDetails?.description || "No description available",
          datePosted: job.createdAt || new Date().toISOString(),
          skills:
            job.skillAnalysis?.requiredSkills?.map((skill: any) =>
              typeof skill === "string" ? skill : skill.name
            ) || [],
          logo: job.user?.companyDetails?.logo || undefined,
        }));

        setJobs(transformedJobs);
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.total || 0);
      } else {
        setError(data.message || "Failed to fetch jobs");
      }
    } catch (err) {
      setError("Error loading jobs. Please try again later.");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedLocation]);

  // Initialize search params from URL on page load ONCE
  useEffect(() => {
    if (router.isReady && !urlParamsLoaded) {
      const { search, location } = router.query;

      // Set state from URL parameters only on initial load
      if (search && typeof search === "string") {
        setSearchQuery(search);
      }
      if (location && typeof location === "string") {
        setSelectedLocation(location);
      }

      // Mark URL params as loaded
      setUrlParamsLoaded(true);
    } else if (router.isReady && urlParamsLoaded === false) {
      // No URL params, mark as loaded anyway
      setUrlParamsLoaded(true);
    }
  }, [router.isReady, urlParamsLoaded]);

  // Fetch jobs whenever search parameters or page changes, but ONLY after URL params are loaded
  useEffect(() => {
    if (router.isReady && urlParamsLoaded) {
      fetchJobs();
    }
  }, [router.isReady, urlParamsLoaded, fetchJobs]);

  const handleSearch = () => {
    // If already on page 1, force a fetch. Otherwise, set to page 1 which will trigger fetch
    if (currentPage === 1) {
      fetchJobs();
    } else {
      setCurrentPage(1);
    }
  };

  // Fetch job details
  const fetchJobDetails = async (jobId: string) => {
    setJobDetailsLoading(true);
    setJobDetailsError(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const apiUrl = `${baseUrl}post/details/${jobId}`;

      console.log("🔍 Fetching job details from:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }

      const data = await response.json();

      if (data.success) {
        setJobDetails(data.data);
      } else {
        setJobDetailsError(data.error || "Failed to fetch job details");
      }
    } catch (err) {
      setJobDetailsError("Error loading job details. Please try again later.");
      console.error("Error fetching job details:", err);
    } finally {
      setJobDetailsLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    // Find the selected job
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      fetchJobDetails(jobId);
    }
  };

  const formatSalary = (salary: Job["salary"]) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${
      salary.currency
    } ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "On-Site":
        return "#e3f2fd";
      case "Remote":
        return "#e8f5e8";
      case "Hybrid":
        return "#fff3e0";
      default:
        return "#f5f5f5";
    }
  };

  const getJobTypeTextColor = (type: string) => {
    switch (type) {
      case "On-Site":
        return "#1976d2";
      case "Remote":
        return "#2e7d32";
      case "Hybrid":
        return "#f57c00";
      default:
        return "#666";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FDFEFE",
      }}
    >
      <Header
        logo="/images/home/logocandidate.png"
        type="jobseeker"
        color="#8310FF"
        link="Are you hiring?"
      />

      <Container
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xs: "95%", lg: "1400px" }, // 100% on small, 80% on large screens
          mx: "auto", // center horizontally
        }}
      >
        {" "}
        {/* Hero Section - matches the image exactly */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.5rem", md: "40px" },
              color: "#2b2152",
              mb: 2,
              fontWeight: 700,
              fontStyle: "bold",
              lineHeight: "164%",
              letterSpacing: "0%",
            }}
          >
            Your next job starts here
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#666",
              mb: 4,
              maxWidth: "800px",
              mx: "auto",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "160%",
              letterSpacing: 0,
              textAlign: "center",
            }}
          >
            Discover top jobs from over{" "}
            {totalJobs > 0 ? totalJobs.toLocaleString() : "22,000"} listings
            across industries and roles. Filter the best remote opportunities
            by, location, and category, with thousands of new positions added
            each month.
          </Typography>
        </Box>
        {/* Search Bar - matches the image exactly */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            maxWidth: 900,
            alignItems: "center",
            gap: { xs: 2, sm: 0 },
            mb: 4,
            p: 1,
            backgroundColor: "#fff",
            borderRadius: "50px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            mx: "auto",
          }}
        >
          {/* Job Title Input */}
          <TextField
            fullWidth
            placeholder="Job Title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image
                    src="/icons/search.svg" // ✅ path inside /public folder
                    alt="search"
                    width={24}
                    height={24}
                    style={{ opacity: 0.7 }}
                  />
                </InputAdornment>
              ),
              sx: {
                height: "48px",
                paddingRight: 1,
                "& input": {
                  padding: "10px 0px",
                  fontSize: "14px",
                  color: "#333",
                },
              },
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                display: "flex",
                alignItems: "center",
                borderRadius: 0,
                border: "none",
                backgroundColor: "transparent",
                "& fieldset": { border: "none" },
              },
              "& input::placeholder": {
                fontSize: "16px",
                color: "rgba(135, 135, 134, 1)",
              },
            }}
          />

          {/* Divider (hidden on mobile) */}
          <Box
            sx={{
              width: "1px",
              backgroundColor: "#e5e7eb",
              height: "30px",
              display: { xs: "none", sm: "block" },
              mx: 1,
            }}
          />

          {/* Location Autocomplete */}
          <Autocomplete
            value={selectedLocation}
            onChange={(e, newValue) => setSelectedLocation(newValue || "")}
            options={JOB_LOCATIONS}
            freeSolo
            onInputChange={(event, newInputValue) => {
              if (event?.type === "change") setSelectedLocation(newInputValue);
            }}
            PaperComponent={({ children, ...other }) => (
              <Paper
                {...other}
                sx={{
                  maxHeight: 300,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {children}
              </Paper>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="All Locations"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image
                        src="/icons/location.svg"
                        alt="location"
                        width={24}
                        height={24}
                        style={{ opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    height: "48px",
                    paddingRight: 1,
                    "& input": {
                      padding: "10px 0px",
                      fontSize: "16px",
                    },
                  },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                  "& input::placeholder": {
                    fontSize: "16px",
                    color: "rgba(135, 135, 134, 1)",
                  },
                }}
              />
            )}
            sx={{ flex: 1 }}
          />

          {/* Button */}
          <Button
            onClick={handleSearch}
            sx={{
              border: "1px solid rgba(163, 98, 239, 1)",
              color: "rgba(163, 98, 239, 1)",
              borderRadius: "50px",
              textTransform: "none",
              px: 3,
              py: 1.2,
              fontWeight: 600,
              fontSize: "16px",
              minWidth: "160px",
              ml: { xs: 0, sm: 1 },
              mt: { xs: 1, sm: 0 },
              "&:hover": {
                backgroundColor: "rgba(163, 98, 239, 1)",
                color: "white",
              },
            }}
          >
            Search Job
          </Button>
        </Box>
        {/* Results Header - matches the image */}
        <Typography
          variant="h6"
          sx={{
            color: "rgba(0, 0, 0, 1)",
            fontWeight: 500, // Medium weight
            fontStyle: "normal", // "Medium" is a weight, not a style
            fontSize: "14px",
            lineHeight: "160%", // equivalent to 1.6
            letterSpacing: 0,
            fontFamily: "var(--font-poppins)",
            mb: 2,
          }}
        >
          Discover {totalJobs} job listings :
        </Typography>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#8310FF" }} />
          </Box>
        )}
        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {/* Two Column Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Job Listings */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Job Listings - matches the image design */}
            {!loading && !error && (
              <>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {jobs.map((job) => (
                    <Grid size={{ xs: 12 }} key={job.id}>
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: 2,
                          border:
                            selectedJob?.id === job.id
                              ? "2px solid rgba(163, 98, 239, 1)"
                              : "1px solid #e0e0e0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            transform: "translateY(-1px)",
                          },
                        }}
                        onClick={(e) => {
                          handleJobClick(job.id);
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 2,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            "&:last-child": {
                              paddingBottom: 2,
                            },
                          }}
                        >
                          {/* Header with logo, title, company and date */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            {/* Company Logo */}
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                backgroundColor: "#f5f5f5",
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1.5,
                                flexShrink: 0,
                              }}
                            >
                              {job.logo ? (
                                <Box
                                  component="img"
                                  src={job.logo}
                                  alt={job.company}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    borderRadius: 1,
                                  }}
                                />
                              ) : (
                                <BusinessIcon
                                  sx={{ color: "#666", fontSize: 20 }}
                                />
                              )}
                            </Box>

                            {/* Job Title, Company and Date */}
                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 700,
                                      color: "#333",
                                      mb: 0.25,
                                      lineHeight: 1.2,
                                      fontSize: "1rem",
                                    }}
                                  >
                                    {job.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#666",
                                      fontSize: "0.8rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {job.company}
                                  </Typography>
                                  {/* Job Tags - matches the image exactly with light blue color */}
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
                                  >
                                    <Chip
                                      label={job.type}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          "rgba(95, 168, 211, 0.1)",
                                        color: "rgba(84, 98, 116, 1)",
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                        height: 24,
                                        border:
                                          "0.25px solid rgba(95, 168, 211, 1)",
                                      }}
                                      icon={
                                        <Image
                                          src="/icons/location2.svg" // ✅ path inside /public folder
                                          alt="search"
                                          width={13}
                                          height={13}
                                        />
                                      }
                                    />
                                    <Chip
                                      label={job.employmentType}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          "rgba(95, 168, 211, 0.1)",
                                        color: "rgba(84, 98, 116, 1)",
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                        height: 24,
                                        border:
                                          "0.25px solid rgba(95, 168, 211, 1)",
                                      }}
                                      icon={
                                        <Image
                                          src="/icons/suitcase.svg" // ✅ path inside /public folder
                                          alt="search"
                                          width={13}
                                          height={13}
                                        />
                                      }
                                    />
                                    <Chip
                                      label={formatSalary(job.salary)}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          "rgba(95, 168, 211, 0.1)",
                                        color: "rgba(84, 98, 116, 1)",
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                        height: 24,
                                        border:
                                          "0.25px solid rgba(95, 168, 211, 1)",
                                      }}
                                      icon={
                                        <Image
                                          src="/icons/dollar.svg" // ✅ path inside /public folder
                                          alt="search"
                                          width={13}
                                          height={13}
                                        />
                                      }
                                    />
                                  </Stack>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(156, 163, 175, 1)",
                                    whiteSpace: "nowrap",
                                    ml: 1.5,
                                    fontFamily: "Poppins", // font family
                                    fontWeight: 500, // Medium weight
                                    fontStyle: "normal", // font-style only accepts normal, italic, oblique
                                    fontSize: "12px", // font size
                                    lineHeight: "23px", // line-height
                                    letterSpacing: 0, // letter-spacing
                                    textAlign: "right",
                                  }}
                                >
                                  {formatDate(job.datePosted)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                      mb: 0,
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, value) => setCurrentPage(value)}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          margin: "0 2px",
                          minWidth: 40,
                          height: 40,
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          "&.Mui-selected": {
                            backgroundColor: "white",
                            borderColor: "rgba(163, 98, 239, 1)",
                            color: "rgba(163, 98, 239, 1)",
                            "&:hover": {
                              backgroundColor: "rgba(131, 16, 255, 0.04)",
                            },
                          },
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        },
                        "& .MuiPaginationItem-previousNext": {
                          backgroundColor: "#f5f5f5",
                          border: "1px solid #e0e0e0",
                          "&:hover": {
                            backgroundColor: "#e0e0e0",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Right Column - Job Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Job Details Panel */}
            {jobDetailsLoading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60vh",
                }}
              >
                <CircularProgress sx={{ color: "rgba(163, 98, 239, 1)" }} />
              </Box>
            )}

            {jobDetailsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {jobDetailsError}
              </Alert>
            )}

            {!jobDetailsLoading && !jobDetailsError && jobDetails && (
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Visible Title Only */}
                  <Box sx={{ p: 4, pb: 0 }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                    >
                      {jobDetails.jobDetails.title}
                    </Typography>
                  </Box>

                  {/* Everything else blurred */}
                  <Box sx={{ position: "relative", mt: 1 }}>
                    <Box
                      sx={{
                        p: 4,
                        filter: "blur(6px)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      aria-hidden
                    >
                      {/* Company Logo and Title */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 3,
                        }}
                      >
                        {jobDetails.user?.companyDetails?.logo && (
                          <Box
                            component="img"
                            src={jobDetails.user.companyDetails.logo}
                            // alt={jobDetails.user.companyDetails.companyName}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              mr: 2,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: "#2b2152", mb: 1 }}
                          >
                            {jobDetails.jobDetails.title}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Job Tags */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
                      >
                        <Chip
                          label={
                            jobDetails.jobDetails.workType ||
                            jobDetails.jobDetails.type ||
                            "On-Site"
                          }
                          size="small"
                          sx={{
                            backgroundColor: getJobTypeColor(
                              jobDetails.jobDetails.workType ||
                                jobDetails.jobDetails.type ||
                                "On-Site"
                            ),
                            color: getJobTypeTextColor(
                              jobDetails.jobDetails.workType ||
                                jobDetails.jobDetails.type ||
                                "On-Site"
                            ),
                            fontWeight: 600,
                            border: "none",
                          }}
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                        />
                        <Chip
                          label={`${
                            jobDetails.jobDetails.salary.currency
                          } ${jobDetails.jobDetails.salary.min.toLocaleString()} - ${
                            jobDetails.jobDetails.salary.currency
                          } ${jobDetails.jobDetails.salary.max.toLocaleString()}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                          icon={<MoneyIcon sx={{ fontSize: 16 }} />}
                        />
                        <Chip
                          label={jobDetails.jobDetails.employmentType}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                        />
                      </Stack>

                      {/* Required Skills */}
                      {jobDetails.skillAnalysis?.requiredSkills?.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                          >
                            Required Skills
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ flexWrap: "wrap", gap: 1 }}
                          >
                            {jobDetails.skillAnalysis.requiredSkills.map(
                              (skill: any, index: number) => (
                                <Chip
                                  key={index}
                                  label={
                                    typeof skill === "string"
                                      ? skill
                                      : `${skill.name}${
                                          skill.level ? ` (${skill.level})` : ""
                                        }`
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor: "#f5f5f5",
                                    color: "#2b2152",
                                    fontWeight: 600,
                                  }}
                                />
                              )
                            )}
                          </Stack>
                        </Box>
                      )}

                      <Divider sx={{ my: 3 }} />

                      {/* Description */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#666",
                            lineHeight: 1.6,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {jobDetails.jobDetails.description}
                        </Typography>
                      </Box>

                      {/* Requirements */}
                      {jobDetails.jobDetails.requirements && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                          >
                            What are we looking for?
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#666",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {jobDetails.jobDetails.requirements}
                          </Typography>
                        </Box>
                      )}

                      {/* Benefits */}
                      {jobDetails.jobDetails.benefits && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                          >
                            What do we have to offer you?
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#666",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {jobDetails.jobDetails.benefits}
                          </Typography>
                        </Box>
                      )}

                      {/* Responsibilities */}
                      {jobDetails.jobDetails.responsibilities && (
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#2b2152", mb: 2 }}
                          >
                            What makes us different?
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#666",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {jobDetails.jobDetails.responsibilities}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.4)",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* No Job Selected State */}
            {!jobDetailsLoading && !jobDetailsError && !jobDetails && !loading && (
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.4)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  py: 6,
                  px: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  textAlign: "center",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      mx: "auto",
                      mb: 3,
                      background: "rgba(130,16,255,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src="/icons/suitcase.svg" // ✅ path inside /public folder
                      alt="search"
                      width={32}
                      height={32}
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{ color: "#333", fontWeight: 600, mb: 1 }}
                  >
                    No Job Selected
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "#666", maxWidth: 300, mx: "auto" }}
                  >
                    Select a job from the list to view its full description and
                    requirements.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
        {/* No Results */}
        {!loading && !error && jobs.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
              No jobs found matching your criteria
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default JobSearchPage;
