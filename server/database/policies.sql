-- ============================================
-- FILE: database/policies.sql
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can view other users' public profiles
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT
    USING (deleted_at IS NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- CONTACTS POLICIES
-- ============================================

-- Users can view their own contacts
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT
    USING (user_id = auth.uid() OR contact_id = auth.uid());

-- Users can insert their own contacts
CREATE POLICY "Users can add contacts" ON contacts
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own contacts
CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own contacts
CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Users can update conversations they created or are admin of
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- CONVERSATION PARTICIPANTS POLICIES
-- ============================================

-- Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Conversation creators/admins can add participants
CREATE POLICY "Admins can add participants" ON conversation_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversation_participants.conversation_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_participants.conversation_id
            AND created_by = auth.uid()
        )
    );

-- Users can update their own participant record
CREATE POLICY "Users can update own participant record" ON conversation_participants
    FOR UPDATE
    USING (user_id = auth.uid());

-- Admins can remove participants
CREATE POLICY "Admins can remove participants" ON conversation_participants
    FOR DELETE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
            AND cp.role = 'admin'
        )
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE
    USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE
    USING (sender_id = auth.uid());

-- ============================================
-- MESSAGE STATUS POLICIES
-- ============================================

-- Users can view status of messages in their conversations
CREATE POLICY "Users can view message status" ON message_status
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM messages m
            WHERE m.id = message_status.message_id
            AND m.sender_id = auth.uid()
        )
    );

-- Users can update their own message status
CREATE POLICY "Users can update message status" ON message_status
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can modify message status" ON message_status
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- MESSAGE REACTIONS POLICIES
-- ============================================

-- Users can view reactions on messages they can see
CREATE POLICY "Users can view reactions" ON message_reactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can add reactions to messages they can see
CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions" ON message_reactions
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- STATUSES POLICIES
-- ============================================

-- Users can view their own statuses
CREATE POLICY "Users can view own statuses" ON statuses
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can view statuses from their contacts
CREATE POLICY "Users can view contact statuses" ON statuses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contact_id = statuses.user_id
            AND user_id = auth.uid()
            AND status = 'accepted'
        )
        AND expires_at > NOW()
    );

-- Users can create their own statuses
CREATE POLICY "Users can create statuses" ON statuses
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own statuses
CREATE POLICY "Users can delete own statuses" ON statuses
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- STATUS VIEWS POLICIES
-- ============================================

-- Status owners can view who viewed their status
CREATE POLICY "Status owners can view viewers" ON status_views
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM statuses
            WHERE id = status_views.status_id
            AND user_id = auth.uid()
        )
    );

-- Users can record viewing a status
CREATE POLICY "Users can record status views" ON status_views
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- CALL LOGS POLICIES
-- ============================================

-- Users can view their own call logs
CREATE POLICY "Users can view own call logs" ON call_logs
    FOR SELECT
    USING (caller_id = auth.uid() OR callee_id = auth.uid());

-- System can insert call logs
CREATE POLICY "System can create call logs" ON call_logs
    FOR INSERT
    WITH CHECK (caller_id = auth.uid());

-- System can update call logs
CREATE POLICY "System can update call logs" ON call_logs
    FOR UPDATE
    USING (caller_id = auth.uid() OR callee_id = auth.uid());

-- Users can delete their own call logs
CREATE POLICY "Users can delete own call logs" ON call_logs
    FOR DELETE
    USING (caller_id = auth.uid() OR callee_id = auth.uid());

-- ============================================
-- USER SETTINGS POLICIES
-- ============================================

-- Users can view their own settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "Users can update own settings" ON user_settings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can modify own settings" ON user_settings
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is contact
CREATE OR REPLACE FUNCTION is_contact(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM contacts
        WHERE user_id = user1_id
        AND contact_id = user2_id
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(user_id UUID, conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE user_id = user_id
        AND conversation_id = conv_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;