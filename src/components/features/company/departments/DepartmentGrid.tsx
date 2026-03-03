import React from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectDepartments,
  selectDepartmentsLoading,
  Department,
} from "@/store/slices/departmentSlice";
import DepartmentCard from "./DepartmentCard";
import DepartmentSkeletonCard from "./DepartmentSkeletonCard";

interface DepartmentGridProps {
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

const DepartmentGrid: React.FC<DepartmentGridProps> = ({ onEdit, onDelete }) => {
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        gap: 1.5,
      }}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <DepartmentSkeletonCard key={i} />)
        : departments.map((dept, idx) => (
            <DepartmentCard
              key={dept._id}
              department={dept}
              index={idx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
    </Box>
  );
};

export default DepartmentGrid;
