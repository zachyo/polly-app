"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pollsApi, type PollWithResults } from "@/lib/database";
import { useAuth } from "@/lib/auth-context";
import { PollResultsChart } from "@/components/poll-results-chart";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [poll, setPoll] = useState<PollWithResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const pollId = params.id as string;

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const pollData = await pollsApi.getPollWithResults(pollId);
        
        if (!pollData) {
          setError("Poll not found");
          return;
        }

        setPoll(pollData);

        // Check if user has already voted
        const voted = await pollsApi.hasUserVoted(pollId);
        setHasVoted(voted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  const handleVote = async (optionIndex: number) => {
    if (hasVoted || !poll) return;

    setVoting(true);
    try {
      await pollsApi.submitVote({
        poll_id: pollId,
        option_index: optionIndex,
      });

      setHasVoted(true);
      
      // Refresh poll data to show updated results
      const updatedPoll = await pollsApi.getPollWithResults(pollId);
      if (updatedPoll) {
        setPoll(updatedPoll);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const getVotePercentage = (optionIndex: number): number => {
    if (!poll || poll.total_votes === 0) return 0;
    const votes = poll.vote_counts[optionIndex.toString()] || 0;
    return Math.round((votes / poll.total_votes) * 100);
  };

  const getVoteCount = (optionIndex: number): number => {
    if (!poll) return 0;
    return poll.vote_counts[optionIndex.toString()] || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center">Loading poll...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error || "Poll not found"}</p>
            <Button onClick={() => router.push("/polls")}>
              Back to Polls
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === poll.user_id;
  const canVote = poll.is_active && !hasVoted && !isOwner;
  const showResults = hasVoted || isOwner || !poll.is_active;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="mt-2 text-base">
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded ${
                poll.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {poll.is_active ? 'Active' : 'Inactive'}
              </span>
              {isOwner && (
                <p className="text-xs text-gray-500 mt-1">You own this poll</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600 mb-4">
            Total votes: {poll.total_votes}
          </div>

          <div className="space-y-3">
            {poll.options.map((option, index) => {
              const voteCount = getVoteCount(index);
              const percentage = getVotePercentage(index);
              
              return (
                <div key={index} className="space-y-2">
                  {canVote ? (
                    <Button
                      variant="outline"
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => handleVote(index)}
                      disabled={voting}
                    >
                      {option}
                    </Button>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{option}</span>
                        {showResults && (
                          <span className="text-sm text-gray-600">
                            {voteCount} votes ({percentage}%)
                          </span>
                        )}
                      </div>
                      {showResults && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasVoted && !isOwner && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Thank you for voting! Results are shown above.
            </div>
          )}

          {!poll.is_active && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              This poll is no longer active.
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push("/polls")}>
              Back to Polls
            </Button>
            {isOwner && (
              <Button variant="outline" onClick={() => router.push(`/polls/${pollId}/share`)}>
                Share Poll
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Chart - Show for owners or when poll has votes */}
      {(isOwner || poll.total_votes > 0) && (
        <div className="mt-6">
          <PollResultsChart poll={poll} />
        </div>
      )}
    </div>
  );
}
