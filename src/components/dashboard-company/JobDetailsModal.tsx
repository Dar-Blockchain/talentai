import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

interface JobDetailsModalProps {
  open: boolean;
  onClose: () => void;
  selectedJobForDetails: any;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  open, 
  onClose, 
  selectedJobForDetails 
}) => {
  if (!selectedJobForDetails) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(24px)',
          maxHeight: '95vh',
          overflow: 'hidden',
          border: '1px solid rgba(0, 255, 157, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '2px solid rgba(0, 255, 157, 0.15)',
        pb: 3,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00FF9D 0%, #02E2FF 50%, #00FF9D 100%)',
          borderRadius: '24px 24px 0 0'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 255, 157, 0.3)'
          }}>
            <WorkIcon sx={{ color: '#1e293b', fontSize: 28, fontWeight: 'bold' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Job Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
              Comprehensive job information and requirements
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            p: 1.5,
            '&:hover': {
              color: '#00FF9D',
              background: 'rgba(0, 255, 157, 0.2)',
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <CloseIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        mt: 0, 
        p: 0,
        overflowY: 'auto',
        maxHeight: 'calc(95vh - 140px)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)'
      }}>
        <Box sx={{ p: 4 }}>
          {/* Job Header - Enhanced */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(2, 226, 255, 0.08) 100%)',
            borderRadius: '20px',
            p: 4,
            border: '2px solid rgba(0, 255, 157, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00FF9D 0%, #02E2FF 100%)'
            }
          }}>
            <Typography variant="h4" sx={{ 
              color: '#1e293b', 
              fontWeight: 800, 
              mb: 3,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1.2
            }}>
              {selectedJobForDetails.jobDetails.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              <Chip
                icon={<LocationOnIcon sx={{ fontSize: 20, color: '#1e293b' }} />}
                label={selectedJobForDetails.jobDetails.location}
                size="medium"
                sx={{ 
                  backgroundColor: 'rgba(0, 255, 157, 0.9)', 
                  color: '#1e293b', 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0, 255, 157, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 255, 157, 0.3)',
                    transition: 'all 0.2s ease'
                  }
                }}
              />
              <Chip
                label={selectedJobForDetails.jobDetails.employmentType}
                size="medium"
                sx={{ 
                  backgroundColor: 'rgba(2, 226, 255, 0.9)', 
                  color: '#1e293b', 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(2, 226, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(2, 226, 255, 0.3)',
                    transition: 'all 0.2s ease'
                  }
                }}
              />
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: 20, color: '#1e293b' }} />}
                label={`${selectedJobForDetails.jobDetails.salary.currency}${selectedJobForDetails.jobDetails.salary.min.toLocaleString()}-${selectedJobForDetails.jobDetails.salary.max.toLocaleString()}`}
                size="medium"
                sx={{ 
                  backgroundColor: 'rgba(255, 193, 7, 0.9)', 
                  color: '#1e293b', 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(255, 193, 7, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(255, 193, 7, 0.3)',
                    transition: 'all 0.2s ease'
                  }
                }}
              />
            </Box>
            
            {selectedJobForDetails.createdAt && (
              <Typography variant="body2" sx={{ 
                color: 'rgba(30, 41, 59, 0.7)', 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoIcon sx={{ fontSize: 16, color: '#00FF9D' }} />
                Posted: {new Date(selectedJobForDetails.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            )}
            
            {/* Job URL - Enhanced */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                color: '#1e293b', 
                fontWeight: 600, 
                display: 'block', 
                mb: 1.5,
                fontSize: '0.95rem'
              }}>
                Public Job URL:
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                p: 2,
                border: '2px solid rgba(0, 255, 157, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 255, 157, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(0, 255, 157, 0.4)',
                  boxShadow: '0 6px 16px rgba(0, 255, 157, 0.2)'
                }
              }}>
                <LinkIcon sx={{ color: '#02E2FF', mr: 1.5, fontSize: 24 }} />
                <Typography
                  sx={{ 
                    color: '#02E2FF', 
                    fontWeight: 600, 
                    flex: 1, 
                    wordBreak: 'break-all',
                    fontSize: '0.9rem'
                  }}
                >
                  {(() => {
                    const base = typeof window !== 'undefined' && window.location.origin 
                      ? `${window.location.origin}`
                      : `https://app.talentai.bid`;
                    const stepId = selectedJobForDetails?.post_Steps?.[0]?._id;
                    return stepId
                      ? `${base}/posts/${selectedJobForDetails._id}/interview?stepId=${stepId}`
                      : `${base}/posts/${selectedJobForDetails._id}/interview`;
                  })()}
                </Typography>
                <Tooltip title="Copy URL" arrow>
                  <IconButton
                    onClick={() => {
                      const base = typeof window !== 'undefined' && window.location.origin 
                        ? `${window.location.origin}`
                        : `https://app.talentai.bid`;
                      const stepId = selectedJobForDetails?.post_Steps?.[0]?._id;
                      const url = stepId
                        ? `${base}/posts/${selectedJobForDetails._id}/interview?stepId=${stepId}`
                        : `${base}/posts/${selectedJobForDetails._id}/interview`;
                      navigator.clipboard.writeText(url);
                    }}
                    sx={{ 
                      color: '#02E2FF', 
                      ml: 1,
                      background: 'rgba(2, 226, 255, 0.1)',
                      borderRadius: '8px',
                      '&:hover': {
                        color: '#00FFC3',
                        background: 'rgba(0, 255, 195, 0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    size="small"
                  >
                    <ContentCopyIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Content Sections */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
            {/* Job Description */}
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              p: 3,
              border: '1px solid rgba(0, 255, 157, 0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" sx={{ 
                color: '#1e293b', 
                fontWeight: 700, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <DescriptionIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#374151', 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem'
              }}>
                {selectedJobForDetails.jobDetails.description}
              </Typography>
            </Box>

            {/* Requirements */}
            {selectedJobForDetails.jobDetails.requirements && selectedJobForDetails.jobDetails.requirements.length > 0 && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CheckIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Requirements
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                  {selectedJobForDetails.jobDetails.requirements.map((req: string, index: number) => (
                    <Typography 
                      key={index} 
                      component="li" 
                      variant="body1" 
                      sx={{ 
                        color: '#374151', 
                        mb: 1.5,
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '8px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#00FF9D'
                        }
                      }}
                    >
                      {req}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Responsibilities */}
            {selectedJobForDetails.jobDetails.responsibilities && selectedJobForDetails.jobDetails.responsibilities.length > 0 && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <WorkIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Responsibilities
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                  {selectedJobForDetails.jobDetails.responsibilities.map((resp: string, index: number) => (
                    <Typography 
                      key={index} 
                      component="li" 
                      variant="body1" 
                      sx={{ 
                        color: '#374151', 
                        mb: 1.5,
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '8px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#02E2FF'
                        }
                      }}
                    >
                      {resp}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Required Skills */}
            {selectedJobForDetails.skillAnalysis?.requiredSkills && selectedJobForDetails.skillAnalysis.requiredSkills.length > 0 && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <StarIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {selectedJobForDetails.skillAnalysis.requiredSkills.map((skill: any, idx: number) => (
                    <Chip
                      key={idx}
                      label={`${skill.name} (${skill.level})`}
                      size="medium"
                      icon={<StarIcon sx={{ color: '#1e293b', fontSize: 18 }} />}
                      sx={{
                        backgroundColor: 'linear-gradient(135deg, rgba(0, 255, 157, 0.9) 0%, rgba(0, 255, 195, 0.9) 100%)',
                        background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.9) 0%, rgba(0, 255, 195, 0.9) 100%)',
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        letterSpacing: 0.2,
                        px: 2,
                        py: 1,
                        borderRadius: '12px',
                        boxShadow: '0 4px 8px rgba(0, 255, 157, 0.2)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 255, 157, 0.3)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Suggested Skills */}
            {selectedJobForDetails.skillAnalysis?.suggestedSkills && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AutoAwesomeIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Suggested Skills
                </Typography>
                
                {/* Technical Skills */}
                {selectedJobForDetails.skillAnalysis.suggestedSkills.technical && selectedJobForDetails.skillAnalysis.suggestedSkills.technical.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: '1rem'
                    }}>
                      Technical Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedJobForDetails.skillAnalysis.suggestedSkills.technical.map((skill: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={skill.name}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(2, 226, 255, 0.9)',
                            color: '#1e293b',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Frameworks */}
                {selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks && selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: '1rem'
                    }}>
                      Frameworks
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks.map((skill: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={skill.name}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(2, 226, 255, 0.9)',
                            color: '#1e293b',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Tools */}
                {selectedJobForDetails.skillAnalysis.suggestedSkills.tools && selectedJobForDetails.skillAnalysis.suggestedSkills.tools.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: '1rem'
                    }}>
                      Tools
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedJobForDetails.skillAnalysis.suggestedSkills.tools.map((skill: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={skill.name}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(2, 226, 255, 0.9)',
                            color: '#1e293b',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Skill Summary */}
            {selectedJobForDetails.skillAnalysis?.skillSummary && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUpIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Skill Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies && selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: '1rem'
                      }}>
                        Main Technologies
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies.map((tech: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={tech}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(0, 255, 157, 0.8)',
                              color: '#1e293b',
                              fontWeight: 600,
                              borderRadius: '8px',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0, 255, 157, 0.3)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills && selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: '1rem'
                      }}>
                        Complementary Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills.map((skill: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(2, 226, 255, 0.8)',
                              color: '#1e293b',
                              fontWeight: 600,
                              borderRadius: '8px',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedJobForDetails.skillAnalysis.skillSummary.stackComplexity && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: '1rem'
                      }}>
                        Stack Complexity
                      </Typography>
                      <Chip
                        label={selectedJobForDetails.skillAnalysis.skillSummary.stackComplexity}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0, 255, 157, 0.9)',
                          color: '#1e293b',
                          fontWeight: 600,
                          borderRadius: '8px',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0, 255, 157, 0.3)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Recruitment Steps */}
            {selectedJobForDetails?.post_Steps?.length > 0 && (
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(0, 255, 157, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUpIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                  Recruitment Steps
                </Typography>
                <Stepper orientation="vertical" nonLinear activeStep={-1}>
                  {selectedJobForDetails?.post_Steps?.map((step: any, index: number) => (
                    <Step key={step._id}>
                      <StepLabel
                        StepIconProps={{
                          sx: {
                            color: 'rgba(0, 255, 157, 1)',
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {step.data.title || step.data.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                          {step.data.subtitle}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '2px solid rgba(0, 255, 157, 0.15)',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '0 0 24px 24px'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
            color: '#1e293b',
            fontWeight: 700,
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: '0 8px 16px rgba(0, 255, 157, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00E2B8 0%, #00C3FF 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(0, 255, 157, 0.4)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsModal;
