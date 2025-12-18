import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack, Divider, IconButton, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, LinearProgress, TextField, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import { Stepper, Step, StepLabel } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { updateAgentConfig, resetUpdateStatus } from '@/store/slices/agentConfigSlice';
import { AppDispatch, RootState } from '@/store/store';
import { toast } from 'react-toastify';

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  job: any | null;
  onRefresh?: () => void;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({ open, onClose, job, onRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status: updateStatus, error: updateError } = useSelector((state: RootState) => state.agentConfig.updateConfig);

  const details = job?.jobDetails || job;
  const createdAt = job?.createdAt || job?.created_at || job?.postedAt;
  const steps: any[] = Array.isArray(job?.post_Steps) ? [...job.post_Steps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const firstStep = steps[0];
  const firstStepData = firstStep?.data;
  const postId = job?._id || job?.id;

  // Edit mode state for agent configuration
  const [isEditingAgentConfig, setIsEditingAgentConfig] = useState(false);
  const [agentConfigForm, setAgentConfigForm] = useState({
    thresholdPercent: 0,
    bidBudgetMin: 0,
    bidBudgetMax: 0,
    bidStep: 0,
    maxCandidatesToBid: 0,
    agentLifetimeDays: 0,
    bidLifetimeDays: 0,
    autoSubmitTopMatch: false,
    maxDailySpending: 0,
    isActive: false
  });

  // Initialize form with job data when job changes
  useEffect(() => {
    if (job?.agentConfig) {
      setAgentConfigForm({
        thresholdPercent: job.agentConfig.thresholdPercent || 0,
        bidBudgetMin: job.agentConfig.bidBudgetMin || 0,
        bidBudgetMax: job.agentConfig.bidBudgetMax || 0,
        bidStep: job.agentConfig.bidStep || 0,
        maxCandidatesToBid: job.agentConfig.maxCandidatesToBid || 0,
        agentLifetimeDays: job.agentConfig.agentLifetimeDays || 0,
        bidLifetimeDays: job.agentConfig.bidLifetimeDays || 0,
        autoSubmitTopMatch: job.agentConfig.autoSubmitTopMatch || false,
        maxDailySpending: job.agentConfig.maxDailySpending || 0,
        isActive: job.agentConfig.isActive || false
      });
    }
  }, [job]);

  // Handle form changes
  const handleAgentConfigChange = (field: string, value: any) => {
    setAgentConfigForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save agent config
  const handleSaveAgentConfig = async () => {
    if (!job?.agentConfig?._id) {
      toast.error("Agent configuration ID not found", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      await dispatch(updateAgentConfig({
        id: job.agentConfig._id,
        data: agentConfigForm
      })).unwrap();

      toast.success("Agent configuration updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });

      // Refresh data from server to get the latest values
      if (onRefresh) {
        await onRefresh();
        // Exit edit mode after data is refreshed
        setIsEditingAgentConfig(false);
      } else {
        // Fallback: Update the job object with new values if no refresh function provided
        if (job?.agentConfig) {
          Object.assign(job.agentConfig, agentConfigForm);
        }
        setIsEditingAgentConfig(false);
      }
    } catch (error: any) {
      toast.error(error || "Failed to update agent configuration", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  // Handle cancel edit
  const handleCancelAgentConfigEdit = () => {
    // Reset form to original values
    if (job?.agentConfig) {
      setAgentConfigForm({
        thresholdPercent: job.agentConfig.thresholdPercent || 0,
        bidBudgetMin: job.agentConfig.bidBudgetMin || 0,
        bidBudgetMax: job.agentConfig.bidBudgetMax || 0,
        bidStep: job.agentConfig.bidStep || 0,
        maxCandidatesToBid: job.agentConfig.maxCandidatesToBid || 0,
        agentLifetimeDays: job.agentConfig.agentLifetimeDays || 0,
        bidLifetimeDays: job.agentConfig.bidLifetimeDays || 0,
        autoSubmitTopMatch: job.agentConfig.autoSubmitTopMatch || false,
        maxDailySpending: job.agentConfig.maxDailySpending || 0,
        isActive: job.agentConfig.isActive || false
      });
    }
    setIsEditingAgentConfig(false);
  };

  // Reset update status when dialog closes
  useEffect(() => {
    if (!open) {
      dispatch(resetUpdateStatus());
      setIsEditingAgentConfig(false);
    }
  }, [open, dispatch]);

  // Derive interview link using steps[0].data when available
  const computeInterviewHref = (): string | null => {
    if (!firstStep) return null;
    // If data is a direct URL string
    if (typeof firstStepData === 'string') {
      if (firstStepData.startsWith('http') || firstStepData.startsWith('/')) {
        return firstStepData;
      }
    }
    // If data is an object that might contain a url or id
    if (firstStepData && typeof firstStepData === 'object') {
      if (typeof firstStepData.url === 'string' && (firstStepData.url.startsWith('http') || firstStepData.url.startsWith('/'))) {
        return firstStepData.url;
      }
      const id = firstStepData.stepId || firstStepData.id || firstStep?._id || firstStep?.id;
      if (postId && id) {
        return `/posts/${postId}/interview?stepId=${id}`;
      }
    }
    // Fallback to previous route pattern using step id
    const id = firstStep?._id || firstStep?.id;
    if (postId && id) {
      return `/posts/${postId}/interview?stepId=${id}`;
    }
    return null;
  };

  const interviewHref = computeInterviewHref();

  const handleCopy = () => {
    if (!interviewHref) return;
    try {
      navigator.clipboard?.writeText(interviewHref);
    } catch (e) {
      // no-op
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 3,
        pt: 3,
        px: 4,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <Typography variant="h4" sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: '1.75rem',
            mb: 0.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {details?.title}
          </Typography>
          {createdAt && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
              Posted on {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.2)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              transform: 'rotate(90deg)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{
        pt: 4,
        px: 4,
        pb: 2,
        backgroundColor: 'transparent',
        maxHeight: 'calc(90vh - 200px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#10b981',
          borderRadius: '10px',
          '&:hover': {
            background: '#059669'
          }
        }
      }}>
        {/* Job Details Section */}
        <Box sx={{
          mb: 4,
          p: 3,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Typography variant="h6" sx={{
            color: '#111827',
            fontWeight: 700,
            mb: 3,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: 6,
              height: 24,
              backgroundColor: '#10b981',
              borderRadius: '3px'
            }} />
            Job Details
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 2 }}>
            {details?.location && (
              <Chip
                icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                label={details.location}
                sx={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontWeight: 600,
                  border: '2px solid #bbf7d0',
                  py: 2.5,
                  px: 1,
                  fontSize: '0.9rem',
                  '& .MuiChip-icon': { color: '#10b981' },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#dcfce7',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.2)'
                  }
                }}
              />
            )}
            {!!details?.salary && (
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
                label={`${details.salary?.currency} ${details.salary?.min.toLocaleString()} - ${details.salary?.currency} ${details.salary?.max.toLocaleString()}`}
                sx={{
                  backgroundColor: '#fffbeb',
                  color: '#92400e',
                  fontWeight: 600,
                  border: '2px solid #fde68a',
                  py: 2.5,
                  px: 1,
                  fontSize: '0.9rem',
                  '& .MuiChip-icon': { color: '#f59e0b' },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#fef3c7',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(245, 158, 11, 0.2)'
                  }
                }}
              />
            )}
            {details?.employmentType && (
              <Chip
                icon={<WorkOutlineIcon sx={{ fontSize: 18 }} />}
                label={details.employmentType}
                sx={{
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  fontWeight: 600,
                  border: '2px solid #bfdbfe',
                  py: 2.5,
                  px: 1,
                  fontSize: '0.9rem',
                  '& .MuiChip-icon': { color: '#3b82f6' },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#dbeafe',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2)'
                  }
                }}
              />
            )}
            {details?.experienceLevel && (
              <Chip
                label={details.experienceLevel}
                sx={{
                  backgroundColor: '#fce7f3',
                  color: '#9f1239',
                  fontWeight: 600,
                  border: '2px solid #fbcfe8',
                  py: 2.5,
                  px: 1,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#fbcfe8',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(159, 18, 57, 0.2)'
                  }
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Required Skills Section */}
        {(() => {
          // Extract skills from pipeline steps or use skillAnalysis
          const displaySkills = React.useMemo(() => {
            if (job?.creationType === 'pipeline' && job?.post_Steps && Array.isArray(job.post_Steps)) {
              const skills: Array<{name: string, level?: number, type: 'technical' | 'soft', importance?: string}> = [];

              job.post_Steps.forEach((step: any) => {
                // Technical skills from technical steps
                if (step.data?.type === 'technical' && step.data?.config?.skills && Array.isArray(step.data.config.skills)) {
                  step.data.config.skills.forEach((skill: any) => {
                    skills.push({
                      name: skill.name,
                      level: skill.requiredLevel,
                      type: 'technical',
                      importance: 'Required'
                    });
                  });
                }

                // Soft skills from soft skill steps
                if (step.data?.type === 'soft' && step.data?.config?.softSkills && Array.isArray(step.data.config.softSkills)) {
                  step.data.config.softSkills.forEach((softSkill: string) => {
                    skills.push({
                      name: softSkill,
                      type: 'soft',
                      importance: 'Required'
                    });
                  });
                }
              });

              return skills;
            }

            // For AI/manual jobs, use skillAnalysis
            return (job?.skillAnalysis?.requiredSkills || []).map((skill: any) => ({
              name: skill.name,
              level: skill.level,
              type: 'technical' as const,
              importance: skill.importance || 'Required'
            }));
          }, [job]);

          return displaySkills.length > 0 ? (
            <Box sx={{
              mb: 4,
              p: 3,
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="h6" sx={{
                color: '#111827',
                fontWeight: 700,
                mb: 3,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 6,
                  height: 24,
                  backgroundColor: '#3b82f6',
                  borderRadius: '3px'
                }} />
                Required Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {displaySkills.map((skill: any, idx: number) => (
                  <Chip
                    key={idx}
                    label={skill.level ? `${skill.name} (Level ${skill.level})` : skill.name}
                    sx={{
                      backgroundColor: skill.importance === 'Required' ? '#dbeafe' : '#f3f4f6',
                      color: skill.importance === 'Required' ? '#1e40af' : '#374151',
                      fontWeight: 600,
                      border: skill.importance === 'Required' ? '2px solid #93c5fd' : '2px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      py: 2.5,
                      px: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null;
        })()}

        {/* Description Section */}
        {details?.description && (
          <Box sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" sx={{
              color: '#111827',
              fontWeight: 700,
              mb: 3,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                width: 6,
                height: 24,
                backgroundColor: '#8b5cf6',
                borderRadius: '3px'
              }} />
              Description
            </Typography>
            <Typography variant="body1" sx={{
              color: '#4b5563',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              fontSize: '0.95rem'
            }}>
              {details.description}
            </Typography>
          </Box>
        )}

        {/* Requirements Section */}
        {details?.requirements && (
          <Box sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" sx={{
              color: '#111827',
              fontWeight: 700,
              mb: 3,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                width: 6,
                height: 24,
                backgroundColor: '#f59e0b',
                borderRadius: '3px'
              }} />
              Requirements
            </Typography>
            <List sx={{ py: 0 }}>
              {Array.isArray(details.requirements) ? details.requirements.map((req: string, idx: number) => (
                <ListItem key={idx} sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                  <Box sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    mt: 0.2
                  }}>
                    <Typography sx={{ color: '#92400e', fontSize: '0.75rem', fontWeight: 700 }}>
                      {idx + 1}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={req}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#4b5563',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        fontWeight: 500
                      }
                    }}
                  />
                </ListItem>
              )) : (
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={details.requirements}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#4b5563',
                        fontSize: '0.9rem',
                        lineHeight: 1.7
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Responsibilities Section */}
        {details?.responsibilities && (
          <Box sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" sx={{
              color: '#111827',
              fontWeight: 700,
              mb: 3,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                width: 6,
                height: 24,
                backgroundColor: '#ec4899',
                borderRadius: '3px'
              }} />
              Responsibilities
            </Typography>
            <List sx={{ py: 0 }}>
              {Array.isArray(details.responsibilities) ? details.responsibilities.map((resp: string, idx: number) => (
                <ListItem key={idx} sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                  <Box sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#fce7f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    mt: 0.2
                  }}>
                    <Typography sx={{ color: '#9f1239', fontSize: '0.75rem', fontWeight: 700 }}>
                      {idx + 1}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={resp}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#4b5563',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        fontWeight: 500
                      }
                    }}
                  />
                </ListItem>
              )) : (
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={details.responsibilities}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#4b5563',
                        fontSize: '0.9rem',
                        lineHeight: 1.7
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Recruitment Flow Section */}
        {steps.length > 0 && (
          <Box sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" sx={{
              color: '#111827',
              fontWeight: 700,
              mb: 3,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                width: 6,
                height: 24,
                backgroundColor: '#6366f1',
                borderRadius: '3px'
              }} />
              Recruitment Flow
            </Typography>
            <Box sx={{ px: 2, py: 2 }}>
              <Stepper activeStep={-1} alternativeLabel sx={{
                '& .MuiStepLabel-label': {
                  typography: 'body2',
                  color: '#4b5563',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  mt: 1
                },
                '& .MuiStepLabel-iconContainer': {
                  '& .MuiSvgIcon-root': {
                    color: '#10b981',
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                  }
                },
                '& .MuiStepConnector-line': {
                  borderColor: '#d1d5db',
                  borderTopWidth: 2
                }
              }}>
                {steps.map((s: any, i: number) => (
                  <Step key={s._id || s.id || i}>
                    <StepLabel
                      optional={s.data?.subtitle ? (
                        <Typography variant="caption" sx={{
                          color: '#9ca3af',
                          display: 'block',
                          mt: 0.5,
                          fontSize: '0.75rem'
                        }}>
                          {s.data.subtitle}
                        </Typography>
                      ) : undefined}
                    >
                      {s.data?.label || `Step ${i + 1}`}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
        )}

        {/* Interview Link Section */}
        {!!interviewHref && (
          <Box sx={{
            mb: 4,
            p: 3,
            border: '2px solid #10b981',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              minWidth: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <OpenInNewIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 700, mb: 0.5 }}>
                Interview Link
              </Typography>
              <Typography variant="body2" sx={{
                color: '#166534',
                wordBreak: 'break-all',
                fontSize: '0.85rem'
              }}>
                {interviewHref}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Link href={interviewHref} passHref legacyBehavior>
                <IconButton
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open interview link in new tab"
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#059669'
                    }
                  }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Link>
              <IconButton
                onClick={handleCopy}
                aria-label="Copy interview link"
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  '&:hover': {
                    backgroundColor: '#f0fdf4'
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Agent Configuration Section */}
        {job?.agentConfig && (
          <Accordion
            defaultExpanded
            sx={{
              mb: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '16px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              backgroundColor: 'white'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#10b981' }} />}
              sx={{
                backgroundColor: 'linear-gradient(to right, #f0fdf4, white)',
                borderBottom: '1px solid #e5e7eb',
                minHeight: 64,
                '&:hover': { backgroundColor: '#f9fafb' },
                '& .MuiAccordionSummary-content': { my: 2 }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SmartToyIcon sx={{ color: '#10b981', fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
                    Agent Configuration
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    AI-powered recruitment automation settings
                  </Typography>
                </Box>
                <Chip
                  label={isEditingAgentConfig ? agentConfigForm.isActive ? 'Active' : 'Inactive' : job.agentConfig.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    backgroundColor: (isEditingAgentConfig ? agentConfigForm.isActive : job.agentConfig.isActive) ? '#d1fae5' : '#fee2e2',
                    color: (isEditingAgentConfig ? agentConfigForm.isActive : job.agentConfig.isActive) ? '#065f46' : '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    px: 1.5,
                    height: 28
                  }}
                />
                {!isEditingAgentConfig && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingAgentConfig(true);
                    }}
                    sx={{
                      color: '#10b981',
                      '&:hover': { backgroundColor: '#d1fae5' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, backgroundColor: '#fafbfc' }}>
              {!isEditingAgentConfig ? (
                // Read-only mode
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 500 }}>Match Threshold</Typography>
                    <Typography variant="h6" sx={{ color: '#166534', fontWeight: 700 }}>{job.agentConfig.thresholdPercent}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={job.agentConfig.thresholdPercent}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: '#bbf7d0',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' }
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 500 }}>Bid Budget Range</Typography>
                    <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
                      ${job.agentConfig.bidBudgetMin} - ${job.agentConfig.bidBudgetMax}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#3b82f6' }}>Step: ${job.agentConfig.bidStep}</Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 500 }}>Max Daily Spending</Typography>
                    <Typography variant="h6" sx={{ color: '#92400e', fontWeight: 700 }}>${job.agentConfig.maxDailySpending}</Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#fce7f3', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                    <Typography variant="caption" sx={{ color: '#9f1239', fontWeight: 500 }}>Max Candidates</Typography>
                    <Typography variant="h6" sx={{ color: '#9f1239', fontWeight: 700 }}>{job.agentConfig.maxCandidatesToBid}</Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>Agent Lifetime</Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>{job.agentConfig.agentLifetimeDays} days</Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>Bid Lifetime</Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>{job.agentConfig.bidLifetimeDays} days</Typography>
                  </Box>
                  {job.agentConfig.autoSubmitTopMatch && (
                    <Box sx={{ p: 2, backgroundColor: '#e0e7ff', borderRadius: '8px', border: '1px solid #c7d2fe', gridColumn: '1 / -1' }}>
                      <Typography variant="body2" sx={{ color: '#3730a3', fontWeight: 500 }}>
                        🤖 Auto-submit top matches is enabled
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                // Edit mode
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                      <TextField
                        label="Match Threshold (%)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.thresholdPercent}
                        onChange={(e) => handleAgentConfigChange('thresholdPercent', Number(e.target.value))}
                        inputProps={{ min: 0, max: 100 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Bid Budget Min ($)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.bidBudgetMin}
                        onChange={(e) => handleAgentConfigChange('bidBudgetMin', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Bid Budget Max ($)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.bidBudgetMax}
                        onChange={(e) => handleAgentConfigChange('bidBudgetMax', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Bid Step ($)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.bidStep}
                        onChange={(e) => handleAgentConfigChange('bidStep', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Max Daily Spending ($)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.maxDailySpending}
                        onChange={(e) => handleAgentConfigChange('maxDailySpending', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Max Candidates to Bid"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.maxCandidatesToBid}
                        onChange={(e) => handleAgentConfigChange('maxCandidatesToBid', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Agent Lifetime (days)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.agentLifetimeDays}
                        onChange={(e) => handleAgentConfigChange('agentLifetimeDays', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <TextField
                        label="Bid Lifetime (days)"
                        type="number"
                        fullWidth
                        size="small"
                        value={agentConfigForm.bidLifetimeDays}
                        onChange={(e) => handleAgentConfigChange('bidLifetimeDays', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': { borderColor: '#10b981' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' }
                        }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agentConfigForm.autoSubmitTopMatch}
                            onChange={(e) => handleAgentConfigChange('autoSubmitTopMatch', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' }
                            }}
                          />
                        }
                        label="Auto-submit Top Matches"
                        sx={{
                          backgroundColor: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          m: 0,
                          width: '100%'
                        }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agentConfigForm.isActive}
                            onChange={(e) => handleAgentConfigChange('isActive', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' }
                            }}
                          />
                        }
                        label="Agent Active"
                        sx={{
                          backgroundColor: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          m: 0,
                          width: '100%'
                        }}
                      />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelAgentConfigEdit}
                      disabled={updateStatus === 'loading'}
                      sx={{
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        '&:hover': {
                          borderColor: '#d1d5db',
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={updateStatus === 'loading' ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SaveIcon />}
                      onClick={handleSaveAgentConfig}
                      disabled={updateStatus === 'loading'}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                        '&.Mui-disabled': {
                          background: '#9ca3af',
                          color: 'white'
                        }
                      }}
                    >
                      {updateStatus === 'loading' ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Skill Analysis Section */}
        {job?.skillAnalysis && (
          <Accordion
            sx={{
              mb: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '16px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              backgroundColor: 'white'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
              sx={{
                backgroundColor: 'linear-gradient(to right, #eff6ff, white)',
                borderBottom: '1px solid #e5e7eb',
                minHeight: 64,
                '&:hover': { backgroundColor: '#f9fafb' },
                '& .MuiAccordionSummary-content': { my: 2 }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUpIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
                    Skill Analysis
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Technology stack and learning path insights
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, backgroundColor: '#fafbfc' }}>
              {job.skillAnalysis.skillSummary && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: '#6b7280', fontWeight: 600, mb: 1 }}>
                    Stack Complexity: <Chip label={job.skillAnalysis.skillSummary.stackComplexity} size="small" sx={{ ml: 1 }} />
                  </Typography>
                  {job.skillAnalysis.skillSummary.mainTechnologies?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Main Technologies</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {job.skillAnalysis.skillSummary.mainTechnologies.map((tech: string, idx: number) => (
                          <Chip key={idx} label={tech} size="small" sx={{ backgroundColor: '#dbeafe', color: '#1e40af' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {job.skillAnalysis.skillSummary.complementarySkills?.filter(Boolean).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Complementary Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {job.skillAnalysis.skillSummary.complementarySkills.filter(Boolean).map((skill: string, idx: number) => (
                          <Chip key={idx} label={skill} size="small" sx={{ backgroundColor: '#d1fae5', color: '#065f46' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {job.skillAnalysis.skillSummary.learningPath?.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Learning Path</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {job.skillAnalysis.skillSummary.learningPath.map((path: string, idx: number) => (
                          <Chip key={idx} label={path} size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* LinkedIn Post Section */}
        {job?.linkedinPost?.finalPost && (
          <Accordion
            sx={{
              mb: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '16px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              backgroundColor: 'white'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#0a66c2' }} />}
              sx={{
                backgroundColor: 'linear-gradient(to right, #eff6ff, white)',
                borderBottom: '1px solid #e5e7eb',
                minHeight: 64,
                '&:hover': { backgroundColor: '#f9fafb' },
                '& .MuiAccordionSummary-content': { my: 2 }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LinkedInIcon sx={{ color: '#0a66c2', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
                    LinkedIn Post
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Auto-generated professional job posting
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, backgroundColor: '#fafbfc' }}>
              <Box sx={{
                p: 3,
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                maxHeight: '400px',
                overflowY: 'auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#0a66c2',
                  borderRadius: '10px'
                }
              }}>
                <Typography variant="body2" sx={{
                  color: '#374151',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.9,
                  fontSize: '0.9rem',
                  fontFamily: '"Segoe UI", Roboto, sans-serif'
                }}>
                  {job.linkedinPost.finalPost}
                </Typography>
              </Box>
              {job.linkedinPost.hashtags && job.linkedinPost.hashtags.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mb: 1, display: 'block' }}>
                    Hashtags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {job.linkedinPost.hashtags.map((tag: string, idx: number) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        sx={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: '1px solid #c7d2fe',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#c7d2fe',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
      
      <DialogActions sx={{
        p: 3,
        pt: 2,
        borderTop: '2px solid #e5e7eb',
        backgroundColor: '#fafbfc',
        gap: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            color: '#6b7280',
            fontWeight: 600,
            borderColor: '#d1d5db',
            borderRadius: '12px',
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f3f4f6'
            }
          }}
        >
          Close
        </Button>
        {!!interviewHref && (
          <Link href={interviewHref} passHref legacyBehavior>
            <Button
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<OpenInNewIcon />}
            >
              Open Interview Link
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
