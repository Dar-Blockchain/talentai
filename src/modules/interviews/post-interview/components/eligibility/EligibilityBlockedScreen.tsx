import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { eligibilityBlockedScreenSx as sx } from "../../styles/eligibilityBlockedScreen.styles";

interface Action {
  label: string;
  onClick: () => void;
  variant?: "contained" | "outlined";
  color?: string;
  hoverColor?: string;
}

interface EligibilityBlockedScreenProps {
  icon: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: Action[];
  maxWidth?: number;
}

export default function EligibilityBlockedScreen({
  icon,
  title,
  description,
  children,
  actions = [],
  maxWidth = 460,
}: EligibilityBlockedScreenProps) {
  const hasBody = !!(description || children);

  return (
    <Box sx={sx.outer}>
      <Box sx={sx.card(maxWidth)}>
        <Box sx={sx.cardInner}>
          <Box sx={sx.iconWrapper}>
            <Typography sx={sx.iconText}>{icon}</Typography>
          </Box>

          <Typography sx={sx.title(hasBody)}>{title}</Typography>

          {description && (
            <Typography component="div" sx={sx.description}>
              {description}
            </Typography>
          )}

          {children}

          {actions.length > 0 && (
            <Box sx={sx.actionsRow(hasBody)}>
              {actions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant ?? (i === 0 ? "contained" : "outlined")}
                  onClick={action.onClick}
                  disableElevation
                  fullWidth={actions.length === 1}
                  sx={sx.button(action.color, action.hoverColor, action.variant)}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
