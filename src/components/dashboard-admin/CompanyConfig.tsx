import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  WorkOutline as PostIcon,
  LockOpen as UnlockIcon,
  VideoCall as InterviewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AppDispatch } from '@/store/store';
import {
  fetchPlanLimits,
  updatePlanLimits,
  selectPlanLimits,
  selectPlanLimitsLoading,
  selectPlanLimitsError,
  selectPlanLimitsUpdating,
  PlanLimit,
} from '@/store/slices/planLimitsSlice';

const PRIMARY = '#8310FF';

interface EditableConfig {
  postsLimit: number;
  candidateUnlockLimit: number;
  monthlyInterviewLimit: number;
}

const CompanyConfig: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectPlanLimits);
  const loading = useSelector(selectPlanLimitsLoading);
  const error = useSelector(selectPlanLimitsError);
  const updating = useSelector(selectPlanLimitsUpdating);

  const [editedConfigs, setEditedConfigs] = useState<Record<string, EditableConfig>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchPlanLimits());
  }, [dispatch]);

  useEffect(() => {
    // Initialize edited configs when plans are loaded
    const initialConfigs: Record<string, EditableConfig> = {};
    plans.forEach((plan) => {
      initialConfigs[plan._id] = {
        postsLimit: plan.postsLimit,
        candidateUnlockLimit: plan.candidateUnlockLimit,
        monthlyInterviewLimit: plan.monthlyInterviewLimit,
      };
    });
    setEditedConfigs(initialConfigs);
  }, [plans]);

  const handleChange = (planId: string, field: keyof EditableConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    setEditedConfigs((prev) => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (plan: PlanLimit) => {
    const updates = editedConfigs[plan._id];
    if (!updates) return;

    try {
      await dispatch(updatePlanLimits({ id: plan._id, updates: { ...updates, name: plan.name } })).unwrap();
      setSnackbar({ open: true, message: `${plan.name} plan updated successfully!`, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err || 'Failed to update configuration', severity: 'error' });
    }
  };

  const quotaFields = [
    {
      key: 'postsLimit' as keyof EditableConfig,
      label: 'Posts Limit',
      description: 'Maximum number of job posts a company can create',
      icon: <PostIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter post limit',
    },
    {
      key: 'candidateUnlockLimit' as keyof EditableConfig,
      label: 'Candidate Unlock Limit',
      description: 'Maximum number of candidates a company can unlock',
      icon: <UnlockIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter unlock limit',
    },
    {
      key: 'monthlyInterviewLimit' as keyof EditableConfig,
      label: 'Monthly Interview Limit',
      description: 'Maximum number of interviews allowed per month',
      icon: <InterviewIcon sx={{ color: PRIMARY }} />,
      placeholder: 'Enter monthly interview limit',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '12px' }}>
        {error}
      </Alert>
    );
  }

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
          Configure plan limits for companies on the platform
        </Typography>
      </Box>

      {/* Plans */}
      {plans.map((plan) => (
        <Paper
          key={plan._id}
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: '16px',
            border: '1px solid #ece6fa',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#1a1a2e',
                }}
              >
                {plan.name} Plan
              </Typography>
              <Chip
                label={plan.isActive ? 'Active' : 'Inactive'}
                size="small"
                sx={{
                  bgcolor: plan.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: plan.isActive ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
          {plan.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#6c6c80',
                mb: 3,
              }}
            >
              {plan.description}
            </Typography>
          )}

          <Divider sx={{ mb: 3, borderColor: '#ece6fa' }} />

          <Grid container spacing={3}>
            {quotaFields.map((field) => (
              <Grid size={{ xs: 12, md: 4 }} key={field.key}>
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
                    value={editedConfigs[plan._id]?.[field.key] ?? plan[field.key]}
                    onChange={handleChange(plan._id, field.key)}
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
              onClick={() => handleSave(plan)}
              disabled={updating}
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
              {updating ? 'Saving...' : `Save ${plan.name} Plan`}
            </Button>
          </Box>
        </Paper>
      ))}

      {plans.length === 0 && !loading && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No plan configurations found. Please create a plan first.
        </Alert>
      )}

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
          Changes to plan limits will apply to all new companies assigned to this plan. Existing companies will retain their current limits unless manually updated.
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
