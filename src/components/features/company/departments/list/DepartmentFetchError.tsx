import React from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectDepartmentsError } from "@/store/slices/departmentSlice";

const DepartmentFetchError: React.FC = () => {
  const error = useSelector(selectDepartmentsError);

  if (!error) return null;

  return (
    <Box
      sx={{
        mb: 3,
        px: 3,
        py: 2,
        borderRadius: 2,
        bgcolor: "#FEF2F2",
        border: "1px solid #FECACA",
      }}
    >
      <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{error}</Typography>
    </Box>
  );
};

export default DepartmentFetchError;
