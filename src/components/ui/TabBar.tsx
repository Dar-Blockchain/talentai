/**
 * TabBar — styled horizontal tab switcher matching the teal workplace design.
 *
 * Usage:
 *   const TABS = [
 *     { id: "active",   label: "Active",   count: 12 },
 *     { id: "archived", label: "Archived", count: 4 },
 *   ];
 *   <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />
 */

import React from "react";
import { Box, Typography } from "@mui/material";

export interface TabItem {
  id: string;
  label: string;
  /** Optional badge count rendered next to the label */
  count?: number;
  /** Colour of the count badge. Defaults to teal. */
  countColor?: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  /** Accent colour for active indicator. Defaults to teal. */
  color?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  color = "#0D9488",
}) => (
  <Box
    sx={{
      display: "flex",
      gap: 0,
      borderBottom: "2px solid #e5e7eb",
      mb: 3,
    }}
  >
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      const badgeColor = tab.countColor ?? color;
      return (
        <Box
          key={tab.id}
          onClick={() => onChange(tab.id)}
          sx={{
            position: "relative",
            px: 3,
            py: 1.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 1,
            // active underline
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: isActive ? color : "transparent",
              borderRadius: "1px 1px 0 0",
              transition: "background-color 0.2s",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? color : "#6b7280",
              transition: "color 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </Typography>

          {tab.count !== undefined && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.75,
                borderRadius: 10,
                backgroundColor: isActive ? `${badgeColor}18` : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: isActive ? badgeColor : "#9ca3af",
                  lineHeight: 1,
                }}
              >
                {tab.count}
              </Typography>
            </Box>
          )}
        </Box>
      );
    })}
  </Box>
);

export default TabBar;
