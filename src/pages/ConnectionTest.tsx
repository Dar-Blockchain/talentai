import React, { useState, useEffect, useRef } from "react";
import type { JSX } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import {
  Videocam,
  Mic,
  Wifi,
  KeyboardArrowDown,
  PlayArrow,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7c3aed",
    },
    secondary: {
      main: "#f97316",
    },
    background: {
      default: "#fbfeff",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

interface ConnectionStatus {
  camera: "checking" | "ready" | "error";
  microphone: "checking" | "working" | "error";
  internet: "checking" | "stable" | "weak" | "error";
}

export const ConnectionTest = (): JSX.Element => {
  const [status, setStatus] = useState<ConnectionStatus>({
    camera: "checking",
    microphone: "checking",
    internet: "checking",
  });
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    checkConnections();
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkConnections = async () => {
    // Check camera and microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoStream(stream);
      setStatus((prev) => ({ ...prev, camera: "ready" }));

      // Set up video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check microphone and set up audio analysis
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        setStatus((prev) => ({ ...prev, microphone: "working" }));
        setupAudioAnalysis(stream);
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        camera: "error",
        microphone: "error",
      }));
    }

    // Check internet connection
    try {
      const start = Date.now();
      await fetch("https://www.google.com/favicon.ico", {
        mode: "no-cors",
        cache: "no-cache",
      });
      const duration = Date.now() - start;

      setStatus((prev) => ({
        ...prev,
        internet: duration < 1000 ? "stable" : "weak",
      }));
    } catch (error) {
      setStatus((prev) => ({ ...prev, internet: "error" }));
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
        }
        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  const getStatusColor = (type: keyof ConnectionStatus) => {
    const currentStatus = status[type];
    switch (currentStatus) {
      case "ready":
      case "working":
      case "stable":
        return "success";
      case "weak":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (type: keyof ConnectionStatus) => {
    const currentStatus = status[type];
    switch (type) {
      case "camera":
        return currentStatus === "ready"
          ? "ready to record"
          : currentStatus === "checking"
          ? "being checked"
          : "not available";
      case "microphone":
        return currentStatus === "working"
          ? "Working properly"
          : currentStatus === "checking"
          ? "being checked"
          : "not working";
      case "internet":
        return currentStatus === "stable"
          ? "stable"
          : currentStatus === "weak"
          ? "weak"
          : currentStatus === "checking"
          ? "being checked"
          : "unstable";
      default:
        return "unknown";
    }
  };

  const AudioLevelBars = () => (
    <Stack direction="row" spacing={0.5} alignItems="end">
      {[1, 2, 3, 4].map((bar) => (
        <Box
          key={bar}
          sx={{
            width: 8,
            height: bar * 4 + 8,
            backgroundColor: audioLevel > bar * 20 ? "#f97316" : "#e5e7eb",
            borderRadius: 1,
            transition: "background-color 0.1s ease",
          }}
        />
      ))}
    </Stack>
  );

  const InternetBars = () => (
    <Stack direction="row" spacing={0.5} alignItems="end">
      {[1, 2, 3, 4, 5].map((bar) => (
        <Box
          key={bar}
          sx={{
            width: 8,
            height: bar * 3 + 8,
            backgroundColor:
              status.internet === "stable"
                ? "#3b82f6"
                : status.internet === "weak" && bar <= 3
                ? "#3b82f6"
                : "#e5e7eb",
            borderRadius: 1,
          }}
        />
      ))}
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            py: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                AI
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              TALENT
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Ahmed Mokhessi
            </Typography>
            <IconButton size="small">
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" sx={{ mb: 2, color: "text.primary" }}>
              Check Your Connection Strength
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 600, mx: "auto" }}
            >
              Ensure optimal performance by checking your video, microphone, and internet
              connection strengths.
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' }, 
              gap: 4, 
              mb: 6 
            }}
          >
            {/* Video Preview */}
            <Box sx={{ flex: { lg: 1 } }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Paper
                    sx={{
                      position: "relative",
                      background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                      borderRadius: 2,
                      overflow: "hidden",
                      height: 280,
                      mb: 2,
                    }}
                  >
                    {videoStream ? (
                      <video
                        ref={videoRef}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        muted
                        autoPlay
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "rgba(255,255,255,0.2)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Videocam sx={{ color: "white", fontSize: 32 }} />
                        </Box>
                      </Box>
                    )}
                  </Paper>

                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Your camera is {getStatusText("camera")}.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ensure you have good lighting for a clear video.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Status Checks */}
            <Box sx={{ flex: { lg: 1 } }}>
              <Stack spacing={3}>
                {/* Microphone Status */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#fff7ed",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Mic sx={{ color: "#f97316" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          Your microphone is {getStatusText("microphone")}.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Make sure your surroundings are quiet to capture clear audio.
                        </Typography>
                        <AudioLevelBars />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Internet Status */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#eff6ff",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Wifi sx={{ color: "#3b82f6" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          Your internet connection is {getStatusText("internet")}.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          A strong connection ensures a smooth interview experience.
                        </Typography>
                        <InternetBars />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>

          {/* Start Test Button */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => window.location.reload()}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              Start Test
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ConnectionTest;