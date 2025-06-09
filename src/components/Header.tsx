import React, { useEffect, useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import dynamic from 'next/dynamic';

const navItems = [
  { label: "Features", id: "features" },
  { label: "Solutions", id: "solutions" },
  { label: "Pricing", id: "pricing" },
  { label: "Contact", id: "contact" },
];

const Header = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyProfile());
      console.log("profile", profile);
    }
  }, [isAuthenticated, dispatch]);

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
        sx={{ height: 32, mb: 2, cursor: 'pointer' }}
        onClick={() => router.push("/")}
      />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.label}
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

  if (!mounted) {
    return null;
  }

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
            sx={{ height: 32, cursor: 'pointer' }}
            onClick={() => router.push("/")}
          />
          {!isMobile && (
            <Stack direction="row" spacing={4} alignItems="center">
              {navItems.map((item) => (
                <Link href={`/#${item.id}`} key={item.id} passHref>
                  <Box
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
                    {item.label}
                  </Box>
                </Link>
              ))}
            </Stack>
          )}

          {!isMobile ? (
            <Button
              variant="contained"
              onClick={() => {
                if (isAuthenticated && profile && profile.type === "Candidate") {
                  router.push("/dashboardCandidate");
                } else if (isAuthenticated && profile && profile.type === "Company") {
                  router.push("/dashboardCompany");
                } else {
                  router.push("/signin");
                }
              }}
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
              {isAuthenticated 
                ? profile?.type === "Candidate" 
                  ? "Dashboard Candidate" 
                  : profile?.type === "Company" 
                    ? "Dashboard Company" 
                    : "Go to Dashboard"
                : "Get Started"}
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

export default dynamic(() => Promise.resolve(Header), { ssr: false });
