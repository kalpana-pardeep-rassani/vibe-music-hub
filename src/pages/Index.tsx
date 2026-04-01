import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoodButton from "@/components/MoodButton";
import SongList from "@/components/SongList";
import { moodSongs, moodConfig, type Mood } from "@/data/songs";
import { Music } from "lucide-react";

const moods: Mood[] = ["happy", "sad", "chill", "energetic"];

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-2"
      >
        <div className="rounded-xl bg-primary/15 p-2">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight font-display">VibeSync</h1>
      </motion.div>

      <p className="text-muted-foreground text-sm mb-10">Pick your mood, find your song.</p>

      <AnimatePresence mode="wait">
        {!selectedMood ? (
          <motion.div
            key="moods"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4 w-full"
          >
            {moods.map((mood) => (
              <MoodButton
                key={mood}
                mood={mood}
                emoji={moodConfig[mood].emoji}
                label={moodConfig[mood].label}
                onClick={setSelectedMood}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="songs" className="w-full">
            <SongList
              mood={selectedMood}
              songs={moodSongs[selectedMood]}
              onBack={() => setSelectedMood(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
