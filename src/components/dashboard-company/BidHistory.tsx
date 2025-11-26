import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
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

const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#111827',
  marginBottom: theme.spacing(3),
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BidHistory Component
 *
 * Displays and manages purchase history for company jobs
 */
const BidHistory: React.FC<BidHistoryProps> = ({
  bids,
  status,
  error,
  onPostNewJob
}) => {
  return (
    <StyledCard sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <SectionTitle sx={{ mb: 0 }}>Purchase History</SectionTitle>
        {bids.length > 0 && (
          <Chip
            label={`${bids.length} purchases`}
            size="small"
            sx={{
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #bfdbfe'
            }}
          />
        )}
      </Box>
      
      {status === "loading" ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : status === "failed" ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : bids.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          py: 8,
          px: 4,
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <PersonIcon sx={{ color: '#0369a1', fontSize: 40 }} />
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'white'
            }}>
              a
            </Box>
          </Box>
          <Typography variant="h5" sx={{
            color: '#10b981',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            No purchase history yet
          </Typography>
          <Box sx={{ maxWidth: 480 }}>
            <Typography variant="body1" sx={{
              color: '#6b7280',
              lineHeight: 1.6,
              mb: 1
            }}>
              Once you buy to reveal candidates who match your job posts, they will appear here.
            </Typography>
            <Typography variant="body1" sx={{
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              View matches from your job posts to buy and reveal candidate information.
            </Typography>
          </Box>
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
                background: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #e5e7eb',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: '#d1d5db'
                }
              }}
            >
              <Box>
                <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '1rem' }}>
                  {bid.userInfo.username}
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  {bid.userInfo.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<WorkIcon sx={{ fontSize: 16, color: '#3b82f6' }} />}
                    label={bid.post.jobDetails.title || '—'}
                    size="small"
                    sx={{ 
                      backgroundColor: '#eff6ff', 
                      color: '#1e40af', 
                      fontWeight: 500, 
                      border: '1px solid #bfdbfe',
                      '& .MuiChip-icon': { color: '#3b82f6' }
                    }}
                  />
                  {bid.status && (
                    <Chip
                      label={bid.status === 'win' ? 'Won' : 'Lost'}
                      size="small"
                      sx={{
                        backgroundColor: bid.status === 'win' ? '#d1fae5' : '#fee2e2',
                        color: bid.status === 'win' ? '#065f46' : '#991b1b',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography sx={{
                color: '#111827',
                fontWeight: 700,
                justifySelf: 'end',
                fontSize: '1.125rem'
              }}>
                {bid.finalBid} TAI
              </Typography>
              <Typography sx={{ 
                color: '#6b7280', 
                fontSize: '0.875rem', 
                justifySelf: 'end',
                fontWeight: 500
              }}>
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

