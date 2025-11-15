import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState("wpm");
  const [limit, setLimit] = useState("50");

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", { sortBy, limit }],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?sort_by=${sortBy}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-mono font-semibold text-foreground">
                Global Leaderboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Top performers ranked by {sortBy === "wpm" ? "WPM" : "Accuracy"}
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]" data-testid="select-sort">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wpm">By WPM</SelectItem>
                  <SelectItem value="accuracy">By Accuracy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-[120px]" data-testid="select-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">Top 25</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="text-muted-foreground animate-pulse">Loading leaderboard...</div>
            </div>
          ) : entries && entries.length > 0 ? (
            <>
              <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-muted/20 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <div>Rank</div>
                <div>Username</div>
                <div className="text-right">WPM</div>
                <div className="text-right">Accuracy</div>
                <div className="text-right">Date</div>
              </div>

              <div className="divide-y divide-border">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;

                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 p-4 hover-elevate transition-all ${
                        isTopThree ? "bg-accent/5" : ""
                      }`}
                      data-testid={`row-leaderboard-${index}`}
                    >
                      <div className="flex items-center gap-3 md:col-span-1">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {getRankIcon(rank)}
                          <span
                            className={`font-bold ${
                              isTopThree ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            #{rank}
                          </span>
                        </div>
                        <div className="md:hidden text-foreground font-medium">
                          {entry.username}
                        </div>
                      </div>

                      <div className="hidden md:block text-foreground font-medium">
                        {entry.username}
                      </div>

                      <div className="flex md:block justify-between md:text-right">
                        <span className="md:hidden text-sm text-muted-foreground uppercase tracking-wide">
                          WPM
                        </span>
                        <span className="font-mono font-bold text-foreground text-lg md:text-base">
                          {parseFloat(entry.wpm.toString())}
                        </span>
                      </div>

                      <div className="flex md:block justify-between md:text-right">
                        <span className="md:hidden text-sm text-muted-foreground uppercase tracking-wide">
                          Accuracy
                        </span>
                        <span className="text-muted-foreground">
                          {parseFloat(entry.accuracy.toString())}%
                        </span>
                      </div>

                      <div className="flex md:block justify-between md:text-right">
                        <span className="md:hidden text-sm text-muted-foreground uppercase tracking-wide">
                          Date
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.completedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No entries yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to complete a typing test!
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-start-first">
                Start Your First Test
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
