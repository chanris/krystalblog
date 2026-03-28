import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, ChevronUp, ChevronDown, Music2, X
} from "lucide-react";
import { useApp } from "../context/AppContext";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, volume,
    togglePlay, nextSong, prevSong, setVolume, setCurrentTime, closePlayer,
  } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);

  // 静音/取消静音同步到 volume
  useEffect(() => {
    if (muted) {
      setVolume(0);
    }
  }, [muted, setVolume]);

  if (!currentSong) return null;

  // 使用 context 中的 duration（来自 Audio 或 song 数据）
  const songDuration = duration || currentSong.durationSec || (typeof currentSong.duration === 'number' ? currentSong.duration : 0);
  const progress = songDuration > 0
    ? (currentTime / songDuration) * 100
    : 0;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Expanded View */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex flex-col items-center py-8 px-6"
              style={{
                background: "linear-gradient(to top, #1c1410, #2d1f0e)",
              }}
            >
              {currentSong.cover ? (
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  className="w-40 h-40 rounded-2xl object-cover shadow-2xl mb-4"
                  style={{ animation: isPlaying ? "spin 20s linear infinite" : "none" }}
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-2xl flex items-center justify-center shadow-2xl mb-4"
                  style={{ background: "#3d2a0e", animation: isPlaying ? "spin 20s linear infinite" : "none" }}
                >
                  <Music2 size={48} style={{ color: "#d97706" }} />
                </div>
              )}
              <h3 className="text-white text-lg" style={{ fontWeight: 600 }}>{currentSong.title}</h3>
              <p style={{ color: "#d97706", fontSize: "0.875rem" }}>{currentSong.artist}</p>
              {currentSong.album && (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{currentSong.album}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player Bar */}
      <div
        style={{ background: "linear-gradient(to right, #1c1410, #2d1f0e)" }}
        className="flex items-center gap-4 px-4 py-3 border-t border-amber-900/30"
      >
        {/* Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            {currentSong.cover ? (
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-11 h-11 rounded-lg object-cover"
                style={{ animation: isPlaying ? "spin 20s linear infinite" : "none" }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{ background: "#3d2a0e", animation: isPlaying ? "spin 20s linear infinite" : "none" }}
              >
                <Music2 size={18} style={{ color: "#d97706" }} />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.2)" }}>
                <Music2 size={14} className="text-amber-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm truncate" style={{ fontWeight: 500 }}>{currentSong.title}</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{currentSong.artist}</p>
          </div>
        </div>

        {/* Progress + Controls */}
        <div className="flex flex-col items-center gap-1 flex-[2]">
          <div className="flex items-center gap-4">
            <button onClick={prevSong} className="text-white/60 hover:text-white transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: "#d97706" }}
            >
              {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
            </button>
            <button onClick={nextSong} className="text-white/60 hover:text-white transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm">
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", minWidth: "2.5rem", textAlign: "right" }}>
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 rounded-full cursor-pointer relative"
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.round(ratio * songDuration));
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%`, background: "#d97706" }}
              />
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", minWidth: "2.5rem" }}>
              {formatTime(songDuration)}
            </span>
          </div>
        </div>

        {/* Volume + Expand */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button
            onClick={closePlayer}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="关闭播放器"
            title="关闭播放器"
          >
            <X size={18} />
          </button>
          <button
            onClick={() => {
              if (muted) {
                setMuted(false);
                setVolume(0.8);
              } else {
                setMuted(true);
              }
            }}
            className="text-white/60 hover:text-white transition-colors hidden sm:block"
          >
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
            className="hidden sm:block w-20 h-1 rounded-full cursor-pointer accent-amber-500"
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
