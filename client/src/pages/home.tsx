import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Upload, Keyboard } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");

  const handleStartTest = () => {
    if (username.trim()) {
      sessionStorage.setItem("typingUsername", username.trim());
      setLocation("/test");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      handleStartTest();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Keyboard className="w-10 h-10 text-foreground" />
            <h1 className="text-4xl md:text-5xl font-mono font-semibold text-foreground tracking-tight">
              TypeSpeed
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Type your words. Own the leaderboard.
          </p>
        </div>

        <div className="space-y-6 border border-border rounded-xl p-8 bg-card">
          <div className="space-y-3">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-muted-foreground uppercase tracking-wide"
            >
              Enter Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Your display name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 text-base bg-background border-input focus:border-foreground transition-colors"
              autoFocus
              data-testid="input-username"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleStartTest}
              disabled={!username.trim()}
              className="w-full h-12 text-base font-medium"
              data-testid="button-start-test"
            >
              Start Typing Test
            </Button>

            <Button
              variant="outline"
              onClick={() => setLocation("/leaderboard")}
              className="w-full h-12 text-base font-medium"
              data-testid="button-view-leaderboard"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/upload")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-upload-content"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Custom Text
          </Button>
        </div>
      </div>
    </div>
  );
}
