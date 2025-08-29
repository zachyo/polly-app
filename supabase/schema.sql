-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create polls table
CREATE TABLE polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL, -- Array of poll options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT polls_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    CONSTRAINT polls_options_count CHECK (jsonb_array_length(options) >= 2 AND jsonb_array_length(options) <= 10)
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_index INTEGER NOT NULL,
    voter_ip INET, -- For anonymous users
    voter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For authenticated users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT votes_option_index_positive CHECK (option_index >= 0),
    CONSTRAINT votes_one_identifier CHECK (
        (voter_ip IS NOT NULL AND voter_id IS NULL) OR 
        (voter_ip IS NULL AND voter_id IS NOT NULL) OR
        (voter_ip IS NOT NULL AND voter_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_polls_user_id ON polls(user_id);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_voter_ip ON votes(voter_ip);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

-- Create unique constraint to prevent duplicate votes
-- One vote per poll per IP address for anonymous users
CREATE UNIQUE INDEX idx_votes_unique_anonymous ON votes(poll_id, voter_ip) 
WHERE voter_id IS NULL;

-- One vote per poll per authenticated user
CREATE UNIQUE INDEX idx_votes_unique_authenticated ON votes(poll_id, voter_id) 
WHERE voter_id IS NOT NULL;

-- Create updated_at trigger for polls
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON polls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
-- Anyone can read active polls
CREATE POLICY "Anyone can view active polls" ON polls
    FOR SELECT USING (is_active = true);

-- Users can view their own polls (including inactive ones)
CREATE POLICY "Users can view own polls" ON polls
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own polls
CREATE POLICY "Users can insert own polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own polls
CREATE POLICY "Users can update own polls" ON polls
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own polls
CREATE POLICY "Users can delete own polls" ON polls
    FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
-- Anyone can view votes for active polls
CREATE POLICY "Anyone can view votes for active polls" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_active = true
        )
    );

-- Poll owners can view all votes for their polls
CREATE POLICY "Poll owners can view votes for their polls" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = votes.poll_id 
            AND polls.user_id = auth.uid()
        )
    );

-- Anyone can insert votes for active polls
CREATE POLICY "Anyone can vote on active polls" ON votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_active = true
        )
    );

-- Create a view for poll results
CREATE VIEW poll_results AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.options,
    p.created_at,
    p.updated_at,
    p.user_id,
    p.is_active,
    COALESCE(vote_counts.counts, '[]'::jsonb) as vote_counts,
    COALESCE(vote_counts.total_votes, 0) as total_votes
FROM polls p
LEFT JOIN (
    SELECT 
        poll_id,
        jsonb_object_agg(option_index::text, vote_count) as counts,
        SUM(vote_count) as total_votes
    FROM (
        SELECT 
            poll_id,
            option_index,
            COUNT(*) as vote_count
        FROM votes
        GROUP BY poll_id, option_index
    ) vote_summary
    GROUP BY poll_id
) vote_counts ON p.id = vote_counts.poll_id;
