import React from "react";
import { Box, Button, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import StatsSummaryCard from "./StatsSummaryCard";
import ChecklistIcon from "@/components/icons/CheckListIcon";
import HourglassIcon from "@/components/icons/HourglassIcon";
import { ArrowForward } from "@mui/icons-material";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import CaseOutlineIcon from "@/components/icons/CaseOutlineIcon";
const PostInterviews = () => {
  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <StatsSummaryCard
          label="Total"
          value={10}
          subtitle="Applications"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(11, 82, 198, 1)" }}
            />
          }
          valueColor="rgba(11, 82, 198, 1)"
          borderColor="rgba(11, 82, 198, 0.18)"
          iconBgColor="rgba(11, 82, 198, 0.06)"
        />
        <StatsSummaryCard
          label="Completed"
          value={7}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(62, 180, 137, 1)" }}
            />
          }
          valueColor="rgba(62, 180, 137, 1)"
          borderColor="rgba(62, 180, 137, 0.18)"
          iconBgColor="rgba(62, 180, 137, 0.09)"
        />
        <StatsSummaryCard
          label="Ongoing"
          value={2}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(250, 180, 70, 1)" }}
            />
          }
          valueColor="rgba(250, 180, 70, 1)"
          borderColor="rgba(250, 180, 70, 0.18)"
          iconBgColor="rgba(255, 249, 241, 0.79)"
        />
      </Box>
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "rgba(100, 113, 131, 1)",
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: "18.78px",
            }}
          >
            History
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(189, 133, 255, 1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "15px",
              px: 2,
              "&:hover": {
                background: "rgba(189, 133, 255, 0.04)",
                border: "none",
              },
            }}
          >
            View All
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            border: "1px solid rgba(211, 224, 245, 1)",
            boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
            borderRadius: "8px",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "17px",
                  lineHeight: "28px",
                  color: "rgba(62, 70, 82, 1)",
                }}
              >
                Techical Support Specialist
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HourglassIcon
                  sx={{ color: "rgba(250, 180, 70, 1)", fontSize: "12px" }}
                />
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "18px",
                    color: "rgba(250, 180, 70, 1)",
                  }}
                >
                  Ongoing
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CaseOutlineIcon
                  sx={{ fontSize: "12px", color: "rgba(84, 98, 116, 1)" }}
                />
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: "11px",
                    lineHeight: "28px",
                    color: "rgba(84, 98, 116, 1)",
                  }}
                >
                  Dar Blockchain
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TimeOutlineIcon />
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: "11px",
                    lineHeight: "28px",
                    color: "rgba(84, 98, 116, 1)",
                  }}
                >
                  1 week ago
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="outlined"
            sx={{
              borderColor: "rgba(189, 133, 255, 1)",
              color: "rgba(189, 133, 255, 1)",
              background: "rgba(189, 133, 255, 0.08)",
              fontWeight: 600,
              borderRadius: "38px",
              py: 1.5,
              maxWidth: "300px",
              height: "42px",
              textTransform: "none",
              fontSize: "0.875rem",
              borderWidth: "1px",
              "&:hover": {
                backgroundColor: "rgba(189, 133, 255, 0.04)",
              },
              "&.Mui-disabled": {
                borderColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            Complete Application
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(PostInterviews), {
  ssr: false,
});
