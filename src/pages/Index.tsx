import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoodButton from "@/components/MoodButton";
import SongList from "@/components/SongList";
import { moodSongs, allMoodConfigs, type Mood, type Song } from "@/data/songs";
import { Music, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const moods: Mood[] = ["happy", "sad", "chill", "energetic", "recommended"];

// Subtle radial glow overlays per mood
const moodBg: Record<string, string> = {
  happy:       "radial-gradient(ellipse at 50% 0%, rgba(255,196,0,0.10) 0%, transparent 70%)",
  sad:         "radial-gradient(ellipse at 50% 0%, rgba(60,100,230,0.12) 0%, transparent 70%)",
  chill:       "radial-gradient(ellipse at 50% 0%, rgba(32,185,141,0.10) 0%, transparent 70%)",
  energetic:   "radial-gradient(ellipse at 50% 0%, rgba(230,50,110,0.11) 0%, transparent 70%)",
  recommended: "radial-gradient(ellipse at 50% 0%, rgba(255,196,0,0.07) 0%, transparent 70%)",
};

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [showSadPopup, setShowSadPopup] = useState(false);
  const consecutiveSadRef = useRef(0);
  const { user, profile } = useAuth();
  const { getRecommendedSongs } = useMoodHistory();

  const language = profile?.preferred_language || "English";

  const handleMoodSelect = async (mood: Mood) => {
    // Reset sad counter when switching away from sad
    if (mood !== "sad") consecutiveSadRef.current = 0;

    if (mood === "recommended") {
      const songs = await getRecommendedSongs();
      setFilteredSongs(songs);
    } else {
      const langSongs = moodSongs[mood].filter((s) => s.language === language);
      if (langSongs.length > 0) {
        // Preferred language first, then other languages fill in for variety / more pages
        const others = moodSongs[mood].filter((s) => s.language !== language);
        setFilteredSongs([...langSongs, ...others]);
      } else {
        setFilteredSongs(moodSongs[mood]);
      }
    }
    setSelectedMood(mood);
  };

  // Called by SongList whenever a song is played (Video or Audio)
  const handleSongPlayed = (_song: Song) => {
    if (selectedMood === "sad") {
      consecutiveSadRef.current += 1;
      if (consecutiveSadRef.current >= 3) {
        consecutiveSadRef.current = 0; // reset to avoid repeat popups
        setShowSadPopup(true);
      }
    } else {
      consecutiveSadRef.current = 0;
    }
  };

  const handleUplift = () => {
    setShowSadPopup(false);
    handleMoodSelect("happy");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-10 max-w-md mx-auto transition-all duration-700"
      style={{ background: selectedMood ? moodBg[selectedMood] : undefined }}
    >
      {/* SAD MOOD DETECTION DIALOG */}
      <Dialog open={showSadPopup} onOpenChange={setShowSadPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why are you feeling sad? 💙</DialogTitle>
            <DialogDescription>
              You've been listening to sad songs for a while. Can I suggest something uplifting instead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <Button onClick={handleUplift} className="flex-1">
              <Sun className="w-4 h-4 mr-1" /> Yes, uplift me!
            </Button>
            <Button variant="outline" onClick={() => setShowSadPopup(false)} className="flex-1">
              No, continue sad vibes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-2 w-full"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/15 p-2">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display">VibeSync</h1>
        </div>
      </motion.div>

      <p className="text-muted-foreground text-sm mb-10">
        {profile?.display_name && profile.display_name !== user?.email
          ? <>Hey <span className="text-foreground font-medium">{profile.display_name.split(" ")[0]}</span>! Pick your mood, find your song.</>
          : "Pick your mood, find your song."
        }
      </p>

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
              onSongPlayed={handleSongPlayed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
