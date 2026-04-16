import React from "react";
import { Dialog, Box, CircularProgress, Typography } from "@mui/material";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

const LogoutProgressModal: React.FC<{ open: boolean }> = ({ open }) => (
  <Dialog
    open={open}
    disableEscapeKeyDown
    onClose={() => {}}
    slotProps={{ paper: { sx: { borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", p: 0 } } }}
  >
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2.5, px: 5, py: 4.5, minWidth: 280,
    }}>
      {/* Icon */}
      <Box sx={{
        width: 52, height: 52, borderRadius: "14px",
        bgcolor: "#FEF2F2", border: "1px solid #FECACA",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <LogoutOutlined sx={{ fontSize: 22, color: "#EF4444" }} />
      </Box>

      {/* Text */}
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0F172A", mb: 0.5 }}>
          Logging out…
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: "#94A3B8", lineHeight: 1.5 }}>
          Please wait while we sign you out safely.
        </Typography>
      </Box>

      {/* Spinner */}
      <CircularProgress size={28} thickness={4} sx={{ color: "#EF4444" }} />
    </Box>
  </Dialog>
);

export default LogoutProgressModal;
