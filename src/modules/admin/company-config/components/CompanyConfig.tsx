import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { Building2 as BusinessIcon, AlertCircle, Info } from 'lucide-react';
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
        <Spinner className="size-9" style={{ color: ADMIN_NEUTRAL }} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle />
        <AlertDescription>{error}</AlertDescription>
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
        <Alert className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 [&>svg]:text-blue-600">
          <Info />
          <AlertDescription className="text-blue-700">
            No plan configurations found. Please create a plan first.
          </AlertDescription>
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
