import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Card,
  CardContent,
  Fade,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Link from "next/link";

export default function PaymentResultPage() {
  const router = useRouter();
  const { status, session_id } = router.query;

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!status) return;

    if (status === "success") {
      setMessage("Thank you! Your payment was completed successfully.");
    } else if (status === "cancel") {
      setMessage("Your payment was canceled. No charges were made.");
    }
  }, [status]);

  if (!status) {
    return (
      <Box
        sx={{
          p: 5,
          textAlign: "center",
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #fafafa 0%, #f1f1f1 100%)",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Checking your payment status...</Typography>
      </Box>
    );
  }

  const isSuccess = status === "success";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        background: isSuccess
          ? "linear-gradient(135deg, #e8f7ed 0%, #f4fff7 100%)"
          : "linear-gradient(135deg, #fff2f2 0%, #ffecec 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Fade in timeout={600}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            p: 1,
            textAlign: "center",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {isSuccess ? (
              <CheckCircleOutlineIcon
                sx={{ fontSize: 70, color: "#4caf50", mb: 2 }}
              />
            ) : (
              <HighlightOffIcon
                sx={{ fontSize: 70, color: "#f44336", mb: 2 }}
              />
            )}

            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, letterSpacing: 0.2 }}
            >
              {isSuccess ? "Payment Successful" : "Payment Canceled"}
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}
            >
              {message}
            </Typography>

            {isSuccess && session_id && (
              <>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    mb: 1,
                    color: "#555",
                  }}
                >
                  Payment Reference
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "#f7f7f7",
                    p: 1.5,
                    px: 2,
                    borderRadius: 2,
                    display: "inline-block",
                    fontSize: "0.85rem",
                    mb: 3,
                    color: "#333",
                    wordBreak: "break-all",
                  }}
                >
                  {session_id}
                </Box>

                <Divider sx={{ mb: 3 }} />
              </>
            )}
            <Button
              variant="contained"
              component={Link}
              href="/dashboard/company"
              sx={{
                textTransform: "none",
                width: "100%",
                borderRadius: 25,
                backgroundColor: "#E09A10",
                color: "#fff",
                fontWeight: 600,
                py: 1.2,
                "&:hover": {
                  backgroundColor: "#c4850e",
                },
              }}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
