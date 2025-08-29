"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pollsApi, type Poll } from "@/lib/database";
import { useAuth } from "@/lib/auth-context";
import QRCode from "qrcode";

export default function SharePollPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const pollId = params.id as string;
  const pollUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/polls/${pollId}`
    : '';

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const pollData = await pollsApi.getPollWithResults(pollId);
        
        if (!pollData) {
          setError("Poll not found");
          return;
        }

        // Check if user owns this poll
        if (pollData.user_id !== user?.id) {
          setError("You don't have permission to share this poll");
          return;
        }

        setPoll(pollData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pollId && user) {
      fetchPoll();
    }
  }, [pollId, user]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (pollUrl && canvasRef.current && !qrGenerated) {
        try {
          await QRCode.toCanvas(canvasRef.current, pollUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrGenerated(true);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
    };

    generateQRCode();
  }, [pollUrl, qrGenerated]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `poll-${pollId}-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const shareNative = async () => {
    if (navigator.share && poll) {
      try {
        await navigator.share({
          title: poll.title,
          text: poll.description || 'Vote on this poll!',
          url: pollUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  if (!user) {
    router.push("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center">Loading...</div>
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

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Poll</CardTitle>
          <CardDescription>
            Share "{poll.title}" with others so they can vote
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Poll URL Section */}
          <div className="space-y-2">
            <Label htmlFor="poll-url">Poll URL</Label>
            <div className="flex gap-2">
              <Input
                id="poll-url"
                value={pollUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <Label>QR Code</Label>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                  />
                </div>
                <Button onClick={downloadQRCode} variant="outline" size="sm">
                  Download QR Code
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="font-medium">How to use the QR Code:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Print and display in physical locations</li>
                  <li>• Share in presentations or documents</li>
                  <li>• People can scan with their phone camera</li>
                  <li>• Direct link to your poll for easy voting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-4">
            <Label>Share Options</Label>
            <div className="flex flex-wrap gap-2">
              {navigator.share && (
                <Button onClick={shareNative} variant="outline">
                  Share via Device
                </Button>
              )}
              <Button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote on my poll: ${poll.title}`)}&url=${encodeURIComponent(pollUrl)}`, '_blank')}
                variant="outline"
              >
                Share on Twitter
              </Button>
              <Button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`, '_blank')}
                variant="outline"
              >
                Share on Facebook
              </Button>
              <Button
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(poll.title)}&body=${encodeURIComponent(`Vote on this poll: ${pollUrl}`)}`, '_blank')}
                variant="outline"
              >
                Share via Email
              </Button>
            </div>
          </div>

          {/* Poll Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Poll Status</h3>
            <div className="flex items-center justify-between">
              <span className={`text-sm px-2 py-1 rounded ${
                poll.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {poll.is_active ? 'Active - Accepting Votes' : 'Inactive - Not Accepting Votes'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/polls/${pollId}`)}
              >
                View Poll
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push("/polls")}>
              Back to My Polls
            </Button>
            <Button variant="outline" onClick={() => router.push(`/polls/${pollId}`)}>
              View Poll Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
