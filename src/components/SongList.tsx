import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Music2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Mood, Song } from "@/data/songs";
import { allMoodConfigs } from "@/data/songs";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import SongPlayerModal from "./SongPlayerModal";

const PAGE_SIZE = 5;

interface SongListProps {
  mood: Mood;
  songs: Song[];
  onBack: () => void;
  onSongPlayed?: (song: Song) => void;
}

const accentText: Record<string, string> = {
  happy: "text-mood-happy", sad: "text-mood-sad", chill: "text-mood-chill",
  energetic: "text-mood-energetic", recommended: "text-primary",
};
const videoBtn: Record<string, string> = {
  happy: "bg-mood-happy/20 text-mood-happy hover:bg-mood-happy/30",
  sad: "bg-mood-sad/20 text-mood-sad hover:bg-mood-sad/30",
  chill: "bg-mood-chill/20 text-mood-chill hover:bg-mood-chill/30",
  energetic: "bg-mood-energetic/20 text-mood-energetic hover:bg-mood-energetic/30",
  recommended: "bg-primary/20 text-primary hover:bg-primary/30",
};
const audioBtn: Record<string, string> = {
  happy: "border border-mood-happy/40 text-mood-happy hover:bg-mood-happy/10",
  sad: "border border-mood-sad/40 text-mood-sad hover:bg-mood-sad/10",
  chill: "border border-mood-chill/40 text-mood-chill hover:bg-mood-chill/10",
  energetic: "border border-mood-energetic/40 text-mood-energetic hover:bg-mood-energetic/10",
  recommended: "border border-primary/40 text-primary hover:bg-primary/10",
};
const borderAccent: Record<string, string> = {
  happy: "bg-mood-happy", sad: "bg-mood-sad", chill: "bg-mood-chill",
  energetic: "bg-mood-energetic", recommended: "bg-primary",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SongList = ({ mood, songs, onBack, onSongPlayed }: SongListProps) => {
  const config = allMoodConfigs[mood];
  const { recordPlay } = useMoodHistory();
  const [pages, setPages] = useState<Song[][]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const poolRef = useRef<Song[]>([]);
  const [playingSong, setPlayingSong] = useState<{ song: Song; type: "video" | "audio" } | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (songs.length === 0) return;
    const shuffled = shuffle(songs);
    const first = shuffled.slice(0, PAGE_SIZE);
    poolRef.current = shuffled.slice(PAGE_SIZE);
    setPages([first]);
    setPageIndex(0);
  }, [songs]);

  const currentSongs = pages[pageIndex] ?? [];

  const takePage = (pool: Song[]): { page: Song[]; remaining: Song[] } => {
    const remaining = pool.length > 0 ? pool : shuffle(songs);
    return { page: remaining.slice(0, PAGE_SIZE), remaining: remaining.slice(PAGE_SIZE) };
  };

  const handleNext = () => {
    setDirection(1);
    if (pageIndex < pages.length - 1) {
      setPageIndex((p) => p + 1);
    } else {
      const { page, remaining } = takePage(poolRef.current);
      poolRef.current = remaining;
      setPages((prev) => [...prev, page]);
      setPageIndex((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (pageIndex > 0) {
      setDirection(-1);
      setPageIndex((p) => p - 1);
    } else {
      onBack();
    }
  };

  const openPlayer = (song: Song, type: "video" | "audio") => {
    recordPlay(mood, song);
    onSongPlayed?.(song);
    setPlayingSong({ song, type });
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <>
      <SongPlayerModal
        song={playingSong?.song ?? null}
        type={playingSong?.type ?? "video"}
        open={playingSong !== null}
        onClose={() => setPlayingSong(null)}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col gap-4"
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{pageIndex > 0 ? "Previous suggestions" : "Back"}</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">
              <span className="mr-2">{config.emoji}</span>
              <span className={accentText[mood] || accentText.recommended}>{config.label}</span>{" "}Vibes
            </h2>
            <p className="text-muted-foreground text-xs mt-1">
              Page {pageIndex + 1} · {songs.length} songs total
            </p>
          </div>
          {pages.length > 1 && (
            <div className="flex items-center gap-1 mt-2">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === pageIndex
                      ? `w-4 h-1.5 ${borderAccent[mood] || borderAccent.recommended}`
                      : "w-1.5 h-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {songs.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-3xl mb-3">🎵</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No songs yet! Explore other moods first — we will recommend songs based on your taste.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={pageIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            {currentSongs.map((song, i) => (
              <motion.div
                key={song.title + song.artist}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative rounded-xl border border-border bg-card hover:bg-secondary/30 transition-all duration-200 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 h-full w-[3px] ${borderAccent[mood] || borderAccent.recommended}`} />
                <div className="flex items-center gap-3 pl-5 pr-3 py-3.5">
                  <span className="text-xs text-muted-foreground/40 w-5 shrink-0 text-center select-none">
                    {pageIndex * PAGE_SIZE + i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 bg-secondary/60 px-1.5 py-0.5 rounded shrink-0 hidden sm:block">
                    {song.language}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openPlayer(song, "audio")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${audioBtn[mood] || audioBtn.recommended}`}
                    >
                      <Music2 className="w-3 h-3" /><span>Audio</span>
                    </button>
                    <button
                      onClick={() => openPlayer(song, "video")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${videoBtn[mood] || videoBtn.recommended}`}
                    >
                      <PlayCircle className="w-3 h-3" /><span>Video</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {songs.length > 0 && (
          <div className="flex gap-2 mt-1">
            {pageIndex > 0 && (
              <button
                onClick={handleBack}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${audioBtn[mood] || audioBtn.recommended}`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${videoBtn[mood] || videoBtn.recommended}`}
            >
              More Songs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default SongList;
