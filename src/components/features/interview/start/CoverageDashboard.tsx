import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { InterviewStatus, Coverage, RealTimeReport } from '@/types/interview';

interface CoverageDashboardProps {
  interviewStatus: InterviewStatus;
  coverage: Coverage | null;
  realTimeReport: RealTimeReport | null;
  agentMessage: string;
  coverageDashboardExpanded: boolean;
  onToggleExpand: () => void;
}

const CoverageDashboard: React.FC<CoverageDashboardProps> = ({
  interviewStatus,
  coverage,
  realTimeReport,
  agentMessage,
  coverageDashboardExpanded,
  onToggleExpand,
}) => {
  if (!(interviewStatus === 'active' || coverage)) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{
      mt: 3,
      background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.1) 0%, rgba(0, 184, 212, 0.1) 100%)',
      border: '1px solid rgba(131, 16, 255, 0.2)',
      borderRadius: 4,
      overflow: 'hidden'
    }}>
      <Box sx={{
        p: 2,
        background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.8) 0%, rgba(0, 184, 212, 0.8) 100%)',
        color: 'white',
        cursor: 'pointer'
      }}
      onClick={onToggleExpand}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <AssessmentIcon />
              AI Coverage Intelligence Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Real-time intelligent analysis of interview coverage
            </Typography>
          </Box>
          <IconButton sx={{ color: 'white' }}>
            {coverageDashboardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible Content */}
      {coverageDashboardExpanded && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 3 }}>
        {/* Overall Coverage */}
        <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
          <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                Overall Coverage
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ color: '#00ff9d', fontWeight: 700 }}>
                  {coverage?.overall || 0}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Interview Completion
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={coverage?.overall || 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #8310FF 0%, #00ff9d 100%)',
                    borderRadius: 4,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* AI Insights */}
        <Box sx={{ width: { xs: '100%', md: 'calc(66.666% - 11px)' } }}>
          <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                AI Intelligence Insights
              </Typography>
              {realTimeReport?.aiInsights ? (
                <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                  {realTimeReport.aiInsights.map((insight: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PsychologyIcon sx={{ fontSize: 16, color: '#00ff9d' }} />
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {insight}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  AI insights will appear as the interview progresses...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Coverage Areas Breakdown */}
        <Box sx={{ width: '100%' }}>
          <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 3 }}>
                Competency Coverage Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {coverage?.areas && Object.entries(coverage.areas).map(([areaName, areaData]: [string, any]) => (
                  <Box key={areaName} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(131, 16, 255, 0.1)',
                      border: '1px solid rgba(131, 16, 255, 0.2)',
                      height: '100%'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          {areaName}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${areaData.percentage || 0}%`}
                          sx={{
                            backgroundColor: areaData.percentage >= 80 ? '#4caf50' : areaData.percentage >= 50 ? '#ff9800' : '#f44336',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={areaData.percentage || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            background: areaData.percentage >= 80 ?
                              'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)' :
                              areaData.percentage >= 50 ?
                              'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)' :
                              'linear-gradient(90deg, #f44336 0%, #e57373 100%)',
                            borderRadius: 3,
                          },
                        }}
                      />
                      {areaData.aiAnalysis && (
                        <Typography variant="caption" sx={{
                          color: '#666',
                          display: 'block',
                          mt: 1,
                          fontSize: '0.7rem',
                          fontStyle: 'italic'
                        }}>
                          AI: {areaData.aiAnalysis.reasoning?.substring(0, 60)}...
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Real-time Recommendations */}
        {realTimeReport?.recommendations && realTimeReport.recommendations.length > 0 && (
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
            <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                  AI Recommendations
                </Typography>
                <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  {realTimeReport.recommendations.map((rec: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#00ff9d',
                        mt: 0.5,
                        flexShrink: 0
                      }} />
                      <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.4 }}>
                        {rec}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Performance Trends */}
        {realTimeReport?.trends && realTimeReport.trends.length > 0 && (
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
            <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                  Performance Trends
                </Typography>
                <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  {realTimeReport.trends.map((trend: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <Box sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderBottom: '6px solid #00b8d4',
                        mt: 0.5,
                        flexShrink: 0
                      }} />
                      <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.4 }}>
                        {trend}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* AI Decision History */}
        {interviewStatus === 'active' && (
          <Box sx={{ width: '100%' }}>
            <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                  AI Decision Intelligence
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(0, 255, 157, 0.1)',
                  border: '1px solid rgba(0, 255, 157, 0.2)'
                }}>
                  <Typography variant="body2" sx={{ color: '#333', mb: 1, fontWeight: 500 }}>
                    Current AI Focus: {agentMessage || 'Analyzing conversation flow...'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    The AI is continuously analyzing responses, preventing question repetition, and ensuring comprehensive coverage of all competency areas.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
        </Box>
      )}
    </Paper>
  );
};

export default CoverageDashboard;
