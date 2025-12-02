import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Container
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import Header from "@/components/Header";
import { AppDispatch } from "@/store/store";
import {
  fetchJobById,
  selectCurrentJob,
  selectCurrentJobLoading,
  selectCurrentJobError,
} from "@/store/slices/postSlice";
import Footer from "@/components/home-page/Footer";
import HeaderDashboard from "@/components/HeaderDashboard";

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
    }
  }, [id, dispatch]);

  const formatSalary = (salary: any) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${
      salary.currency
    } ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container maxWidth="lg">
      <HeaderDashboard />

      <Box sx={{ py: 4, flex: 1, px: 4, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/jobs")}
          sx={{
            mb: 3,
            color: "#8310FF",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(131, 16, 255, 0.04)",
            },
          }}
        >
          Back to Jobs
        </Button>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
              width: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#8310FF" }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && job && (
          <Grid spacing={3}>
            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                  >
                    {job.jobDetails.title}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <BusinessIcon sx={{ color: "#666" }} />
                    <Typography variant="h6" sx={{ color: "#666" }}>
                      {job.user?.companyDetails?.companyName ||
                        job.user?.username}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={3}
                    sx={{ mb: 3, flexWrap: "wrap" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon sx={{ color: "#8310FF", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {job.jobDetails.location}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkIcon sx={{ color: "#8310FF", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {job.jobDetails.workType || job.jobDetails.type}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MoneyIcon sx={{ color: "#8310FF", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {formatSalary(job.jobDetails.salary)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon sx={{ color: "#8310FF", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Posted {formatDate(job.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 3, flexWrap: "wrap" }}
                  >
                    <Chip
                      label={job.jobDetails.employmentType}
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    />
                    {job.jobDetails.experienceLevel && (
                      <Chip
                        label={job.jobDetails.experienceLevel}
                        sx={{
                          backgroundColor: "#f3e5f5",
                          color: "#8310FF",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                    >
                      Job Description
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#666",
                        lineHeight: 1.8,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {job.jobDetails.description}
                    </Typography>
                  </Box>

                  {job.jobDetails.requirements && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                      >
                        Requirements
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {job.jobDetails.requirements}
                      </Typography>
                    </Box>
                  )}

                  {job.jobDetails.responsibilities && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                      >
                        Responsibilities
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {job.jobDetails.responsibilities}
                      </Typography>
                    </Box>
                  )}

                  {job.jobDetails.benefits && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                      >
                        Benefits
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {job.jobDetails.benefits}
                      </Typography>
                    </Box>
                  )}

                  {job.skillAnalysis?.requiredSkills?.length > 0 && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                      >
                        Required Skills
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap", gap: 1 }}
                      >
                        {job.skillAnalysis.requiredSkills.map(
                          (skill, index) => (
                            <Chip
                              key={index}
                              label={
                                typeof skill === "string"
                                  ? skill
                                  : `${skill.name}${
                                      skill.level ? ` (${skill.level})` : ""
                                    }`
                              }
                              sx={{
                                backgroundColor: "#f5f5f5",
                                color: "#333",
                                fontWeight: 500,
                              }}
                            />
                          )
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              {job.user?.companyDetails && (
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#333", mb: 2 }}
                    >
                      About the Company
                    </Typography>

                    {job.user.companyDetails.logo && (
                      <Box
                        component="img"
                        src={job.user.companyDetails.logo}
                        alt={job.user.companyDetails.companyName}
                        sx={{
                          width: "100%",
                          maxWidth: 120,
                          height: "auto",
                          mb: 2,
                        }}
                      />
                    )}

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#333", mb: 1 }}
                    >
                      {job.user.companyDetails.companyName}
                    </Typography>

                    {job.user.companyDetails.description && (
                      <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                        {job.user.companyDetails.description}
                      </Typography>
                    )}

                    {job.user.companyDetails.website && (
                      <Button
                        variant="outlined"
                        fullWidth
                        href={job.user.companyDetails.website}
                        target="_blank"
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#8310FF",
                          color: "#8310FF",
                          "&:hover": {
                            borderColor: "#6B0BC7",
                            backgroundColor: "rgba(131, 16, 255, 0.04)",
                          },
                        }}
                      >
                        Visit Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
</Container>
      <Footer />

    </Box>
  );
};

export default JobDetailPage;