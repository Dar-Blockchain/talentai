import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { Department } from "@/store/slices/departmentSlice";

const TEAL = "#0D9488";
const TEAL_LIGHT = "#F0FDFA";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export interface DepartmentCardProps {
  department: Department;
  index: number;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
  canManage?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  index,
  onEdit,
  onDelete,
  canManage = true,
}) => {
  const router = useRouter();
  return (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35 }}
    style={{ height: "100%" }}
  >
    <Box
      className="dept-card"
      onClick={() => router.push(`/company/departments/${department._id}`)}
      sx={{
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 3,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          borderColor: `${TEAL}50`,
          transform: "translateY(-2px)",
          "& .view-hint": { opacity: 1 },
        },
        transition: "all 0.2s",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2, bgcolor: TEAL_LIGHT,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CorporateFareOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
            {department.name}
          </Typography>
        </Box>

        {canManage && (
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(department); }}
              sx={{ color: "#9CA3AF", "&:hover": { color: TEAL, bgcolor: TEAL_LIGHT } }}
            >
              <EditOutlined sx={{ fontSize: 17 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(department); }}
              sx={{ color: "#9CA3AF", "&:hover": { color: "#DC2626", bgcolor: "#FEF2F2" } }}
            >
              <DeleteOutlined sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Description */}
      <Typography
        sx={{
          fontSize: "13px",
          color: "#6B7280",
          lineHeight: 1.65,
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {department.description || "No description provided."}
      </Typography>

      {/* Footer */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pt: 1.5, borderTop: "1px solid #F3F4F6",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <CalendarTodayOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            Created {fmtDate(department.createdAt)}
          </Typography>
        </Box>

        <Box className="view-hint" sx={{
          display: "flex", alignItems: "center", gap: 0.5,
          px: 1.25, py: "4px", borderRadius: "8px",
          bgcolor: TEAL_LIGHT,
          opacity: 0, transition: "opacity 0.18s",
        }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: TEAL }}>View details</Typography>
          <ArrowForwardOutlined sx={{ fontSize: 12, color: TEAL }} />
        </Box>
      </Box>
    </Box>
  </motion.div>
  );
};

export default DepartmentCard;
