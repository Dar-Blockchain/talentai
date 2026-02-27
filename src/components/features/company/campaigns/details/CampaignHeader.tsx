import React, { useState } from "react";
import AppButton from "@/components/ui/AppButton";
import { Box, Chip, Menu, MenuItem, Typography } from "@mui/material";
import { DeleteOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import { Campaign, CampaignStatus } from "@/types/campaign";
import {
  STATUS_COLORS,
  STATUS_TRANSITION_LABELS,
  STATUS_TRANSITIONS,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/constants/campaign";

const CARD = { bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 2.5 } as const;

interface Props {
  campaign: Campaign;
  onChangeStatus: (id: string, status: CampaignStatus) => void;
  onDeleteClick: () => void;
}

const CampaignHeader: React.FC<Props> = ({ campaign, onChangeStatus, onDeleteClick }) => {
  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
  const tc = TYPE_COLORS[campaign.type] || TYPE_COLORS.CUSTOM;
  const transitions = STATUS_TRANSITIONS[campaign.status] ?? [];

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={CARD}>
      {/* Status + type chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <Chip
          label={campaign.status}
          size="small"
          sx={{
            bgcolor: sc.bg,
            color: sc.fg,
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            height: 22,
            borderRadius: "11px",
          }}
        />
        <Chip
          label={TYPE_LABELS[campaign.type]}
          size="small"
          sx={{
            bgcolor: tc.bg,
            color: tc.fg,
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            height: 22,
            borderRadius: "11px",
            border: `1px solid ${tc.border}`,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "flex-start" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Title + description */}
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
            {campaign.title}
          </Typography>
          {campaign.description && (
            <Typography
              sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5, maxWidth: 560, lineHeight: 1.6 }}
            >
              {campaign.description}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          {transitions.length > 0 && (
            <>
              <AppButton
                label="Change Status"
                variant="primary"
                size="medium"
                endIcon={<KeyboardArrowDownOutlined />}
                onClick={(e) => setAnchor(e.currentTarget)}
              />
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 2,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      minWidth: 160,
                      border: "1px solid #F3F4F6",
                      mt: 0.5,
                    },
                  },
                }}
              >
                {transitions.map((s) => (
                  <MenuItem
                    key={s}
                    onClick={() => {
                      setAnchor(null);
                      onChangeStatus(campaign._id, s);
                    }}
                    sx={{ fontSize: "13px", fontWeight: 600, color: STATUS_COLORS[s]?.fg }}
                  >
                    {STATUS_TRANSITION_LABELS[s]}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <AppButton
            label="Delete"
            variant="danger"
            size="medium"
            startIcon={<DeleteOutlined fontSize="small" />}
            onClick={onDeleteClick}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignHeader;
