import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { type Song } from "../data/mockData";

interface AppContextType {
  // Admin mode
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // Music player
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setCurrentSong: (song: Song, list?: Song[]) => void;
  closePlayer: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (v: number) => void;
  setCurrentTime: (t: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化 Audio 元素
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    // 播放进度更新
    const handleTimeUpdate = () => {
      setCurrentTimeState(Math.floor(audio.currentTime));
    };

    // 获取实际音频时长
    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration));
    };

    // 播放结束 → 自动下一首
    const handleEnded = () => {
      setIsPlaying(false);
      // 延迟一点触发下一首，避免状态竞争
      setTimeout(() => {
        nextSongRef.current();
      }, 100);
    };

    // 播放出错处理
    const handleError = () => {
      console.error("音频加载失败:", audio.src);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 解析 JWT token 设置管理员状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'ADMIN');
      } catch (e) {
        console.error('解析token失败', e);
      }
    }
  }, []);

  // 获取歌曲的时长（兼容后端 duration 为秒数和前端 durationSec）
  const getSongDuration = useCallback((song: Song): number => {
    if (song.durationSec && song.durationSec > 0) return song.durationSec;
    if (typeof song.duration === 'number' && song.duration > 0) return song.duration;
    return 0;
  }, []);

  const setCurrentSong = useCallback((song: Song, list?: Song[]) => {
    setCurrentSongState(song);
    if (list) setPlaylist(list);
    setCurrentTimeState(0);
    setDuration(getSongDuration(song));

    const audio = audioRef.current;
    if (!audio) return;

    if (song.audioUrl) {
      // 有音频 URL → 真实播放
      audio.src = song.audioUrl;
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("播放失败:", err);
        // 即使播放失败也设置状态，让 UI 正常显示
        setIsPlaying(true);
      });
    } else {
      // 没有音频 URL → 只更新状态（模拟模式）
      audio.pause();
      audio.src = "";
      setIsPlaying(true);
      startSimTimer(song);
    }
  }, [getSongDuration]);

  // 模拟播放定时器（仅在无 audioUrl 时使用作为降级）
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSimTimer = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  }, []);

  const startSimTimer = useCallback((song: Song) => {
    clearSimTimer();
    const dur = song.durationSec || (typeof song.duration === 'number' ? song.duration : 0);
    if (dur <= 0) return;
    simTimerRef.current = setInterval(() => {
      setCurrentTimeState((prev) => {
        if (prev >= dur) {
          clearSimTimer();
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, [clearSimTimer]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    setIsPlaying((prev) => {
      if (prev) {
        // 暂停
        if (audio && audio.src) {
          audio.pause();
        }
        clearSimTimer();
      } else if (currentSong) {
        // 继续播放
        if (audio && audio.src && currentSong.audioUrl) {
          audio.play().catch(console.error);
        } else if (currentSong) {
          startSimTimer(currentSong);
        }
      }
      return !prev;
    });
  }, [currentSong, clearSimTimer, startSimTimer]);

  // 用 ref 存储 nextSong 以便 audio ended 回调使用
  const nextSongRef = useRef<() => void>(() => {});

  const nextSong = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    const next = playlist[(idx + 1) % playlist.length];
    setCurrentSong(next, playlist);
  }, [currentSong, playlist, setCurrentSong]);

  // 保持 ref 同步
  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [nextSong]);

  const prevSong = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    setCurrentSong(prev, playlist);
  }, [currentSong, playlist, setCurrentSong]);

  const closePlayer = useCallback(() => {
    clearSimTimer();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audio.load();
    }
    setIsPlaying(false);
    setCurrentTimeState(0);
    setDuration(0);
    setCurrentSongState(null);
  }, [clearSimTimer]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  const setCurrentTime = useCallback((t: number) => {
    setCurrentTimeState(t);
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = t;
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAdmin, setIsAdmin,
        sidebarOpen, setSidebarOpen,
        currentSong, playlist, isPlaying, currentTime, duration, volume,
        setCurrentSong, closePlayer, togglePlay, nextSong, prevSong,
        setVolume, setCurrentTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
