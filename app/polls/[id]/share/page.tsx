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

import { Copy, Download, Share2, Twitter, Facebook, Mail, ArrowLeft } from "lucide-react";

// ... (imports)

export default function SharePollPage() {
  // ... (state and useEffects)

  if (!user) {
    router.push("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading share page...</p>
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

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Share Your Poll</CardTitle>
          <CardDescription>
            Share "{poll.title}" with others so they can vote.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Poll URL Section */}
          <div className="space-y-2">
            <Label htmlFor="poll-url">Poll URL</Label>
            <div className="flex gap-2">
              <Input
                id="poll-url"
                value={pollUrl}
                readOnly
                className="bg-input flex-1"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <Label>QR Code</Label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center space-y-4">
                <div className="border rounded-lg p-2 bg-white">
                  <canvas ref={canvasRef} />
                </div>
                <Button onClick={downloadQRCode} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>
              
              <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground">How to use the QR Code:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Print and display in physical locations.</li>
                  <li>Share in presentations or documents.</li>
                  <li>People can scan with their phone camera.</li>
                  <li>Direct link to your poll for easy voting.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-4">
            <Label>More Share Options</Label>
            <div className="flex flex-wrap gap-2">
              {navigator.share && (
                <Button onClick={shareNative} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via Device
                </Button>
              )}
              <Button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote on my poll: ${poll.title}`)}&url=${encodeURIComponent(pollUrl)}`, '_blank')}
                variant="outline"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`, '_blank')}
                variant="outline"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(poll.title)}&body=${encodeURIComponent(`Vote on this poll: ${pollUrl}`)}`, '_blank')}
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push("/polls")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Polls
            </Button>
            <Button onClick={() => router.push(`/polls/${pollId}`)}>
              View Poll Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
