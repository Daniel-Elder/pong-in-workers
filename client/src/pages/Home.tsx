import { useState } from "react";
import { useScores } from "@/hooks/use-scores";
import PongGame from "@/components/PongGame";
import { ArcadeButton } from "@/components/ArcadeButton";
import { Trophy, Gamepad2, Loader2 } from "lucide-react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: scores, isLoading } = useScores();

  if (isPlaying) {
    return <PongGame onExit={() => setIsPlaying(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background crt-flicker">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-bold text-primary glow-text tracking-tighter" data-testid="text-title">
              PONG
            </h1>
            <p className="text-muted-foreground text-lg font-display tracking-widest uppercase">
              The Original Electronic Tennis
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <ArcadeButton size="lg" onClick={() => setIsPlaying(true)} data-testid="button-play-game">
              <Gamepad2 className="mr-3 w-6 h-6 inline-block" />
              PLAY GAME
            </ArcadeButton>
          </div>

          <div className="text-xs text-muted-foreground mt-8 font-mono border border-muted p-4 rounded bg-black/50 backdrop-blur">
            <p>SYSTEM READY.</p>
            <p>RAM: 64KB OK</p>
            <p>VIDEO: MONOCHROME</p>
            <p className="animate-pulse mt-2 text-primary">INSERT COIN OR PRESS START</p>
          </div>
        </div>

        <div className="bg-black border-4 border-primary p-6 shadow-[0_0_20px_rgba(57,255,20,0.2)] w-full relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0 opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6 border-b-2 border-primary pb-4">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
              <h2 className="text-2xl text-primary font-bold tracking-widest">HIGH SCORES</h2>
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-primary">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>
            ) : !scores || scores.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-sm" data-testid="text-no-scores">
                NO SCORES RECORDED.<br />BE THE FIRST!
              </div>
            ) : (
              <ul className="space-y-4 font-mono text-lg h-80 overflow-y-auto pr-2 custom-scrollbar" data-testid="list-high-scores">
                {scores.slice(0, 10).map((score, idx) => (
                  <li
                    key={score.id}
                    className="flex justify-between items-center border-b border-primary/20 pb-2 hover:bg-primary/10 transition-colors px-2 cursor-default group"
                    data-testid={`row-score-${idx}`}
                  >
                    <span className="text-primary/70 w-8">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-white group-hover:text-primary transition-colors font-bold tracking-widest">
                      {score.initials}
                    </span>
                    <span className="text-primary glow-text">
                      {String(score.score).padStart(5, '0')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="fixed bottom-4 text-xs text-muted-foreground opacity-40 font-mono">
        PONG - REIMAGINED 2024
      </footer>
    </div>
  );
}
