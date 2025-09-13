import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, QrCode, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Create, Share, and Analyze Polls with{" "}
            <span className="text-primary">Polly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Engage your audience with real-time polls. Perfect for events,
            classrooms, and meetings. Share with a QR code and see results
            instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/polls/new">
              <Button size="lg">Create a Poll</Button>
            </Link>
            <Link href="/polls">
              <Button variant="outline" size="lg">
                Browse Polls
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why You'll Love Polly
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything you need for effective polling.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-6 h-6 text-primary" />
                  Real-time Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Watch results update live as votes come in. Beautiful charts
                  and statistics help you understand the data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-primary" />
                  QR Code Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate QR codes for instant sharing. Perfect for physical
                  events, presentations, or anywhere you need quick access.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-primary" />
                  Easy to Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share your polls with a simple link. No need for your
                  audience to sign up or install anything.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Create</h3>
              <p className="text-muted-foreground text-sm">
                Build your poll with a question and options.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Share</h3>
              <p className="text-muted-foreground text-sm">
                Share the poll with a link or QR code.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Vote</h3>
              <p className="text-muted-foreground text-sm">
                Anyone with the link can vote.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-lg mb-2">Analyze</h3>
              <p className="text-muted-foreground text-sm">
                See the results in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your First Poll?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join thousands of users who trust Polly for their polling needs.
          </p>
          <Link href="/polls/new">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3"
            >
              Start Creating Polls
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
