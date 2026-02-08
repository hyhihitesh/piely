-- Migration: Performance Indexes
-- Add missing foreign key indexes for better query performance

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id 
ON public.chat_messages(project_id);

-- ============================================
-- MEMORIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_memories_project_id 
ON public.memories(project_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
ON public.notifications(actor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_comment_id 
ON public.notifications(comment_id) 
WHERE comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_post_id 
ON public.notifications(post_id) 
WHERE post_id IS NOT NULL;

-- ============================================
-- POST COMMENTS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id 
ON public.post_comments(user_id);

-- ============================================
-- POST LIKES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id 
ON public.post_likes(post_id);

-- ============================================
-- POSTS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_project_id 
ON public.posts(project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_user_id 
ON public.posts(user_id);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Chat messages ordered by creation date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_created 
ON public.chat_messages(project_id, created_at DESC);

-- Notifications for user feed
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);
