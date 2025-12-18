import React from 'react';
import { Box, Typography, Chip, Stack, List, ListItem, ListItemText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

interface JobBasicInfoProps {
  details: any;
  skillAnalysis?: any;
}

const JobBasicInfo: React.FC<JobBasicInfoProps> = ({ details, skillAnalysis }) => {
  return (
    <>
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
      {(skillAnalysis?.requiredSkills ?? []).length > 0 && (
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
            {skillAnalysis.requiredSkills.map((skill: any, idx: number) => (
              <Chip
                key={idx}
                label={`${skill.name} ${skill.level ? `(Level ${skill.level})` : ''}`}
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
      )}

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
    </>
  );
};

export default React.memo(JobBasicInfo);
