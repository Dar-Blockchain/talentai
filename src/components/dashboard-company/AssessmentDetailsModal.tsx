// components/AssessmentDetailsModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SkillAnalysis {
  skillName: string;
  requiredLevel: string;
  demonstratedLevel: string;
  match: string;
}

interface RecommendationModalProps {
  open: boolean;
  onClose: () => void;
  assessment?: {
    condidateId: {
      skills: Array<{ _id: string; name: string; experienceLevel: string }>;
    };
    timestamp: string;
    analysis: {
      overallScore: number;
      jobMatch: { status: string };
      skillAnalysis: SkillAnalysis[];
      recommendations: string[];
    };
  };
}

export const AssessmentDetailsModal: React.FC<RecommendationModalProps> = ({
  open,
  onClose,
  assessment
}) => {
  if (!assessment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(2,226,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: 'black', borderBottom: '1px solid rgba(2,226,255,0.1)' }}>
        Assessment Details
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Candidate Info */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>
            Candidate Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'black' }}>Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {assessment.condidateId.skills.map(s => (
                  <Chip
                    key={s._id}
                    label={`${s.name} (${s.experienceLevel})`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 255, 157, 1)',
                      color: 'black',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'black' }}>Assessment Date</Typography>
              <Typography sx={{ color: 'black' }}>
                {new Date(assessment.timestamp).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Assessment Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>
            Assessment Results
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'black' }}>Overall Score</Typography>
              <Typography sx={{ color: 'black' }}>
                {assessment.analysis.overallScore}%
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'black' }}>Job Match Status</Typography>
              <Typography sx={{ color: 'black' }}>
                {assessment.analysis.jobMatch.status}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Skill Analysis */}
        <Box sx={{ mb: 4, backgroundColor: 'white', borderRadius: '16px', p: 2, border: '2px solid rgba(0, 255, 157, 1)' }}>
          <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>
            Skill Analysis
          </Typography>
          {assessment.analysis.skillAnalysis.map((skill, i) => (
            <Box key={i} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: '8px' }}>
              <Typography variant="subtitle1" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 1 }}>
                {skill.skillName}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#000' }}>Required Level</Typography>
                  <Typography sx={{ color: '#000' }}>{skill.requiredLevel}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#000' }}>Demonstrated Level</Typography>
                  <Typography sx={{ color: '#000' }}>{skill.demonstratedLevel}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#000' }}>Match Status</Typography>
                  <Typography sx={{ color: '#000' }}>{skill.match}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Recommendations */}
        <Box>
          <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>
            Recommendations
          </Typography>
          <List>
            {assessment.analysis.recommendations.map((rec, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  <ArrowForwardIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                </ListItemIcon>
                <ListItemText primary={rec} sx={{ color: 'black' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(2,226,255,0.1)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(0, 255, 157, 1)',
            '&:hover': { backgroundColor: 'rgba(0, 255, 157, 0.1)' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
