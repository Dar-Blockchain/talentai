import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Divider, Card, CardContent, Paper, Tooltip, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface CodeValidationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  detailsProject: any;
}

const CodeValidationDetailsModal: React.FC<CodeValidationDetailsModalProps> = ({ open, onClose, detailsProject }) => {
  const renderScoreChip = (score: number | undefined | null) => {
    if (score === undefined || score === null) {
      return (
        <Chip
          label="N/A"
          size="medium"
          sx={{
            bgcolor: '#e0e0e0',
            color: '#757575',
            fontWeight: 700,
            fontSize: 15,
            px: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
            border: '1.5px solid #e0e0e0',
          }}
        />
      );
    }
    let chipGradient = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
    let chipText = '#fff';
    let icon = <StarIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
    let tooltip = 'Excellent';
    if (score < 50) {
      chipGradient = 'linear-gradient(90deg, #e53935 0%, #ff6a00 100%)';
      icon = <WarningAmberIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
      tooltip = 'Needs Improvement';
    } else if (score < 80) {
      chipGradient = 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)';
      icon = <TrendingUpIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
      tooltip = 'Good';
    }
    return (
      <Tooltip title={tooltip} arrow>
        <Chip
          icon={icon}
          label={<span style={{ fontWeight: 700, fontSize: 15 }}>{score}%</span>}
          size="medium"
          sx={{
            background: chipGradient,
            color: chipText,
            fontWeight: 700,
            fontSize: 15,
            px: 2.5,
            borderRadius: 3,
            boxShadow: '0 4px 16px 0 rgba(67,233,123,0.18)',
            minWidth: 60,
            justifyContent: 'left',
            border: '2px solid #fff',
          }}
        />
      </Tooltip>
    );
  };

  const codeAnalysis = detailsProject?.assessment?.codeAnalysis;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" fontWeight={800}>Code Validation Details</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="large" sx={{ ml: 2 }}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {detailsProject && (
          <Box>
            <Typography variant="h5" sx={{ mt: 1, mb: 1, fontWeight: 800 }}>{detailsProject.name}</Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>{detailsProject.description || 'No description provided.'}</Typography>
            
            {codeAnalysis ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Overall Code Analysis Score */}
                <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2, background: 'linear-gradient(135deg, #f7faff 0%, #e3f2fd 100%)' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssessmentIcon sx={{ color: '#7C4DFF', mr: 1 }} />
                      <Typography variant="h6" fontWeight={800}>Overall Code Quality Score</Typography>
                      <Box sx={{ ml: 'auto' }}>
                        {renderScoreChip(codeAnalysis.analysis?.overallScore)}
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      This score represents the overall quality assessment of the project's codebase, including structure, maintainability, security, and best practices.
                    </Typography>
                  </CardContent>
                </Paper>



                {/* Project Architecture */}
                {codeAnalysis.analysis?.architecture && (
                  <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ArchitectureIcon sx={{ color: '#00B8D4', mr: 1 }} />
                        <Typography variant="h6" fontWeight={800}>Project Architecture</Typography>
                        <Box sx={{ ml: 'auto' }}>
                          {renderScoreChip(codeAnalysis.analysis.architecture.quality)}
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Architecture Pattern</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{codeAnalysis.analysis.architecture.pattern || 'Not specified'}</Typography>
                      
                      {codeAnalysis.analysis.architecture.layers && codeAnalysis.analysis.architecture.layers.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Architecture Layers</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {codeAnalysis.analysis.architecture.layers.map((layer: string, i: number) => (
                              <Chip
                                key={i}
                                label={layer}
                                size="small"
                                sx={{
                                  bgcolor: '#e8f5e8',
                                  color: '#2e7d32',
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {codeAnalysis.analysis.architecture.patterns && codeAnalysis.analysis.architecture.patterns.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Design Patterns</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {codeAnalysis.analysis.architecture.patterns.map((pattern: string, i: number) => (
                              <Chip
                                key={i}
                                label={pattern}
                                size="small"
                                sx={{
                                  bgcolor: '#fff3e0',
                                  color: '#f57c00',
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {codeAnalysis.analysis.architecture.strengths && codeAnalysis.analysis.architecture.strengths.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Strengths</Typography>
                          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                            {codeAnalysis.analysis.architecture.strengths.map((strength: string, i: number) => (
                              <li key={i}><Typography variant="body2">{strength}</Typography></li>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {codeAnalysis.analysis.architecture.weaknesses && codeAnalysis.analysis.architecture.weaknesses.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Areas for Improvement</Typography>
                          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                            {codeAnalysis.analysis.architecture.weaknesses.map((weakness: string, i: number) => (
                              <li key={i}><Typography variant="body2">{weakness}</Typography></li>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {/* Architecture Structure */}
                      {codeAnalysis.analysis.architecture.structure && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Project Structure</Typography>
                          
                          {codeAnalysis.analysis.architecture.structure.rootFiles && codeAnalysis.analysis.architecture.structure.rootFiles.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Root Files:</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {codeAnalysis.analysis.architecture.structure.rootFiles.map((file: string, i: number) => (
                                  <Chip
                                    key={i}
                                    label={file}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f5f5f5',
                                      color: '#424242',
                                      fontWeight: 500,
                                      fontSize: 11,
                                      fontFamily: 'monospace',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {codeAnalysis.analysis.architecture.structure.srcStructure && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Source Structure:</Typography>
                              {Object.entries(codeAnalysis.analysis.architecture.structure.srcStructure).map(([key, value]: [string, any]) => (
                                <Box key={key} sx={{ mb: 1 }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1976d2' }}>{key}:</Typography>
                                  {Array.isArray(value) && value.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
                                      {value.map((item: string, i: number) => (
                                        <Chip
                                          key={i}
                                          label={item}
                                          size="small"
                                          sx={{
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 500,
                                            fontSize: 11,
                                            fontFamily: 'monospace',
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Paper>
                )}

                {/* Project Purpose */}
                {codeAnalysis.analysis?.projectPurpose && (
                  <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ArticleIcon sx={{ color: '#00B8D4', mr: 1 }} />
                        <Typography variant="h6" fontWeight={800}>Project Purpose</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Domain</Typography>
                          <Typography variant="body2">{codeAnalysis.analysis.projectPurpose.domain || 'Not specified'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Type</Typography>
                          <Typography variant="body2">{codeAnalysis.analysis.projectPurpose.type || 'Not specified'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Complexity</Typography>
                          <Typography variant="body2">{codeAnalysis.analysis.projectPurpose.complexity || 'Not specified'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Target</Typography>
                          <Typography variant="body2">{codeAnalysis.analysis.projectPurpose.target || 'Not specified'}</Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Description</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{codeAnalysis.analysis.projectPurpose.description || 'Not specified'}</Typography>
                      
                      {codeAnalysis.analysis.projectPurpose.features && codeAnalysis.analysis.projectPurpose.features.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Features</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {codeAnalysis.analysis.projectPurpose.features.map((feature: string, i: number) => (
                              <Chip
                                key={i}
                                label={feature}
                                size="small"
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {codeAnalysis.analysis.projectPurpose.technologies && codeAnalysis.analysis.projectPurpose.technologies.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Technologies</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {codeAnalysis.analysis.projectPurpose.technologies.map((tech: string, i: number) => (
                              <Chip
                                key={i}
                                label={tech}
                                size="small"
                                sx={{
                                  bgcolor: '#f3e5f5',
                                  color: '#7b1fa2',
                                  fontWeight: 600,
                                  fontSize: 12,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {codeAnalysis.analysis.projectPurpose.keyFiles && codeAnalysis.analysis.projectPurpose.keyFiles.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Key Files</Typography>
                          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                            {codeAnalysis.analysis.projectPurpose.keyFiles.map((file: string, i: number) => (
                              <li key={i}><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>{file}</Typography></li>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Conclusion</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{codeAnalysis.analysis.projectPurpose.conclusion || 'Not specified'}</Typography>
                    </CardContent>
                  </Paper>
                )}



                {/* Repository Information */}
                <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2, background: '#f8fafc' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CodeIcon sx={{ color: '#7C4DFF', mr: 1 }} />
                      <Typography variant="h6" fontWeight={800}>Repository Information</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Repository</Typography>
                        <Typography variant="body2">{codeAnalysis.owner}/{codeAnalysis.repo}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Total Commits</Typography>
                        <Typography variant="body2">{codeAnalysis.totalCommits || 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>First Commit</Typography>
                        <Typography variant="body2">
                          {codeAnalysis.firstCommit ? new Date(codeAnalysis.firstCommit).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Last Commit</Typography>
                        <Typography variant="body2">
                          {codeAnalysis.lastCommit ? new Date(codeAnalysis.lastCommit).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Paper>
              </Box>
            ) : (
              <Paper elevation={3} sx={{ borderRadius: 4, p: 3, textAlign: 'center', background: '#f8fafc' }}>
                <CodeIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>No Code Analysis Available</Typography>
                <Typography variant="body2" color="text.secondary">
                  Code analysis has not been performed for this project yet.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CodeValidationDetailsModal; 