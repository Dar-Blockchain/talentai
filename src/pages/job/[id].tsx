import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
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
  Paper,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Header from '@/components/Header';
import ModernFooter from '@/components/home-page/ModernFooter';

interface JobDetail {
  _id: string;
  jobDetails: {
    title: string;
    description: string;
    location: string;
    workType: string;
    type?: string;
    employmentType: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    requirements?: string;
    responsibilities?: string;
    benefits?: string;
    experienceLevel?: string;
  };
  skillAnalysis: {
    requiredSkills: Array<{
      name: string;
      level?: string;
    }>;
  };
  user: {
    companyDetails?: {
      companyName: string;
      logo?: string;
      description?: string;
      website?: string;
    };
    email: string;
    username: string;
  };
  status: string;
  createdAt: string;
}

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const apiUrl = `${baseUrl}post/details/${id}`;  // Public endpoint, no auth required
        
        console.log('🔍 Fetching job details from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();

        if (data.success) {
          setJob(data.data);
        } else {
          setError(data.error || 'Failed to fetch job details');
        }
      } catch (err) {
        setError('Error loading job details. Please try again later.');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const formatSalary = (salary: JobDetail['jobDetails']['salary']) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.currency} ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <Header 
        logo="/images/home/logocandidate.png"
        type="jobseeker"
        color="#8310FF"
        link="Are you hiring?"
      />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/jobs')}
          sx={{
            mb: 3,
            color: '#8310FF',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 0.04)',
            }
          }}
        >
          Back to Jobs
        </Button>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Job Details */}
        {!loading && !error && job && (
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Job Title */}
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                    {job.jobDetails.title}
                  </Typography>

                  {/* Company */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <BusinessIcon sx={{ color: '#666' }} />
                    <Typography variant="h6" sx={{ color: '#666' }}>
                      {job.user?.companyDetails?.companyName || job.user?.username}
                    </Typography>
                  </Stack>

                  {/* Job Meta Info */}
                  <Stack direction="row" spacing={3} sx={{ mb: 3, flexWrap: 'wrap' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon sx={{ color: '#8310FF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {job.jobDetails.location}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkIcon sx={{ color: '#8310FF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {job.jobDetails.workType || job.jobDetails.type}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MoneyIcon sx={{ color: '#8310FF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {formatSalary(job.jobDetails.salary)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon sx={{ color: '#8310FF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Posted {formatDate(job.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Badges */}
                  <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label={job.jobDetails.employmentType} 
                      sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                    />
                    {job.jobDetails.experienceLevel && (
                      <Chip 
                        label={job.jobDetails.experienceLevel} 
                        sx={{ backgroundColor: '#f3e5f5', color: '#8310FF', fontWeight: 600 }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                      Job Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {job.jobDetails.description}
                    </Typography>
                  </Box>

                  {/* Requirements */}
                  {job.jobDetails.requirements && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                        Requirements
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {job.jobDetails.requirements}
                      </Typography>
                    </Box>
                  )}

                  {/* Responsibilities */}
                  {job.jobDetails.responsibilities && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                        Responsibilities
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {job.jobDetails.responsibilities}
                      </Typography>
                    </Box>
                  )}

                  {/* Benefits */}
                  {job.jobDetails.benefits && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                        Benefits
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {job.jobDetails.benefits}
                      </Typography>
                    </Box>
                  )}

                  {/* Skills */}
                  {job.skillAnalysis?.requiredSkills?.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                        Required Skills
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {job.skillAnalysis.requiredSkills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={typeof skill === 'string' ? skill : `${skill.name}${skill.level ? ` (${skill.level})` : ''}`}
                            sx={{
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Company Info */}
              {job.user?.companyDetails && (
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                      About the Company
                    </Typography>
                    
                    {job.user.companyDetails.logo && (
                      <Box
                        component="img"
                        src={job.user.companyDetails.logo}
                        alt={job.user.companyDetails.companyName}
                        sx={{
                          width: '100%',
                          maxWidth: 120,
                          height: 'auto',
                          mb: 2,
                        }}
                      />
                    )}

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                      {job.user.companyDetails.companyName}
                    </Typography>

                    {job.user.companyDetails.description && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
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
                          textTransform: 'none',
                          fontWeight: 600,
                          borderColor: '#8310FF',
                          color: '#8310FF',
                          '&:hover': {
                            borderColor: '#6B0BC7',
                            backgroundColor: 'rgba(131, 16, 255, 0.04)',
                          }
                        }}
                      >
                        Visit Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Job Summary */}
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                  Job Summary
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      EMPLOYMENT TYPE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                      {job.jobDetails.employmentType}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      WORK TYPE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                      {job.jobDetails.workType || job.jobDetails.type}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                      {job.jobDetails.location}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      SALARY RANGE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                      {formatSalary(job.jobDetails.salary)}
                    </Typography>
                  </Box>

                  {job.jobDetails.experienceLevel && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                        EXPERIENCE LEVEL
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                        {job.jobDetails.experienceLevel}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
      
      <ModernFooter />
    </Box>
  );
};

export default JobDetailPage;

