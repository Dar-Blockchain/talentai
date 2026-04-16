import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { FeedbackFormData } from '../../../../types/postInterview';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose }) => {
  const [feedback, setFeedback] = useState<FeedbackFormData>({
    overallExperience: '',
    easeOfUse: '',
    questionQuality: '',
    interfaceRating: '',
    evaluationRating: '',
    recommendation: '',
  });

  const ratingOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FeedbackIcon sx={{ color: '#02E2FF' }} />
          <Typography variant="h6">Interview Feedback</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth required>
                <InputLabel>Overall Experience</InputLabel>
                <Select
                  value={feedback.overallExperience}
                  onChange={(e) =>
                    setFeedback((prev) => ({ ...prev, overallExperience: e.target.value }))
                  }
                  label="Overall Experience"
                >
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth required>
                <InputLabel>Ease of Use</InputLabel>
                <Select
                  value={feedback.easeOfUse}
                  onChange={(e) => setFeedback((prev) => ({ ...prev, easeOfUse: e.target.value }))}
                  label="Ease of Use"
                >
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth required>
                <InputLabel>Question Quality</InputLabel>
                <Select
                  value={feedback.questionQuality}
                  onChange={(e) =>
                    setFeedback((prev) => ({ ...prev, questionQuality: e.target.value }))
                  }
                  label="Question Quality"
                >
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth required>
                <InputLabel>Interface Rating</InputLabel>
                <Select
                  value={feedback.interfaceRating}
                  onChange={(e) =>
                    setFeedback((prev) => ({ ...prev, interfaceRating: e.target.value }))
                  }
                  label="Interface Rating"
                >
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box>
            <FormControl fullWidth required>
              <InputLabel>Evaluation Rating</InputLabel>
              <Select
                value={feedback.evaluationRating}
                onChange={(e) =>
                  setFeedback((prev) => ({ ...prev, evaluationRating: e.target.value }))
                }
                label="Evaluation Rating"
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments or Suggestions"
              value={feedback.recommendation}
              onChange={(e) => setFeedback((prev) => ({ ...prev, recommendation: e.target.value }))}
              placeholder="Share your thoughts about the interview experience..."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(FeedbackDialog);
