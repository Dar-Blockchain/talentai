import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Bid {
  _id: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    skills: Array<{ name: string; level: string }>;
    experience: string;
  };
  job: {
    _id: string;
    title: string;
    company: string;
  };
  amount: number;
  currency: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter-offered';
  createdAt: string;
  matchScore?: number;
}

interface BidHistoryProps {
  bids: Bid[];
  onAccept: (bidId: string) => void;
  onReject: (bidId: string) => void;
  onCounterOffer: (bidId: string, amount: number, message: string) => void;
  isLoading: boolean;
  error?: string;
}

interface CounterOfferDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, message: string) => void;
  currentAmount: number;
  currency: string;
  isLoading: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  textTransform: 'capitalize',
  ...(status === 'pending' && {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    color: '#f57c00',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  }),
  ...(status === 'accepted' && {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#2e7d32',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  }),
  ...(status === 'rejected' && {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    color: '#c62828',
    border: '1px solid rgba(244, 67, 54, 0.3)',
  }),
  ...(status === 'counter-offered' && {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    color: '#7b1fa2',
    border: '1px solid rgba(156, 39, 176, 0.3)',
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const AcceptButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  color: '#2e7d32',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  '&:hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
}));

const RejectButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: 'rgba(244, 67, 54, 0.1)',
  color: '#c62828',
  border: '1px solid rgba(244, 67, 54, 0.3)',
  '&:hover': {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
}));

const CounterButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: 'rgba(156, 39, 176, 0.1)',
  color: '#7b1fa2',
  border: '1px solid rgba(156, 39, 176, 0.3)',
  '&:hover': {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderColor: 'rgba(156, 39, 176, 0.5)',
  },
}));

// ============================================================================
// COUNTER OFFER DIALOG COMPONENT
// ============================================================================

const CounterOfferDialog: React.FC<CounterOfferDialogProps> = ({
  open,
  onClose,
  onSubmit,
  currentAmount,
  currency,
  isLoading,
}) => {
  const [amount, setAmount] = useState(currentAmount);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (amount > 0 && message.trim()) {
      onSubmit(amount, message.trim());
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Make Counter Offer
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Counter Offer Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <AttachMoneyIcon sx={{ color: 'rgba(0,0,0,0.5)', mr: 1 }} />
                ),
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message to Candidate"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your counter offer..."
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || amount <= 0 || !message.trim()}
          sx={{ background: '#7b1fa2' }}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Send Counter Offer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
  onAccept,
  onReject,
  onCounterOffer,
  isLoading,
  error,
}) => {
  const [counterOfferDialog, setCounterOfferDialog] = useState<{
    open: boolean;
    bidId: string;
    currentAmount: number;
    currency: string;
  }>({
    open: false,
    bidId: '',
    currentAmount: 0,
    currency: 'USD',
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCounterOffer = (bidId: string, currentAmount: number, currency: string) => {
    setCounterOfferDialog({
      open: true,
      bidId,
      currentAmount,
      currency,
    });
  };

  const handleCounterOfferSubmit = (amount: number, message: string) => {
    onCounterOffer(counterOfferDialog.bidId, amount, message);
    setCounterOfferDialog({ open: false, bidId: '', currentAmount: 0, currency: 'USD' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f57c00';
      case 'accepted': return '#2e7d32';
      case 'rejected': return '#c62828';
      case 'counter-offered': return '#7b1fa2';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBidCard = (bid: Bid) => (
    <StyledCard key={bid._id} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Candidate Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: bid.matchScore && bid.matchScore > 80 ? '#4caf50' : 
                                     bid.matchScore && bid.matchScore > 60 ? '#ff9800' : '#f44336',
                      border: '2px solid white',
                    }}
                  />
                }
              >
                <Avatar
                  src={bid.candidate.avatar}
                  sx={{ width: 56, height: 56 }}
                >
                  {bid.candidate.firstName[0]}{bid.candidate.lastName[0]}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {bid.candidate.firstName} {bid.candidate.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bid.candidate.experience} experience
                </Typography>
                {bid.matchScore && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {bid.matchScore}% match
                    </Typography>
                    {bid.matchScore > 80 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Skills */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {bid.candidate.skills.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill.name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {bid.candidate.skills.length > 3 && (
                  <Chip
                    label={`+${bid.candidate.skills.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Job & Bid Info */}
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {bid.job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {bid.job.company}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {bid.message}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon sx={{ color: 'rgba(0,0,0,0.5)' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                {bid.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bid.currency}
              </Typography>
            </Box>
          </Grid>

          {/* Actions */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <StatusChip
                label={bid.status}
                status={bid.status}
                size="small"
              />
              
              <Typography variant="caption" color="text.secondary">
                {formatDate(bid.createdAt)}
              </Typography>

              {bid.status === 'pending' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <AcceptButton
                    startIcon={<CheckIcon />}
                    onClick={() => onAccept(bid._id)}
                    size="small"
                  >
                    Accept
                  </AcceptButton>
                  
                  <RejectButton
                    startIcon={<CloseIcon />}
                    onClick={() => onReject(bid._id)}
                    size="small"
                  >
                    Reject
                  </RejectButton>
                  
                  <CounterButton
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => handleCounterOffer(bid._id, bid.amount, bid.currency)}
                    size="small"
                  >
                    Counter
                  </CounterButton>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={40} sx={{ color: '#8310FF' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (bids.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <WorkIcon sx={{ fontSize: 64, color: 'rgba(0,0,0,0.3)', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No Bids Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Candidates will start bidding on your jobs once they're posted.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
          Bid History
        </Typography>
        <Chip
          label={`${bids.length} total bids`}
          variant="outlined"
          sx={{ borderColor: '#8310FF', color: '#8310FF' }}
        />
      </Box>

      {/* Bids List */}
      <Box>
        {bids.map(renderBidCard)}
      </Box>

      {/* Counter Offer Dialog */}
      <CounterOfferDialog
        open={counterOfferDialog.open}
        onClose={() => setCounterOfferDialog({ open: false, bidId: '', currentAmount: 0, currency: 'USD' })}
        onSubmit={handleCounterOfferSubmit}
        currentAmount={counterOfferDialog.currentAmount}
        currency={counterOfferDialog.currency}
        isLoading={false}
      />
    </Box>
  );
};

export default BidHistory;
