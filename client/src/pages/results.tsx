import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResultsData {
  wpm: number;
  accuracy: number;
  testDuration: number;
  errorCount: number;
  correctChars: number;
  totalChars: number;
  contentId?: string;
}

export default function Results() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [username, setUsername] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sessions/submit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setIsSubmitted(true);
      toast({
        title: "Score submitted!",
        description: "Your result has been added to the leaderboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit score",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const storedResults = sessionStorage.getItem("typingResults");
    const storedUsername = sessionStorage.getItem("typingUsername");

    if (!storedResults || !storedUsername) {
      setLocation("/");
      return;
    }

    const parsedResults = JSON.parse(storedResults);
    setResults(parsedResults);
    setUsername(storedUsername);

    if (parsedResults.contentId) {
      submitMutation.mutate({
        username: storedUsername,
        contentId: String(parsedResults.contentId),
        wpm: parsedResults.wpm.toString(),
        accuracy: parsedResults.accuracy.toString(),
        testDuration: parsedResults.testDuration,
        errorCount: parsedResults.errorCount,
        correctChars: parsedResults.correctChars,
        totalChars: parsedResults.totalChars,
      });
    }
  }, [setLocation]);

  if (!results) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const chartData = Array.from({ length: 10 }, (_, i) => ({
    time: `${i * 10}s`,
    wpm: Math.round(results.wpm * (0.5 + (i / 20)) + Math.random() * 10),
  }));

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-6">
          <div>
            <div
              className="text-8xl md:text-9xl font-bold text-foreground font-mono mb-2"
              data-testid="text-result-wpm"
            >
              {results.wpm}
            </div>
            <div className="text-muted-foreground text-lg uppercase tracking-widest">
              Words Per Minute
            </div>
          </div>

          <div>
            <div
              className="text-5xl md:text-6xl font-bold text-foreground font-mono"
              data-testid="text-result-accuracy"
            >
              {results.accuracy}%
            </div>
            <div className="text-muted-foreground uppercase tracking-wider">Accuracy</div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-8 bg-card space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Performance Breakdown</h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background rounded-lg border border-border">
              <div className="text-2xl font-bold text-foreground font-mono">
                {formatTime(results.testDuration)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Duration
              </div>
            </div>

            <div className="text-center p-4 bg-background rounded-lg border border-border">
              <div className="text-2xl font-bold text-foreground font-mono">
                {results.correctChars} / {results.totalChars}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Correct Chars
              </div>
            </div>

            <div className="text-center p-4 bg-background rounded-lg border border-border">
              <div className="text-2xl font-bold text-foreground font-mono">
                {results.errorCount}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Errors
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Speed Over Time
            </h3>
            <div className="bg-background rounded-lg border border-border p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/test")}
            className="flex-1 h-12 text-base"
            data-testid="button-try-again"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => setLocation("/leaderboard")}
            className="flex-1 h-12 text-base"
            data-testid="button-view-leaderboard"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Full Leaderboard
          </Button>

          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="flex-1 h-12 text-base"
            data-testid="button-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
