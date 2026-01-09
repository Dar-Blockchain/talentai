import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchJobDetails } from "@/store/slices/jobDetailsSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobSearchBar from "@/components/posts/list/JobSearchBar";
import JobCard from "@/components/posts/list/JobCard";
import JobDetailsPanel from "@/components/posts/list/JobDetailsPanel";
import { Job, transformJobData } from "@/utils/jobHelpers";

const JobSearchPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state for job details
  const { jobDetails, loading: jobDetailsLoading, error: jobDetailsError } = useSelector(
    (state: RootState) => state.jobDetails
  );

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
        const transformedJobs = (data.results || []).map(transformJobData);

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

  const handleJobClick = (jobId: string) => {
    // Find the selected job
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      // Dispatch Redux action to fetch job details
      dispatch(fetchJobDetails(jobId));
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

        {/* Search Bar */}
        <JobSearchBar
          searchQuery={searchQuery}
          selectedLocation={selectedLocation}
          onSearchQueryChange={setSearchQuery}
          onLocationChange={setSelectedLocation}
          onSearch={handleSearch}
        />
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
            {/* Job Listings */}
            {!loading && !error && (
              <>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {jobs.map((job) => (
                    <Grid size={{ xs: 12 }} key={job.id}>
                      <JobCard
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        onClick={handleJobClick}
                      />
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
            <JobDetailsPanel
              jobDetails={jobDetails}
              loading={jobDetailsLoading}
              error={jobDetailsError}
            />
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
