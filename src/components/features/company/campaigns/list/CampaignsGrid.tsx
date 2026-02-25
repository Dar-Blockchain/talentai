import React, { useEffect, memo } from "react";
import { Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import {
  selectCampaignLoading,
  selectCampaigns,
  fetchCampaigns,
  selectCampaignLimit,
  selectCampaignPage,
  selectCampaignCount,
  setPage,
  setLimit
} from "@/store/slices/campaignSlice";
import Pagination from "@/components/ui/Pagination";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import EmptyState from "@/components/ui/EmptyState"; 
import AppButton from "@/components/ui/AppButton";
import AddOutlined from "@mui/icons-material/AddOutlined";

const CampaignsStats: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const campaigns = useSelector(selectCampaigns);
  const loading = useSelector(selectCampaignLoading);
  const page = useSelector(selectCampaignPage);
  const limit = useSelector(selectCampaignLimit);
  const count = useSelector(selectCampaignCount);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
    dispatch(setPage(1));
  };

  useEffect(() => {
    dispatch(fetchCampaigns({ page, limit }));
  }, [dispatch, page, limit]);

  if (loading) return <CampaignsSkeleton />;

  if (!loading && campaigns.length === 0) 
    return (
      <EmptyState
        icon={<CampaignOutlined />}
        title="No campaigns yet"
        description="Create your first assessment campaign to start measuring your team's skills."
        action={
          <AppButton
            key="new"
            label="New Campaign"
            variant="contained"
            startIcon={<AddOutlined />}
            size="medium"
          />
        }
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
          mt: 3
        }}
      >
        <AnimatePresence>
          {campaigns.map((camp) => (
            <motion.div
              key={camp._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CampaignCard
                campaign={camp}
                onViewDetails={() => {}}
                onDelete={() => {}}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {count > 0 && (
        <Pagination
          page={page}
          limit={limit}
          total={count}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}
    </>
  );
};

export default memo(CampaignsStats);