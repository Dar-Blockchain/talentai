import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Stack } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import Image from 'next/image';
import { Job, formatDate } from '@/utils/jobHelpers';
import { formatSalary } from '@/utils/postHelpers';

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSelected, onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: isSelected
          ? '2px solid rgba(163, 98, 239, 1)'
          : '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-1px)',
        },
      }}
      onClick={() => onClick(job.id)}
    >
      <CardContent
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': {
            paddingBottom: 2,
          },
        }}
      >
        {/* Header with logo, title, company and date */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {/* Company Logo */}
          <Box
            sx={{
              width: 64,
              height: 64,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            ) : (
              <BusinessIcon sx={{ color: '#666', fontSize: 20 }} />
            )}
          </Box>

          {/* Job Title, Company and Date */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    mb: 0.25,
                    lineHeight: 1.2,
                    fontSize: '1rem',
                  }}
                >
                  {job.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {job.company}
                </Typography>
                {/* Job Tags */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
                >
                  <Chip
                    label={job.type}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(95, 168, 211, 0.1)',
                      color: 'rgba(84, 98, 116, 1)',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      border: '0.25px solid rgba(95, 168, 211, 1)',
                    }}
                    icon={
                      <Image
                        src="/icons/location2.svg"
                        alt="location"
                        width={13}
                        height={13}
                      />
                    }
                  />
                  <Chip
                    label={job.employmentType}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(95, 168, 211, 0.1)',
                      color: 'rgba(84, 98, 116, 1)',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      border: '0.25px solid rgba(95, 168, 211, 1)',
                    }}
                    icon={
                      <Image
                        src="/icons/suitcase.svg"
                        alt="employment type"
                        width={13}
                        height={13}
                      />
                    }
                  />
                  <Chip
                    label={formatSalary(job.salary)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(95, 168, 211, 0.1)',
                      color: 'rgba(84, 98, 116, 1)',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      border: '0.25px solid rgba(95, 168, 211, 1)',
                    }}
                    icon={
                      <Image
                        src="/icons/dollar.svg"
                        alt="salary"
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
                  color: 'rgba(156, 163, 175, 1)',
                  whiteSpace: 'nowrap',
                  ml: 1.5,
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '23px',
                  letterSpacing: 0,
                  textAlign: 'right',
                }}
              >
                {formatDate(job.datePosted)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobCard);
