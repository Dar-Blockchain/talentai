import React from "react";
import { Box, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";
import { useSelector } from "react-redux";
import { selectDepartments, selectDepartmentsLoading } from "@/store/slices/departmentSlice";
import AppButton from "@/components/ui/AppButton";

interface DepartmentEmptyStateProps {
  search: string;
  onCreateClick: () => void;
}

const DepartmentEmptyState: React.FC<DepartmentEmptyStateProps> = ({ search, onCreateClick }) => {
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);

  if (loading || departments.length > 0) return null;

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 3,
      }}
    >
      <CorporateFareOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
      <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
        {search ? "No departments match your search" : "No departments yet"}
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5, mb: 3 }}>
        {search
          ? "Try a different keyword"
          : "Create your first department to start organizing your teams."}
      </Typography>
      {!search && (
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
