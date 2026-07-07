import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Skeleton } from "@mui/material";
import { Briefcase as WorkOutlineOutlined, CheckCircle2 as CheckCircleOutline, FileEdit as EditNoteOutlined, Clock as AccessTimeOutlined } from "lucide-react";
import { usePostMetricsQuery } from "../queries";

const CARD_DEFS = [
  { key: "total",  Icon: WorkOutlineOutlined, color: "#0D9488", bg: "#F0FDFA" },
  { key: "active", Icon: CheckCircleOutline,  color: "#10B981", bg: "#F0FDF4" },
  { key: "draft",  Icon: EditNoteOutlined,    color: "#D97706", bg: "#FFFBEB" },
  { key: "closed", Icon: AccessTimeOutlined,  color: "#DC2626", bg: "#FEF2F2" },
] as const;

const GRID_SX  = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 } as const;
const CARD_SX  = { bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, display: "flex", alignItems: "center", gap: 2 } as const;
const ICON_BOX_BASE = { width: 42, height: 42, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const LABEL_SX = { fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.4 } as const;
const VALUE_SX = { fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 } as const;

const PostsStats: React.FC = memo(() => {
  const { t } = useTranslation("posts");
  const { data: metrics, isLoading } = usePostMetricsQuery();

  return (
    <Box sx={GRID_SX}>
      {CARD_DEFS.map(({ key, Icon, color, bg }) => (
        <Box key={key} sx={CARD_SX}>
          <Box sx={{ ...ICON_BOX_BASE, bgcolor: bg }}>
            <Icon size={20} color={color} />
          </Box>
          <Box>
            {isLoading
              ? <Skeleton variant="text" width={50} height={28} />
              : <Typography sx={VALUE_SX}>{(metrics as any)?.[key] ?? 0}</Typography>
            }
            <Typography sx={LABEL_SX}>{t(`stats.${key}`)}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
});

PostsStats.displayName = "PostsStats";
export default PostsStats;
