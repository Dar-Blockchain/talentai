import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar, CircularProgress } from '@mui/material';
import { AppDispatch } from '@/store/store';
import { fetchPlanLimits } from '../api';
import { selectPlanLimits, selectPlanLimitsLoading, selectPlanLimitsError } from '../queries';
import SubscribeCompanyCard from './SubscribeCompanyCard';
import PlanOverviewGrid from './PlanOverviewGrid';
import { ADMIN_ACCENT, AdminPageHeading } from '@/modules/admin/shared';

const CompanyConfig: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectPlanLimits);
  const loading = useSelector(selectPlanLimitsLoading);
  const error = useSelector(selectPlanLimitsError);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchPlanLimits());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress sx={{ color: ADMIN_ACCENT }} />
      </div>
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
    <div>
      {/* Header */}
      <AdminPageHeading title="Company Configuration" subtitle="Subscribe companies to a plan on the platform" />

      {/* Available plans */}
      <PlanOverviewGrid plans={plans} />

      {/* Subscribe a company */}
      <SubscribeCompanyCard
        plans={plans}
        onSubscribed={(companyName, planName) =>
          setSnackbar({ open: true, message: `${companyName} subscribed to ${planName} successfully!`, severity: 'success' })
        }
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
      />

      {plans.length === 0 && !loading && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No plan configurations found. Please create a plan first.
        </Alert>
      )}

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
    </div>
  );
};

export default CompanyConfig;
