import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const languages = ["English", "Hindi", "Urdu", "Punjabi", "Spanish"];

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState(profile?.preferred_language || "English");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_language: selected })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Saved", description: "Language preference updated." });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold font-display">Language Preference</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Change your language to see songs in that language.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelected(lang)}
              className={`rounded-xl border p-4 text-sm font-medium transition-colors flex items-center justify-between ${
                selected === lang
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {lang}
              {selected === lang && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || selected === profile?.preferred_language}
          className="w-full"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;
