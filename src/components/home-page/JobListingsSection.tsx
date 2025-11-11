import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/router";
import JobCarousel from "./candidate/JobCarousel";

interface Job {
  id: string;
  title: string;
  type: string;
  salary: string;
  company: string;
  location: string;
  logo: string;
}

const JobListingsSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from API
  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        const apiUrl = `${baseUrl}post/search?limit=9&sortBy=createdAt&sortOrder=desc`;

        console.log("🔍 Fetching latest jobs for landing page");

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();

        if (data.success && data.results) {
          // Transform API data to match component interface
          const currencySymbols: Record<string, string> = {
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥",
          };

          const transformedJobs = data.results.map((job: any) => {
            const companyName =
              job.user?.companyDetails?.companyName ||
              job.user?.username ||
              "Company";

            const currencyCode =
              job.jobDetails?.salary?.currency?.toUpperCase() || "USD";
            const currencySymbol =
              currencySymbols[currencyCode] || currencyCode;

            const minSalary = job.jobDetails?.salary?.min;
            const maxSalary = job.jobDetails?.salary?.max;

            const salary =
              minSalary && maxSalary
                ? `${currencySymbol}${minSalary.toLocaleString()} - ${currencySymbol}${maxSalary.toLocaleString()}`
                : "Salary not specified";

            return {
              id: job._id,
              title: job.jobDetails?.title || "Untitled Position",
              type:
                job.jobDetails?.employmentType?.toUpperCase() || "FULL-TIME",
              salary,
              company: companyName,
              location: job.jobDetails?.location || "Location not specified",
              logo: companyName.charAt(0).toUpperCase(),
            };
          });

          setJobs(transformedJobs);
          console.log("✅ Loaded", transformedJobs.length, "jobs");
        }
      } catch (error) {
        console.error("Error fetching latest jobs:", error);
        // Keep empty array to show no jobs
      } finally {
        setLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

  const jobsPerSlide = 3;
  const totalSlides = Math.ceil(jobs.length / jobsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentJobs = jobs.slice(
    currentSlide * jobsPerSlide,
    (currentSlide + 1) * jobsPerSlide
  );

  return (
    <Box sx={{ py: 6 }}>
      {/* Promotional Banner */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 8,
          maxWidth: 1300,
          mx: "auto",
          px: 4,
          minHeight: 300,
        }}
      >
        {/* Centered Card */}
        <Card
          sx={{
            width: "100%",
            p: 6,
            borderRadius: "24px",
            backgroundColor: "rgba(248, 250, 252, 1)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            textAlign: "left",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: { xs: "24px", md: "32px" },
              color: "#000000",
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Ready to Take the Next Step in Your Career?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              color: "#666666",
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Join thousands of job seekers who have found success with TalentAI.
            Sign up today to unlock personalized job recommendations, expert
            resources, and invaluable support to guide you towards your dream
            job.
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push("/jobs")}
            sx={{
              backgroundColor: "rgba(163, 98, 239, 1)",
              color: "#ffffff",
              px: 4,
              py: 1,
              borderRadius: "50px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#6b0db8",
              },
            }}
          >
            Search Job
          </Button>
        </Card>
      </Box>

      {/* Job Listings Section */}
      {jobs.length > 0 && (
        <Box sx={{ maxWidth: 1300, mx: "auto", px: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: { xs: "24px", md: "48px" },
              color: "#333",
              mb: 1,
              textAlign: "left",
            }}
          >
            Latest job listings
          </Typography>
          <JobCarousel jobs={jobs} loading={loading} />
        </Box>
      )}
    </Box>
  );
};

export default JobListingsSection;
