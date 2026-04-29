import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CorporateFareOutlined  from "@mui/icons-material/CorporateFareOutlined";
import EditOutlined            from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined   from "@mui/icons-material/DeleteOutlineOutlined";
import CalendarTodayOutlined   from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightOutlined    from "@mui/icons-material/ChevronRightOutlined";
import MoreVertOutlined        from "@mui/icons-material/MoreVertOutlined";
import { Department } from "@/store/slices/departmentSlice";
import AppButton from "@/components/ui/AppButton";
import Link from "next/link";

const PALETTE = [
  { accent: "#0D9488", bg: "#F0FDFA" },
  { accent: "#2563EB", bg: "#EFF6FF" },
  { accent: "#7C3AED", bg: "#F5F3FF" },
  { accent: "#EA580C", bg: "#FFF7ED" },
  { accent: "#DB2777", bg: "#FDF2F8" },
  { accent: "#16A34A", bg: "#F0FDF4" },
];

function formatCardDate(iso: string, locale: string) {
  const loc = locale.startsWith("fr") ? "fr-FR" : "en-US";
  return new Date(iso).toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

export interface DepartmentCardProps {
  department: Department;
  index: number;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
  canManage?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department, index, onEdit, onDelete, canManage = true,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { accent, bg } = PALETTE[index % PALETTE.length];
  const createdLabel = useMemo(
    () => formatCardDate(department.createdAt, i18n.language),
    [department.createdAt, i18n.language],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ height: "100%" }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
          "&:hover": {
            boxShadow: `0 6px 24px rgba(0,0,0,0.09)`,
            borderColor: `${accent}40`,
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Left accent bar */}
        <Box sx={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
          bgcolor: accent, borderRadius: "16px 0 0 16px",
        }} />

        {/* Body */}
        <Box sx={{ p: 2.5, pl: 3, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Top row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: "11px", flexShrink: 0,
                bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${accent}20`,
              }}>
                <CorporateFareOutlined sx={{ fontSize: 20, color: accent }} />
              </Box>
              <Typography sx={{
                fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {department.name}
              </Typography>
            </Box>

            {canManage && (
              <>
                <IconButton
                  size="small"
                  sx={{ color: "#9CA3AF", p: 0.25, "&:hover": { color: "#6B7280" }, flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
                >
                  <MoreVertOutlined sx={{ fontSize: 18 }} />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  onClick={(e) => e.stopPropagation()}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: "14px", minWidth: 170, p: 0.75,
                        bgcolor: "#fff", boxShadow: "0 8px 30px rgba(15,23,42,0.10)",
                        border: "1px solid #E5E7EB",
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => { setMenuAnchor(null); onEdit(department); }}
                    sx={{ borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36, "&:hover": { bgcolor: "#EFF6FF" } }}
                  >
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "7px", flexShrink: 0,
                      bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <EditOutlined sx={{ fontSize: 13, color: "#2563EB" }} />
                    </Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2563EB" }}>{t("pages.departments.card.menu_edit")}</Typography>
                  </MenuItem>

                  <Box sx={{ my: 0.75, mx: 1, height: "1px", bgcolor: "#F3F4F6" }} />

                  <MenuItem
                    onClick={() => { setMenuAnchor(null); onDelete(department); }}
                    sx={{ borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36, "&:hover": { bgcolor: "#FEF2F2" } }}
                  >
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "7px", flexShrink: 0,
                      bgcolor: "#FEF2F2", border: "1px solid #FECACA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <DeleteOutlineOutlined sx={{ fontSize: 13, color: "#DC2626" }} />
                    </Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#DC2626" }}>{t("pages.departments.card.menu_delete")}</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Description */}
          <Typography sx={{
            fontSize: "12.5px", color: "#6B7280", lineHeight: 1.65, flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {department.description || t("pages.departments.card.no_description")}
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 2.5, pl: 3, py: 1.75,
          bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
              {createdLabel}
            </Typography>
          </Box>
          <Link href={`/company/departments/${department._id}`}>
            <AppButton
              endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
              label={t("pages.departments.card.view")}
              size="xs"
            />
          </Link>
        </Box>
      </Box>
    </motion.div>
  );
};

export default DepartmentCard;
