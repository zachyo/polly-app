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
// Error here
import { pollsApi, type PollWithResults } from "@/lib/database";
import { useAuth } from "@/lib/auth-context";
import { PollResultsChart } from "@/components/poll-results-chart";

import { Share2, ArrowLeft } from "lucide-react";

// ... (imports)

export default function PollPage() {
  // ... (state and useEffect)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading poll...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || "Poll not found"}</p>
        <Button onClick={() => router.push("/polls")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === poll.user_id;
  const canVote = poll.is_active && !hasVoted && !isOwner;
  const showResults = hasVoted || isOwner || !poll.is_active;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="mt-2 text-base">
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  poll.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {poll.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Total votes: {poll.total_votes}
          </div>

          <div className="space-y-3">
            {poll.options.map((option, index) => {
              const voteCount = getVoteCount(index);
              const percentage = getVotePercentage(index);

              return (
                <div key={index}>
                  {canVote ? (
                    <Button
                      variant={selectedOption === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => setSelectedOption(index)}
                    >
                      {option}
                    </Button>
                  ) : (
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{option}</span>
                        {showResults && (
                          <span className="text-sm text-muted-foreground">
                            {voteCount} votes ({percentage}%)
                          </span>
                        )}
                      </div>
                      {showResults && (
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
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

          {canVote && (
            <Button
              className="w-full"
              onClick={() => selectedOption !== null && handleVote(selectedOption)}
              disabled={voting || selectedOption === null}
            >
              {voting ? "Voting..." : "Submit Vote"}
            </Button>
          )}

          {hasVoted && !isOwner && (
            <div className="bg-green-100/50 border border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300 px-4 py-3 rounded-md text-sm">
              Thank you for voting! Results are shown above.
            </div>
          )}

          {!poll.is_active && (
            <div className="bg-yellow-100/50 border border-yellow-200 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-md text-sm">
              This poll is no longer active.
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push("/polls")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Polls
            </Button>
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => router.push(`/polls/${pollId}/share`)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Poll
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(isOwner || (showResults && poll.total_votes > 0)) && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Poll Results</h3>
          <PollResultsChart poll={poll} />
        </div>
      )}
    </div>
  );
}
