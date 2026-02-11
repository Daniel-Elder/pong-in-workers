import { useEffect, useRef, useState } from "react";
import { useCreateScore } from "@/hooks/use-scores";
import { ArcadeButton } from "./ArcadeButton";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Send } from "lucide-react";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 12;
const WIN_SCORE = 10;
const AI_SPEED = 4.5;
const PLAYER_SPEED = 8;

interface GameState {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  playerScore: number;
  aiScore: number;
  isPlaying: boolean;
  gameOver: boolean;
  winner: "player" | "ai" | null;
}

export default function PongGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mutate: submitScore, isPending } = useCreateScore();
  const { toast } = useToast();
  const [initials, setInitials] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    playerY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballSpeedX: 5,
    ballSpeedY: 5,
    playerScore: 0,
    aiScore: 0,
    isPlaying: false,
    gameOver: false,
    winner: null,
  });

  const stateRef = useRef(gameState);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number>();

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const playSound = (freq: number, type: OscillatorType = "square") => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const loop = () => {
      const state = stateRef.current;

      if (keysPressed.current["ArrowUp"] || keysPressed.current["w"] || keysPressed.current["W"]) {
        state.playerY = Math.max(0, state.playerY - PLAYER_SPEED);
      }
      if (keysPressed.current["ArrowDown"] || keysPressed.current["s"] || keysPressed.current["S"]) {
        state.playerY = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.playerY + PLAYER_SPEED);
      }

      const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
      if (aiCenter < state.ballY - 35) {
        state.aiY += AI_SPEED;
      } else if (aiCenter > state.ballY + 35) {
        state.aiY -= AI_SPEED;
      }
      state.aiY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.aiY));

      state.ballX += state.ballSpeedX;
      state.ballY += state.ballSpeedY;

      if (state.ballY <= 0 || state.ballY >= GAME_HEIGHT - BALL_SIZE) {
        state.ballSpeedY = -state.ballSpeedY;
        playSound(200);
      }

      if (
        state.ballX <= PADDLE_WIDTH + 10 &&
        state.ballY + BALL_SIZE >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT &&
        state.ballSpeedX < 0
      ) {
        state.ballSpeedX = -state.ballSpeedX * 1.05;
        const deltaY = state.ballY - (state.playerY + PADDLE_HEIGHT / 2);
        state.ballSpeedY = deltaY * 0.35;
        playSound(400);
      }

      if (
        state.ballX >= GAME_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE &&
        state.ballY + BALL_SIZE >= state.aiY &&
        state.ballY <= state.aiY + PADDLE_HEIGHT &&
        state.ballSpeedX > 0
      ) {
        state.ballSpeedX = -state.ballSpeedX * 1.05;
        const deltaY = state.ballY - (state.aiY + PADDLE_HEIGHT / 2);
        state.ballSpeedY = deltaY * 0.35;
        playSound(400);
      }

      if (state.ballX < 0) {
        state.aiScore += 1;
        playSound(100, "sawtooth");
        resetBall(state);
      } else if (state.ballX > GAME_WIDTH) {
        state.playerScore += 1;
        playSound(600, "sine");
        resetBall(state);
      }

      if (state.playerScore >= WIN_SCORE || state.aiScore >= WIN_SCORE) {
        state.gameOver = true;
        state.winner = state.playerScore >= WIN_SCORE ? "player" : "ai";
        state.isPlaying = false;
        setGameState({ ...state });
      }

      draw(state);

      if (!state.gameOver) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState.isPlaying, gameState.gameOver]);

  const resetBall = (state: GameState) => {
    state.ballX = GAME_WIDTH / 2;
    state.ballY = GAME_HEIGHT / 2;
    state.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    state.ballSpeedY = (Math.random() * 2 - 1) * 5;
    setGameState({ ...state });
  };

  const draw = (state: GameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.strokeStyle = "#39ff14";
    ctx.setLineDash([10, 15]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();

    ctx.fillStyle = "#39ff14";
    ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(GAME_WIDTH - PADDLE_WIDTH - 10, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);
  };

  const startGame = () => {
    setGameState({
      playerY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballSpeedX: 5,
      ballSpeedY: 5,
      playerScore: 0,
      aiScore: 0,
      isPlaying: true,
      gameOver: false,
      winner: null,
    });
  };

  const handleScoreSubmit = () => {
    if (!initials) {
      toast({ title: "Error", description: "Please enter your initials", variant: "destructive" });
      return;
    }
    submitScore(
      { initials: initials.toUpperCase(), score: gameState.playerScore },
      {
        onSuccess: () => {
          toast({ title: "Score Saved!", description: "You are now on the leaderboard." });
          onExit();
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-background text-primary">
      <div className="flex justify-between w-full max-w-[800px] mb-4 text-4xl md:text-6xl font-mono">
        <div className="glow-text" data-testid="text-player-score">{gameState.playerScore}</div>
        <div className="text-xl md:text-2xl mt-4 opacity-50">FIRST TO 10</div>
        <div className="glow-text" data-testid="text-ai-score">{gameState.aiScore}</div>
      </div>

      <div className="relative arcade-border bg-black">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-auto max-w-[800px] max-h-[600px] block"
          data-testid="canvas-pong-game"
        />

        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h1 className="text-6xl md:text-8xl mb-8 glow-text animate-pulse">PONG</h1>
            <div className="flex flex-col gap-4">
              <ArcadeButton onClick={startGame} size="lg" data-testid="button-start-game">Insert Coin / Start</ArcadeButton>
              <ArcadeButton onClick={onExit} variant="secondary" data-testid="button-back-menu">Back to Menu</ArcadeButton>
            </div>
            <p className="mt-8 text-sm opacity-60">CONTROLS: W/S or UP/DOWN</p>
          </div>
        )}

        {gameState.gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
            <h2 className="text-5xl md:text-7xl mb-8 text-primary glow-text" data-testid="text-game-result">
              {gameState.winner === "player" ? "YOU WIN" : "GAME OVER"}
            </h2>

            {gameState.winner === "player" && (
              <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-xs animate-in fade-in zoom-in duration-500">
                <p className="text-lg mb-2">ENTER INITIALS</p>
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-b-4 border-primary text-center text-4xl p-2 outline-none font-mono uppercase focus:border-white transition-colors"
                  placeholder="_ _ _"
                  autoFocus
                  data-testid="input-initials"
                />
                <ArcadeButton
                  onClick={handleScoreSubmit}
                  disabled={isPending || initials.length === 0}
                  className="w-full mt-4"
                  data-testid="button-submit-score"
                >
                  {isPending ? "SAVING..." : "SUBMIT SCORE"} <Send className="w-4 h-4 ml-2 inline" />
                </ArcadeButton>
              </div>
            )}

            <div className="flex gap-4">
              <ArcadeButton onClick={startGame} data-testid="button-replay"><RefreshCw className="mr-2 w-4 h-4 inline" /> REPLAY</ArcadeButton>
              <ArcadeButton onClick={onExit} variant="secondary" data-testid="button-exit">EXIT</ArcadeButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
