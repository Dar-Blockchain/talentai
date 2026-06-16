import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog,
  TextField, Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { submitFeedback, resetFeedback } from '@/store/slices/feedbackSlice';

interface FeedbackModalProps {
  open: boolean;
  interviewId?: string;
  interviewType?: string;
  onDone: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, interviewId, interviewType, onDone }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { submitting, submitted, error } = useSelector((state: RootState) => state.feedback);

  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  // Reset local + redux state each time the modal opens
  useEffect(() => {
    if (open) {
      dispatch(resetFeedback());
      setRating(0);
      setHovered(0);
      setComment('');
    }
  }, [open, dispatch]);

  // Auto-proceed 1.5 s after successful submission
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [submitted, onDone]);

  const followUpQuestion =
    rating === 0  ? null :
    rating <= 3   ? 'What could be improved?' :
                    'What did you like most?';

  return (
    <Dialog
      open={open}
      onClose={() => {}} // prevent accidental backdrop close
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        },
      }}
    >
      {/* Purple accent bar */}
      <Box sx={{ height: 4, background: 'linear-gradient(90deg, #8310FF 0%, #6d0ee0 100%)' }} />

      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {submitted ? (
          /* ── Success state ── */
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 52, color: '#16a34a' }} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#15803d' }}>
              Thank you for your feedback!
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', textAlign: 'center' }}>
              We appreciate your response.
            </Typography>
          </Box>
        ) : (
          /* ── Form state ── */
          <>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', mb: 0.5 }}>
              How was your interview experience?
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', mb: 2.5 }}>
              Your feedback helps us improve.
            </Typography>

            {/* Star rating */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hovered || rating);
                return (
                  <Box
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    sx={{ cursor: 'pointer', color: active ? '#F59E0B' : '#D1D5DB' }}
                  >
                    {active
                      ? <StarIcon sx={{ fontSize: 36 }} />
                      : <StarBorderIcon sx={{ fontSize: 36 }} />}
                  </Box>
                );
              })}
            </Box>

            {/* Conditional follow-up */}
            {followUpQuestion && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', fontWeight: 600, color: '#374151', mb: 1 }}>
                  {followUpQuestion}
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Write your comment here…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontFamily: 'Poppins',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&:hover fieldset': { borderColor: '#9CA3AF' },
                      '&.Mui-focused fieldset': { borderColor: '#8310FF' },
                    },
                  }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.5, textAlign: 'right' }}>
                  {comment.length}/1000
                </Typography>
              </Box>
            )}

            {error && (
              <Typography sx={{ fontSize: '0.82rem', color: '#DC2626', mb: 1.5, fontFamily: 'Poppins' }}>
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                disabled={!rating || submitting}
                onClick={() => dispatch(submitFeedback({ rating, comment, interviewId, interviewType }))}
                sx={{
                  flex: 1,
                  fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem',
                  textTransform: 'none', py: 1.2, borderRadius: '12px',
                  bgcolor: '#8310FF', color: '#fff', boxShadow: 'none',
                  '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                }}
              >
                {submitting
                  ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                  : 'Submit'}
              </Button>

              <Button
                variant="text"
                disabled={submitting}
                onClick={onDone}
                sx={{
                  fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem',
                  textTransform: 'none', px: 2.5, py: 1.2, borderRadius: '12px',
                  color: '#6B7280', '&:hover': { bgcolor: '#f9fafb' },
                }}
              >
                Skip
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default FeedbackModal;
