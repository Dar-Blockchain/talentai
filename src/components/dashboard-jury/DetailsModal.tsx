import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Divider, Card, CardContent, Paper, Tooltip, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import LayersIcon from '@mui/icons-material/Layers';
import GroupIcon from '@mui/icons-material/Group';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import ArticleIcon from '@mui/icons-material/Article';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { downloadProjectPdf } from '@/store/slices/projectSlice';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';

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

  const dispatch = useDispatch<any>();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!detailsProject?._id) return;
    setDownloading(true);
    try {
      const blob = await dispatch(downloadProjectPdf(detailsProject._id)).unwrap();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${detailsProject?.name || 'project'}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
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
        <Button
          variant="contained"
          startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={downloading}
          sx={{
            mb: 2,
            background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 4px 16px 0 rgba(124,77,255,0.15)',
            borderRadius: 3,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontSize: 16,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #6b0cd6 0%, #00acc1 100%)',
              boxShadow: '0 8px 32px 0 rgba(124,77,255,0.22)',
            },
          }}
        >
          {downloading ? 'Downloading...' : 'Download Report as PDF'}
        </Button>
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
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }} fontSize={'20px'}><ArticleIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Summary</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{detailsProject.assessment.technicalData?.summary || 'No summary provided.'}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><ConstructionIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Tech Stack</Typography>
                      {Array.isArray(detailsProject.assessment.technicalData?.techStack) && detailsProject.assessment.technicalData.techStack.length > 0 ? (
                        detailsProject.assessment.technicalData.techStack.map((stack: any, idx: number) => (
                          <Card sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 1, background: '#f0f4ff' }} key={idx}>
                            <Typography variant="body2">{stack.title} ({stack.componentType})</Typography>
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
                          </Card>
                        ))
                      ) : <Typography variant="body2">No tech stack data.</Typography>}
                    </Box>
                    <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><AccountTreeIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Architecture</Typography>
                      {detailsProject.assessment.technicalData?.architecture ? (
                        <Box>
                          <Typography variant="body2">{detailsProject.assessment.technicalData.architecture.title} ({detailsProject.assessment.technicalData.architecture.type})</Typography>
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
                    </Box>
                    <Box my={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><ShowChartIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Scalability Approach</Typography>
                      {detailsProject.assessment.technicalData?.scalabilityApproach ? (
                        <Box>
                          <Typography variant="body2">{detailsProject.assessment.technicalData.scalabilityApproach.strategy}</Typography>
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
                    </Box>
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
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }} fontSize={'20px'}><ArticleIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Summary</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{detailsProject.assessment.businessData?.summary || 'No summary provided.'}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><BusinessIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Business Model</Typography>
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
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><PublicIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Market Potential</Typography>
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
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><GroupIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Target Users</Typography>
                      {Array.isArray(detailsProject.assessment.businessData?.targetUsers) && detailsProject.assessment.businessData.targetUsers.length > 0 ? (
                        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                          {detailsProject.assessment.businessData.targetUsers.map((u: string, i: number) => <li key={i}><Typography variant="body2">{u}</Typography></li>)}
                        </Box>
                      ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><AddCircleIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Added Values</Typography>
                      {Array.isArray(detailsProject.assessment.businessData?.addedValues) && detailsProject.assessment.businessData.addedValues.length > 0 ? (
                        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                          {detailsProject.assessment.businessData.addedValues.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                        </Box>
                      ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                      <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><BusinessIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Competitors</Typography>
                      {Array.isArray(detailsProject.assessment.businessData?.competitors) && detailsProject.assessment.businessData.competitors.length > 0 ? (
                        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                          {detailsProject.assessment.businessData.competitors.map((c: string, i: number) => <li key={i}><Typography variant="body2">{c}</Typography></li>)}
                        </Box>
                      ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
                      {/* Innovation Section */}
                      {detailsProject.assessment.businessData?.innovation && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><AddCircleIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Innovation</Typography>
                          {detailsProject.assessment.businessData.innovation.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.businessData.innovation.score)}</Typography>}
                          {detailsProject.assessment.businessData.innovation.addedValues && detailsProject.assessment.businessData.innovation.addedValues.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Added Values:</Typography>
                              {detailsProject.assessment.businessData.innovation.addedValues.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.mentionnedInnovationAspects && detailsProject.assessment.businessData.innovation.mentionnedInnovationAspects.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Mentioned Aspects:</Typography>
                              {detailsProject.assessment.businessData.innovation.mentionnedInnovationAspects.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.approvedInnovationAspects && detailsProject.assessment.businessData.innovation.approvedInnovationAspects.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Approved Aspects:</Typography>
                              {detailsProject.assessment.businessData.innovation.approvedInnovationAspects.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.explanation && detailsProject.assessment.businessData.innovation.explanation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Explanation:</Typography>
                              {detailsProject.assessment.businessData.innovation.explanation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.judgement && detailsProject.assessment.businessData.innovation.judgement.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Judgement:</Typography>
                              {detailsProject.assessment.businessData.innovation.judgement.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.strengths && detailsProject.assessment.businessData.innovation.strengths.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                              {detailsProject.assessment.businessData.innovation.strengths.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.weaknesses && detailsProject.assessment.businessData.innovation.weaknesses.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                              {detailsProject.assessment.businessData.innovation.weaknesses.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.innovation.recommendation && detailsProject.assessment.businessData.innovation.recommendation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                              {detailsProject.assessment.businessData.innovation.recommendation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                        </Box>
                      )}
                      {/* Track Alignment Section */}
                      {detailsProject.assessment.businessData?.trackAlignment && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><LayersIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Track Alignment</Typography>
                          <Typography variant="body2">Track: {detailsProject.assessment.businessData.trackAlignment.track}</Typography>
                          {detailsProject.assessment.businessData.trackAlignment.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.businessData.trackAlignment.score)}</Typography>}
                          {detailsProject.assessment.businessData.trackAlignment.explanation && detailsProject.assessment.businessData.trackAlignment.explanation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Explanation:</Typography>
                              {detailsProject.assessment.businessData.trackAlignment.explanation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.trackAlignment.judgement && detailsProject.assessment.businessData.trackAlignment.judgement.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Judgement:</Typography>
                              {detailsProject.assessment.businessData.trackAlignment.judgement.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.trackAlignment.strengths && detailsProject.assessment.businessData.trackAlignment.strengths.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                              {detailsProject.assessment.businessData.trackAlignment.strengths.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.trackAlignment.weaknesses && detailsProject.assessment.businessData.trackAlignment.weaknesses.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                              {detailsProject.assessment.businessData.trackAlignment.weaknesses.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.trackAlignment.recommendation && detailsProject.assessment.businessData.trackAlignment.recommendation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                              {detailsProject.assessment.businessData.trackAlignment.recommendation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                        </Box>
                      )}
                      {/* Hedera Ecosystem Impact Section */}
                      {detailsProject.assessment.businessData?.hederaEcosystemImpact && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" fontWeight={700} fontSize={'20px'}><ScienceIcon sx={{ mr: 1, fontSize: 25, verticalAlign: 'middle' }} />Hedera Ecosystem Impact</Typography>
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(detailsProject.assessment.businessData.hederaEcosystemImpact.score)}</Typography>}
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.explanation && detailsProject.assessment.businessData.hederaEcosystemImpact.explanation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Explanation:</Typography>
                              {detailsProject.assessment.businessData.hederaEcosystemImpact.explanation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.judgement && detailsProject.assessment.businessData.hederaEcosystemImpact.judgement.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Judgement:</Typography>
                              {detailsProject.assessment.businessData.hederaEcosystemImpact.judgement.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.strengths && detailsProject.assessment.businessData.hederaEcosystemImpact.strengths.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                              {detailsProject.assessment.businessData.hederaEcosystemImpact.strengths.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.weaknesses && detailsProject.assessment.businessData.hederaEcosystemImpact.weaknesses.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                              {detailsProject.assessment.businessData.hederaEcosystemImpact.weaknesses.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                          {detailsProject.assessment.businessData.hederaEcosystemImpact.recommendation && detailsProject.assessment.businessData.hederaEcosystemImpact.recommendation.length > 0 && (
                            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                              <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                              {detailsProject.assessment.businessData.hederaEcosystemImpact.recommendation.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
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
            {/* Eligibility Section */}
            {detailsProject.assessment.eligibility && (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mt: 2, background: '#f3f7f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningAmberIcon sx={{ color: detailsProject.assessment.eligibility.isEligible ? '#43e97b' : '#e53935', mr: 1 }} />
                  <Typography variant="h6" fontWeight={800} sx={{ mr: 2 }}>Eligibility</Typography>
                  <Chip
                    label={detailsProject.assessment.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                    color={detailsProject.assessment.eligibility.isEligible ? 'success' : 'error'}
                    sx={{ fontWeight: 700, fontSize: 15, borderRadius: 2, ml: 1 }}
                  />
                </Box>
                {Array.isArray(detailsProject.assessment.eligibility.checks) && detailsProject.assessment.eligibility.checks.length > 0 ? (
                  <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                    {detailsProject.assessment.eligibility.checks.map((check: any, idx: number) => (
                      <li key={idx}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <DescriptionIcon sx={{ fontSize: 18, mr: 1, color: '#7C4DFF' }} />
                          <b>{check.type}:</b>&nbsp;
                          <span style={{ color: check.status === 'IS_ELIGIBLE' ? '#43e97b' : check.status === 'IS_NOT_ELIGIBLE' ? '#e53935' : '#ff9800', fontWeight: 600 }}>
                            {check.status.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        </Typography>
                      </li>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2">No eligibility checks available.</Typography>
                )}
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal; 