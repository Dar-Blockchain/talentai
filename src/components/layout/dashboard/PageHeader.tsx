"use client";

import React, { ReactNode } from "react";
import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
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
  icon?: React.ElementType;
  accentColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  icon: Icon,
  accentColor = "#0D9488",
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        px: 3,
        py: 2.5,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* Left: breadcrumbs + title + subtitle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Optional icon box */}
        {Icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: `${accentColor}12`,
              border: `1.5px solid ${accentColor}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 24, color: accentColor }} />
          </Box>
        )}

        <Box>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={
                <NavigateNextIcon sx={{ fontSize: 12, color: "#D1D5DB" }} />
              }
              aria-label="breadcrumb"
              sx={{ mb: 0.5, "& .MuiBreadcrumbs-separator": { mx: 0.25 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <HomeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              </Box>
              {breadcrumbs.map((item, index) =>
                item.href ? (
                  <MuiLink
                    key={index}
                    component={Link}
                    href={item.href}
                    underline="none"
                    sx={{
                      fontSize: "11.5px",
                      fontWeight: 500,
                      color: "#9CA3AF",
                      transition: "color 0.15s",
                      "&:hover": { color: accentColor },
                    }}
                  >
                    {item.label}
                  </MuiLink>
                ) : (
                  <Typography
                    key={index}
                    sx={{
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {item.label}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}

          {/* Title */}
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              sx={{
                fontSize: "13px",
                color: "#6B7280",
                mt: 0.4,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: actions */}
      {actions && (
        <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
