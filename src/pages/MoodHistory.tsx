import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Shield, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useMoodEntries, type MoodEntry } from "@/hooks/useMoodEntries";

const MoodHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { entries, loading, createEntry, updateEntry, deleteEntry } = useMoodEntries(isAdmin);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form
  const [newMood, setNewMood] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");

  // Edit form
  const [editMood, setEditMood] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");

  const handleCreate = async () => {
    const ok = await createEntry(newMood, newTitle, newArtist);
    if (ok) {
      setNewMood("");
      setNewTitle("");
      setNewArtist("");
      setShowCreate(false);
    }
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

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/15 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold font-display mb-1">Mood History</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {isAdmin ? "Viewing all users' mood entries." : "Your mood entries."}
        </p>

        {/* Create button */}
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-border bg-card p-4 mb-6 flex flex-col gap-3 overflow-hidden"
            >
              <h3 className="font-display font-semibold text-sm">Add Mood Entry</h3>
              <Input placeholder="Mood (e.g. happy, sad)" value={newMood} onChange={(e) => setNewMood(e.target.value)} />
              <Input placeholder="Song Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Input placeholder="Artist" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries list */}
        {entries.length === 0 && (
          <p className="text-muted-foreground text-sm">No mood entries yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              {editingId === entry.id ? (
                <div className="flex flex-col gap-3">
                  <Input value={editMood} onChange={(e) => setEditMood(e.target.value)} placeholder="Mood" />
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Song Title" />
                  <Input value={editArtist} onChange={(e) => setEditArtist(e.target.value)} placeholder="Artist" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5 min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full capitalize">
                        {entry.mood}
                      </span>
                      {isAdmin && entry.user_id !== user?.id && (
                        <span className="text-xs text-muted-foreground">
                          (other user)
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-foreground truncate">{entry.song_title}</span>
                    <span className="text-sm text-muted-foreground truncate">{entry.song_artist}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {canModify(entry) && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(entry)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteEntry(entry.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MoodHistory;
