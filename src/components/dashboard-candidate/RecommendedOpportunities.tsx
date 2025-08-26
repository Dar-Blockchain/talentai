import React, { useState } from "react";
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
} from "@mui/material";
import Link from "next/link";

export type RecommendedOpportunity = {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  createdAt?: string | number | Date;
  type?: string; // e.g., Full-time
  firstStepId?: string;
};

type RecommendedOpportunitiesProps = {
  data: RecommendedOpportunity[];
  total?: number;
  emptyText?: string;
};

export default function RecommendedOpportunities({ data, total, emptyText = "No recommendations available yet" }: RecommendedOpportunitiesProps) {
  const [selected, setSelected] = useState<RecommendedOpportunity | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

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

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {data.length === 0 ? (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, background: '#fff' }}>
            <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>{emptyText}</Typography>
          </Paper>
        ) : (
          data.map((row) => {
            const id = row._id || row.id;
            return (
              <Box key={id} sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
                  <Typography variant="h6" sx={{ color: '#8310FF', fontWeight: 700, mb: 1, minHeight: 48 }}>
                    {row.title || 'Untitled Post'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', mb: 2, minHeight: 60 }}>
                    {row.description ? row.description.slice(0, 90) + (row.description.length > 90 ? '...' : '') : 'No description.'}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Button onClick={() => handleOpen(row)} variant="contained" sx={{ background: '#8310FF', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, width: '100%' }}>
                      Learn More
                    </Button>
                  </Box>
                </Paper>
              </Box>
            );
          })
        )}
      </Box>
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


