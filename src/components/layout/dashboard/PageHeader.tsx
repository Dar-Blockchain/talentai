"use client";

import React, { ReactNode } from "react";
import { Box, Typography, Breadcrumbs, Link as MuiLink  } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
<Breadcrumbs
  separator={
    <NavigateNextIcon
      fontSize="small"
      sx={{ color: "#D1D5DB" }}
    />
  }
  aria-label="breadcrumb"
  sx={{
    "& .MuiBreadcrumbs-separator": {
      mx: 0.5,
    },
  }}
>
  {breadcrumbs.map((item, index) =>
    item.href ? (
      <MuiLink
        key={index}
        component={Link}
        href={item.href}
        underline="hover"
        sx={{
          fontSize: "12px",
          fontWeight: 500,
          color: "#6B7280",
          "&:hover": { color: "#111827" },
        }}
      >
        {item.label}
      </MuiLink>
    ) : (
      <Typography
        key={index}
        sx={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {item.label}
      </Typography>
    )
  )}
</Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Title & Subtitle */}
        <Box>
          <Typography
            sx={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ color: "#6B7280", fontSize: "14px" }}>{subtitle}</Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && <Box sx={{ display: "flex", gap: 1.5 }}>{actions}</Box>}
      </Box>
    </Box>
  );
};

export default PageHeader;