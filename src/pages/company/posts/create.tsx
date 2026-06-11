import React from "react";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import { Box, Typography } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Link from "next/link";
import CreatePostPage from "@/modules/company/posts/create/components/CreatePostPage";
import { useCreatePostPage } from "@/modules/company/posts/create/hooks";

const CreatePage: React.FC = () => {
  const { postsUsed, postsLimit, atLimit } = useCreatePostPage();

  return (
    <DashboardLayout>
      {atLimit ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 2, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockOutlined sx={{ fontSize: 30, color: "#EF4444" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827" }}>Post limit reached</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.9rem", maxWidth: 360 }}>
            You have used {postsUsed} of {postsLimit} job posts on your current plan. Upgrade your plan to create more posts.
          </Typography>
          <Link href="/company/plans">
            <Box component="button" sx={{ mt: 1, px: 3, py: 1.2, bgcolor: "#0D9488", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", "&:hover": { opacity: 0.9 } }}>
              Upgrade Plan
            </Box>
          </Link>
        </Box>
      ) : (
        <CreatePostPage />
      )}
    </DashboardLayout>
  );
};

export default CreatePage;
