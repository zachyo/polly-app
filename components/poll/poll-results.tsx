
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PollOption from './poll-option';
import PollChart from './poll-chart';
import { Poll } from '@/lib/types';

interface PollResultsProps {
  pollId: string;
}

const PollResults = ({ pollId }: PollResultsProps) => {
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();
      if (data) {
        setPoll(data);
      }
    };

    fetchPoll();

    const channel = supabase
      .channel(`poll_${pollId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls', filter: `id=eq.${pollId}` }, (payload) => {
        setPoll(payload.new as Poll);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{poll.question}</h1>
      <div>
        {poll.options.map((option) => (
          <PollOption key={option.id} option={option} pollId={pollId} />
        ))}
      </div>
      <PollChart poll={poll} />
    </div>
  );
};

export default PollResults;
