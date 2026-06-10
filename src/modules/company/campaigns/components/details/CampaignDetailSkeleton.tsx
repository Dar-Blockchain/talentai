import React from "react";
import { Box, Divider, Skeleton } from "@mui/material";

const CampaignDetailSkeleton: React.FC = () => (
  <Box>
    {/* Header row */}
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "flex-start" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Left: chips + title + description */}
      <Box>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Skeleton variant="rounded" width={58} height={22} sx={{ borderRadius: "11px" }} />
          <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "11px" }} />
        </Box>
        <Skeleton variant="text" width={280} height={34} />
        <Skeleton variant="text" width={420} height={20} sx={{ mt: 0.5 }} />
      </Box>

      {/* Right: action buttons */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
        <Skeleton variant="rounded" width={130} height={34} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>

    {/* Main grid */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 300px" },
        gap: 3,
        alignItems: "start",
      }}
    >
      {/* Left column */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Campaign Details card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            p: 3,
          }}
        >
          <Skeleton variant="text" width={140} height={20} sx={{ mb: 2.5 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                <Skeleton variant="circular" width={16} height={16} sx={{ mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Skeleton variant="text" width={70} height={14} sx={{ mb: 0.25 }} />
                  <Skeleton variant="text" width={110} height={18} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Assessment Modules card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Skeleton variant="text" width={160} height={20} />
            <Skeleton variant="rounded" width={24} height={20} sx={{ borderRadius: "10px" }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(2)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                  bgcolor: "#FAFAFA",
                  alignItems: "flex-start",
                }}
              >
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Skeleton variant="text" width={100} height={18} />
                    <Skeleton variant="rounded" width={50} height={18} sx={{ borderRadius: "9px" }} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={16} />
                  <Skeleton variant="text" width={80} height={14} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right sidebar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Campaign Link card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            p: 3,
          }}
        >
          <Skeleton variant="text" width={120} height={18} sx={{ mb: 1.5 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
            }}
          >
            <Skeleton variant="text" sx={{ flex: 1 }} height={18} />
            <Skeleton variant="circular" width={24} height={24} sx={{ flexShrink: 0 }} />
          </Box>
        </Box>

        {/* Overview card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            p: 3,
          }}
        >
          <Skeleton variant="text" width={80} height={18} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={i}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Skeleton variant="text" width={60} height={16} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
                {i < 5 && <Divider sx={{ my: 1.25 }} />}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default CampaignDetailSkeleton;
