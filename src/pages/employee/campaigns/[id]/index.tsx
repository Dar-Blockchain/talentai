import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CampaignDetail from "@/components/features/company/campaigns/details/CampaignDetail";
import CampaignDetailSkeleton from "@/components/features/company/campaigns/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/components/features/company/campaigns/details/CampaignDetailError";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCampaignById,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
  clearSelectedCampaign,
} from "@/store/slices/campaignSlice";
import dynamic from "next/dynamic";

const EmployeeCampaignDetailsPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const campaign = useSelector(selectSelectedCampaign);
  const loading  = useSelector(selectDetailLoading);
  const error    = useSelector(selectDetailError);

  useEffect(() => {
    if (id && typeof id === "string" && authUser?._id) {
      dispatch(fetchCampaignById({ campaignId: id, userId: authUser._id }));
    }
    return () => { dispatch(clearSelectedCampaign()); };
  }, [dispatch, id, authUser?._id]);

  return (
    <DashboardLayout>
      {loading ? (
        <CampaignDetailSkeleton />
      ) : error ? (
        <CampaignDetailError message={error} />
      ) : campaign ? (
        <CampaignDetail campaign={campaign} mode="employee" />
      ) : null}
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignDetailsPage), { ssr: false });
