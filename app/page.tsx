import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Polly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create engaging polls, share them with QR codes, and see real-time results.
            Perfect for events, classrooms, meetings, and social gatherings.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/polls">
              <Button size="lg" className="text-lg px-8 py-3">
                Browse Polls
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Create Polls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build custom polls with multiple options. Add descriptions and manage
                your polls with an intuitive interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                QR Code Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate QR codes for instant sharing. Perfect for physical events,
                presentations, or anywhere you need quick access.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Real-time Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Watch results update live as votes come in. Beautiful charts and
                statistics help you understand the data.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">Create your free account to get started</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Create Poll</h3>
              <p className="text-gray-600 text-sm">Add your question and answer options</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Share</h3>
              <p className="text-gray-600 text-sm">Use QR codes or direct links to share</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Analyze</h3>
              <p className="text-gray-600 text-sm">View real-time results and insights</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Create Your First Poll?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users who trust Polly for their polling needs.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Creating Polls
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
