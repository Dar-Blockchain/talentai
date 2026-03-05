/**
 * PageBanner — gradient header banner used at the top of major dashboard pages.
 *
 * Usage:
 *   <PageBanner
 *     title="Assessment Campaigns"
 *     subtitle="Create and manage skill assessments across your team"
 *     icon={<CampaignOutlined />}
 *     gradient="135deg, #0D9488 0%, #0f766e 100%"
 *     stats={[
 *       { label: "Active", value: 4 },
 *       { label: "Completed", value: 12 },
 *     ]}
 *     action={<Button>New Campaign</Button>}
 *   />
 */

import React from "react";
import { Box, Typography } from "@mui/material";

export interface BannerStat {
  label: string;
  value: string | number;
}

export interface PageBannerProps {
  title: string;
  subtitle?: string;
  /** Icon rendered inside a tinted circle */
  icon?: React.ReactNode;
  /** CSS gradient string — defaults to teal gradient */
  gradient?: string;
  /** Small stat pills shown at the bottom of the banner */
  stats?: BannerStat[];
  /** Action button(s) placed top-right */
  action?: React.ReactNode;
}

const PageBanner: React.FC<PageBannerProps> = ({
  title,
  subtitle,
  icon,
  gradient = "135deg, #0D9488 0%, #0f766e 100%",
  stats,
  action,
}) => (
  <Box
    sx={{
      background: `linear-gradient(${gradient})`,
      borderRadius: 3,
      p: { xs: 3, md: 4 },
      mb: 3,
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative background circle */}
    <Box
      sx={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }}
    />

    {/* Top row: icon + title + action */}
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: subtitle || stats ? 2 : 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon && (
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": { fontSize: 28 },
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography
            sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, color: "#fff" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.75)", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>

    {/* Stats row */}
    {stats && stats.length > 0 && (
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {stats.map((s) => (
          <Box key={s.label}>
            <Typography sx={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export default PageBanner;
