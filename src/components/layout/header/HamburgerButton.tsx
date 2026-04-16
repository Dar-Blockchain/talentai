"use client";
import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MobileDrawer from "./MobileDrawer";

const HamburgerButton = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = useCallback(() => setMobileOpen((prev) => !prev), []);

  return (
    <>
      <IconButton
        sx={{
          display: "none",
          "@media (max-width:750px)": {
            display: "flex",
          },
        }}
        onClick={toggleDrawer}
      >
        <MenuIcon sx={{ color: "#000", fontSize: 26 }} />
      </IconButton>

      {/* MOBILE DRAWER */}
      <MobileDrawer open={mobileOpen} onClose={toggleDrawer} />
    </>
  );
};

export default HamburgerButton;
