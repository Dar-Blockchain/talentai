import React, { memo } from "react";
import { Box, Button } from "@mui/material";
import PageBanner from "@/components/ui/PageBanner";
import StatCard from "@/components/ui/StatCard";
import AddOutlined from "@mui/icons-material/AddOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import { WorkOutlineOutlined } from "@mui/icons-material";

const TEAL = "#0D9488";

const STATS_GRID_SX = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2, mb: 3 } as const;
const ADD_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: "13px",
  bgcolor: "rgba(255,255,255,0.2)",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 2,
  backdropFilter: "blur(8px)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
} as const;

interface JobPostsHeaderProps {
  total: number;
  active: number;
  drafts: number;
  expired: number;
  onCreateClick: () => void;
}

const JobPostsHeader = memo<JobPostsHeaderProps>(({ total, active, drafts, expired, onCreateClick }) => (
  <>
    <PageBanner
      title="Job Posts"
      subtitle="Manage your open positions, track candidates, and share interview links."
      icon={<WorkOutlineOutlined />}
      gradient="135deg, #0D9488 0%, #0891B2 100%"
      action={
        <Button variant="contained" startIcon={<AddOutlined />} onClick={onCreateClick} sx={ADD_BTN_SX}>
          New Job Post
        </Button>
      }
    />
    <Box sx={STATS_GRID_SX}>
      <StatCard icon={<WorkOutlined />}       label="Total Posts" value={total}   color={TEAL}      />
      <StatCard icon={<PeopleAltOutlined />}  label="Active"      value={active}  color="#16A34A"   />
      <StatCard icon={<EditNoteOutlined />}   label="Drafts"      value={drafts}  color="#D97706"   />
      <StatCard icon={<AccessTimeOutlined />} label="Expired"     value={expired} color="#DC2626"   />
    </Box>
  </>
));
JobPostsHeader.displayName = "JobPostsHeader";

export default JobPostsHeader;
