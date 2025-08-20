import React from 'react';
import { Box, Typography, CircularProgress, Alert, Card, styled } from '@mui/material';

// Styled Component for the container card
const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
}));

// Define the shape of a bid history item
interface BidHistoryItem {
  _id: string;
  userInfo: { username: string; email: string };
  post?: { jobDetails?: { title: string } };
  finalBid: number;
  dateBid: string;
}

// Props for the BidHistory component
interface BidHistoryProps {
  data: BidHistoryItem[];
  status: 'loading' | 'idle' | 'succeeded' | 'failed';
  error: string | null;
}

// BidHistory component
export const BidHistory: React.FC<BidHistoryProps> = ({ data, status, error }) => {
  return (
    <StyledCard>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Bid History</Typography>
      {status === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : status === 'failed' ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : data.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No bid history found.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map(bid => (
            <Box
              key={bid._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white',
                borderRadius: '10px',
                p: 2,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{bid.userInfo.username}</Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>{bid.userInfo.email}</Typography>
                {bid.post?.jobDetails?.title && (
                  <Typography sx={{ fontSize: '0.85rem' }}>{bid.post.jobDetails.title}</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontWeight: 600, color: 'rgba(0, 255, 157, 1)' }}>${bid.finalBid}</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>
                  {new Date(bid.dateBid).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </StyledCard>
  );
};
