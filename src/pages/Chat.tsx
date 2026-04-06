import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Trash2, Radio, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  is_broadcast: boolean;
  created_at: string;
}

const Chat = () => {
  const { user, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [tableReady, setTableReady] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myName =
    profile?.display_name && profile.display_name !== user?.email
      ? profile.display_name
      : user?.email?.split("@")[0] || "User";

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages" as never)
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) {
      if (error.message.includes("does not exist")) setTableReady(false);
      return;
    }
    setMessages((data as ChatMessage[]) || []);
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = supabase
      .channel("chat_rt")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "chat_messages" }, fetchMessages)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (broadcast = false) => {
    if (!text.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages" as never).insert({
      user_id: user.id,
      display_name: myName,
      message: text.trim(),
      is_broadcast: broadcast,
    } as never);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      setText("");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    const { error } = await supabase.from("chat_messages" as never).delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    }
  };

  if (!tableReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-4">
        <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
        <div>
          <p className="font-semibold mb-1">Chat setup required</p>
          <p className="text-muted-foreground text-sm">
            Run the latest migration in your Supabase dashboard to enable the chat table.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-5 py-5 border-b border-border/40 shrink-0">
        <h1 className="text-xl font-bold font-display">Community Chat</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Share song vibes with everyone</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-20">
            <MessageCircle className="w-10 h-10 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation! 🎵</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex flex-col gap-0.5 max-w-[78%] ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <span className="text-[10px] text-muted-foreground px-1 font-medium">{msg.display_name}</span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.is_broadcast
                      ? "bg-primary/15 text-primary border border-primary/25 w-full"
                      : isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/60"
                  }`}
                >
                  {msg.is_broadcast && (
                    <span className="flex items-center gap-1 text-[10px] font-bold mb-1 opacity-70">
                      <Radio className="w-2.5 h-2.5" /> BROADCAST
                    </span>
                  )}
                  {msg.message}
                </div>
                <span className="text-[10px] text-muted-foreground/50 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {(isOwn || isAdmin) && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="mb-5 text-muted-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/40 shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(false); } }}
            placeholder="Type a message…"
            disabled={sending}
            className="text-sm"
          />
          <Button onClick={() => handleSend(false)} disabled={sending || !text.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <Button
              onClick={() => handleSend(true)}
              disabled={sending || !text.trim()}
              variant="outline"
              size="icon"
              title="Send broadcast to all users"
            >
              <Radio className="w-4 h-4" />
            </Button>
          )}
        </div>
        {isAdmin && (
          <p className="text-[10px] text-muted-foreground mt-1.5">
            📢 Use the broadcast button to send announcements to all users
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
