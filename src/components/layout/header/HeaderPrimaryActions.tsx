import React, { useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DemoVideoModal from "@/components/home/company/DemoVideoModal";

const ACCENT = "#0D9488";

const HeaderPrimaryActions = ({ inverted = false }: { inverted?: boolean }) => {
  const router   = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [videoOpen, setVideoOpen] = useState(false);

  const userType =
    user?.role?.toLowerCase() ||
    (typeof window !== "undefined" ? localStorage.getItem("userType") : null) ||
    "candidate";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {/* Log in — ghost */}
      <Box
        onClick={() => router.push("/signin")}
        sx={{
          px: 1.75, py: 0.65,
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "13.5px",
          fontWeight: 500,
          color: inverted ? "#475569" : "#555",
          transition: "color 0.18s, background 0.18s",
          "&:hover": {
            color: inverted ? ACCENT : "#111",
            bgcolor: inverted ? "rgba(13,148,136,0.12)" : "rgba(0,0,0,0.04)",
          },
        }}
      >
        Log in
      </Box>

      {/* Separator */}
      <Box sx={{ width: "1px", height: 18, bgcolor: inverted ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />

      {/* CTA — green pill */}
      <Box
        onClick={() =>
          userType === "candidate" ? router.push("/signin") : setVideoOpen(true)
        }
        sx={{
          px: 2, py: 0.65,
          borderRadius: "10px",
          cursor: "pointer",
          bgcolor: ACCENT,
          fontSize: "13.5px",
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.01em",
          boxShadow: `0 2px 10px ${ACCENT}55`,
          transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
          "&:hover": {
            opacity: 0.9,
            transform: "translateY(-1px)",
            boxShadow: `0 4px 16px ${ACCENT}66`,
          },
        }}
      >
        {userType === "candidate" ? "Sign up free" : "Watch Demo"}
      </Box>

      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </Box>
  );
};

export default HeaderPrimaryActions;
