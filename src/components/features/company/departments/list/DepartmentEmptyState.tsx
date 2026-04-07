import React from "react";
import { Box, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import { useSelector } from "react-redux";
import { selectDepartments, selectDepartmentsLoading } from "@/store/slices/departmentSlice";
import AppButton from "@/components/ui/AppButton";

interface DepartmentEmptyStateProps {
  search: string;
  onCreateClick: () => void;
  canManage?: boolean;
}

const DepartmentEmptyState: React.FC<DepartmentEmptyStateProps> = ({ search, onCreateClick, canManage = true }) => {
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);

  if (loading || departments.length > 0) return null;

  const isFiltered = Boolean(search);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 12,
        px: 3,
        bgcolor: "#fff",
        border: "1px dashed #E5E7EB",
        borderRadius: "20px",
        textAlign: "center",
      }}
    >
      <Box sx={{
        width: 72, height: 72, borderRadius: "20px",
        bgcolor: isFiltered ? "#F5F3FF" : "#F0FDFA",
        border: `1px solid ${isFiltered ? "#DDD6FE" : "#99F6E4"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        mb: 2.5,
      }}>
        {isFiltered
          ? <SearchOffOutlined sx={{ fontSize: 32, color: "#7C3AED" }} />
          : <CorporateFareOutlined sx={{ fontSize: 32, color: "#0D9488" }} />
        }
      </Box>

      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", mb: 0.75 }}>
        {isFiltered ? "No departments found" : "No departments yet"}
      </Typography>
      <Typography sx={{ fontSize: "13.5px", color: "#9CA3AF", maxWidth: 340, lineHeight: 1.6, mb: 3 }}>
        {isFiltered
          ? `No departments match "${search}". Try a different keyword.`
          : "Create your first department to start organizing your company's teams and employees."}
      </Typography>

      {!isFiltered && canManage && (
        <AppButton
          label="Create Department"
          variant="contained"
          startIcon={<AddOutlined />}
          size="medium"
          onClick={onCreateClick}
        />
      )}
    </Box>
  );
};

export default DepartmentEmptyState;
