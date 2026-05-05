import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectDepartmentsError } from "@/store/slices/departmentSlice";
import { resolveDepartmentApiMessage } from "@/utils/departmentI18n";

const DepartmentFetchError: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const error = useSelector(selectDepartmentsError);
  const message = useMemo(() => resolveDepartmentApiMessage(error, t), [error, t]);

  if (!message) return null;

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
      <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{message}</Typography>
    </Box>
  );
};

export default DepartmentFetchError;
