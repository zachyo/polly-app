import { createClient } from './supabase/client'
import { Poll, Vote, PollWithResults, CreatePollData, VoteData } from './types'

export * from './types';

// Client-side functions
export const pollsApi = {
  // Get all active polls
  async getActivePolls(): Promise<Poll[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get user's polls
  async getUserPolls(): Promise<Poll[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get poll by ID with results
  async getPollWithResults(id: string): Promise<PollWithResults | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('poll_results')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Create a new poll
  async createPoll(pollData: CreatePollData): Promise<Poll> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('polls')
      .insert({
        ...pollData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a poll
  async updatePoll(id: string, updates: Partial<CreatePollData>): Promise<Poll> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('polls')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a poll
  async deletePoll(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Toggle poll active status
  async togglePollStatus(id: string): Promise<Poll> {
    const supabase = createClient()
    
    // First get current status
    const { data: poll, error: fetchError } = await supabase
      .from('polls')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Toggle the status
    const { data, error } = await supabase
      .from('polls')
      .update({ is_active: !poll.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Submit a vote via API route (handles IP tracking)
  async submitVote(voteData: VoteData): Promise<Vote> {
    const response = await fetch(`/api/polls/${voteData.poll_id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        option_index: voteData.option_index,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit vote');
    }

    const { vote } = await response.json();
    return vote;
  },

  // Check if user has already voted
  async hasUserVoted(pollId: string, voterIp?: string): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)

    if (user) {
      query = query.eq('voter_id', user.id)
    } else if (voterIp) {
      query = query.eq('voter_ip', voterIp)
    } else {
      return false
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}

