import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  verificationUrl: string;
  nftId?: string;
  loading?: boolean;
  error?: string;
}

export default function QRCodeModal({
  open,
  onClose,
  verificationUrl,
  nftId,
  loading = false,
  error
}: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (verificationUrl && !loading && !error) {
      generateQRCode();
    }
  }, [verificationUrl, loading, error]);

  const generateQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `resume-verification-${nftId || 'qr'}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Resume Verification QR Code
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Creating NFT on Hedera blockchain...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && qrCodeDataUrl && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              Scan this QR code to verify the authenticity of this resume on the Hedera blockchain
            </Typography>
            
            <Box
              component="img"
              src={qrCodeDataUrl}
              alt="Resume Verification QR Code"
              sx={{
                width: 300,
                height: 300,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
              }}
            />
            
            {nftId && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                <strong>NFT ID:</strong> {nftId}
              </Typography>
            )}
            
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Verification URL:
              </Typography>
              <Link
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ wordBreak: 'break-all', fontSize: '12px' }}
              >
                {verificationUrl}
              </Link>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" onClick={copyToClipboard}>
                Copy URL
              </Button>
              <Button variant="outlined" size="small" onClick={downloadQRCode}>
                Download QR
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 