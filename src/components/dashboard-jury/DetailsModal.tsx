import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Divider, Card, CardContent, Paper, Tooltip, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  detailsProject: any;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, detailsProject }) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        Project Assessment Details
        <IconButton aria-label="close" onClick={onClose} size="large" sx={{ ml: 2 }}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {detailsProject && (
          <Box>
            <Typography variant="h5" sx={{ mt: 1, mb: 1, fontWeight: 800 }}>{detailsProject.name}</Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>{detailsProject.description || 'No description provided.'}</Typography>
            {detailsProject.assessment ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Technical Assessment */}
                <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScienceIcon sx={{ color: '#7C4DFF', mr: 1 }} />
                      <Typography variant="h6" fontWeight={800}>Technical Assessment</Typography>
                      <Box sx={{ ml: 'auto' }}>{renderScoreChip(detailsProject.assessment.technicalData?.overallScore)}</Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Track: <span style={{ fontWeight: 400 }}>{detailsProject.assessment.technicalData?.track || 'No data'}</span></Typography>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Summary:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{detailsProject.assessment.technicalData?.summary || 'No summary provided.'}</Typography>
                    <Accordion elevation={0} sx={{ mb: 1, background: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>Tech Stack</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {Array.isArray(detailsProject.assessment.technicalData?.techStack) && detailsProject.assessment.technicalData.techStack.length > 0 ? (
                          detailsProject.assessment.technicalData.techStack.map((stack: any, idx: number) => (
                            <Box key={idx} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">{stack.title} ({stack.componentType})</Typography>
                              <Typography variant="body2">Complexity: {stack.complexity}, Modernity: {stack.modernity}</Typography>
                              {stack.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(stack.score)}</Typography>}
                              {stack.choiceExplanation && stack.choiceExplanation.length > 0 && (
                                <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                  {stack.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                                </Box>
                              )}
                              {stack.strengths && stack.strengths.length > 0 && (
                                <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                  <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                                  {stack.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                                </Box>
                              )}
                              {stack.weaknesses && stack.weaknesses.length > 0 && (
                                <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                  <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                                  {stack.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                                </Box>
                              )}
                              {stack.recommendation && stack.recommendation.length > 0 && (
                                <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                  <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                                  {stack.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                                </Box>
                              )}
                            </Box>
                          ))
                        ) : <Typography variant="body2">No tech stack data.</Typography>}
                      </AccordionDetails>
                    </Accordion>
                    <Accordion elevation={0} sx={{ mb: 1, background: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>Architecture</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {detailsProject.assessment.technicalData?.architecture ? (
                          <Box>
                            <Typography variant="subtitle2">{detailsProject.assessment.technicalData.architecture.title} ({detailsProject.assessment.technicalData.architecture.type})</Typography>
                            {detailsProject.assessment.technicalData.architecture.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.technicalData.architecture.score)}</Typography>}
                            {detailsProject.assessment.technicalData.architecture.choiceExplanation && detailsProject.assessment.technicalData.architecture.choiceExplanation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                {detailsProject.assessment.technicalData.architecture.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.architecture.strengths && detailsProject.assessment.technicalData.architecture.strengths.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                                {detailsProject.assessment.technicalData.architecture.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.architecture.weaknesses && detailsProject.assessment.technicalData.architecture.weaknesses.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                                {detailsProject.assessment.technicalData.architecture.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.architecture.recommendation && detailsProject.assessment.technicalData.architecture.recommendation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                                {detailsProject.assessment.technicalData.architecture.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                              </Box>
                            )}
                          </Box>
                        ) : <Typography variant="body2">No architecture data.</Typography>}
                      </AccordionDetails>
                    </Accordion>
                    <Accordion elevation={0} sx={{ mb: 1, background: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>Scalability Approach</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {detailsProject.assessment.technicalData?.scalabilityApproach ? (
                          <Box>
                            <Typography variant="subtitle2">{detailsProject.assessment.technicalData.scalabilityApproach.strategy}</Typography>
                            {detailsProject.assessment.technicalData.scalabilityApproach.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.technicalData.scalabilityApproach.score)}</Typography>}
                            {detailsProject.assessment.technicalData.scalabilityApproach.choiceExplanation && detailsProject.assessment.technicalData.scalabilityApproach.choiceExplanation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                {detailsProject.assessment.technicalData.scalabilityApproach.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.scalabilityApproach.strengths && detailsProject.assessment.technicalData.scalabilityApproach.strengths.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                                {detailsProject.assessment.technicalData.scalabilityApproach.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.scalabilityApproach.weaknesses && detailsProject.assessment.technicalData.scalabilityApproach.weaknesses.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                                {detailsProject.assessment.technicalData.scalabilityApproach.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.technicalData.scalabilityApproach.recommendation && detailsProject.assessment.technicalData.scalabilityApproach.recommendation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                                {detailsProject.assessment.technicalData.scalabilityApproach.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                              </Box>
                            )}
                          </Box>
                        ) : <Typography variant="body2">No scalability data.</Typography>}
                      </AccordionDetails>
                    </Accordion>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>Created: {detailsProject.assessment.technicalData?.createdAt ? new Date(detailsProject.assessment.technicalData.createdAt).toLocaleString() : 'No date'}</Typography>
                  </CardContent>
                </Paper>
                {/* Business Assessment */}
                <Paper elevation={3} sx={{ borderRadius: 4, mb: 2, flex: 1, p: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BusinessCenterIcon sx={{ color: '#00B8D4', mr: 1 }} />
                      <Typography variant="h6" fontWeight={800}>Business Assessment</Typography>
                      <Box sx={{ ml: 'auto' }}>{renderScoreChip(detailsProject.assessment.businessData?.overallScore)}</Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Problem: <span style={{ fontWeight: 400 }}>{detailsProject.assessment.businessData?.problem || 'No data'}</span></Typography>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Summary:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{detailsProject.assessment.businessData?.summary || 'No summary provided.'}</Typography>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Target Users:</Typography>
                    {Array.isArray(detailsProject.assessment.businessData?.targetUsers) && detailsProject.assessment.businessData.targetUsers.length > 0 ? (
                      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                        {detailsProject.assessment.businessData.targetUsers.map((u: string, i: number) => <li key={i}><Typography variant="body2">{u}</Typography></li>)}
                      </Box>
                    ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Added Values:</Typography>
                    {Array.isArray(detailsProject.assessment.businessData?.addedValues) && detailsProject.assessment.businessData.addedValues.length > 0 ? (
                      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                        {detailsProject.assessment.businessData.addedValues.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                      </Box>
                    ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                    <Accordion elevation={0} sx={{ mb: 1, background: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>Business Model</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {detailsProject.assessment.businessData?.businessModel ? (
                          <Box>
                            <Typography variant="subtitle2">{detailsProject.assessment.businessData.businessModel.model}</Typography>
                            {detailsProject.assessment.businessData.businessModel.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.businessData.businessModel.score)}</Typography>}
                            {detailsProject.assessment.businessData.businessModel.choiceExplanation && detailsProject.assessment.businessData.businessModel.choiceExplanation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                {detailsProject.assessment.businessData.businessModel.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.businessData.businessModel.strengths && detailsProject.assessment.businessData.businessModel.strengths.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                                {detailsProject.assessment.businessData.businessModel.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject?.assessment?.businessData?.businessModel?.weaknesses && detailsProject?.assessment?.businessData?.businessModel?.weaknesses.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                                {detailsProject.assessment.businessData.businessModel.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.businessData.businessModel.recommendation && detailsProject.assessment.businessData.businessModel.recommendation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                                {detailsProject.assessment.businessData.businessModel.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                              </Box>
                            )}
                          </Box>
                        ) : <Typography variant="body2">No business model data.</Typography>}
                      </AccordionDetails>
                    </Accordion>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Competitors:</Typography>
                    {Array.isArray(detailsProject.assessment.businessData?.competitors) && detailsProject.assessment.businessData.competitors.length > 0 ? (
                      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                        {detailsProject.assessment.businessData.competitors.map((c: string, i: number) => <li key={i}><Typography variant="body2">{c}</Typography></li>)}
                      </Box>
                    ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                    <Accordion elevation={0} sx={{ mb: 1, background: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>Market Potential</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {detailsProject.assessment.businessData?.marketPotential ? (
                          <Box>
                            <Typography variant="body2">Range: {detailsProject.assessment.businessData.marketPotential.range}</Typography>
                            <Typography variant="body2">Estimated Market Size: {detailsProject.assessment.businessData.marketPotential.estimatedMarketSize}</Typography>
                            <Typography variant="body2">Target Region: {detailsProject.assessment.businessData.marketPotential.targetRegion}</Typography>
                            {detailsProject.assessment.businessData.marketPotential.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.businessData.marketPotential.score)}</Typography>}
                            {detailsProject.assessment.businessData.marketPotential.choiceExplanation && detailsProject.assessment.businessData.marketPotential.choiceExplanation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                {detailsProject.assessment.businessData.marketPotential.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.businessData.marketPotential.strengths && detailsProject.assessment.businessData.marketPotential.strengths.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                                {detailsProject.assessment.businessData.marketPotential.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.businessData.marketPotential.weaknesses && detailsProject.assessment.businessData.marketPotential.weaknesses.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                                {detailsProject.assessment.businessData.marketPotential.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                              </Box>
                            )}
                            {detailsProject.assessment.businessData.marketPotential.recommendation && detailsProject.assessment.businessData.marketPotential.recommendation.length > 0 && (
                              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                                {detailsProject.assessment.businessData.marketPotential.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                              </Box>
                            )}
                          </Box>
                        ) : <Typography variant="body2">No market potential data.</Typography>}
                      </AccordionDetails>
                    </Accordion>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>Created: {detailsProject.assessment.businessData?.createdAt ? new Date(detailsProject.assessment.businessData.createdAt).toLocaleString() : 'No date'}</Typography>
                  </CardContent>
                </Paper>
              </Box>
            ) : (
              <Typography>No assessment data available.</Typography>
            )}
            <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mt: 2, background: '#f8fafc' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Combined Score</Typography>
              {renderScoreChip(detailsProject.assessment.overallScore)}
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal; 