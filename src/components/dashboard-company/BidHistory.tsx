import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import WorkIcon from '@mui/icons-material/Work';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Bid {
  _id: string;
  userInfo: {
    username: string;
    email: string;
  };
  post: {
    jobDetails: {
      title: string;
    };
  };
  status: 'win' | 'lose';
  finalBid: number;
  dateBid: string;
}

interface BidHistoryProps {
  bids: Bid[];
  status: string;
  error: string | null;
  onPostNewJob: () => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'black',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
    borderRadius: '2px'
  }
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BidHistory Component
 * 
 * Displays and manages bid history for company jobs
 */
const BidHistory: React.FC<BidHistoryProps> = ({
  bids,
  status,
  error,
  onPostNewJob
}) => {
  const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

  return (
    <StyledCard sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <SectionTitle sx={{ mb: 0 }}>Bid History</SectionTitle>
        {bids.length > 0 && (
          <Chip
            label={`${bids.length} bids`}
            size="small"
            sx={{
              background: 'rgba(2, 226, 255, 0.12)',
              color: '#0f172a',
              fontWeight: 700,
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          />
        )}
      </Box>
      
      {status === "loading" ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      ) : status === "failed" ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : bids.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 6,
          px: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(15,23,42,0.06)'
        }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(2,226,255,0.15), rgba(0,255,195,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.06)'
          }}>
            <PersonSearchIcon sx={{ color: GREEN_MAIN, fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
            No bid history yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 520 }}>
            Once you place bids on candidates who match your job posts, they will appear here. View matches from your job posts to place a bid.
          </Typography>
          <Button
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={onPostNewJob}
            sx={{
              mt: 1,
              background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: '12px',
              px: 2.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #00FFC3, #02E2FF)'
              }
            }}
          >
            Post New Job
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bids.map((bid: Bid) => (
            <Box
              key={bid._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                p: 2,
                boxShadow: '0 8px 20px rgba(2,23,36,0.06)',
                border: '1px solid rgba(15,23,42,0.06)'
              }}
            >
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>{bid.userInfo.username}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{bid.userInfo.email}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    label={bid.post.jobDetails.title || '—'}
                    size="small"
                    sx={{ background: 'rgba(2, 226, 255, 0.12)', color: '#0f172a', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}
                  />
                  {bid.status && (
                    <Chip
                      label={bid.status === 'win' ? 'Won' : 'Lost'}
                      size="small"
                      sx={{
                        background: bid.status === 'win' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: '#0f172a',
                        fontWeight: 800,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 800, justifySelf: 'end' }}>
                ${bid.finalBid}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', justifySelf: 'end' }}>
                {new Date(bid.dateBid).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </StyledCard>
  );
};

export default BidHistory;
