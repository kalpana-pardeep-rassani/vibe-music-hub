import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Song, Mood } from "@/data/songs";
import { moodSongs } from "@/data/songs";

export const useMoodHistory = () => {
  const { user, profile } = useAuth();

  const recordPlay = useCallback(async (mood: string, song: Song) => {
    if (!user) return;
    await supabase.from("mood_history").insert({
      user_id: user.id,
      mood,
      song_title: song.title,
      song_artist: song.artist,
    });
  }, [user]);

  const getRecommendedSongs = useCallback(async (): Promise<Song[]> => {
    if (!user) return [];

    // Get user's mood history, most frequent moods
    const { data } = await supabase
      .from("mood_history")
      .select("mood")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) return [];

    // Count mood frequencies
    const moodCounts: Record<string, number> = {};
    data.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    // Sort moods by frequency
    const sortedMoods = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([mood]) => mood)
      .filter((m) => m in moodSongs) as Exclude<Mood, 'recommended'>[];

    // Pick songs from top moods, filtered by language
    const language = profile?.preferred_language || "English";
    const recommended: Song[] = [];
    const seen = new Set<string>();

    for (const mood of sortedMoods) {
      const songs = moodSongs[mood].filter(
        (s) => s.language === language && !seen.has(s.title)
      );
      for (const s of songs) {
        if (recommended.length >= 20) break;
        recommended.push(s);
        seen.add(s.title);
      }
      if (recommended.length >= 20) break;
    }

    // If not enough, fill with any language from top moods
    if (recommended.length < 20) {
      for (const mood of sortedMoods) {
        const songs = moodSongs[mood].filter((s) => !seen.has(s.title));
        for (const s of songs) {
          if (recommended.length >= 20) break;
          recommended.push(s);
          seen.add(s.title);
        }
        if (recommended.length >= 20) break;
      }
    }

    return recommended;
  }, [user, profile]);

  return { recordPlay, getRecommendedSongs };
};
