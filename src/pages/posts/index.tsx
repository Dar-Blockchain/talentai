import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchJobDetails,
  searchJobs,
  selectJobSearchJobs,
  selectJobSearchLoading,
  selectJobSearchError,
  selectJobSearchTotalPages,
  selectJobSearchTotalJobs,
} from "@/store/slices/jobDetailsSlice";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import JobSearchBar from "@/components/posts/list/JobSearchBar";
import JobCard from "@/components/posts/list/JobCard";
import JobDetailsPanel from "@/components/posts/list/JobDetailsPanel";
import { Job } from "@/utils/jobHelpers";

const JobSearchPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state for job details
  const { jobDetails, loading: jobDetailsLoading, error: jobDetailsError } = useSelector(
    (state: RootState) => state.jobDetails
  );

  // Redux state for job search
  const jobs = useSelector(selectJobSearchJobs);
  const loading = useSelector(selectJobSearchLoading);
  const error = useSelector(selectJobSearchError);
  const totalPages = useSelector(selectJobSearchTotalPages);
  const totalJobs = useSelector(selectJobSearchTotalJobs);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Track if URL params have been initialized
  const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);

  // Job details state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Initialize search params from URL on page load ONCE
  useEffect(() => {
    if (router.isReady && !urlParamsLoaded) {
      const { search, location } = router.query;

      if (search && typeof search === "string") {
        setSearchQuery(search);
      }
      if (location && typeof location === "string") {
        setSelectedLocation(location);
      }

      setUrlParamsLoaded(true);
    } else if (router.isReady && urlParamsLoaded === false) {
      setUrlParamsLoaded(true);
    }
  }, [router.isReady, urlParamsLoaded]);

  // Fetch jobs whenever search parameters or page changes, but ONLY after URL params are loaded
  useEffect(() => {
    if (router.isReady && urlParamsLoaded) {
      dispatch(
        searchJobs({
          page: currentPage,
          limit: jobsPerPage,
          search: searchQuery || undefined,
          location: selectedLocation || undefined,
        })
      );
    }
  }, [router.isReady, urlParamsLoaded, currentPage, searchQuery, selectedLocation, dispatch]);

  const handleSearch = () => {
    if (currentPage === 1) {
      dispatch(
        searchJobs({
          page: 1,
          limit: jobsPerPage,
          search: searchQuery || undefined,
          location: selectedLocation || undefined,
        })
      );
    } else {
      setCurrentPage(1);
    }
  };

  const handleJobClick = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      dispatch(fetchJobDetails(jobId));
    }
  };

  return (
    <PageContainer>
      <Header/>
        {/* Hero Section */}
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
              mb: 2,
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
        {/* Results Header */}
        <Typography
          variant="h6"
          sx={{
            color: "rgba(0, 0, 0, 1)",
            fontWeight: 500,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "160%",
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
      </PageContainer>
  );
};

export default JobSearchPage;
