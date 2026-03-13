import { useRouter } from "next/router";
import { Box, Container, Typography, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9fb",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            textAlign: "center",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid rgba(0,0,0,0.06)",
            p: { xs: 4, sm: 6 },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(220, 53, 69, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 36, color: "#dc3545" }} />
          </Box>

          {/* Code */}
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#dc3545",
              mb: 1,
            }}
          >
            403 — Forbidden
          </Typography>

          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "#111", mb: 1.5, letterSpacing: "-0.02em" }}
          >
            Access Denied
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{ color: "#666", lineHeight: 1.7, mb: 4, maxWidth: 300, mx: "auto" }}
          >
            You don't have permission to view this page. If you think this is a
            mistake, please contact your administrator.
          </Typography>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={() => router.back()}
              size="small"
              sx={{
                borderRadius: "38px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2.5,
                borderColor: "rgba(0,0,0,0.18)",
                color: "#444",
                "&:hover": { borderColor: "#999", background: "rgba(0,0,0,0.03)" },
              }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
              onClick={() => router.push("/")}
              size="small"
              sx={{
                borderRadius: "38px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2.5,
                background: "#111",
                color: "#fff",
                boxShadow: "none",
                "&:hover": { background: "#333", boxShadow: "none" },
              }}
            >
              Go Home
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
