import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Music2, Globe, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", chill: "😌", energetic: "⚡", recommended: "✨",
};

interface UserStat {
  user_id: string;
  display_name: string | null;
  preferred_language: string;
  entry_count: number;
  top_mood: string;
  last_active: string | null;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) return; // show access denied UI below instead of redirecting
    (async () => {
      setLoading(true);
      const [{ data: profiles }, { data: history }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, preferred_language").limit(500),
        supabase.from("mood_history").select("user_id, mood, created_at").limit(2000),
      ]);

      if (!profiles) { setLoading(false); return; }

      const stats: UserStat[] = profiles.map((p) => {
        const userHistory = (history || []).filter((h) => h.user_id === p.user_id);
        const moodCounts: Record<string, number> = {};
        let lastActive: string | null = null;
        userHistory.forEach((h) => {
          moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1;
          if (!lastActive || h.created_at > lastActive) lastActive = h.created_at;
        });
        const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
        return {
          user_id: p.user_id,
          display_name: p.display_name,
          preferred_language: p.preferred_language,
          entry_count: userHistory.length,
          top_mood: topMood,
          last_active: lastActive,
        };
      });

      setUsers(stats.sort((a, b) => b.entry_count - a.entry_count));
      setLoading(false);
    })();
  }, [isAdmin, roleLoading]);

  const filtered = users.filter((u) => {
    const searchName = (u.display_name || "Unnamed").toLowerCase();
    return search === "" || searchName.includes(search.toLowerCase());
  });

  const totalEntries = users.reduce((acc, u) => acc + u.entry_count, 0);
  const moodFreq: Record<string, number> = {};
  users.forEach((u) => { if (u.top_mood !== "—") moodFreq[u.top_mood] = (moodFreq[u.top_mood] || 0) + 1; });
  const globalTopMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading admin panel…</p>
      </div>
    );
  }

  // ── Access Restricted ─────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 max-w-sm"
        >
          <div className="rounded-full bg-destructive/10 border border-destructive/20 p-6">
            <Shield className="w-10 h-10 text-destructive/70" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This area is only accessible to administrators.<br />
              Your account does not have the required permissions.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-5 py-4 w-full text-left">
            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-widest mb-2">Your Role</p>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">User</div>
              <span className="text-xs text-muted-foreground">Standard access only</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:underline transition-all"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold font-display">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage all users and their listening activity</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Users",   value: users.length,  icon: Users,    color: "text-primary" },
          { label: "Total Entries", value: totalEntries,  icon: Music2,   color: "text-emerald-400" },
          { label: "Global Mood",   value: `${MOOD_EMOJI[globalTopMood] || ""} ${globalTopMood}`, icon: BarChart2, color: "text-yellow-400" },
          { label: "Languages",     value: [...new Set(users.map((u) => u.preferred_language))].length, icon: Globe, color: "text-violet-400" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              <p className="text-muted-foreground text-[11px]">{card.label}</p>
            </div>
            <p className={`text-2xl font-bold font-display capitalize ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-3">
          <h2 className="font-semibold font-display text-sm">All Users</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="text-xs bg-secondary/50 border border-border/40 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/40 w-36"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm px-5 py-10 text-center">No users found.</p>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((u, i) => (
              <motion.div
                key={u.user_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.025 }}
                className="px-5 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-colors"
              >
                {/* Avatar letter */}
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary uppercase">
                    {(u.display_name || "?")[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.display_name || "Unnamed"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {u.preferred_language} · {u.entry_count} {u.entry_count === 1 ? "play" : "plays"}
                    {u.last_active && (
                      <> · last {new Date(u.last_active).toLocaleDateString()}</>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {u.top_mood !== "—" ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                      {MOOD_EMOJI[u.top_mood] || ""} {u.top_mood}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">no data</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;
