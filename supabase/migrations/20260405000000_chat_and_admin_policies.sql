
-- ============================================================
-- 1. Admin SELECT policy on profiles (needed for Admin Panel)
-- ============================================================
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 2. Admin SELECT policy on mood_history (needed for Dashboard / Admin Panel)
-- ============================================================
CREATE POLICY "Admins can view all mood history"
  ON public.mood_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 3. Chat messages table
-- ============================================================
CREATE TABLE public.chat_messages (
  id            UUID    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT    NOT NULL DEFAULT 'User',
  message       TEXT    NOT NULL,
  is_broadcast  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- All signed-in users can read every message
CREATE POLICY "Authenticated users can read chat"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own messages
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own; admins can delete any
CREATE POLICY "Users or admins can delete chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Enable real-time for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
