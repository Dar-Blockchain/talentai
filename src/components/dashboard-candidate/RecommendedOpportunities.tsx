import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export type RecommendedOpportunity = {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  companyName?: string;
  location?: string;
  description?: string;
  createdAt?: string | number | Date;
  type?: string; // e.g., Full-time
  employmentType?: string;
  firstStepId?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobDetails?: {
    title?: string;
    employmentType?: string;
    location?: string;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    company?: string;
    companyName?: string;
  };
};

type RecommendedOpportunitiesProps = {
  data: RecommendedOpportunity[];
  total?: number;
  emptyText?: string;
};

export default function RecommendedOpportunities({ data, total, emptyText = "You need to pass a test with a score of 'Good' or >20% to see recommended opportunities" }: RecommendedOpportunitiesProps) {
  const [selected, setSelected] = useState<RecommendedOpportunity | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOpen = async (row: RecommendedOpportunity) => {
    setSelected(row);
    setSelectedDetails(null);
    setDetailsError(null);
    const id = row._id || row.id;
    if (!id) return;
    try {
      setLoadingDetails(true);
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('api_token') || localStorage.getItem('token')
          : null;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const url = `${base}post/getPostById/${id}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load job details');
      const json = await res.json();
      const full = json?.data || json;
      setSelectedDetails(full || null);
    } catch (e: any) {
      setDetailsError(e?.message || 'Unable to load job details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setSelectedDetails(null);
    setDetailsError(null);
    setLoadingDetails(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#000000',
              fontSize: '1.5rem',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: '120px',
                height: '3px',
                background: '#8310FF',
                borderRadius: '2px',
              },
            }}
          >
            Recommended Opportunities
          </Typography>
        </Box>

        {/* Navigation Arrows */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={scrollLeft}
            sx={{
              color: '#8310FF',
              '&:hover': {
                backgroundColor: 'rgba(131, 16, 255, 0.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            sx={{
              color: '#8310FF',
              '&:hover': {
                backgroundColor: 'rgba(131, 16, 255, 0.1)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Job Cards Container */}
      {data.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            background: '#fff',
            border: '1px solid #E0E0E0',
          }}
        >
          <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
            {emptyText}
          </Typography>
        </Paper>
      ) : (
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            pb: 2,
          }}
        >
            {data.map((row) => {
              console.log('Row from recommended opportunities:', data);
            console.log('Row from postads:', row);
            const id = row._id || row.id;
            
            // Extract job information - try multiple possible data structures
            const jobDetails = row?.jobDetails || row;
            const title = jobDetails?.title || row?.title || 'Technical Support Specialist';
            const employmentType = jobDetails?.employmentType || row?.employmentType || row?.type || 'Full-time';
            
            // Extract real salary from your data format - try multiple paths
            let salary = '$20,000 - $25,000'; // fallback
            const salaryData = jobDetails?.salary || row?.salary;
            if (salaryData) {
              const { currency, min, max } = salaryData;
              salary = `${currency}${min.toLocaleString()}-${max.toLocaleString()}`;
            }
            
            const company = jobDetails?.company || jobDetails?.companyName || row?.company || 'Google Inc.';
            const location = jobDetails?.location || row?.location || 'Remote';

            return (
              <Paper
                key={id}
                elevation={2}
                sx={{
                  minWidth: 400,
                  maxWidth: 400,
                  height: 160,
                  p: 3,
                  borderRadius: 2,
                  background: '#ffffff',
                  border: '1px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  },
                }}
                onClick={() => handleOpen(row)}
              >
                {/* Bookmark Icon */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    color: '#666666',
                    '&:hover': {
                      color: '#8310FF',
                    },
                  }}
                >
                  <BookmarkBorderIcon fontSize="small" />
                </IconButton>

                {/* Top Section */}
                <Box>
                  {/* Job Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#000000',
                      fontSize: '1.125rem',
                      mb: 2,
                      pr: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </Typography>

                  {/* Employment Type and Salary */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={employmentType}
                      size="small"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        fontSize: '0.875rem',
                      }}
                    >
                      Salary: {salary}
                    </Typography>
                  </Box>
                </Box>


                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: '#666666', fontSize: '1rem' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      fontSize: '0.875rem',
                    }}
                  >
                    {location}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Job Details Dialog */}
      <Dialog open={!!selected} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {(() => {
            const job: any = selectedDetails || selected;
            const details = job?.jobDetails || job;
            return details?.title || 'Opportunity details';
          })()}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 600 }}>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : detailsError ? (
            <Typography variant="body2" color="error">{detailsError}</Typography>
          ) : (
            (() => {
              const job: any = selectedDetails || selected;
              if (!job) return null;
              const details: any = job.jobDetails || job;
              const createdAt = job.createdAt || job.created_at || job.postedAt;
              const location = details.location;
              const type = details.employmentType || details.type || details.jobType;
              const experience = details.experienceLevel || details.experience || details.seniority;
              const salaryRange = details.salary || details.salaryRange || details.compensation;
              const salary = salaryRange && typeof salaryRange === 'object'
                ? `${salaryRange.currency || ''} ${salaryRange.min ?? ''}${salaryRange.max != null ? ' - ' + salaryRange.max : ''}`.trim()
                : (typeof salaryRange === 'string' ? salaryRange : undefined);
              const description = details.description;
              const responsibilities: string[] = Array.isArray(details.responsibilities) ? details.responsibilities : [];
              const requirements: string[] = Array.isArray(details.requirements) ? details.requirements : [];

              return (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {location && (
                      <Box sx={{ px: 1, py: 0.25, bgcolor: '#F3E8FF', color: '#6B21A8', borderRadius: 1 }}>
                        <Typography variant="caption">{location}</Typography>
                      </Box>
                    )}
                    {type && (
                      <Box sx={{ px: 1, py: 0.25, bgcolor: '#EEF2FF', color: '#4338CA', borderRadius: 1 }}>
                        <Typography variant="caption">{type}</Typography>
                      </Box>
                    )}
                    {experience && (
                      <Box sx={{ px: 1, py: 0.25, bgcolor: '#ECFDF5', color: '#065F46', borderRadius: 1 }}>
                        <Typography variant="caption">{experience}</Typography>
                      </Box>
                    )}
                    {salary && (
                      <Box sx={{ px: 1, py: 0.25, bgcolor: '#FFF7ED', color: '#9A3412', borderRadius: 1 }}>
                        <Typography variant="caption">{salary}</Typography>
                      </Box>
                    )}
                    {createdAt && (
                      <Typography variant="caption" sx={{ color: '#666', ml: 'auto' }}>
                        Posted {(() => { const d = new Date(createdAt); return isNaN(d.getTime()) ? createdAt : d.toLocaleDateString(); })()}
                      </Typography>
                    )}
                  </Stack>

                  {description && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>About the role</Typography>
                      <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'pre-line' }}>{description}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {requirements.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Requirements</Typography>
                        <Stack spacing={0.5}>
                          {requirements.map((req, i) => (
                            <Typography key={i} variant="body2">• {req}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {responsibilities.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Responsibilities</Typography>
                        <Stack spacing={0.5}>
                          {responsibilities.map((resp, i) => (
                            <Typography key={i} variant="body2">• {resp}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Stack>
              );
            })()
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Close</Button>
          {!!(selected?._id || selected?.id) && (
            <Link href={`/posts/${selected?._id || selected?.id}/interview${selected?.firstStepId ? `?stepId=${selected.firstStepId}` : ''}`} passHref legacyBehavior>
              <Button variant="contained" sx={{ background: '#8310FF', textTransform: 'none' }}>
                Proceed
              </Button>
            </Link>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}


