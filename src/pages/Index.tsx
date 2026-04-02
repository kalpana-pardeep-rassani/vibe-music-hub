import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoodButton from "@/components/MoodButton";
import SongList from "@/components/SongList";
import { moodSongs, moodConfig, allMoodConfigs, type Mood, type Song } from "@/data/songs";
import { Music, LogOut, Globe, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const moods: Mood[] = ["happy", "sad", "chill", "energetic", "recommended"];

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const { user, profile, signOut } = useAuth();
  const { getRecommendedSongs } = useMoodHistory();

  const language = profile?.preferred_language || "English";

  const handleMoodSelect = async (mood: Mood) => {
    if (mood === "recommended") {
      const songs = await getRecommendedSongs();
      setFilteredSongs(songs);
    } else {
      const songs = moodSongs[mood].filter((s) => s.language === language);
      // fallback: if no songs in preferred language, show all
      setFilteredSongs(songs.length > 0 ? songs : moodSongs[mood]);
    }
    setSelectedMood(mood);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-2 w-full justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/15 p-2">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display">VibeSync</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" /> {language}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
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
                emoji={allMoodConfigs[mood].emoji}
                label={allMoodConfigs[mood].label}
                onClick={handleMoodSelect}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="songs" className="w-full">
            <SongList
              mood={selectedMood}
              songs={filteredSongs}
              onBack={() => setSelectedMood(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
