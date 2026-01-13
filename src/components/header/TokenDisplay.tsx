"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Avatar,
  Button,
  IconButton,
  Drawer,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  fetchTokenBalance,
  selectTokenBalance,
  selectTokenLoading,
} from "@/store/slices/tokenSlice";
import { formatNumber } from "@/utils/functions";
import { openModal } from "@/store/slices/tokenPurchaseSlice";
import TokenPurchaseModal from "../token-purchase/TokenPurchaseModal";

// Styles
const pulseDot = {
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: "#DE9300",
  animation: "pulseDot 1s infinite ease-in-out",
  "@keyframes pulseDot": {
    "0%": { transform: "scale(1)", opacity: 0.4 },
    "50%": { transform: "scale(1.6)", opacity: 1 },
    "100%": { transform: "scale(1)", opacity: 0.4 },
  },
};

// Reusable Components
const LoadingDots = () => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
    <Box sx={pulseDot} />
    <Box sx={{ ...pulseDot, animationDelay: "0.2s" }} />
    <Box sx={{ ...pulseDot, animationDelay: "0.4s" }} />
  </Box>
);

const TokenDisplay: React.FC = ({}) => {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const balance = useSelector(selectTokenBalance);
  const loading = useSelector(selectTokenLoading);
  const { user } = useSelector((state: RootState) => state.user.connectedUser);

  const isCompany = useMemo(
    () => user?.role?.toLowerCase() === "company",
    [user?.role]
  );
  const handleOpenModal = useCallback(() => dispatch(openModal()), [dispatch]);
  useEffect(() => {
    if (token) {
      dispatch(fetchTokenBalance());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (router.query.refreshBalance === "true" && token) {
      dispatch(fetchTokenBalance());
    }
  }, [router.query.refreshBalance, token, dispatch]);
  
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: "25px",
        boxShadow: '0px 0px 18.1px 0px rgba(0, 0, 0, 0.05)',
        p: "0 12px",
        height: 40,
        gap: 1.5,
      }}
    >
      <Image
        src="/icons/token.svg"
        alt="token"
        width={20}
        height={20}
      />
      {loading ? (
        <LoadingDots />
      ) : (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "14px",
            color: "rgba(222, 147, 0, 1)",
          }}
        >
          {formatNumber(balance)} tokens
        </Typography>
      )}
      {isCompany && (
        <Tooltip title="Purchase Tokens">
          <IconButton
            onClick={handleOpenModal}
            sx={{
              ml: 1,
              width: 22,
              height:  22,
              backgroundColor: "white",
              border: "0.5px solid rgba(14, 194, 125, 0.27)",
              borderRadius: "16px",
              boxShadow: "0px 0px 10.7px 1px rgba(41, 210, 145, 0.17)",
            }}
          >
            <Image
              src="/icons/plus.svg"
              alt="plus"
              width={12}
              height={12}
            />
          </IconButton>
        </Tooltip>
      )}
      <TokenPurchaseModal />
    </Box>
  );
};

export default TokenDisplay;
