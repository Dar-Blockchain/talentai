import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { placeBid } from '@/store/slices/bidSlice';
import { AppDispatch } from '@/store/store';

interface AddBidDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCandidate: any;
  selectedJob: string;
  companyId: string;
}

const AddBidDialog: React.FC<AddBidDialogProps> = ({
  open,
  onClose,
  selectedCandidate,
  selectedJob,
  companyId,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleBidClick = () => {
    if (!selectedCandidate || !bidAmount) return;
    setShowConfirmation(true);
  };

  const handleConfirmBid = async () => {
    try {
      setIsSubmittingBid(true);
      const params = {
        newBid: Number(bidAmount),
        userId: selectedCandidate.candidateId._id,
        postId: selectedJob,
        companyId: companyId
      };
      await dispatch(placeBid(params)).unwrap();
      setShowConfirmation(false);
      onClose();
      toast.success("Purchase successful! Candidate information revealed.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error: any) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setBidAmount('');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'white',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: 'black'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Buy to Reveal</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'black' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              p: 2.5,
              border: '1px solid black',
              display: "flex",
              justifyContent: "space-between"
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(2,226,255,0.2) 0%, rgba(0,255,195,0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'black'
                }}>
                  {selectedCandidate?.candidateId?.username?.charAt(0).toUpperCase() || '?'}
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ color: 'black', fontWeight: 600, fontSize: '1.1rem' }}>
                      {selectedCandidate?.candidateId?.username}
                    </Typography>
                    {selectedCandidate?.candidateId?.isVerified && (
                      <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <StarIcon sx={{ fontSize: 12, color: 'black' }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(2,226,255,0.1) 0%, rgba(0,255,195,0.1) 100%)',
                padding: '8px',
                borderRadius: '8px',
                minWidth: '70px',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: 'black',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}>
                  {selectedCandidate?.finalBid} TAI
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'black',
                  fontSize: '0.7rem'
                }}>
                  Current Price
                </Typography>
              </Box>
            </Box>
          </Box>
          <TextField
            label="Amount"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">TAI</InputAdornment>,
            }}
            fullWidth
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '& .MuiInputBase-input': {
                color: 'black',
              },
              '& .MuiInputAdornment-root .MuiTypography-root': {
                color: 'black',
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Button
          onClick={handleClose}
          sx={{
            color: 'black',
            mr: 1
          }}
          disabled={isSubmittingBid}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleBidClick}
          disabled={!bidAmount || parseFloat(bidAmount) <= 0 || isSubmittingBid}
          sx={{
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            color: 'black',
            '&:hover': {
              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
            },
            '&.Mui-disabled': {
              background: 'grey',
              color: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          Buy to Reveal
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={handleCancelConfirmation}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'white',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: 'black',
          fontWeight: 600,
        }}>
          Confirm Purchase
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: 'black', mb: 2 }}>
            Are you sure you want to buy to reveal for{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#02E2FF' }}>
              {bidAmount} TAI
            </Box>
            {' '}for candidate{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {selectedCandidate?.candidateId?.username}
            </Box>
            ?
          </Typography>
          <Box sx={{
            background: 'rgba(2,226,255,0.1)',
            borderRadius: '8px',
            p: 2,
            border: '1px solid rgba(2,226,255,0.3)',
          }}>
            <Typography variant="body2" sx={{ color: 'black', fontWeight: 500 }}>
              Current price: {selectedCandidate?.finalBid || 0} TAI
            </Typography>
            <Typography variant="body2" sx={{ color: 'black', fontWeight: 500, mt: 0.5 }}>
              Your offer: {bidAmount} TAI
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Button
            onClick={handleCancelConfirmation}
            sx={{
              color: 'black',
              mr: 1
            }}
            disabled={isSubmittingBid}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBid}
            disabled={isSubmittingBid}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: 'black',
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
              },
              '&.Mui-disabled': {
                background: 'grey',
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {isSubmittingBid ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                Submitting...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddBidDialog;
