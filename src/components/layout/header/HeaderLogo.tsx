"use client";
import React, { useCallback } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";

const HeaderLogo = () => {
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  return (
    <Box
      onClick={goHome}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "opacity 0.2s",
        "&:hover": { opacity: 0.82 },
      }}
    >
      <Box
        component="img"
        src="/images/home/logo.svg"
        alt="TalentAI"
        sx={{ height: 36, display: "block", userSelect: "none" }}
      />
    </Box>
  );
};

export default HeaderLogo;
