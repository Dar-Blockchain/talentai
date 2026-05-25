import React from "react";
import { Box, Typography } from "@mui/material";
import { chatSegmentedControlSx } from "@/modules/chat/shared/styles/segmentedControl";
import { TEAM_MINT_UI } from "@/modules/chat/shared/constants/teamMintUi";

export interface ChatSegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface ChatSegmentedControlProps<T extends string> {
  value: T;
  options: ChatSegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Stretch control to fill row (e.g. team tabs above chat). */
  fullWidth?: boolean;
  /** Team chat: align with light mint shell (#F8FAFC / soft green active). */
  mintLightTeamUi?: boolean;
}

function ChatSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  fullWidth = false,
  mintLightTeamUi = false,
}: ChatSegmentedControlProps<T>) {
  const mintRoot = mintLightTeamUi
    ? {
        bgcolor: TEAM_MINT_UI.bgMain,
        border: `1px solid ${TEAM_MINT_UI.border}`,
        borderRadius: "14px",
        gap: 0.5,
        p: 0.45,
        boxShadow: TEAM_MINT_UI.shadowSoft,
      }
    : {};
  const mintItem = mintLightTeamUi
    ? {
        borderRadius: "12px",
        py: 0.75,
        color: TEAM_MINT_UI.textSecondary,
        transition: TEAM_MINT_UI.transition,
        "&:hover": {
          bgcolor: TEAM_MINT_UI.bgCard,
          color: TEAM_MINT_UI.textPrimary,
          boxShadow: TEAM_MINT_UI.shadowSoft,
        },
      }
    : {};
  const mintItemActive = mintLightTeamUi
    ? {
        bgcolor: TEAM_MINT_UI.primarySoft,
        borderColor: "rgba(52, 211, 153, 0.35)",
        color: TEAM_MINT_UI.textPrimary,
        boxShadow: "none",
      }
    : {};

  return (
    <Box
      sx={{
        ...chatSegmentedControlSx.root,
        ...mintRoot,
        ...(fullWidth ? { width: "100%", flexWrap: "nowrap" as const } : {}),
      }}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            onClick={() => onChange(option.value)}
            sx={{
              ...chatSegmentedControlSx.item,
              ...mintItem,
              ...(fullWidth ? { flex: 1, minWidth: 0 } : {}),
              ...(isActive ? { ...chatSegmentedControlSx.itemActive, ...mintItemActive } : {}),
            }}
          >
            <Typography component="span" sx={chatSegmentedControlSx.label}>
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default ChatSegmentedControl;
