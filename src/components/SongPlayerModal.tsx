import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExternalLink, Music2, PlayCircle, X } from "lucide-react";
import type { Song } from "@/data/songs";

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

  const videoId = song ? getYouTubeId(song.youtubeUrl) : null;
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  // Reset state whenever the song or open-state changes
  useEffect(() => {
    setEmbedBlocked(false);
    setPlayerReady(false);
  }, [song?.youtubeUrl, open]);

  // Listen for YouTube postMessage events.
  // We DON'T use a timeout â€” we only show the fallback when YouTube
  // explicitly reports an embedding error (codes 101 / 150).
  // onReady fires for embeddable videos and drives the equaliser animation.
  useEffect(() => {
    if (!open || !videoId) return;

    const handler = (e: MessageEvent) => {
      if (
        e.origin !== "https://www.youtube.com" &&
        e.origin !== "https://www.youtube-nocookie.com"
      ) return;

      try {
        const raw = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        // YouTube wraps its data under an "info" key sometimes
        const data = raw?.info && typeof raw.info === "object" ? raw : raw;

        if (data?.event === "onReady") setPlayerReady(true);

        if (data?.event === "onError") {
          const code = Number(data.info ?? data.data);
          // 100 = video not found / private
          // 101 / 150 = embedding disabled by the owner
          if (code === 100 || code === 101 || code === 150) {
            setEmbedBlocked(true);
          }
        }
      } catch { /* ignore non-JSON messages from other frames */ }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open, videoId]);

  if (!song || !videoId) return null;

  // Build embed URL.  enablejsapi=1 makes YouTube send postMessage events.
  // origin= is required for postMessage delivery in most browsers.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&rel=0&modestbranding=1&enablejsapi=1` +
    `&origin=${encodeURIComponent(origin)}`;

  const ytMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(
    `${song.title} ${song.artist}`,
  )}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-lg border-border/50 bg-card [&>button]:hidden">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-1.5 ${
                type === "audio" ? "bg-primary/15" : "bg-violet-500/10"
              }`}
            >
              {type === "audio"
                ? <Music2 className="w-4 h-4 text-primary" />
                : <PlayCircle className="w-4 h-4 text-violet-400" />}
            </div>
            <div>
              <p className="font-semibold text-sm font-display leading-tight">
                {song.title}
              </p>
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

        {/* â”€â”€ Player body â”€â”€ */}
        {embedBlocked ? (

          /* Fallback â€” shown ONLY when YouTube signals the video can't be embedded */
          <div className="flex flex-col items-center gap-5 p-8">
            {thumbnail && (
              <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20">
                <img
                  src={thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
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

          /* â”€â”€ Full video player â”€â”€ */
          <div className="aspect-video w-full bg-black">
            {/* key={videoId} forces React to remount the iframe on song change,
                which resets autoplay and avoids stale src issues */}
            <iframe
              key={videoId}
              src={embedUrl}
              title={song.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

        ) : (

          /* â”€â”€ Audio mode â€” iframe plays audio; album-art overlay hides the video â”€â”€ */
          <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
            {/* The iframe sits at full size so the browser honours autoplay.
                It is covered completely by the overlay below. */}
            <iframe
              key={videoId}
              src={embedUrl}
              title={song.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 w-full h-full border-0"
            />

            {/* Overlay â€” covers the video, shows album art + animated equaliser */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/95">
              {thumbnail && (
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/30">
                  <img
                    src={thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Animated equaliser â€” shows once player is ready */}
                  {playerReady && (
                    <div className="absolute inset-0 bg-black/35 flex items-end justify-center pb-3">
                      <div className="flex items-end gap-[3px] h-6">
                        {[0.5, 0.9, 0.4, 1.0, 0.7, 0.5, 0.8].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-[3px] bg-primary rounded-full"
                            animate={{ scaleY: [h, 0.2, h] }}
                            transition={{
                              duration: 0.6 + i * 0.09,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{ height: "100%", transformOrigin: "bottom" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-sm text-white font-display">
                  {song.title}
                </p>
                <p className="text-white/60 text-xs mt-0.5">{song.artist}</p>
              </div>
              <p className="text-white/40 text-[10px]">
                {playerReady ? "â™« Audio playing" : "Loadingâ€¦"}
              </p>
            </div>
          </div>
        )}

        {/* â”€â”€ Footer â”€â”€ */}
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

