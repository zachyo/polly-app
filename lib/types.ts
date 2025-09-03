export interface Poll {
  id: string
  title: string
  description?: string
  options: string[]
  created_at: string
  updated_at: string
  user_id: string
  is_active: boolean
}

export interface Vote {
  id: string
  poll_id: string
  option_index: number
  voter_ip?: string
  voter_id?: string
  created_at: string
}

export interface PollWithResults extends Poll {
  vote_counts: { [key: string]: number }
  total_votes: number
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[]
}

export interface VoteData {
  poll_id: string
  option_index: number
  voter_ip?: string
}

// Form validation schemas
export interface PollFormData {
  title: string
  description: string
  options: string[]
}