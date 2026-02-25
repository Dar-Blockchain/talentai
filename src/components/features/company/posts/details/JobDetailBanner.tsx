import React from "react";
import { Chip, Box } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import PageBanner from "@/components/dashboard-workplace/ui/PageBanner";

const CREATION_TYPE: Record<string, { label: string; Icon: React.ElementType }> = {
  ai:       { label: "AI Generated", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline",     Icon: AccountTreeOutlined },
  manual:   { label: "Manual",       Icon: EditNoteOutlined },
};

interface Props {
  title: string;
  subtitle: string;
  creationType?: string;
  isDraft: boolean;
}

const JobDetailBanner: React.FC<Props> = ({ title, subtitle, creationType, isDraft }) => {
  const ct = CREATION_TYPE[creationType || "manual"] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ct;

  return (
    <PageBanner
      title={title || "Job Details"}
      subtitle={subtitle}
      icon={<WorkOutlined />}
      gradient="135deg, #0D9488 0%, #0891B2 100%"
      action={
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            icon={<CtIcon sx={{ fontSize: 13 }} />}
            label={ct.label}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "11px", height: 26,
              bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          <Chip
            label={isDraft ? "Draft" : "Active"}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "11px", height: 26,
              bgcolor: isDraft ? "rgba(156,163,175,0.3)" : "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </Box>
      }
    />
  );
};

export default JobDetailBanner;
