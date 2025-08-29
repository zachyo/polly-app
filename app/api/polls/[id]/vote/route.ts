import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { option_index } = await request.json();
    const pollId = params.id;

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    const supabase = await createClient();
    
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Validate poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, is_active')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (!poll.is_active) {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      );
    }

    // Check if user/IP has already voted
    let existingVoteQuery = supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId);

    if (user) {
      existingVoteQuery = existingVoteQuery.eq('voter_id', user.id);
    } else {
      existingVoteQuery = existingVoteQuery.eq('voter_ip', ip);
    }

    const { data: existingVote } = await existingVoteQuery.single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 400 }
      );
    }

    // Submit the vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_index,
        voter_id: user?.id || null,
        voter_ip: user ? null : ip, // Only store IP for anonymous users
      })
      .select()
      .single();

    if (voteError) {
      console.error('Vote submission error:', voteError);
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
