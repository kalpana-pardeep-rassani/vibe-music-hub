import { motion } from "framer-motion";
import type { Mood } from "@/data/songs";

interface MoodButtonProps {
  mood: Mood;
  emoji: string;
  label: string;
  onClick: (mood: Mood) => void;
}

const moodStyles: Record<Mood, string> = {
  happy: "bg-mood-happy/15 border-mood-happy/30 hover:bg-mood-happy/25 hover:border-mood-happy/50",
  sad: "bg-mood-sad/15 border-mood-sad/30 hover:bg-mood-sad/25 hover:border-mood-sad/50",
  chill: "bg-mood-chill/15 border-mood-chill/30 hover:bg-mood-chill/25 hover:border-mood-chill/50",
  energetic: "bg-mood-energetic/15 border-mood-energetic/30 hover:bg-mood-energetic/25 hover:border-mood-energetic/50",
};

const textStyles: Record<Mood, string> = {
  happy: "text-mood-happy",
  sad: "text-mood-sad",
  chill: "text-mood-chill",
  energetic: "text-mood-energetic",
};

const MoodButton = ({ mood, emoji, label, onClick }: MoodButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(mood)}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-colors ${moodStyles[mood]}`}
    >
      <span className="text-4xl">{emoji}</span>
      <span className={`text-sm font-semibold tracking-wide uppercase ${textStyles[mood]}`}>
        {label}
      </span>
    </motion.button>
  );
};

export default MoodButton;
