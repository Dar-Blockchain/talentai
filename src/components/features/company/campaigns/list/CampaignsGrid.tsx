import React, { memo } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCampaigns } from "@/store/slices/campaignSlice";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";

const CampaignsStats: React.FC = () => {
  const campaigns = useSelector(selectCampaigns);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)", // ✅ 3 per row on large screens
        },        gap: 3,
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
  );
};

export default memo(CampaignsStats);