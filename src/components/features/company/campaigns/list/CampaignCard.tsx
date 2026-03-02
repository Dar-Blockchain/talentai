import React, { memo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTimeOutlined,
  ChevronRightOutlined,
  DeleteOutlined,
  MoreVertOutlined,
  SwapHorizOutlined,
} from "@mui/icons-material";
import { daysLeft, fmtDate } from "@/utils/functions";
import {
  MODULE_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/constants/campaign";
import AppButton from "@/components/ui/AppButton";
import { Campaign } from "@/types/campaign";
import Link from "next/link";

const CampaignCard: React.FC<{
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onStatusChange: (id: string, title: string, currentStatus: Campaign["status"]) => void;
}> = memo(({ campaign, onViewDetails, onDelete, onStatusChange }) => {
  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
  const tc = TYPE_COLORS[campaign.type] || TYPE_COLORS.CUSTOM;
  const remaining = daysLeft(campaign.deadline);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        "&:hover": { boxShadow: 3 },
        transition: "box-shadow 0.2s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ p: 3, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, mr: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip
                label={campaign.status}
                size="small"
                sx={{
                  bgcolor: sc.bg,
                  color: sc.fg,
                  fontSize: "8px",
                  fontWeight: 900,
                  fontFamily: "Poppins, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  height: 22,
                }}
              />
              <Chip
                label={TYPE_LABELS[campaign.type]}
                size="small"
                sx={{
                  bgcolor: tc.bg,
                  color: tc.fg,
                  fontSize: "8px",
                  fontWeight: 900,
                  fontFamily: "Poppins, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  height: 22,
                  border: `1px solid ${tc.border}`,
                }}
              />
            </Box>
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}
            >
              {campaign.title}
            </Typography>
            {campaign.description && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#6B7280",
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {campaign.description}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            sx={{ color: "#9CA3AF" }}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertOutlined />
          </IconButton>
<Menu
  anchorEl={menuAnchor}
  open={Boolean(menuAnchor)}
  onClose={() => setMenuAnchor(null)}
  slotProps={{
    paper: {
      sx: {
        borderRadius: 2.5,
        minWidth: 170,
        p: 0.5,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 6px 18px rgba(15, 23, 42, 0.05)",
        border: "1px solid #F1F5F9",
      },
    },
  }}
>
  <MenuItem
    onClick={() => {
      setMenuAnchor(null);
      onStatusChange(campaign._id, campaign.title, campaign.status);
    }}
    disabled={!STATUS_TRANSITIONS[campaign.status]?.length}
    sx={{
      borderRadius: 2,
      px: 1.25,
      py: 0.9,
      gap: 1,
      minHeight: 34,
      transition: "background-color 0.12s ease",
      "&:hover": {
        backgroundColor: "#F8FAFC",
      },
      "&.Mui-disabled": {
        opacity: 0.4,
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EEF2FF",
        }}
      >
        <SwapHorizOutlined sx={{ fontSize: 14, color: "#6366F1" }} />
      </Box>
    </ListItemIcon>

    <ListItemText
      primary="Change status"
      primaryTypographyProps={{
        fontSize: 12.5,
        fontWeight: 500,
        color: "#475569",
      }}
    />
  </MenuItem>

  {/* Ultra-soft divider */}
  <Box
    sx={{
      my: 0.5,
      mx: 1,
      height: 1,
      backgroundColor: "#F1F5F9",
      opacity: 0.6,
    }}
  />

  <MenuItem
    onClick={() => {
      setMenuAnchor(null);
      onDelete(campaign._id, campaign.title);
    }}
    sx={{
      borderRadius: 2,
      px: 1.25,
      py: 0.9,
      gap: 1,
      minHeight: 34,
      transition: "background-color 0.12s ease",
      "&:hover": {
        backgroundColor: "#FFF5F5",
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FEE2E2",
        }}
      >
        <DeleteOutlined sx={{ fontSize: 14, color: "#F87171" }} />
      </Box>
    </ListItemIcon>

    <ListItemText
      primary="Delete"
      primaryTypographyProps={{
        fontSize: 12.5,
        fontWeight: 500,
        color: "#64748B",
      }}
    />
  </MenuItem>
</Menu>
        </Box>

        {/* Module chip */}
        {campaign.module && (
          <Chip
            label={MODULE_LABELS[campaign.module.type]}
            size="small"
            sx={{
              bgcolor: "#F3F4F6",
              color: "#4B5563",
              fontSize: "10px",
              fontWeight: 500,
              height: 24,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#F9FAFB",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeOutlined sx={{ fontSize: 15, color: "#6B7280" }} />
          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
            {campaign.deadline ? (
              <Tooltip
                title={
                  remaining === 0
                    ? "Expired"
                    : remaining !== null && remaining > 0
                      ? `${remaining} day${remaining !== 1 ? "s" : ""} left`
                      : ""
                }
                placement="top"
                arrow
              >
                <span>
                  Due:{" "}
                  <strong style={{ color: remaining === 0 ? "#EF4444" : "#374151" }}>
                    {fmtDate(campaign.deadline)}
                  </strong>
                </span>
              </Tooltip>
            ) : (
              "No deadline"
            )}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Link href={`/company/campaigns/${campaign._id}`}>
            <AppButton
              endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
              label="View"
              size="xs"
            />
          </Link>
        </Box>
      </Box>
    </Box>
  );
});

export default memo(CampaignCard);
