import React from "react";
import { Box, Typography, Button } from "@mui/material";

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
  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: { xs: 5, md: 8 } }}>
        <Box sx={{ width: "100%", maxWidth, bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <Box sx={{ p: { xs: 4, md: 5 }, textAlign: "center" }}>

            <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,0,0,0.05)", border: "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
              <Typography sx={{ fontSize: "2rem", lineHeight: 1, userSelect: "none" }}>{icon}</Typography>
            </Box>

            <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "1.4rem", color: "#0F172A", lineHeight: 1.25, letterSpacing: "-0.01em", mb: description || children ? 1.5 : 0 }}>
              {title}
            </Typography>

            {description && (
              <Typography component="div" sx={{ fontFamily: "Poppins", fontSize: "0.88rem", color: "#475569", lineHeight: 1.8 }}>
                {description}
              </Typography>
            )}

            {children}

            {actions.length > 0 && (
              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap", mt: children || description ? 3.5 : 2 }}>
                {actions.map((action, i) => {
                  const isGradient = action.color?.includes("gradient");
                  return (
                    <Button
                      key={i}
                      variant={action.variant ?? (i === 0 ? "contained" : "outlined")}
                      onClick={action.onClick}
                      disableElevation
                      fullWidth={actions.length === 1}
                      sx={{
                        fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem",
                        textTransform: "none", borderRadius: "12px", py: 1.3,
                        ...(action.color
                          ? isGradient
                            ? { background: action.color, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", "&:hover": { background: action.hoverColor ?? action.color, boxShadow: "0 6px 16px rgba(0,0,0,0.2)", color: "#fff" } }
                            : { bgcolor: action.color, color: "#fff", "&:hover": { bgcolor: action.hoverColor ?? action.color } }
                          : action.variant === "outlined"
                            ? { borderColor: "#E2E8F0", color: "#475569", "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" } }
                            : {}
                        ),
                      }}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </Box>
            )}

          </Box>
        </Box>
      </Box>
  );
}
