import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Music, Shield, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ──────────────────────────────────────────────
// Demo credentials — swap these for real accounts
// ──────────────────────────────────────────────
const DEMO_ADMIN = { email: "admin@vibemusicapp.com", password: "Admin@123" };
const DEMO_USER  = { email: "user@vibemusicapp.com",  password: "User@123"  };

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setShowResend(true);
          toast({
            title: "Email not confirmed",
            description: "Please check your inbox and confirm your email, or resend below.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Login failed", description: error.message, variant: "destructive" });
        }
      }
    } else {
      const trimmedName = name.trim();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: trimmedName || email.split("@")[0] },
        },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Account created!",
          description: "Check your email to confirm your account, then log in.",
        });
        setIsLogin(true);
        setName("");
        setShowResend(true);
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmation email sent!", description: `Check ${email} for the confirmation link.` });
    }
    setResendLoading(false);
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

      <p className="text-muted-foreground text-sm mb-8">
        {isLogin ? "Welcome back! Log in to continue." : "Create your account to get started."}
      </p>

      <motion.form
        key={isLogin ? "login" : "signup"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4"
      >
        {!isLogin && (
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
        </Button>
      </motion.form>

      {showResend && email && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-center"
        >
          <p className="text-xs text-muted-foreground mb-2">
            Didn't get the confirmation email?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-xs"
          >
            {resendLoading ? "Sending..." : "Resend confirmation email"}
          </Button>
        </motion.div>
      )}

      <button
        onClick={() => { setIsLogin(!isLogin); setName(""); setShowResend(false); }}
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </button>

      {/* ── Demo Quick Login ── */}
      {isLogin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 w-full"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 border-t border-border/40" />
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest">Demo Accounts</span>
            <div className="flex-1 border-t border-border/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Admin demo */}
            <button
              type="button"
              onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); }}
              className="group flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-4 transition-all text-left"
            >
              <div className="rounded-full bg-primary/15 p-2 group-hover:bg-primary/25 transition-all">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Admin</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Full access · all users</p>
              </div>
            </button>

            {/* Regular user demo */}
            <button
              type="button"
              onClick={() => { setEmail(DEMO_USER.email); setPassword(DEMO_USER.password); }}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border hover:border-border/80 bg-secondary/30 hover:bg-secondary/50 px-4 py-4 transition-all text-left"
            >
              <div className="rounded-full bg-secondary p-2 group-hover:bg-secondary/80 transition-all">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">User</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Personal stats · own data</p>
              </div>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 text-center mt-2">Click a card to fill credentials, then press Log In</p>
        </motion.div>
      )}
    </div>
  );
};

export default Auth;
