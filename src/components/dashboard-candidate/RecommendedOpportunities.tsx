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
  profile: any;
  data: RecommendedOpportunity[];
  total?: number;
  emptyText?: string;
};

export default function RecommendedOpportunities({profile, data, total, emptyText = "You need to pass a test with a score of 'Good' or >20% to see recommended opportunities" }: RecommendedOpportunitiesProps) {
  const [selected, setSelected] = useState<RecommendedOpportunity | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOpen = async (row: RecommendedOpportunity) => {
    console.log('Opening modal with row:', row);
    setSelected(row);
    setSelectedDetails(null);
    setDetailsError(null);
    const id = row._id || row.id;
    console.log('Job ID:', id);
    
    if (!id) {
      console.warn('No ID found for job');
      return;
    }
    
    try {
      setLoadingDetails(true);
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('api_token') || localStorage.getItem('token')
          : null;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const url = `${base}post/getPostById/${id}`;
      console.log('Fetching job details from:', url);
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) throw new Error('Failed to load job details');
      
      const json = await res.json();
      console.log('API Response:', json);
      
      const full = json?.data || json;
      console.log('Setting details to:', full);
      setSelectedDetails(full || null);
    } catch (e: any) {
      console.error('Error loading job details:', e);
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
      {(() => {
        // Filter out any rows that don't have a valid title AND firstStepId
        const validData = data.filter((row) => {
          const jobDetails = row?.jobDetails || row;
          const title = jobDetails?.title || row?.title;
          const firstStepId = row?.firstStepId;
          
          // Debug: Log jobs without stepId
          if (!firstStepId && title) {
            console.log('🚫 Filtering out job without stepId:', {
              id: row._id || row.id,
              title,
              firstStepId
            });
          }
          
          // Only show cards with actual titles AND firstStepId (required for interview)
          return !!title && !!firstStepId;
        });

        console.log(`✅ Showing ${validData.length} jobs with stepId out of ${data.length} total jobs`);

        // If no valid data, show empty state
        if (validData.length === 0) {
          return (
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
                background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.1) 0%, rgba(0, 184, 212, 0.1) 100%)',
                border: '2px solid #8310FF',
                borderStyle: 'dashed',
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#8310FF', 
                  fontStyle: 'italic', 
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                }}
              >
                {emptyText}
              </Typography>
            </Paper>
          );
        }

        // Render valid cards
        return (
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
            {validData.map((row) => {
              console.log('Row from recommended opportunities:', data);
              console.log('Row from postads:', row);
              const id = row._id || row.id;
              
              // Extract job information - try multiple possible data structures
              const jobDetails = row?.jobDetails || row;
              const title = jobDetails?.title || row?.title;
              const employmentType = jobDetails?.employmentType || row?.employmentType || row?.type;
              
              // Extract real salary from your data format - try multiple paths
              let salary: string | undefined = undefined;
              const salaryData = jobDetails?.salary || row?.salary;
              if (salaryData) {
                const { currency, min, max } = salaryData;
                salary = `${currency}${min.toLocaleString()}-${max.toLocaleString()}`;
              }
              
              const company = jobDetails?.company || jobDetails?.companyName || row?.company;
              const location = jobDetails?.location || row?.location;

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
                    {title && (
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
                    )}

                    {/* Employment Type and Salary */}
                    {(employmentType || salary) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {employmentType && (
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
                        )}
                        {salary && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666666',
                              fontSize: '0.875rem',
                            }}
                          >
                            Salary: {salary}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Location */}
                  {location && (
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
                  )}
                </Paper>
              );
            })}
          </Box>
        );
      })()}

      {/* Job Details Dialog */}
      <Dialog 
        open={!!selected} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 400
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2, borderBottom: '1px solid #E0E0E0' }}>
          {(() => {
            console.log('Rendering dialog title - selected:', selected, 'selectedDetails:', selectedDetails);
            const job: any = selectedDetails || selected;
            const details = job?.jobDetails || job;
            const title = details?.title || 'Opportunity Details';
            console.log('Dialog title:', title);
            return title;
          })()}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 600, minHeight: 300, py: 3 }}>
          {loadingDetails && !selected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ color: '#8310FF' }} />
              <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
                Loading job details...
              </Typography>
            </Box>
          ) : detailsError && !selected ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>{detailsError}</Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                Please try again or contact support if the issue persists.
              </Typography>
            </Box>
          ) : (
            (() => {
              const job: any = selectedDetails || selected;
              console.log('Modal job data:', job);
              
              if (!job) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      No job details available.
                    </Typography>
                  </Box>
                );
              }

              const details: any = job.jobDetails || job;
              const createdAt = job.createdAt || job.created_at || job.postedAt;
              const location = details.location || 'Location not specified';
              const type = details.employmentType || details.type || details.jobType || 'Full-time';
              const experience = details.experienceLevel || details.experience || details.seniority;
              const salaryRange = details.salary || details.salaryRange || details.compensation;
              const salary = salaryRange && typeof salaryRange === 'object'
                ? `${salaryRange.currency || '$'} ${salaryRange.min?.toLocaleString() ?? ''}${salaryRange.max != null ? ' - ' + salaryRange.max.toLocaleString() : ''}`.trim()
                : (typeof salaryRange === 'string' ? salaryRange : undefined);
              const description = details.description || 'No description available.';
              const responsibilities: string[] = Array.isArray(details.responsibilities) ? details.responsibilities : [];
              const requirements: string[] = Array.isArray(details.requirements) ? details.requirements : [];
              const company = details.company || details.companyName || job.company || job.companyName;

              console.log('Rendering modal content:', {
                job,
                details,
                location,
                type,
                salary,
                company,
                description,
                requirements: requirements.length,
                responsibilities: responsibilities.length
              });

              return (
                <Stack spacing={3}>
                  {/* Loading overlay for additional details */}
                  {loadingDetails && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      p: 2, 
                      bgcolor: '#F3F4F6', 
                      borderRadius: 2 
                    }}>
                      <CircularProgress size={16} sx={{ color: '#8310FF' }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Loading additional details...
                      </Typography>
                    </Box>
                  )}
                  {/* Company Info */}
                  {company && (
                    <Box sx={{ pb: 2, borderBottom: '1px solid #E0E0E0' }}>
                      <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5 }}>
                        Company
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#000' }}>
                        {company}
                      </Typography>
                    </Box>
                  )}

                  {/* Job Info Tags */}
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                    {location && (
                      <Chip
                        icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />}
                        label={location}
                        size="small"
                        sx={{ 
                          bgcolor: '#F3E8FF', 
                          color: '#6B21A8',
                          '& .MuiChip-icon': { color: '#6B21A8' }
                        }}
                      />
                    )}
                    {type && (
                      <Chip
                        label={type}
                        size="small"
                        sx={{ bgcolor: '#EEF2FF', color: '#4338CA' }}
                      />
                    )}
                    {experience && (
                      <Chip
                        label={experience}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#065F46' }}
                      />
                    )}
                    {salary && (
                      <Chip
                        label={salary}
                        size="small"
                        sx={{ bgcolor: '#FFF7ED', color: '#9A3412' }}
                      />
                    )}
                    {createdAt && (
                      <Typography variant="caption" sx={{ color: '#666', ml: 'auto !important' }}>
                        Posted {(() => { 
                          const d = new Date(createdAt); 
                          return isNaN(d.getTime()) ? createdAt : d.toLocaleDateString(); 
                        })()}
                      </Typography>
                    )}
                  </Stack>

                  {/* Description */}
                  {description && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#000' }}>
                        About the role
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {description}
                      </Typography>
                    </Box>
                  )}

                  {/* Requirements & Responsibilities */}
                  {(requirements.length > 0 || responsibilities.length > 0) && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                      {requirements.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#000' }}>
                            Requirements
                          </Typography>
                          <Stack spacing={0.5}>
                            {requirements.map((req, i) => (
                              <Typography key={i} variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                                • {req}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {responsibilities.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#000' }}>
                            Responsibilities
                          </Typography>
                          <Stack spacing={0.5}>
                            {responsibilities.map((resp, i) => (
                              <Typography key={i} variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                                • {resp}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* No additional info message */}
                  {!description && requirements.length === 0 && responsibilities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Additional details will be provided during the application process.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              );
            })()
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Close</Button>
          {!!(selected?._id || selected?.id) && selected?.firstStepId && (profile?.quota < 5) ? (
            <Link href={`/posts/${selected._id || selected.id}/interview?stepId=${selected.firstStepId}`} passHref legacyBehavior>
              <Button variant="contained" sx={{ background: '#8310FF', textTransform: 'none' }}>
                Proceed
              </Button>
            </Link>
          ) : (
            <Button 
              variant="contained" 
              disabled 
              sx={{ 
                background: '#cccccc', 
                textTransform: 'none',
                '&.Mui-disabled': {
                  color: '#666666'
                }
              }}
            >
              Interview Not Available
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}


