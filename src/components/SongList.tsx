import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, ArrowLeft, ExternalLink } from "lucide-react";
import type { Mood, Song } from "@/data/songs";
import { allMoodConfigs } from "@/data/songs";
import { useMoodHistory } from "@/hooks/useMoodHistory";

interface SongListProps {
  mood: Mood;
  songs: Song[];
  onBack: () => void;
}

const accentStyles: Record<string, string> = {
  happy: "text-mood-happy",
  sad: "text-mood-sad",
  chill: "text-mood-chill",
  energetic: "text-mood-energetic",
  recommended: "text-primary",
};

const playStyles: Record<string, string> = {
  happy: "bg-mood-happy/20 text-mood-happy hover:bg-mood-happy/30",
  sad: "bg-mood-sad/20 text-mood-sad hover:bg-mood-sad/30",
  chill: "bg-mood-chill/20 text-mood-chill hover:bg-mood-chill/30",
  energetic: "bg-mood-energetic/20 text-mood-energetic hover:bg-mood-energetic/30",
  recommended: "bg-primary/20 text-primary hover:bg-primary/30",
};

const stopStyles: Record<string, string> = {
  happy: "bg-mood-happy/30 text-mood-happy hover:bg-mood-happy/40",
  sad: "bg-mood-sad/30 text-mood-sad hover:bg-mood-sad/40",
  chill: "bg-mood-chill/30 text-mood-chill hover:bg-mood-chill/40",
  energetic: "bg-mood-energetic/30 text-mood-energetic hover:bg-mood-energetic/40",
  recommended: "bg-primary/30 text-primary hover:bg-primary/40",
};

function getYouTubeId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /[?&]v=([^&]+)/,                          // watch?v=ID
    /youtu\.be\/([^?&]+)/,                     // youtu.be/ID
    /embed\/([^?&]+)/,                         // embed/ID
    /\/v\/([^?&]+)/,                           // /v/ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const SongList = ({ mood, songs, onBack }: SongListProps) => {
  const config = allMoodConfigs[mood];
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [errorIndexes, setErrorIndexes] = useState<Set<number>>(new Set());
  const { recordPlay } = useMoodHistory();

  const handlePlay = (index: number, song: Song) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
      setErrorIndexes((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      recordPlay(mood, song);
    }
  };

  const handleIframeError = (index: number) => {
    setErrorIndexes((prev) => new Set(prev).add(index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h2 className="font-display text-2xl font-bold">
        <span className="mr-2">{config.emoji}</span>
        <span className={accentStyles[mood] || accentStyles.recommended}>{config.label}</span> Vibes
      </h2>

      {songs.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No songs yet! Play some songs in other moods first, and we'll recommend songs for you.
        </p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        {songs.map((song, i) => {
          const isPlaying = playingIndex === i;
          const videoId = getYouTubeId(song.youtubeUrl);
          const hasError = errorIndexes.has(i);

          return (
            <motion.div
              key={song.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-0.5 min-w-0 mr-3">
                  <span className="font-medium text-foreground truncate">{song.title}</span>
                  <span className="text-sm text-muted-foreground truncate">{song.artist}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={song.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handlePlay(i, song)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isPlaying ? (stopStyles[mood] || stopStyles.recommended) : (playStyles[mood] || playStyles.recommended)}`}
                  >
                    {isPlaying ? (
                      <><Square className="w-3.5 h-3.5" /> Stop</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Play</>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isPlaying && videoId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {hasError ? (
                      <div className="aspect-video w-full flex flex-col items-center justify-center bg-muted/30 gap-3 p-4">
                        <p className="text-muted-foreground text-sm">Video unavailable in embed</p>
                        <a
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${playStyles[mood] || playStyles.recommended}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Watch on YouTube
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-video w-full">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                          title={song.title}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          className="w-full h-full"
                          onError={() => handleIframeError(i)}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SongList;
