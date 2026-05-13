import React from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  candidateWorkspaceNavItems,
  isCandidateWorkspaceNavActive,
} from "@/components/layout/candidate/candidateWorkspaceNav";
import { useChatUnreadBadges } from "@/modules/shared/chat/hooks/useChatUnreadBadges";
import ChatUnreadBadge from "@/modules/shared/chat/components/ChatUnreadBadge";

interface CandidateQuickNavProps {
  variant?: "vertical" | "horizontal";
  onNavigate?: () => void;
}

const CandidateQuickNav: React.FC<CandidateQuickNavProps> = ({
  variant = "vertical",
  onNavigate,
}) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const viewQuery = router.query.view;
  const { candidateChatUnread } = useChatUnreadBadges();

  const handleNavigate = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  const items = candidateWorkspaceNavItems.map((item) => ({
    ...item,
    label: t(item.labelKey),
    sublabel: t(item.sublabelKey),
    active: isCandidateWorkspaceNavActive(item, router.pathname, viewQuery),
  }));

  if (variant === "horizontal") {
    return (
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          pb: 0.25,
          "&::-webkit-scrollbar": { height: 4 },
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => handleNavigate(item.href)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.9,
              borderRadius: "12px",
              cursor: "pointer",
              flexShrink: 0,
              border: `1px solid ${item.active ? item.border : "#E5E7EB"}`,
              bgcolor: item.active ? item.bg : "#fff",
              transition: "all 0.18s ease",
              "&:hover": { borderColor: item.border, bgcolor: item.bg },
            }}
          >
            <item.icon sx={{ fontSize: 16, color: item.active ? item.color : "#6B7280" }} />
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: item.active ? 700 : 500,
                color: item.active ? item.color : "#374151",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Typography>
            {item.id === "messages" && <ChatUnreadBadge count={candidateChatUnread} size="md" />}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        p: 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 1.25,
        }}
      >
        {t("candidate.nav.navigation")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => handleNavigate(item.href)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.5,
              py: 1.1,
              borderRadius: "12px",
              cursor: "pointer",
              border: `1px solid ${item.active ? item.border : "#E5E7EB"}`,
              bgcolor: item.active ? item.bg : "#FAFAFA",
              transition: "all 0.18s ease",
              "&:hover": { borderColor: item.border, bgcolor: item.bg },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                bgcolor: item.active ? `${item.color}18` : "#fff",
                border: `1px solid ${item.active ? item.border : "#E5E7EB"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <item.icon sx={{ fontSize: 16, color: item.active ? item.color : "#6B7280" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: item.active ? 700 : 500,
                  color: item.active ? item.color : "#374151",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8" }}>{item.sublabel}</Typography>
            </Box>
            {item.id === "messages" && <ChatUnreadBadge count={candidateChatUnread} />}
            {item.active && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CandidateQuickNav;
