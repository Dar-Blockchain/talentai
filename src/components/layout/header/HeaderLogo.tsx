"use client";
import React, { useCallback } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";

const HeaderLogo = () => {
  const router         = useRouter();
  const storedUserType = useSelector((state: RootState) => state.user.userType);
  const { user }       = useSelector((state: RootState) => state.user.connectedUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const userType =
    router.pathname === "/" || router.pathname === "/home/candidate" || router.pathname === "/candidate/home"
      ? storedUserType
      : user?.role?.toLowerCase() ?? storedUserType ?? "candidate";

  const goHome = useCallback(() => router.push("/"), [router]);

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
