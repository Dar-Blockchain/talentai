import React from "react";
import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type NavItem = {
  label: string;
  id?: string;
  href?: string;
};

const getNavItems = (type: string): NavItem[] => {
  if (type === "company") {
    return [
      { label: "Features", id: "features" },
      { label: "How It Works", id: "howitworks" },
      { label: "Are You a Job Seeker?", href: "/home/candidate/" },
    ];
  }
  if (type === "candidate") {
    return [
      { label: "Find Jobs", href: "/posts/" },
      { label: "How It Works", id: "howitworks" },
      { label: "Are You Hiring?", href: "/home/company/" },
    ];
  }
  return [
    { label: "Features", id: "features" },
    { label: "Solutions", id: "solutions" },
    { label: "Contact", id: "contact" },
  ];
};

interface HeaderNavMenuProps {
  direction?: "row" | "column";
}

const HeaderNavMenu: React.FC<HeaderNavMenuProps> = ({ direction = "row" }) => {
  const router = useRouter();
  const userType =  useSelector(
    (state: RootState) => state.user.userType
  ) ?? 'candidate';

  const handleNavClick = (item: NavItem) => {
    if (item.id) {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (router.pathname.includes("/home")) {
        router.push(`#${item.id}`);
      }
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.href) {
      return router.pathname === item.href;
    }
    if (item.id && typeof window !== "undefined") {
      return window.location.hash === `#${item.id}`;
    }
    return false;
  };

  return (
    <Stack
      direction={direction}
      spacing={4}
      alignItems={direction === "row" ? "center" : "flex-start"}
      sx={
        direction === "row"
          ? {
              px: 3,
              py: 1.5,
              borderRadius: 999,
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              "@media (max-width:750px)": {
                display: "none",
              },
            }
          : { width: "100%" }
      }
    >
      {getNavItems(userType).map((item, index) => {
        const isLast = index === getNavItems(userType).length - 1;
        const lastItemColor =
          userType === "candidate"
            ? "#4DD9A3"
            : userType === "company"
            ? "#BD85FF"
            : "#180D00";
        const active = isActive(item);

        return (
          <Box
            key={item.id || item.href}
            onClick={() => handleNavClick(item)}
            sx={{
              cursor: "pointer",
              fontWeight: active ? 700 : isLast ? 600 : 500,
              fontSize: "14px",
              color: active ? "#000" : isLast ? lastItemColor : "#878786",
              transition: "all 0.2s",
              "&:hover": {
                color: active ? "#000" : isLast ? lastItemColor : "#180D00",
                fontWeight: 600,
              },
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Stack>
  );
};

export default HeaderNavMenu;
