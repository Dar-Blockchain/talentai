import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { submitFeedback } from '@/store/slices/feedbackSlice';
import { useTranslation } from 'react-i18next';

interface InterviewFeedbackProps {
  interviewId?: string;
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ interviewId }) => {
  const { t } = useTranslation('modules/interview/results');
  const dispatch = useDispatch<AppDispatch>();
  const { submitting, submitted, error } = useSelector((state: RootState) => state.feedback);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const question =
    rating === 0
      ? null
      : rating <= 3
      ? t('feedback.question_bad')
      : t('feedback.question_good');

  const handleSubmit = () => {
    if (!rating) return;
    dispatch(submitFeedback({ rating, comment, interviewId }));
  };

  if (submitted) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          py: 4,
          px: 3,
          bgcolor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          mt: 3,
          mb: 1,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#16a34a' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#15803d', fontFamily: 'Poppins' }}>
          {t('feedback.thanks_title')}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#4ade80', fontFamily: 'Poppins' }}>
          {t('feedback.thanks_desc')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        p: { xs: 3, md: 4 },
        mt: 3,
        mb: 1,
      }}
    >
      <Typography
        sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.5, fontFamily: 'Poppins' }}
      >
        {t('feedback.title')}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', mb: 2.5, fontFamily: 'Poppins' }}>
        {t('feedback.subtitle')}
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
              sx={{ cursor: 'pointer', color: active ? '#F59E0B' : '#D1D5DB', fontSize: 36, lineHeight: 1 }}
            >
              {active ? (
                <StarIcon sx={{ fontSize: 36 }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: 36 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Conditional question */}
      {question && (
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151', mb: 1, fontFamily: 'Poppins' }}
          >
            {question}
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder={t('feedback.placeholder')}
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

      <Button
        variant="contained"
        disabled={!rating || submitting}
        onClick={handleSubmit}
        sx={{
          bgcolor: '#8310FF',
          color: '#fff',
          fontWeight: 600,
          borderRadius: '10px',
          px: 4,
          py: 1.2,
          textTransform: 'none',
          boxShadow: 'none',
          fontFamily: 'Poppins',
          fontSize: '0.88rem',
          '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
          '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
        }}
      >
        {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : t('feedback.submit')}
      </Button>
    </Box>
  );
};

export default InterviewFeedback;
