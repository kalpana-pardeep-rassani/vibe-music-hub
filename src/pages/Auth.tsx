import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Type your email address above first.", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password reset email sent!", description: `Check ${email} for a reset link.` });
      setShowForgotPassword(false);
    }
    setResetLoading(false);
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

      {isLogin && (
        <button
          type="button"
          onClick={() => setShowForgotPassword((v) => !v)}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors self-end"
        >
          Forgot password?
        </button>
      )}

      {showForgotPassword && isLogin && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-center"
        >
          <p className="text-xs text-muted-foreground mb-2">
            Enter your email above and we'll send you a reset link.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-xs"
          >
            {resetLoading ? "Sendingâ€¦" : "Send reset email"}
          </Button>
        </motion.div>
      )}

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
        onClick={() => { setIsLogin(!isLogin); setName(""); setShowResend(false); setShowForgotPassword(false); }}
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </button>
    </div>
  );
};

export default Auth;
