import React from "react";
import { Box } from "@mui/material";

interface ChatUnreadBadgeProps {
  count: number;
  size?: "sm" | "md";
}

const ChatUnreadBadge: React.FC<ChatUnreadBadgeProps> = ({ count, size = "sm" }) => {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : count;
  const dimensions = size === "md"
    ? { minWidth: 20, height: 20, fontSize: "10px", px: 0.75 }
    : { minWidth: 18, height: 18, fontSize: "9px", px: 0.5 };

  return (
    <Box
      component="span"
      sx={{
        ...dimensions,
        borderRadius: "999px",
        bgcolor: "#EF4444",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {label}
    </Box>
  );
};

export default ChatUnreadBadge;
