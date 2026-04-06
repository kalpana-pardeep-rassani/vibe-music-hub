import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Music2, TrendingUp, ListMusic, Smile, Shield, User } from "lucide-react";

const MOOD_COLORS: Record<string, string> = {
  happy:       "#FFD700",
  sad:         "#60A5FA",
  chill:       "#34D399",
  energetic:   "#F87171",
  recommended: "#A78BFA",
};

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", chill: "😌", energetic: "⚡", recommended: "✨",
};

interface MoodEntry { mood: string; song_title: string; song_artist: string; created_at: string; }

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [total, setTotal]           = useState(0);
  const [uniqueSongCount, setUniqueSongCount] = useState(0);
  const [moodData, setMoodData] = useState<{ mood: string; count: number }[]>([]);
  const [topSongs, setTopSongs] = useState<{ title: string; count: number }[]>([]);
  const [topMood,  setTopMood]  = useState<string>("");
  const [weekData, setWeekData] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      let q = supabase.from("mood_history").select("mood,song_title,song_artist,created_at").limit(500);
      if (!isAdmin) q = q.eq("user_id", user.id);
      const { data } = await q;
      if (!data) { setLoading(false); return; }

      setTotal(data.length);

      // Mood counts
      const moodCounts: Record<string, number> = {};
      const songCounts: Record<string, number> = {};
      for (const e of data as MoodEntry[]) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        const key = `${e.song_title} — ${e.song_artist}`;
        songCounts[key] = (songCounts[key] || 0) + 1;
      }

      const moodArr = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count);
      setMoodData(moodArr);
      setTopMood(moodArr[0]?.mood || "");

      setUniqueSongCount(Object.keys(songCounts).length);

      setTopSongs(
        Object.entries(songCounts)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      );

      // Last 7 days activity
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      const dayCounts: Record<string, number> = {};
      days.forEach((d) => (dayCounts[d] = 0));
      (data as MoodEntry[]).forEach((e) => {
        const day = e.created_at.slice(0, 10);
        if (day in dayCounts) dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      setWeekData(days.map((d) => ({ day: new Date(d + "T12:00:00").toLocaleDateString("en", { weekday: "short" }), count: dayCounts[d] })));

      setLoading(false);
    })();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Songs Played", value: total,         icon: Music2,     color: "text-primary" },
    { label: "Top Mood",           value: topMood ? `${MOOD_EMOJI[topMood] || ""} ${topMood}` : "—", icon: Smile, color: "text-yellow-400" },
    { label: "Unique Songs",       value: uniqueSongCount, icon: ListMusic, color: "text-emerald-400" },
    { label: "Active Days (7d)",   value: weekData.filter((d) => d.count > 0).length, icon: TrendingUp, color: "text-violet-400" },
  ];

  return (
    <div className="min-h-screen px-5 py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          {isAdmin ? (
            <span className="flex items-center gap-1 text-xs font-medium bg-primary/15 text-primary px-2.5 py-1 rounded-full border border-primary/20">
              <Shield className="w-3 h-3" /> Admin View · All Users
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full border border-border/40">
              <User className="w-3 h-3" /> My Stats
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          {isAdmin ? "Aggregated listening activity across all registered users." : "Your personal listening history and mood patterns."}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <p className="text-muted-foreground text-xs">{card.label}</p>
            </div>
            <p className={`text-2xl font-bold font-display capitalize ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {total === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🎵</p>
          <p className="text-muted-foreground text-sm">No data yet — play some songs to see your stats!</p>
        </div>
      ) : (
        <>
          {/* 7-day activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="rounded-2xl border border-border bg-card p-5 mb-5"
          >
            <h2 className="font-semibold font-display text-sm mb-4">Activity — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  cursor={{ fill: "hsl(var(--secondary))" }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood distribution */}
          {moodData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-2xl border border-border bg-card p-5 mb-5"
            >
              <h2 className="font-semibold font-display text-sm mb-4">Mood Distribution</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={moodData} dataKey="count" nameKey="mood" cx="50%" cy="50%" outerRadius={70} innerRadius={38} paddingAngle={3}>
                      {moodData.map((entry) => (
                        <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood] || "#A78BFA"} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 11, textTransform: "capitalize" }}>{MOOD_EMOJI[value] || ""} {value}</span>}
                    />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Top songs */}
          {topSongs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="font-semibold font-display text-sm mb-4">Most Played Songs</h2>
              <div className="flex flex-col gap-3">
                {topSongs.map((song, i) => {
                  const max = topSongs[0].count;
                  return (
                    <div key={song.title} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/50 w-4 shrink-0 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate mb-1">{song.title}</p>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(song.count / max) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{song.count}×</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
