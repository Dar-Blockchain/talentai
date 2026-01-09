"use client";
import React, { useMemo, useCallback } from "react";
import { Box } from "@mui/material";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";

import { selectProfile } from "@/store/slices/profileSlice";

const HeaderLogo = () => {
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);

  const userType = user?.role?.toLowerCase()  || localStorage.getItem("userType") || "candidate";

  // Memoized values
  const isCompany = useMemo(
    () => userType === "company",
    [userType]
  );

  const logoSrc = useMemo(
    () =>
      userType === "candidate"
        ? "/images/home/logocandidate.png"
        : "/images/home/logocompany.png",
    [userType]
  );

  const homeRoute = useMemo(
    () => (isCompany ? "/" : "/home/candidate"),
    [isCompany]
  );

  const navigateToHome = useCallback(
    () => router.push(homeRoute),
    [router, homeRoute]
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "50px" }}>
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "50px",
          height: 40,
          width: 138,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#141415",
            borderRadius: "50px",
            width: 134,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={navigateToHome}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            style={{ height: 24 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderLogo;
