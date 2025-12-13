import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { getJobTypeColor, getJobTypeTextColor } from '@/utils/jobHelpers';

interface JobDetailsPanelProps {
  jobDetails: any | null;
  loading: boolean;
  error: string | null;
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  jobDetails,
  loading,
  error,
}) => {
  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress sx={{ color: 'rgba(163, 98, 239, 1)' }} />
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Job Details Loaded
  if (jobDetails) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Visible Title Only */}
          <Box sx={{ p: 4, pb: 0 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
            >
              {jobDetails.jobDetails.title}
            </Typography>
          </Box>

          {/* Everything else blurred */}
          <Box sx={{ position: 'relative', mt: 1 }}>
            <Box
              sx={{
                p: 4,
                filter: 'blur(6px)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              aria-hidden
            >
              {/* Company Logo and Title */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 3,
                }}
              >
                {jobDetails.user?.companyDetails?.logo && (
                  <Box
                    component="img"
                    src={jobDetails.user.companyDetails.logo}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      mr: 2,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: '#2b2152', mb: 1 }}
                  >
                    {jobDetails.jobDetails.title}
                  </Typography>
                </Box>
              </Box>

              {/* Job Tags */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
              >
                <Chip
                  label={
                    jobDetails.jobDetails.workType ||
                    jobDetails.jobDetails.type ||
                    'On-Site'
                  }
                  size="small"
                  sx={{
                    backgroundColor: getJobTypeColor(
                      jobDetails.jobDetails.workType ||
                        jobDetails.jobDetails.type ||
                        'On-Site'
                    ),
                    color: getJobTypeTextColor(
                      jobDetails.jobDetails.workType ||
                        jobDetails.jobDetails.type ||
                        'On-Site'
                    ),
                    fontWeight: 600,
                    border: 'none',
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
                    sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
                  >
                    Required Skills
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {jobDetails.skillAnalysis.requiredSkills.map(
                      (skill: any, index: number) => (
                        <Chip
                          key={index}
                          label={
                            typeof skill === 'string'
                              ? skill
                              : `${skill.name}${
                                  skill.level ? ` (${skill.level})` : ''
                                }`
                          }
                          size="small"
                          sx={{
                            backgroundColor: '#f5f5f5',
                            color: '#2b2152',
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
                  sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
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
                    sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
                  >
                    What are we looking for?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
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
                    sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
                  >
                    What do we have to offer you?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
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
                    sx={{ fontWeight: 700, color: '#2b2152', mb: 2 }}
                  >
                    What makes us different?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {jobDetails.jobDetails.responsibilities}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.4)',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // No Job Selected State
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        py: 6,
        px: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        textAlign: 'center',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            mx: 'auto',
            mb: 3,
            background: 'rgba(130,16,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/icons/suitcase.svg"
            alt="No job selected"
            width={32}
            height={32}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{ color: '#333', fontWeight: 600, mb: 1 }}
        >
          No Job Selected
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#666', maxWidth: 300, mx: 'auto' }}
        >
          Select a job from the list to view its full description and
          requirements.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsPanel);
