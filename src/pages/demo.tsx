import Head from "next/head";
import { useRef, useState } from "react";
import { Box, Container, IconButton, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import Header from "@/modules/shared/layouts/home/HomeHeader";

const TEAL = "#0D9488";
const DARK = "#111827";

export default function DemoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Head>
        <title>Demo — TalentAI</title>
        <meta name="description" content="Watch TalentAI in action" />
      </Head>

      <Box sx={{ minHeight: "100vh", bgcolor: DARK, display: "flex", flexDirection: "column" }}>
        <Header />

        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 4, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="overline"
                sx={{ color: TEAL, letterSpacing: 3, fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Product Demo
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  mt: 1,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                }}
              >
                See TalentAI in Action
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.55)", mt: 1.5, fontFamily: "Poppins, sans-serif" }}
              >
                Watch how AI transforms your hiring workflow
              </Typography>
            </Box>

            {/* Video player wrapper */}
            <Box
              sx={{
                position: "relative",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#000",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.6)`,
                cursor: "pointer",
                "&:hover .controls-bar": { opacity: 1 },
              }}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(playing ? false : true)}
              onClick={togglePlay}
            >
              {/* Video element */}
              <video
                ref={videoRef}
                src="/video/DemoV2.mp4"
                style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "contain" }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => { setPlaying(false); setShowControls(true); }}
                playsInline
              />

              {/* Big play button — shown when paused, does NOT stop propagation so parent click still fires */}
              {!playing && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.35)",
                    pointerEvents: "none", // let click fall through to parent
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: TEAL,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 40px ${TEAL}80`,
                    }}
                  >
                    <PlayArrowRoundedIcon sx={{ fontSize: 48, color: "#fff" }} />
                  </Box>
                </Box>
              )}

              {/* Bottom controls bar */}
              <Box
                className="controls-bar"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 2,
                  pb: 1.5,
                  pt: 4,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                  opacity: showControls ? 1 : 0,
                  transition: "opacity 0.25s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seekable progress bar */}
                <Box sx={{ cursor: "pointer", py: 0.75 }} onClick={handleSeek}>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${progress}%`,
                        bgcolor: TEAL,
                        borderRadius: 2,
                        transition: "width 0.1s linear",
                      }}
                    />
                  </Box>
                </Box>

                {/* Buttons row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton size="small" onClick={togglePlay} sx={{ color: "#fff" }}>
                    {playing
                      ? <PauseRoundedIcon fontSize="small" />
                      : <PlayArrowRoundedIcon fontSize="small" />
                    }
                  </IconButton>
                  <IconButton size="small" onClick={toggleMute} sx={{ color: "#fff" }}>
                    {muted
                      ? <VolumeOffRoundedIcon fontSize="small" />
                      : <VolumeUpRoundedIcon fontSize="small" />
                    }
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.7)", fontFamily: "Poppins, sans-serif", flex: 1, pl: 0.5 }}
                  >
                    {fmt(currentTime)} / {fmt(duration)}
                  </Typography>
                  <IconButton size="small" onClick={handleFullscreen} sx={{ color: "#fff" }}>
                    <FullscreenRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Caption */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.4)", fontFamily: "Poppins, sans-serif" }}
              >
                Click the video to play · Click again to pause
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}
