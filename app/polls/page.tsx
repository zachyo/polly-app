
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
import { pollsApi } from "@/lib/database";
import { Poll } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

import { BarChart, Trash2, Power, PowerOff } from "lucide-react";

// ... (imports)

export default function PollsPage() {
  // ... (state and useEffect)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading polls...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user ? "My Polls" : "Available Polls"}
          </h1>
          <p className="text-muted-foreground">
            {user
              ? "Manage your polls and view their results."
              : "Cast your vote and make your voice heard!"}
          </p>
        </div>
        {user && (
          <Link href="/polls/new">
            <Button className="mt-4 md:mt-0">Create New Poll</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-semibold">
            {user ? "You haven't created any polls yet." : "No polls available."}
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {user ? "Get started by creating your first poll." : "Check back later for new polls."}
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
            <Card key={poll.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{poll.title}</span>
                  {user && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        poll.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {poll.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </CardTitle>
                {poll.description && (
                  <CardDescription className="truncate h-10">
                    {poll.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  <span>{poll.options.length} options</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
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
                      size="icon"
                      onClick={() => handleTogglePollStatus(poll.id)}
                      title={poll.is_active ? "Deactivate" : "Activate"}
                    >
                      {poll.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeletePoll(poll.id)}
                      title="Delete Poll"
                    >
                      <Trash2 className="w-4 h-4" />
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
