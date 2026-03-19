import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { Department } from "@/store/slices/departmentSlice";

const PURPLE = "#8310FF";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

interface DepartmentDetailHeaderProps {
  department: Department | null;
  loading: boolean;
  membersTotal: number;
  loadingMembers: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const DepartmentDetailHeader: React.FC<DepartmentDetailHeaderProps> = ({
  department, loading, membersTotal, loadingMembers, onEdit, onDelete,
}) => {
  const router = useRouter();

  return (
    <Box sx={{
      bgcolor: "#fff", border: "1px solid #EDEEF0",
      borderRadius: "22px", overflow: "hidden",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5,
      background: `linear-gradient(135deg, ${PURPLE}06 0%, transparent 50%)`,
    }}>
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 3 }}>

        {/* Nav row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box
            onClick={() => router.push("/company/departments")}
            sx={{
              display: "inline-flex", alignItems: "center", gap: 0.75,
              cursor: "pointer", color: "#94A3B8",
              transition: "color 0.15s", "&:hover": { color: "#475569" },
            }}
          >
            <ArrowBackOutlined sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "inherit" }}>Departments</Typography>
          </Box>

          {department && (
            <Box sx={{ display: "flex", gap: 0.875 }}>
              <Box
                onClick={onEdit}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.625,
                  px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                  border: "1px solid #E2E8F0", bgcolor: "#F8FAFC", transition: "all 0.15s",
                  "&:hover": { bgcolor: `${PURPLE}08`, borderColor: `${PURPLE}30`, "& *": { color: PURPLE } },
                }}
              >
                <EditOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>Edit</Typography>
              </Box>
              <Box
                onClick={onDelete}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.625,
                  px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                  border: "1px solid #FECACA", bgcolor: "#FEF7F7", transition: "all 0.15s",
                  "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" },
                }}
              >
                <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#F87171" }} />
                <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" }}>Delete</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Identity */}
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: "16px", flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="35%" height={28} />
              <Skeleton variant="text" width="55%" height={16} sx={{ mt: 0.5 }} />
              <Box sx={{ display: "flex", gap: 1, mt: 1.25 }}>
                <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: "999px" }} />
                <Skeleton variant="rounded" width={120} height={22} sx={{ borderRadius: "999px" }} />
              </Box>
            </Box>
          </Box>
        ) : department && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: "16px", flexShrink: 0,
              bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BusinessOutlined sx={{ fontSize: 28, color: PURPLE }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", lineHeight: 1.2 }}>
                {department.name}
              </Typography>
              {department.description && (
                <Typography sx={{ fontSize: "0.8125rem", color: "#64748B", mt: 0.4 }}>
                  {department.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.25, flexWrap: "wrap" }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1.125, py: "3px", borderRadius: "999px",
                  bgcolor: `${PURPLE}0C`, border: `1px solid ${PURPLE}18`,
                }}>
                  <PeopleAltOutlined sx={{ fontSize: 11, color: PURPLE }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>
                    {loadingMembers ? "…" : `${membersTotal} member${membersTotal !== 1 ? "s" : ""}`}
                  </Typography>
                </Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlined sx={{ fontSize: 11, color: "#CBD5E1" }} />
                  <Typography sx={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>
                    Created {fmtDate(department.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DepartmentDetailHeader;
