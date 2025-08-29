import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
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

export interface PollWithVotes extends Poll {
  votes: Vote[]
  vote_counts: { [key: number]: number }
  total_votes: number
}
