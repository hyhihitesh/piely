-- Migration: Node Chat Messages Table (Simplified)
-- Creates the node_chat_messages table with simplified RLS

CREATE TABLE IF NOT EXISTS public.node_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.node_chat_messages ENABLE ROW LEVEL SECURITY;

-- Simple RLS: Allow authenticated users to manage their node chat messages
-- (Node ownership is validated at the application layer)
CREATE POLICY "Allow authenticated users to read node chat messages"
ON public.node_chat_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create node chat messages"
ON public.node_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete node chat messages"
ON public.node_chat_messages
FOR DELETE
TO authenticated
USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_node_chat_messages_node_id_created
ON public.node_chat_messages(node_id, created_at DESC);
