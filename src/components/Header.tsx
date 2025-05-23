import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const navItems = ["Features", "Solutions", "Pricing", "Contact"];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        background: "#fff",
        width: "100%",
        height: "100%",
        color: "#000",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        component="img"
        src="/logo.svg"
        alt="TalentAI Logo"
        sx={{ height: 32, mb: 2 }}
      />
      <List>
        {navItems.map((item) => (
          <ListItem key={item}>
            <ListItemText
              primary={item}
              sx={{
                textAlign: "start",
                fontWeight: 500,
                color: "#000",
                transition: "all 0.1s",
                "&:hover": {
                  color: " #00FF9D",
                  fontWeight: "bold",
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#fff", color: "#000" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="TalentAI Logo"
            sx={{ height: 32 }}
          />
          {!isMobile && (
            <Stack direction="row" spacing={4} alignItems="center">
              {navItems.map((item) => (
                <Box
                  key={item}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 500,
                    color: "#000",
                    typography: "body1",
                    borderBottom: "2px solid transparent",
                    transition: "all 0.1s",
                    "&:hover": {
                      borderBottom: "4px solid #00FF9D",
                      fontWeight: "bold",
                    },
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          )}

          {!isMobile ? (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 999,
                textTransform: "none",
                padding: "6px 20px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
              endIcon={
                <ArrowForwardIcon
                  sx={{ fontSize: 16, color: "rgba(0, 255, 157, 1)" }}
                />
              }
            >
              Get Started
            </Button>
          ) : (
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
