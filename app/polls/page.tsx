
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { pollsApi, type Poll } from "@/lib/database";
import { useAuth } from "@/lib/auth-context";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const data = user
          ? await pollsApi.getUserPolls()
          : await pollsApi.getActivePolls();
        setPolls(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [user]);

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;

    try {
      await pollsApi.deletePoll(pollId);
      setPolls(polls.filter(poll => poll.id !== pollId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTogglePollStatus = async (pollId: string) => {
    try {
      const updatedPoll = await pollsApi.togglePollStatus(pollId);
      setPolls(polls.map(poll =>
        poll.id === pollId ? updatedPoll : poll
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center">Loading polls...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {user ? "My Polls" : "Available Polls"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user
              ? "Manage your polls and view results"
              : "Cast your vote and make your voice heard!"
            }
          </p>
        </div>
        {user && (
          <Link href="/polls/new">
            <Button className="mt-4 md:mt-0">Create New Poll</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {user ? "You haven't created any polls yet." : "No polls available."}
          </p>
          {user && (
            <Link href="/polls/new">
              <Button>Create Your First Poll</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{poll.title}</span>
                  {user && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      poll.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {poll.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </CardTitle>
                {poll.description && (
                  <CardDescription>{poll.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {poll.options.length} options
                </p>
                <p className="text-xs text-gray-500">
                  Created {new Date(poll.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/polls/${poll.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    {user ? "View Results" : "Vote"}
                  </Button>
                </Link>
                {user && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePollStatus(poll.id)}
                    >
                      {poll.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePoll(poll.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
