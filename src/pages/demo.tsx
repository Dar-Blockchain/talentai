import Head from "next/head";
import { useRef, useState } from "react";
import {
  Play as PlayArrowRoundedIcon,
  Pause as PauseRoundedIcon,
  Volume2 as VolumeUpRoundedIcon,
  VolumeX as VolumeOffRoundedIcon,
  Maximize as FullscreenRoundedIcon,
} from "lucide-react";
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

      <div className="flex min-h-screen flex-col" style={{ backgroundColor: DARK }}>
        <Header />

        <main className="flex flex-1 flex-col items-center justify-center py-8 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            {/* Title */}
            <div className="mb-8 text-center">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[3px]" style={{ color: TEAL }}>
                Product Demo
              </p>
              <h1 className="mt-2 text-[1.8rem] md:text-[2.5rem] font-bold text-white">
                See TalentAI in Action
              </h1>
              <p className="mt-3 text-white/55">
                Watch how AI transforms your hiring workflow
              </p>
            </div>

            {/* Video player wrapper */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-black"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.6)` }}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(playing ? false : true)}
              onClick={togglePlay}
            >
              {/* Video element */}
              <video
                ref={videoRef}
                src="/video/DemoV2.mp4"
                className="block w-full max-h-[70vh] object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => { setPlaying(false); setShowControls(true); }}
                playsInline
              />

              {/* Big play button — shown when paused, does NOT stop propagation so parent click still fires */}
              {!playing && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: TEAL, boxShadow: `0 0 40px ${TEAL}80` }}
                  >
                    <PlayArrowRoundedIcon size={48} color="#fff" />
                  </div>
                </div>
              )}

              {/* Bottom controls bar */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 px-4 pb-3 pt-8 transition-opacity duration-[250ms]"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                  opacity: showControls ? 1 : 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seekable progress bar */}
                <div className="cursor-pointer py-1.5" onClick={handleSeek}>
                  <div className="relative h-1 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="absolute bottom-0 left-0 top-0 rounded-full transition-[width] duration-100 ease-linear"
                      style={{ width: `${progress}%`, backgroundColor: TEAL }}
                    />
                  </div>
                </div>

                {/* Buttons row */}
                <div className="flex items-center gap-1">
                  <button onClick={togglePlay} className="rounded-md p-1.5 text-white">
                    {playing
                      ? <PauseRoundedIcon size={18} />
                      : <PlayArrowRoundedIcon size={18} />
                    }
                  </button>
                  <button onClick={toggleMute} className="rounded-md p-1.5 text-white">
                    {muted
                      ? <VolumeOffRoundedIcon size={18} />
                      : <VolumeUpRoundedIcon size={18} />
                    }
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

            {/* Caption */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                Click the video to play · Click again to pause
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
