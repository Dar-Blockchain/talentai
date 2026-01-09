import React from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const WorkspaceSelector: React.FC = () => {
  const { user, profile } = useSelector((state: RootState) => state.auth);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, mb: 2, fontSize: "36px" }}
      >
        Welcome back, {profile?.firstName || user?.username}!
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 400,
          color: "rgba(56, 68, 85, 1)",
          mb: 4,
        }}
      >
        Choose the space you want to log into
      </Typography>
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: "13px",
          p: 2,
          border: "1px solid rgba(56, 68, 85, 0.3)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "500px",
          width: "100%",
          mb: 2,
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src="/static/images/avatar/1.jpg" />
          <Typography>Personal Space</Typography>
        </Box>
        <IconButton
          sx={{
            color: "rgba(131, 16, 255, 1)",
            transition: "transform 0.2s ease",
            "&:hover": {
              background: "transparent",
              transform: "scale(1.4)",
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: "13px",
          p: 2,
          border: "1px solid rgba(56, 68, 85, 0.3)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "500px",
          width: "100%",
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src="/static/images/avatar/1.jpg">
            <BusinessRoundedIcon sx={{ color: "white" }} />
          </Avatar>
          <Typography>Company Space</Typography>
        </Box>
        <IconButton
          sx={{
            color: "rgba(131, 16, 255, 1)",
            transition: "transform 0.2s ease",
            "&:hover": {
              background: "transparent",
              transform: "scale(1.4)",
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default WorkspaceSelector;
