import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { UploadedContent } from "@shared/schema";

interface CharacterState {
  char: string;
  status: "pending" | "correct" | "incorrect";
}

export default function TypingTest() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charStates, setCharStates] = useState<CharacterState[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: content, isLoading } = useQuery<UploadedContent>({
    queryKey: ["/api/content/random"],
  });

  useEffect(() => {
    if (content?.content) {
      setCharStates(
        content.content.split("").map((char) => ({
          char,
          status: "pending",
        }))
      );
    }
  }, [content]);

  useEffect(() => {
    if (startTime && !isFinished) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);

        const correctChars = charStates.filter((c) => c.status === "correct").length;
        const wordsTyped = correctChars / 5;
        const minutes = elapsed / 60;
        const currentWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        setWpm(currentWpm);

        const totalTyped = charStates.filter((c) => c.status !== "pending").length;
        const currentAccuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
        setAccuracy(currentAccuracy);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [startTime, isFinished, charStates]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isFinished || !charStates.length) return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (currentIndex > 0) {
          const newStates = [...charStates];
          newStates[currentIndex - 1].status = "pending";
          setCharStates(newStates);
          setCurrentIndex(currentIndex - 1);
        }
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        const expectedChar = charStates[currentIndex].char;
        const isCorrect = e.key === expectedChar;

        const newStates = [...charStates];
        newStates[currentIndex].status = isCorrect ? "correct" : "incorrect";
        setCharStates(newStates);

        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);

        if (newIndex === charStates.length) {
          setIsFinished(true);
          const finalElapsed = (Date.now() - (startTime || Date.now())) / 1000;
          const correctChars = newStates.filter((c) => c.status === "correct").length;
          const errorCount = newStates.filter((c) => c.status === "incorrect").length;

          sessionStorage.setItem(
            "typingResults",
            JSON.stringify({
              wpm: Math.round((correctChars / 5) / (finalElapsed / 60)),
              accuracy: Math.round((correctChars / newStates.length) * 100),
              testDuration: Math.round(finalElapsed),
              errorCount,
              correctChars,
              totalChars: newStates.length,
              contentId: content?.id,
            })
          );

          setTimeout(() => setLocation("/results"), 500);
        }
      }
    },
    [currentIndex, charStates, isFinished, startTime, content, setLocation]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleRestart = () => {
    setCurrentIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    if (content?.content) {
      setCharStates(
        content.content.split("").map((char) => ({
          char,
          status: "pending",
        }))
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = charStates.length > 0 ? (currentIndex / charStates.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading test...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2 text-foreground">
          <Timer className="w-4 h-4" />
          <span className="font-mono text-lg font-medium">{formatTime(elapsedTime)}</span>
        </div>
        <div className="text-muted-foreground text-sm">{content?.title || "Typing Test"}</div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            data-testid="button-restart"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-exit"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-24">
        <div className="w-full max-w-4xl">
          <div
            className="text-2xl md:text-3xl font-mono leading-relaxed tracking-wide select-none"
            data-testid="text-typing-area"
          >
            {charStates.map((charState, index) => {
              let className = "transition-colors duration-75";

              if (index < currentIndex) {
                if (charState.status === "correct") {
                  className += " text-foreground";
                } else {
                  className += " text-red-500";
                }
              } else if (index === currentIndex) {
                className += " text-foreground border-b-2 border-foreground";
              } else {
                className += " text-muted-foreground";
              }

              return (
                <span key={index} className={className}>
                  {charState.char}
                </span>
              );
            })}
          </div>
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute"
            autoFocus
            data-testid="input-typing"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="h-1 bg-foreground" style={{ width: `${progress}%` }} />
        <div className="flex items-center justify-around h-full px-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground font-mono" data-testid="text-wpm">
              {wpm}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground font-mono" data-testid="text-accuracy">
              {accuracy}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">ACC</div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-3xl md:text-4xl font-bold text-foreground font-mono">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
