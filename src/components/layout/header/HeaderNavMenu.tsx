import React, { useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type NavItem = { label: string; id?: string; href?: string };

const getNavItems = (type: string): NavItem[] => {
  if (type === "company") return [
    { label: "Features",     id: "features"   },
    { label: "How It Works", id: "howitworks" },
  ];
  if (type === "candidate") return [
    { label: "Find Jobs",       href: "/posts/"          },
    { label: "How It Works",    id:   "howitworks"       },
    { label: "Are You Hiring?", href: "/home/company/"   },
  ];
  return [
    { label: "Features", id: "features" },
    { label: "Contact",  id: "contact"  },
  ];
};

const ACCENT = "#0D9488";

interface HeaderNavMenuProps {
  direction?: "row" | "column";
  inverted?: boolean;
}

const HeaderNavMenu: React.FC<HeaderNavMenuProps> = ({ direction = "row", inverted = false }) => {
  const router   = useRouter();
  const userType = useSelector((state: RootState) => state.user.userType) ?? "candidate";
  const [hovered, setHovered] = useState<string | null>(null);

  const handleNavClick = (item: NavItem) => {
    if (item.id) {
      const el = document.getElementById(item.id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else if (router.pathname.includes("/home")) router.push(`#${item.id}`);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.href) return router.pathname === item.href;
    if (item.id && typeof window !== "undefined") return window.location.hash === `#${item.id}`;
    return false;
  };

  const items = getNavItems(userType);

  if (direction === "column") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item) => (
          <Box
            key={item.id || item.href}
            onClick={() => handleNavClick(item)}
            sx={{
              px: 2, py: 1.25, borderRadius: "8px", cursor: "pointer",
              fontSize: "14px", fontWeight: isActive(item) ? 700 : 500,
              color: isActive(item) ? "#111" : "#374151",
              "&:hover": { bgcolor: "#F3F4F6", color: "#111" },
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {items.map((item) => {
        const active  = isActive(item);
        const isHover = hovered === (item.id || item.href);

        const textColor  = inverted ? "#475569" : "#555";
        const textActive = inverted ? ACCENT : "#0a0a0a";
        const hoverBg    = inverted ? "rgba(13,148,136,0.15)" : `${ACCENT}14`;

        return (
          <Box
            key={item.id || item.href}
            onClick={() => handleNavClick(item)}
            onMouseEnter={() => setHovered(item.id || item.href || null)}
            onMouseLeave={() => setHovered(null)}
            sx={{
              position: "relative",
              px: 1.75,
              py: 0.75,
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: active ? 650 : 500,
              color: active ? textActive : textColor,
              letterSpacing: "0.01em",
              bgcolor: (active || isHover) ? hoverBg : "transparent",
              transition: "color 0.18s, background 0.18s",
              "&:hover": { color: textActive },
              // bottom accent line
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
                transformOrigin: "center",
                width: "60%",
                height: "2px",
                borderRadius: "2px",
                bgcolor: ACCENT,
                transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              },
              "&:hover::after": { transform: "translateX(-50%) scaleX(1)" },
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default HeaderNavMenu;
