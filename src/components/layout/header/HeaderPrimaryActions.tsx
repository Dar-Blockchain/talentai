import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const DEMO_VIDEO_SRC = "https://drive.google.com/file/d/1oWx6YFJ3ezx3guiYB8Rwj1T12964zB_n/preview";

const HeaderPrimaryActions = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [videoOpen, setVideoOpen] = useState(false);

  const userType = user?.role?.toLowerCase()  || localStorage.getItem("userType") || "candidate";

  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        onClick={() => router.push("/signin")}
        sx={{
          backgroundColor: "#ffffff",
          color: userType === "candidate" ? "#BD85FF" : "#4DD9A3",
          border: "none",
          borderRadius: 999,
          textTransform: "none",
          px: 2,
          py: 0.75,
          fontSize: "14px",
          fontWeight: 600,
          "&:hover": {
            color: "white",
            backgroundColor: userType === "candidate" ? "#BD85FF" : "#4DD9A3",
          },
        }}
      >
        Login
      </Button>
      <Button
        variant="outlined"
        onClick={() =>
          userType === "candidate"
            ? router.push("/signin")
            : setVideoOpen(true)
        }
        sx={{
          backgroundColor: "#ffffff",
          color: "#383A3D",
          border: "none",
          borderRadius: 999,
          textTransform: "none",
          px: 2,
          py: 0.75,
          fontSize: "14px",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#f9fafb",
          },
        }}
      >
        {userType === "candidate" ? "Sign-up" : "Watch Demo"}
      </Button>

      {/* ── Demo video modal ── */}
      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden", bgcolor: "#000" } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, bgcolor: "#111827" }}>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "14px", color: "#fff" }}>
            TalentAI — Product Demo
          </Typography>
          <IconButton onClick={() => setVideoOpen(false)} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#fff" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0, bgcolor: "#000" }}>
          <iframe
            src={DEMO_VIDEO_SRC}
            width="100%"
            allow="autoplay"
            style={{ border: "none", display: "block", aspectRatio: "16/9" }}
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default HeaderPrimaryActions;
