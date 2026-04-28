import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Skeleton } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchPostMetrics,
  selectPostMetrics,
  selectPostMetricsLoading,
} from "@/store/slices/postSlice";

const CARD_DEFS = [
  { key: "total",  Icon: WorkOutlineOutlined, color: "#0D9488", bg: "#F0FDFA" },
  { key: "active", Icon: CheckCircleOutline,  color: "#10B981", bg: "#F0FDF4" },
  { key: "draft",  Icon: EditNoteOutlined,    color: "#D97706", bg: "#FFFBEB" },
  { key: "closed", Icon: AccessTimeOutlined,  color: "#DC2626", bg: "#FEF2F2" },
] as const;

const PostsStats: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const metrics  = useSelector(selectPostMetrics);
  const loading  = useSelector(selectPostMetricsLoading);

  useEffect(() => {
    dispatch(fetchPostMetrics());
  }, [dispatch]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
      {CARD_DEFS.map(({ key, Icon, color, bg }) => (
        <Box
          key={key}
          sx={{
            bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB",
            p: 2.5, display: "flex", alignItems: "center", gap: 2,
          }}
        >
          <Box sx={{ width: 42, height: 42, borderRadius: "10px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon sx={{ fontSize: 20, color }} />
          </Box>
          <Box>
            {loading ? (
              <Skeleton variant="text" width={50} height={28} />
            ) : (
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                {(metrics as any)?.[key] ?? 0}
              </Typography>
            )}
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.4 }}>
              {t(`pages.posts.stats.${key}`)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default memo(PostsStats);
