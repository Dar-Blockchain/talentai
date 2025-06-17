import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SecurityIcon from '@mui/icons-material/Security';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PersonIcon from '@mui/icons-material/Person';
import { nftService } from '@/utils/nftService';

interface EnhancedNFTData {
  tokenId: string;
  serial: string;
  accountId: string;
  createdTimestamp: string;
  modifiedTimestamp: string;
}

interface EnhancedMetadata {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    fullName: string;
    profession: string;
    email: string;
    phone?: string;
    verificationDate: string;
    resumeFingerprint: string;
    platform: string;
    version?: string;
    schemaVersion?: string;
  };
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  metadata: EnhancedMetadata;
  nftData: EnhancedNFTData;
  explorerUrls: {
    hedera: string;
    mirror: string;
  };
  message: string;
}

export default function VerifyResume() {
  const router = useRouter();
  const { nftId } = router.query;
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nftId && typeof nftId === 'string') {
      verifyNFT(nftId);
    }
  }, [nftId]);

  const verifyNFT = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await nftService.verifyResumeNFT(id);
      if (result) {
        setVerificationData(result as any);
      } else {
        setError('NFT not found or verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify NFT');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      // Hedera timestamps are in seconds.nanoseconds format
      const seconds = parseInt(timestamp.split('.')[0]);
      return new Date(seconds * 1000).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatHash = (hash: string, length: number = 8) => {
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying Resume...</Typography>
          <Typography variant="body2" color="textSecondary">
            Checking Hedera blockchain records
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            Resume Verification
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Powered by Hedera Hashgraph Blockchain
          </Typography>
        </Box>

        {error ? (
          <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{ mt: 2 }}
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        ) : verificationData?.verified ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Main Verification Status */}
            <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <VerifiedIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ✅ Blockchain Verified Resume
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip label="Authentic" color="success" variant="filled" />
                  <Chip label="Immutable" color="primary" variant="filled" />
                  <Chip label="Hedera Network" color="secondary" variant="filled" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                  {verificationData.metadata.name}
                </Typography>
              </CardContent>
            </Card>

            {/* Personal Information and Blockchain Details */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card elevation={4} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Personal Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Full Name"
                        secondary={verificationData.metadata.properties.fullName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Profession"
                        secondary={verificationData.metadata.properties.profession}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={verificationData.metadata.properties.email}
                      />
                    </ListItem>
                    {verificationData.metadata.properties.phone && (
                      <ListItem>
                        <ListItemText
                          primary="Phone"
                          secondary={verificationData.metadata.properties.phone}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              <Card elevation={4} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon sx={{ mr: 1 }} />
                    Blockchain Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Token ID"
                        secondary={verificationData.nftData.tokenId}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Serial Number"
                        secondary={verificationData.nftData.serial}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Created On"
                        secondary={formatTimestamp(verificationData.nftData.createdTimestamp)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FingerprintIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Resume Fingerprint"
                        secondary={formatHash(verificationData.metadata.properties.resumeFingerprint)}
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Verification Attributes */}
            {verificationData.metadata.attributes && (
              <Card elevation={4}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <DateRangeIcon sx={{ mr: 1 }} />
                    Verification Attributes
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {verificationData.metadata.attributes.map((attr, index) => (
                      <Chip
                        key={index}
                        label={`${attr.trait_type}: ${attr.value}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card elevation={4}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                  This resume has been cryptographically verified and recorded on the Hedera blockchain.
                  The verification is immutable and tamper-proof.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    href={verificationData.explorerUrls.hedera}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Hedera Explorer
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    href={verificationData.explorerUrls.mirror}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mirror Node API
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" gutterBottom>
                No verification data found
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{ mt: 2 }}
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Powered by{' '}
            <Link
              href="https://hedera.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'white', textDecoration: 'underline' }}
            >
              Hedera Hashgraph
            </Link>
            {' '}blockchain technology • Verified with Mirror Node API
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 