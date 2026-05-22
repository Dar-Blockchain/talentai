import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";

interface Props {
  hasFilters: boolean;
}

const ApplicationsEmptyState: React.FC<Props> = ({ hasFilters }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Box sx={{ py: 10, textAlign: "center", border: "1.5px dashed #E5E7EB", borderRadius: "12px", bgcolor: "#FAFAFA" }}>
      <PeopleAltOutlined sx={{ fontSize: 44, color: "#D1D5DB", mb: 1.5 }} />
      <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
        {hasFilters ? t("pages.applications.empty_filtered_title") : t("pages.applications.empty_no_apps_title")}
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
        {hasFilters ? t("pages.applications.empty_filtered_sub") : t("pages.applications.empty_no_apps_sub")}
      </Typography>
    </Box>
  );
};

export default ApplicationsEmptyState;
