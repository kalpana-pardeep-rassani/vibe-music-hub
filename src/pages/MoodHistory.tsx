import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Shield, Save, X,
  PlayCircle, Music2, ChevronDown, Filter, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useMoodEntries, type MoodEntry } from "@/hooks/useMoodEntries";

const playSong = (title: string, artist: string, type: "video" | "audio" = "video") => {
  const q = encodeURIComponent(`${title} ${artist}`);
  if (type === "audio") {
    window.open(`https://music.youtube.com/search?q=${q}`, "_blank", "noopener,noreferrer");
  } else {
    window.open(`https://www.youtube.com/results?search_query=${q}+official+music+video`, "_blank", "noopener,noreferrer");
  }
};

const MOODS = ["all", "happy", "sad", "chill", "energetic"];
const DATE_RANGES = ["all time", "today", "this week", "this month"];
const SORT_OPTIONS = ["newest", "oldest", "mood a-z"];

const MoodHistory = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { entries, loading, createEntry, updateEntry, deleteEntry } = useMoodEntries(isAdmin);

  const [showCreate, setShowCreate]   = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Create form
  const [newMood,   setNewMood]   = useState("");
  const [newTitle,  setNewTitle]  = useState("");
  const [newArtist, setNewArtist] = useState("");

  // Edit form
  const [editMood,   setEditMood]   = useState("");
  const [editTitle,  setEditTitle]  = useState("");
  const [editArtist, setEditArtist] = useState("");

  // Filters
  const [moodFilter,  setMoodFilter]  = useState("all");
  const [dateFilter,  setDateFilter]  = useState("all time");
  const [sortBy,      setSortBy]      = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async () => {
    const ok = await createEntry(newMood, newTitle, newArtist);
    if (ok) { setNewMood(""); setNewTitle(""); setNewArtist(""); setShowCreate(false); }
  };

  const startEdit = (entry: MoodEntry) => {
    setEditingId(entry.id);
    setEditMood(entry.mood);
    setEditTitle(entry.song_title);
    setEditArtist(entry.song_artist);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const ok = await updateEntry(editingId, editMood, editTitle, editArtist);
    if (ok) setEditingId(null);
  };

  const canModify = (entry: MoodEntry) => isAdmin || entry.user_id === user?.id;

  const filtered = useMemo(() => {
    let result = [...entries];

    // Mood filter
    if (moodFilter !== "all") result = result.filter((e) => e.mood === moodFilter);

    // Date filter
    if (dateFilter !== "all time") {
      const now = new Date();
      result = result.filter((e) => {
        const d = new Date(e.created_at);
        if (dateFilter === "today") {
          return d.toDateString() === now.toDateString();
        }
        if (dateFilter === "this week") {
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }
        if (dateFilter === "this month") {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.song_title.toLowerCase().includes(q) || e.song_artist.toLowerCase().includes(q) || e.mood.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "oldest")   result.sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sortBy === "newest")   result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sortBy === "mood a-z") result.sort((a, b) => a.mood.localeCompare(b.mood));

    return result;
  }, [entries, moodFilter, dateFilter, sortBy, searchQuery]);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold font-display">Mood History</h1>
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/15 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          {isAdmin ? "All users' mood entries." : "Your mood entries."}
        </p>

        {/* CREATE BUTTON */}
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="mb-5">
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
        )}

        {/* CREATE FORM */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-border bg-card p-4 mb-5 flex flex-col gap-3 overflow-hidden"
            >
              <h3 className="font-semibold text-sm">Add Mood Entry</h3>
              <select
                value={newMood}
                onChange={(e) => setNewMood(e.target.value)}
                className="w-full text-sm bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/40 capitalize"
              >
                <option value="" disabled>Select mood…</option>
                {["happy", "sad", "chill", "energetic"].map((m) => (
                  <option key={m} value={m} className="capitalize">{m}</option>
                ))}
              </select>
              <Input placeholder="Song Title"                              value={newTitle}  onChange={(e) => setNewTitle(e.target.value)} />
              <Input placeholder="Artist"                                  value={newArtist} onChange={(e) => setNewArtist(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}><Save className="w-4 h-4 mr-1" /> Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FILTERS ── */}
        <div className="rounded-xl border border-border bg-card p-4 mb-5 flex flex-col gap-3">
          {/* Search */}
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(10); }}
            placeholder="Search songs, artists, moods…"
            className="w-full text-sm bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/40"
          />

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

            {/* Mood */}
            <div className="flex gap-1 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMoodFilter(m); setVisibleCount(10); }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all capitalize ${
                    moodFilter === m ? "bg-primary/15 border-primary/40 text-primary font-medium" : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

            {/* Date range */}
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setVisibleCount(10); }}
              className="text-xs bg-secondary/50 border border-border/40 rounded-lg px-2.5 py-1.5 outline-none"
            >
              {DATE_RANGES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-secondary/50 border border-border/40 rounded-lg px-2.5 py-1.5 outline-none"
            >
              {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            {(moodFilter !== "all" || dateFilter !== "all time" || searchQuery) && (
              <button
                onClick={() => { setMoodFilter("all"); setDateFilter("all time"); setSearchQuery(""); setVisibleCount(10); }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            {entries.length !== filtered.length && ` of ${entries.length}`}
          </p>
        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🎵</p>
            <p className="text-muted-foreground text-sm">
              {entries.length === 0 ? "No mood entries yet." : "No entries match your filters."}
            </p>
          </div>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-3">
          {filtered.slice(0, visibleCount).map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              {editingId === entry.id ? (
                <div className="flex flex-col gap-3">
                  <select
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    className="w-full text-sm bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/40 capitalize"
                  >
                    <option value="" disabled>Select mood…</option>
                    {["happy", "sad", "chill", "energetic"].map((m) => (
                      <option key={m} value={m} className="capitalize">{m}</option>
                    ))}
                  </select>
                  <Input value={editTitle}  onChange={(e) => setEditTitle(e.target.value)}  placeholder="Song Title" />
                  <Input value={editArtist} onChange={(e) => setEditArtist(e.target.value)} placeholder="Artist" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate}><Save className="w-4 h-4 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full capitalize mb-1 inline-block">
                        {entry.mood}
                      </span>
                      <p className="font-semibold">{entry.song_title}</p>
                      <p className="text-sm text-muted-foreground">{entry.song_artist}</p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5">
                        {new Date(entry.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {canModify(entry) && (
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(entry)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => {
                              if (window.confirm("Delete this entry?")) deleteEntry(entry.id);
                            }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => playSong(entry.song_title, entry.song_artist, "video")}>
                      <PlayCircle className="w-3.5 h-3.5 mr-1" /> Video
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => playSong(entry.song_title, entry.song_artist, "audio")}>
                      <Music2 className="w-3.5 h-3.5 mr-1" /> Audio
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* LOAD MORE */}
        {visibleCount < filtered.length && (
          <Button variant="outline" onClick={() => setVisibleCount((v) => v + 10)} className="mt-4 w-full">
            <ChevronDown className="w-4 h-4 mr-1" />
            Load More ({filtered.length - visibleCount} remaining)
          </Button>
        )}

      </motion.div>
    </div>
  );
};

export default MoodHistory;
