"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Mail, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SubmitResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

export default function Home() {
  const [channel, setChannel] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SubmitResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel, email }),
      });

      const data: SubmitResponse = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: "Failed to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-blue-100/20"></div>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Youtube className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            YouTube Title Architect
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            <Sparkles className="inline h-4 w-4 mr-1" />
            Improve your YouTube video titles with AI-powered suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="channel" className="flex items-center gap-2 text-gray-700 font-medium">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube Channel
              </Label>
              <Input
                id="channel"
                type="text"
                placeholder="Enter channel name or @handle"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-sm text-gray-500">
                Enter your YouTube channel name or handle (e.g., "PewDiePie" or "@MrBeast")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                <Mail className="h-4 w-4 text-blue-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-sm text-gray-500">
                We'll send the improved titles to this email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Improved Titles
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {response && (
            <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
              response.success
                ? "bg-green-50 border-green-200 text-green-800 shadow-md"
                : "bg-red-50 border-red-200 text-red-800 shadow-md"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {response.success ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <p className="font-semibold">
                  {response.success ? "Success!" : "Error"}
                </p>
              </div>
              <p className="text-sm">
                {response.message || response.error}
              </p>
              {response.jobId && (
                <div className="mt-3 p-2 bg-gray-100 rounded font-mono text-xs">
                  Job ID: {response.jobId}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Powered by AI</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>Results sent via email</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                <Youtube className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
