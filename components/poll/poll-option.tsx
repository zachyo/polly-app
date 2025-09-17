
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PollOption } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface PollOptionProps {
  option: PollOption;
  pollId: string;
}

const PollOptionComponent = ({ option, pollId }: PollOptionProps) => {
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    const { error } = await supabase.rpc('vote', { poll_id: pollId, option_id: option.id });
    if (!error) {
      setVoted(true);
    }
  };

  if (voted) {
    return (
      <div>
        <span>{option.text}</span>
        <span>{option.votes}</span>
      </div>
    );
  }

  return (
    <div>
      <span>{option.text}</span>
      <Button onClick={handleVote}>Vote</Button>
    </div>
  );
};

export default PollOptionComponent;
