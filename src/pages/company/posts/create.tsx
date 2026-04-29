import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { AppDispatch } from "@/store/store";
import { clearPost, selectCreationType, setCreationType } from "@/store/slices/postGenerationSlice";
import { resetManualPost } from "@/store/slices/manualPostSlice";
import { resetFlow, resetSavePost } from "@/store/slices/postSlice";
import {
  fetchCombinedSubscriptionDetails,
  selectCombinedDetails,
} from "@/store/slices/paymentSlice";
import CreateStepper from "@/components/features/company/posts/create/CreateStepper";
import { Box, Typography } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Link from "next/link";

const CreatePostPage: React.FC = () => {
  useCompanyAccess("canCreateJobPosts");
  const dispatch    = useDispatch<AppDispatch>();
  const router      = useRouter();
  const [mounted, setMounted] = useState(false);
  const creationType = useSelector(selectCreationType);
  const combined     = useSelector(selectCombinedDetails);

  const postsUsed  = combined?.combined.usage.posts.used ?? 0;
  const postsLimit = combined?.combined.usage.posts.limit ?? Infinity;
  const atLimit    = combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit;

  useEffect(() => {
    dispatch(setCreationType("ai"));
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(fetchCombinedSubscriptionDetails());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearPost());
      dispatch(resetManualPost());
      dispatch(resetFlow());
      dispatch(resetSavePost());
    };
  }, []);

  if (!mounted) return null;

  if (atLimit) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 2, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockOutlined sx={{ fontSize: 30, color: "#EF4444" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827" }}>
            Post limit reached
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.9rem", maxWidth: 360 }}>
            You have used {postsUsed} of {postsLimit} job posts on your current plan. Upgrade your plan to create more posts.
          </Typography>
          <Link href="/company/plans">
            <Box component="button" sx={{ mt: 1, px: 3, py: 1.2, bgcolor: "#0D9488", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", "&:hover": { opacity: 0.9 } }}>
              Upgrade Plan
            </Box>
          </Link>
        </Box>
      </DashboardLayout>
    );
  }

  return (
      <DashboardLayout>
        {creationType && <CreateStepper />}
      </DashboardLayout>
  );
};

export default CreatePostPage;
