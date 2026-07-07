import { useRef, useState } from "react";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import {
  X as CloseIcon,
  Play as PlayArrowRoundedIcon,
  Pause as PauseRoundedIcon,
  Volume2 as VolumeUpRoundedIcon,
  VolumeX as VolumeOffRoundedIcon,
  Maximize as FullscreenRoundedIcon,
} from "lucide-react";

const TEAL = "#0D9488";

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ open, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [muted,   setMuted]     = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (v?.requestFullscreen) v.requestFullscreen();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    videoRef.current?.pause();
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden", bgcolor: "#000" } } }}
    >
      {/* Header bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, bgcolor: "#111827" }}>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "14px", color: "#fff" }}>
          TalentAI — Product Demo
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#fff" } }}>
          <CloseIcon size={18} />
        </IconButton>
      </Box>

      {/* Video area */}
      <DialogContent sx={{ p: 0, bgcolor: "#000", position: "relative" }}>
        <Box
          sx={{
            position: "relative",
            cursor: "pointer",
            "&:hover .modal-controls": { opacity: 1 },
          }}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src="/video/DemoV2.mp4"
            style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "contain" }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => { const v = videoRef.current; if (v) setDuration(v.duration); }}
            onEnded={() => { setPlaying(false); }}
            playsInline
          />

          {/* Center play button — pointer-events none so click falls through */}
          {!playing && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.4)",
                pointerEvents: "none",
              }}
            >
              <Box sx={{
                width: 70, height: 70, borderRadius: "50%", bgcolor: TEAL,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px ${TEAL}80`,
              }}>
                <PlayArrowRoundedIcon size={42} color="#fff" />
              </Box>
            </Box>
          )}

          {/* Controls bar */}
          <Box
            className="modal-controls"
            sx={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              px: 2, pb: 1.5, pt: 3,
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
              opacity: playing ? 0 : 1,
              transition: "opacity 0.25s",
              display: "flex", flexDirection: "column", gap: 0.5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Seek bar */}
            <Box sx={{ cursor: "pointer", py: 0.75 }} onClick={handleSeek}>
              <Box sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.2)", position: "relative", overflow: "hidden" }}>
                <Box sx={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${progress}%`, bgcolor: TEAL, borderRadius: 2,
                  transition: "width 0.1s linear",
                }} />
              </Box>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" onClick={togglePlay} sx={{ color: "#fff" }}>
                {playing ? <PauseRoundedIcon size={18} /> : <PlayArrowRoundedIcon size={18} />}
              </IconButton>
              <IconButton size="small" onClick={toggleMute} sx={{ color: "#fff" }}>
                {muted ? <VolumeOffRoundedIcon size={18} /> : <VolumeUpRoundedIcon size={18} />}
              </IconButton>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontFamily: "Poppins", flex: 1, pl: 0.5 }}>
                {fmt(currentTime)} / {fmt(duration)}
              </Typography>
              <IconButton size="small" onClick={handleFullscreen} sx={{ color: "#fff" }}>
                <FullscreenRoundedIcon size={18} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
