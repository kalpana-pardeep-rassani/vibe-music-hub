import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExternalLink, Music2, PlayCircle, X } from "lucide-react";
import type { Song } from "@/data/songs";

// ── YouTube IFrame API types (minimal) ───────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: () => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => { destroy: () => void };
      loaded: number;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load the YT IFrame API once per page session
let _ytApiPromise: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.loaded) return Promise.resolve();
  if (_ytApiPromise) return _ytApiPromise;
  _ytApiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return _ytApiPromise;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([^&#]+)/) ?? url.match(/youtu\.be\/([^?&#]+)/);
  return m ? m[1] : null;
}

interface SongPlayerModalProps {
  song: Song | null;
  type: "video" | "audio";
  open: boolean;
  onClose: () => void;
}

const SongPlayerModal = ({ song, type, open, onClose }: SongPlayerModalProps) => {
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<{ destroy: () => void } | null>(null);

  const videoId = song ? getYouTubeId(song.youtubeUrl) : null;
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  // Reset state and destroy previous player whenever song / open changes
  useEffect(() => {
    setEmbedBlocked(false);
    setPlayerReady(false);
    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, [song?.youtubeUrl, open]);

  // Build the YT.Player after the IFrame API has loaded
  const initPlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return;
    // Clear any previous player markup
    containerRef.current.innerHTML = "";
    const el = document.createElement("div");
    containerRef.current.appendChild(el);

    ytPlayerRef.current = new window.YT.Player(el, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        rel: 0,
        fs: 1,
        controls: type === "video" ? 1 : 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => setPlayerReady(true),
        onError: (e) => {
          // 100 = video not found/private
          // 101 & 150 = embedding disabled by the owner
          if (e.data === 100 || e.data === 101 || e.data === 150) {
            setEmbedBlocked(true);
          }
        },
      },
    });
  }, [videoId, type]);

  useEffect(() => {
    if (!open || !videoId) return;
    loadYTApi().then(initPlayer);
  }, [open, videoId, initPlayer]);

  if (!song || !videoId) return null;

  const ytMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(
    `${song.title} ${song.artist}`
  )}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-lg border-border/50 bg-card [&>button]:hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-1.5 ${type === "audio" ? "bg-primary/15" : "bg-violet-500/10"}`}>
              {type === "audio"
                ? <Music2 className="w-4 h-4 text-primary" />
                : <PlayCircle className="w-4 h-4 text-violet-400" />}
            </div>
            <div>
              <p className="font-semibold text-sm font-display leading-tight">{song.title}</p>
              <p className="text-xs text-muted-foreground">{song.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Player Body ── */}
        {embedBlocked ? (
          // Fallback — shown only for genuinely non-embeddable videos
          <div className="flex flex-col items-center gap-5 p-8">
            {thumbnail && (
              <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20">
                <img src={thumbnail} alt={song.title} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-muted-foreground text-sm text-center leading-relaxed">
              This song can't be embedded by its owner.<br />
              Open it directly on the platform below.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors px-4 py-2 rounded-xl text-sm font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
              </a>
              <a
                href={ytMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Music2 className="w-3.5 h-3.5" /> YouTube Music
              </a>
            </div>
          </div>

        ) : type === "video" ? (
          // ── Video player ──
          <div className="aspect-video w-full bg-black">
            <div
              ref={containerRef}
              className="w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full"
            />
          </div>

        ) : (
          // ── Audio mode: YT player runs underneath, album art overlay on top ──
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {/* Real YouTube player (hidden behind overlay, audio still plays) */}
            <div
              ref={containerRef}
              className="absolute inset-0 w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full"
            />
            {/* Album-art overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm pointer-events-none">
              {thumbnail && (
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/30">
                  <img src={thumbnail} alt={song.title} className="w-full h-full object-cover" />
                  {/* Animated equaliser bars — only shown once player is ready */}
                  <div className="absolute inset-0 bg-black/35 flex items-end justify-center pb-3">
                    <div className="flex items-end gap-[3px] h-6">
                      {playerReady && [0.5, 0.9, 0.4, 1.0, 0.7, 0.5, 0.8].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] bg-primary rounded-full"
                          animate={{ scaleY: [h, 0.2, h] }}
                          transition={{ duration: 0.6 + i * 0.09, repeat: Infinity, ease: "easeInOut" }}
                          style={{ height: "100%", transformOrigin: "bottom" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-sm text-white font-display">{song.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{song.artist}</p>
              </div>
              <p className="text-white/30 text-[10px] text-center px-6">
                {playerReady ? "Audio playing" : "Loading…"}
              </p>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex justify-between items-center px-4 py-2.5 border-t border-border/40">
          <a
            href={type === "audio" ? ytMusicUrl : song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
            {type === "audio" ? "Open in YouTube Music" : "Open in YouTube"}
          </a>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
          >
            Close
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default SongPlayerModal;

