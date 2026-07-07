import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Alert, CircularProgress } from '@mui/material';
import { Building2 as BusinessIcon } from 'lucide-react';
import { AppDispatch } from '@/store/store';
import { fetchPlanLimits } from '../api';
import { selectPlanLimits, selectPlanLimitsLoading, selectPlanLimitsError } from '../queries';
import SubscribeCompanyCard from './SubscribeCompanyCard';
import PlanOverviewGrid from './PlanOverviewGrid';
import CompanySubscriptionsTable from './CompanySubscriptionsTable';
import { ADMIN_NEUTRAL, AdminPageHeading, ZoneHeading } from '@/modules/admin/shared';

const CompanyConfig: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectPlanLimits);
  const loading = useSelector(selectPlanLimitsLoading);
  const error = useSelector(selectPlanLimitsError);

  useEffect(() => {
    dispatch(fetchPlanLimits());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress sx={{ color: ADMIN_NEUTRAL }} />
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
      <PlanOverviewGrid
        plans={plans}
        onSaved={(planName, mode) =>
          toast.success(mode === 'created' ? `Plan "${planName}" created.` : `Plan "${planName}" updated.`)
        }
        onError={(message) => toast.error(message)}
      />

      {/* Subscribe a company */}
      <SubscribeCompanyCard
        plans={plans}
        onSubscribed={(companyName, planName) =>
          toast.success(`${companyName} subscribed to ${planName} successfully!`)
        }
        onError={(message) => toast.error(message)}
     />

      {plans.length === 0 && !loading && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No plan configurations found. Please create a plan first.
        </Alert>
      )}

      {/* All companies & their subscriptions */}
      <div className="mt-2">
        <ZoneHeading icon={BusinessIcon} label="All Companies" />
        <CompanySubscriptionsTable />
      </div>
    </div>
  );
};

export default CompanyConfig;
