"use client";

import { useParams } from "next/navigation";
import PollResults from "@/components/poll/poll-results";

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <PollResults pollId={pollId} />
    </div>
  );
}
