import { motion } from "framer-motion";
import type { Mood } from "@/data/songs";

interface MoodButtonProps {
  mood: Mood;
  emoji: string;
  label: string;
  onClick: (mood: Mood) => void;
}

const moodStyles: Record<string, string> = {
  happy: "bg-mood-happy/15 border-mood-happy/30 hover:bg-mood-happy/25 hover:border-mood-happy/50",
  sad: "bg-mood-sad/15 border-mood-sad/30 hover:bg-mood-sad/25 hover:border-mood-sad/50",
  chill: "bg-mood-chill/15 border-mood-chill/30 hover:bg-mood-chill/25 hover:border-mood-chill/50",
  energetic: "bg-mood-energetic/15 border-mood-energetic/30 hover:bg-mood-energetic/25 hover:border-mood-energetic/50",
  recommended: "bg-primary/15 border-primary/30 hover:bg-primary/25 hover:border-primary/50",
};

const textStyles: Record<string, string> = {
  happy: "text-mood-happy",
  sad: "text-mood-sad",
  chill: "text-mood-chill",
  energetic: "text-mood-energetic",
  recommended: "text-primary",
};

const glowStyles: Record<string, string> = {
  happy: "hover:shadow-[0_0_20px_rgba(255,196,0,0.25)]",
  sad: "hover:shadow-[0_0_20px_rgba(60,100,230,0.25)]",
  chill: "hover:shadow-[0_0_20px_rgba(32,185,141,0.25)]",
  energetic: "hover:shadow-[0_0_20px_rgba(230,50,110,0.25)]",
  recommended: "hover:shadow-[0_0_20px_rgba(255,196,0,0.2)]",
};

const MoodButton = ({ mood, emoji, label, onClick }: MoodButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(mood)}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all duration-200 ${
        moodStyles[mood] || moodStyles.recommended
      } ${glowStyles[mood] || glowStyles.recommended}`}
    >
      <span className="text-5xl">{emoji}</span>
      <span className={`text-sm font-semibold tracking-wide uppercase ${textStyles[mood] || textStyles.recommended}`}>
        {label}
      </span>
    </motion.button>
  );
};

export default MoodButton;
