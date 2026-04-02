import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Music, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const languages = ["English", "Hindi", "Urdu", "Punjabi", "Spanish"];

const LanguageSelect = () => {
  const { user, refreshProfile } = useAuth();
  const [selected, setSelected] = useState("English");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 max-w-md mx-auto">
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

      <div className="flex items-center gap-2 mb-2 mt-6">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold font-display">Choose your language</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        We'll show you songs in your preferred language.
      </p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-3 w-full mb-8"
      >
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelected(lang)}
            className={`rounded-xl border p-4 text-sm font-medium transition-colors ${
              selected === lang
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-card border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {lang}
          </button>
        ))}
      </motion.div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
};

export default LanguageSelect;
