import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  song_title: string;
  song_artist: string;
  created_at: string;
}

export const useMoodEntries = (isAdmin: boolean) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("mood_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error loading entries", description: error.message, variant: "destructive" });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, [user, isAdmin, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Refetch when window regains focus for freshness (realtime removed for security)
  useEffect(() => {
    const handleFocus = () => fetchEntries();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchEntries]);

  const createEntry = useCallback(
    async (mood: string, songTitle: string, songArtist: string) => {
      if (!user) return;
      if (!mood.trim() || !songTitle.trim() || !songArtist.trim()) {
        toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
        return false;
      }
      const { error } = await supabase.from("mood_history").insert({
        user_id: user.id,
        mood: mood.trim(),
        song_title: songTitle.trim(),
        song_artist: songArtist.trim(),
      });
      if (error) {
        toast({ title: "Error creating entry", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Entry created" });
      return true;
    },
    [user, toast]
  );

  const updateEntry = useCallback(
    async (id: string, mood: string, songTitle: string, songArtist: string) => {
      if (!mood.trim() || !songTitle.trim() || !songArtist.trim()) {
        toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
        return false;
      }
      const { error } = await supabase
        .from("mood_history")
        .update({ mood: mood.trim(), song_title: songTitle.trim(), song_artist: songArtist.trim() })
        .eq("id", id);
      if (error) {
        toast({ title: "Error updating entry", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Entry updated" });
      return true;
    },
    [toast]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("mood_history").delete().eq("id", id);
      if (error) {
        toast({ title: "Error deleting entry", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Entry deleted" });
      return true;
    },
    [toast]
  );

  return { entries, loading, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
};
