import { motion } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import type { Mood, Song } from "@/data/songs";
import { moodConfig } from "@/data/songs";

interface SongListProps {
  mood: Mood;
  songs: Song[];
  onBack: () => void;
}

const accentStyles: Record<Mood, string> = {
  happy: "text-mood-happy",
  sad: "text-mood-sad",
  chill: "text-mood-chill",
  energetic: "text-mood-energetic",
};

const playStyles: Record<Mood, string> = {
  happy: "bg-mood-happy/20 text-mood-happy hover:bg-mood-happy/30",
  sad: "bg-mood-sad/20 text-mood-sad hover:bg-mood-sad/30",
  chill: "bg-mood-chill/20 text-mood-chill hover:bg-mood-chill/30",
  energetic: "bg-mood-energetic/20 text-mood-energetic hover:bg-mood-energetic/30",
};

const SongList = ({ mood, songs, onBack }: SongListProps) => {
  const config = moodConfig[mood];

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
        <span className={accentStyles[mood]}>{config.label}</span> Vibes
      </h2>

      <div className="flex flex-col gap-3 mt-2">
        {songs.map((song, i) => (
          <motion.div
            key={song.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-col gap-0.5 min-w-0 mr-3">
              <span className="font-medium text-foreground truncate">{song.title}</span>
              <span className="text-sm text-muted-foreground truncate">{song.artist}</span>
            </div>
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0 ${playStyles[mood]}`}
            >
              <Play className="w-3.5 h-3.5" />
              Play
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SongList;
