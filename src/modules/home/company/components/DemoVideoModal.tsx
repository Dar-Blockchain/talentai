import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-xl bg-black">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-[#111827] px-4 py-2">
          <span className="text-[14px] font-semibold text-white">
            TalentAI — Product Demo
          </span>
          <button onClick={handleClose} className="rounded-md p-1 text-[#9CA3AF] hover:text-white">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Video area */}
        <div className="relative bg-black p-0">
          <div className="group relative cursor-pointer" onClick={togglePlay}>
            <video
              ref={videoRef}
              src="/video/DemoV2.mp4"
              className="block w-full [aspect-ratio:16/9] object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => { const v = videoRef.current; if (v) setDuration(v.duration); }}
              onEnded={() => { setPlaying(false); }}
              playsInline
            />

            {/* Center play button — pointer-events none so click falls through */}
            {!playing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                <div
                  className="flex h-[70px] w-[70px] items-center justify-center rounded-full"
                  style={{ backgroundColor: TEAL, boxShadow: `0 0 32px ${TEAL}80` }}
                >
                  <PlayArrowRoundedIcon size={42} color="#fff" />
                </div>
              </div>
            )}

            {/* Controls bar */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 flex flex-col gap-1 px-4 pb-3 pt-6 transition-opacity duration-[250ms]",
                playing ? "opacity-0 group-hover:opacity-100" : "opacity-100",
              )}
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seek bar */}
              <div className="cursor-pointer py-1.5" onClick={handleSeek}>
                <div className="relative h-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="absolute bottom-0 left-0 top-0 rounded-full transition-[width] duration-100 ease-linear"
                    style={{ width: `${progress}%`, backgroundColor: TEAL }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-1">
                <button onClick={togglePlay} className="rounded-md p-1.5 text-white">
                  {playing ? <PauseRoundedIcon size={18} /> : <PlayArrowRoundedIcon size={18} />}
                </button>
                <button onClick={toggleMute} className="rounded-md p-1.5 text-white">
                  {muted ? <VolumeOffRoundedIcon size={18} /> : <VolumeUpRoundedIcon size={18} />}
                </button>
                <span className="flex-1 pl-1 text-xs text-white/70">
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
                <button onClick={handleFullscreen} className="rounded-md p-1.5 text-white">
                  <FullscreenRoundedIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
