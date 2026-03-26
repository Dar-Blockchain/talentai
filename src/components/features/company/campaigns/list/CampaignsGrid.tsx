import React, { useEffect, memo, useState } from "react";
import { Box } from "@mui/material";
import { Campaign } from "@/types/campaign";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import DeleteCampaignDialog from "../details/DeleteCampaignDialog";
import ChangeStatusDialog from "../details/ChangeStatusDialog";
import {
  selectCampaignLoading,
  selectCampaigns,
  fetchCampaigns,
  deleteCampaign,
  updateCampaignStatus,
  selectCampaignLimit,
  selectCampaignPage,
  selectCampaignCount,
  setPage,
  setLimit,
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

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({
    open: false,
    id: "",
    title: "",
  });

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteDialog({ open: true, id, title });
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteCampaign(deleteDialog.id));
    setDeleteDialog({ open: false, id: "", title: "" });
    dispatch(fetchCampaigns({ page, limit }));
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, id: "", title: "" });
  };

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
    currentStatus: Campaign["status"];
  }>({ open: false, id: "", title: "", currentStatus: "DRAFT" });

  const handleStatusChangeRequest = (
    id: string,
    title: string,
    currentStatus: Campaign["status"],
  ) => {
    setStatusDialog({ open: true, id, title, currentStatus });
  };

  const handleStatusConfirm = async (newStatus: Campaign["status"]) => {
    await dispatch(
      updateCampaignStatus({ campaignId: statusDialog.id, status: newStatus }),
    );
    setStatusDialog({ open: false, id: "", title: "", currentStatus: "DRAFT" });
    dispatch(fetchCampaigns({ page, limit }));
  };

  const handleStatusClose = () => {
    setStatusDialog({ open: false, id: "", title: "", currentStatus: "DRAFT" });
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
          mt: 3,
        }}
      >
        <AnimatePresence>
          {campaigns.map((camp) => (
            <motion.div
              key={camp._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ height: "100%" }}
            >
              <CampaignCard
                campaign={camp}
                onViewDetails={() => {}}
                onDelete={handleDeleteRequest}
                onStatusChange={handleStatusChangeRequest}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {count > 0 && (
        <Pagination
          page={page}
          pageSize={limit}
          total={count}
          onPageChange={handlePageChange}
        />
      )}

      <DeleteCampaignDialog
        open={deleteDialog.open}
        campaignTitle={deleteDialog.title}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      <ChangeStatusDialog
        open={statusDialog.open}
        campaignTitle={statusDialog.title}
        currentStatus={statusDialog.currentStatus}
        onClose={handleStatusClose}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
};

export default memo(CampaignsStats);
