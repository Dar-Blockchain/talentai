import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  WorkOutline as PostIcon,
  LockOpen as UnlockIcon,
  VideoCall as InterviewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const PRIMARY = '#8310FF';

interface QuotaConfig {
  quotaPost: number;
  quotaUnlockCandidate: number;
  quotaInterviewMonthly: number;
}

const CompanyConfig: React.FC = () => {
  const [config, setConfig] = useState<QuotaConfig>({
    quotaPost: 10,
    quotaUnlockCandidate: 50,
    quotaInterviewMonthly: 100,
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleChange = (field: keyof QuotaConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement API call when backend is ready
    setTimeout(() => {
      setSaving(false);
      setSnackbar({ open: true, message: 'Configuration saved successfully!', severity: 'success' });
    }, 1000);
  };

  const quotaFields = [
    {
      key: 'quotaPost' as keyof QuotaConfig,
      label: 'Quota Post',
      description: 'Maximum number of job posts a company can create',
      icon: <PostIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter post quota',
    },
    {
      key: 'quotaUnlockCandidate' as keyof QuotaConfig,
      label: 'Quota Unlock Candidate',
      description: 'Maximum number of candidates a company can unlock',
      icon: <UnlockIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter unlock quota',
    },
    {
      key: 'quotaInterviewMonthly' as keyof QuotaConfig,
      label: 'Quota Interview Monthly',
      description: 'Maximum number of interviews allowed per month',
      icon: <InterviewIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter monthly interview quota',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          Company Configuration
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6c6c80',
          }}
        >
          Configure default quota settings for companies on the platform
        </Typography>
      </Box>

      {/* Quota Settings Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid #ece6fa',
          bgcolor: '#ffffff',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          Quota Settings
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6c6c80',
            mb: 3,
          }}
        >
          Set the default quotas that will be applied to all companies. These values define the limits for various platform features.
        </Typography>

        <Divider sx={{ mb: 3, borderColor: '#ece6fa' }} />

        <Grid container spacing={3}>
          {quotaFields.map((field) => (
            <Grid item xs={12} md={4} key={field.key}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #ece6fa',
                  bgcolor: '#faf9ff',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: PRIMARY,
                    boxShadow: `0 4px 12px rgba(131, 16, 255, 0.1)`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {field.icon}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a2e',
                    }}
                  >
                    {field.label}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#6c6c80',
                    mb: 2,
                    minHeight: 40,
                  }}
                >
                  {field.description}
                </Typography>

                <TextField
                  fullWidth
                  type="number"
                  value={config[field.key]}
                  onChange={handleChange(field.key)}
                  placeholder={field.placeholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: '#6c6c80', fontWeight: 500 }}>#</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      bgcolor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#ece6fa',
                      },
                      '&:hover fieldset': {
                        borderColor: PRIMARY,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: PRIMARY,
                      },
                    },
                    '& input': {
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: PRIMARY,
              borderRadius: '10px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 14px rgba(131, 16, 255, 0.3)`,
              '&:hover': {
                bgcolor: '#6b0dd4',
                boxShadow: `0 6px 20px rgba(131, 16, 255, 0.4)`,
              },
              '&:disabled': {
                bgcolor: '#d1c4e9',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert
        severity="info"
        sx={{
          mt: 3,
          borderRadius: '12px',
          bgcolor: '#f5f3ff',
          border: '1px solid #ece6fa',
          '& .MuiAlert-icon': {
            color: PRIMARY,
          },
        }}
      >
        <Typography variant="body2">
          Changes to quota settings will apply to all new companies. Existing companies will retain their current quotas unless manually updated.
        </Typography>
      </Alert>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyConfig;
