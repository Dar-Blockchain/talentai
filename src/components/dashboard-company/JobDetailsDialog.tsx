import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import JobBasicInfo from './job-details/JobBasicInfo';
import RecruitmentFlowSection from './job-details/RecruitmentFlowSection';
import SkillAnalysisSection from './job-details/SkillAnalysisSection';
import LinkedInPostSection from './job-details/LinkedInPostSection';
import AgentConfigSection from './job-details/AgentConfigSection';

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  job: any | null;
  onRefresh?: () => void;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({ open, onClose, job, onRefresh }) => {
  const details = job?.jobDetails || job;
  const createdAt = job?.createdAt || job?.created_at || job?.postedAt;
  const steps: any[] = Array.isArray(job?.post_Steps) ? [...job.post_Steps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const firstStep = steps[0];
  const firstStepData = firstStep?.data;
  const postId = job?._id || job?.id;

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
        {/* Job Basic Information */}
        <JobBasicInfo details={details} skillAnalysis={job?.skillAnalysis} />

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
        <AgentConfigSection job={job} onRefresh={onRefresh} />

        {/* Skill Analysis Section */}
        <SkillAnalysisSection skillAnalysis={job?.skillAnalysis} />

        {/* LinkedIn Post Section */}
        <LinkedInPostSection linkedinPost={job?.linkedinPost} />
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
