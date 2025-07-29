import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Fade, CircularProgress } from "@mui/material";
import ActionButton from "@/components/ActionButton";
import UsersIcon from "@/components/icons/UsersIcon";
import VerifiedIcon from "@/components/icons/VerifiedIcon";
import FeedBackIcon from "@/components/icons/FeedBackIcon";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import {
selectInvitationData,
decodeInvitationToken
} from "@/store/slices/projectSlice";
const ProjectActivatePage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { projectId, token } = router.query;
  const [projectName, setProjectName] = useState("Hackathon Project");
  const [mounted, setMounted] = useState(false);
  const {loading, error, data} = useSelector(selectInvitationData);
  const [loadingJoin, setLoadingJoin] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      const callbackUrl = `/projects/activate?token=${token}`;
      router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    const fetchProject = async () => {
      if (!data?.projectId) return;
      try {
        const token = localStorage.getItem("api_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectById/${data.projectId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error("Failed to fetch project");
        const resData = await res.json();
        setProjectName(resData.name || resData.Name || "Hackathon Project");
      } catch (err) {
        setProjectName("Hackathon Project");
      }
    };

    fetchProject();
  }, [dispatch, isAuthenticated, data, token, router]);

  useEffect(() => {
    if(typeof token === 'string'){
      dispatch(decodeInvitationToken(token) as any);
    }
  }, [token]);

  const handleJoin = async () => {
    if (!data?.projectId || !token) {
      window.alert("Missing projectId or token.");
      return;
    }
    try {
      setLoadingJoin(true)
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/";
      const url = `${apiBase}project/activate`;
      const token1 = localStorage.getItem("api_token");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({ projectId: data.projectId, token }),
      });
      if (!res.ok) throw new Error("Activation failed");
      router.push("/dashboardCandidate");
      setLoadingJoin(false)
    } catch (err) {
      setLoadingJoin(false)
      window.alert("Failed to activate project.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    const callbackUrl = `/projects/activate?token=${token}`;
    router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    return;
  };

  if (!mounted) return null; // or a loader
  if(loading) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#8310FF' }} />
      </Box>
    ); 

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
      }}
    >
      {/* If Authenticated, show user info and logout */}
      {data && isAuthenticated && (user.email !== data.memberEmail) && (
        <Box
          sx={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            p: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
            maxWidth: 360,
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={"/logo.svg"}
            alt="TalentAI Logo"
            sx={{ height: 32, mb: 2, cursor: "pointer" }}
            onClick={() => router.push("/")}
          />

          {/* Info + Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ color: "#333", mb: 0.5, textAlign: "center" }}
            >
              You are connected as{" "}
              <b>{user?.email || user?.username || "User"}</b>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#666", mb: 1, textAlign: "center" }}
            >
              Logout in order to accept the invitation and become a team member
              of the project <b>{projectName}</b>.
            </Typography>
            <ActionButton
              icon={null}
              label="Logout"
              tooltip="Logout and return to sign in"
              onClick={handleLogout}
            />
          </Box>
        </Box>
      )}

      {/* Glassmorphism Card, centered */}
      {data && isAuthenticated && (user.email === data.memberEmail)  && (
        <Fade in timeout={600}>
          <Paper
            elevation={6}
            sx={{
              position: "relative",
              zIndex: 2,
              minWidth: { xs: 320, sm: 400 },
              maxWidth: 420,
              px: { xs: 3, sm: 5 },
              py: { xs: 5, sm: 6 },
              borderRadius: 5,
              boxShadow: "0 4px 24px 0 rgba(80,40,180,0.08)",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(18px) saturate(1.1)",
              border: "1px solid rgba(162,89,255,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2.5,
            }}
          >
            <Box sx={{ position: "absolute", top: -32, right: 20, zIndex: 3 }}>
              <VerifiedIcon />
            </Box>
            <Box sx={{ mb: 2, mt: 1 }}>
              <UsersIcon />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              textAlign="center"
              sx={{ color: "#3a2c5c", textShadow: "0 1px 6px #a259ff22" }}
            >
              You've Been Invited!
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={400}
              textAlign="center"
              sx={{ color: "#5e5e7a", mb: 1 }}
            >
              You has invited you to join the hackathon project{" "}
              <b>{projectName}</b>.
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ color: "#7b7b8b", mb: 2 }}
            >
              Accept the invitation to collaborate and make an impact.
              <br />
              Join a talented team and build something amazing!
            </Typography>
            <ActionButton
              icon={<FeedBackIcon />}
              label="Accept Invitation"
              tooltip="Join this hackathon project"
              onClick={handleJoin}
              loading={loadingJoin}
            />
          </Paper>
        </Fade>
      )}

      {/* Footer */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          py: 2,
          px: 2,
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "rgba(20,20,40,0.10)",
            borderRadius: 3,
            px: 2.5,
            py: 1,
            boxShadow: "0 1px 6px 0 #0002",
            color: "#5e5e7a",
            fontSize: { xs: 13, sm: 15 },
            fontWeight: 400,
            textAlign: "center",
            maxWidth: 340,
          }}
        >
          Powered by <b>TalentAI Hackathon Platform</b>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectActivatePage;
