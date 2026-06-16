import React, { useEffect, useRef, useState } from "react";
import { 
  Bot, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  Trophy, 
  BookOpen, 
  Award, 
  Sparkles, 
  User, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  BookOpenCheck 
} from "lucide-react";
import Engine from "./GameEngine";
import GestureView, { swipeDirections } from "@/components/GestureView";
import ProceduralAudio from "./ProceduralAudio";

export default function App() {
  const [gameState, setGameState] = useState<"none" | "playing" | "gameOver">("none");
  const [ready, setReady] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem("crossing_school_highscore") || "0");
    } catch {
      return 0;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizNotice, setQuizNotice] = useState<{ text: string; correct: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activePowerUps, setActivePowerUps] = useState<any>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const noticeTimeoutRef = useRef<any>(null);

  // Initialize and handle game lifecycle
  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;

    // Build fresh game engine
    const engine = new Engine();
    engineRef.current = engine;

    // Set callback hooks
    engine.onUpdateScore = (currentScore: number) => {
      setScore(currentScore);
    };

    engine.onGameInit = () => {
      setScore(0);
      setReady(false);
    };

    engine._isGameStateEnded = () => {
      return gameState !== "playing";
    };

    engine.onGameReady = () => {
      setReady(true);
    };

    engine.onGameEnded = () => {
      setGameState("gameOver");
    };

    engine.onQuiz = (q: any) => {
      // Wrap the quiz answer hook to show elegant feedback with delay unpause
      setQuiz({
        prompt: q.prompt,
        answers: q.answers,
        correctIndex: q.correctIndex,
        answer: (index: number) => {
          const correct = index === q.correctIndex;
          setQuizNotice({
            text: correct ? "+10 Điểm! Hoàn toàn chính xác!" : "-3 Điểm! Gần đúng rồi, hãy cố gắng nhé!",
            correct
          });
          
          setTimeout(() => {
            q.answer(index);
            setQuiz(null);
            setQuizNotice(null);
          }, 2000);
        }
      });
    };

    engine.onNotice = (msg: string) => {
      setNotice(msg);
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      noticeTimeoutRef.current = setTimeout(() => {
        setNotice(null);
      }, 3500);
    };

    engine.onPowerUpStateChange = (powers: any) => {
      setActivePowerUps(powers || {});
    };

    // Lazy load Three.js 3D assets & environment map
    engine.setupGame("chicken");

    // Connect standard canvas context
    engine._onGLContextCreate({
      canvas: canvasRef.current,
      drawingBufferWidth: canvasRef.current.clientWidth,
      drawingBufferHeight: canvasRef.current.clientHeight,
    });

    // Fire audio loop on interaction
    if (!isMuted) {
      ProceduralAudio.init();
      // Wait shortly to start music to ensure context runs
      setTimeout(() => {
        try {
          // Play simple procedurally generated background music loop if audio context is running cleanly
          // (This class carries its own state checker)
        } catch (e) {}
      }, 500);
    }

    return () => {
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      if (engineRef.current) {
        if (engineRef.current.raf) {
          cancelAnimationFrame(engineRef.current.raf);
        }
      }
    };
  }, [gameState]);

  // Sync highscore
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem("crossing_school_highscore", String(score));
      } catch {}
    }
  }, [score, highScore]);

  // Audio Toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stopped
      // ProceduralAudio doesn't have an explicit stop, but we can prevent any playBeep sounds
    } else {
      ProceduralAudio.init();
    }
  };

  const handleStartGame = () => {
    try {
      ProceduralAudio.init();
    } catch {}
    setGameState("playing");
  };

  // Touch Swipe interface handler
  const handleSwipe = (direction: string) => {
    if (gameState === "playing" && engineRef.current) {
      engineRef.current.moveWithDirection(direction);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden select-none">
      
      {/* LEFT SIDE PANEL - Branding & Statistics */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          {/* Logo Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                Đường Đến Trường
              </h1>
              <p className="text-xs text-indigo-400 font-mono">Trò chơi voxel 3D vô tận</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4 mb-6">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Kỷ Lục Điểm</p>
                  <p className="text-lg font-bold font-mono text-amber-500">{highScore}</p>
                </div>
              </div>
              <Award className="w-5 h-5 text-slate-750" />
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Điểm Lượt Này</p>
                  <p className="text-xl font-extrabold font-mono text-indigo-400">{score}</p>
                </div>
              </div>
              <Activity className="w-5 h-5 text-indigo-500/20 animate-pulse" />
            </div>
          </div>

          {/* Interactive controls overview */}
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Hướng Dẫn Điều Khiển
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col items-center">
                <span className="text-indigo-400 font-bold">W / ↑</span>
                <span>Nhảy Tiến</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col items-center">
                <span className="text-indigo-400 font-bold">S / ↓</span>
                <span>Nhảy Lùi</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col items-center col-span-2">
                <span className="text-indigo-400 font-bold">A / D / ← / →</span>
                <span>Sang Trái / Phải</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-2.5 text-center leading-relaxed">
              Trên màn hình cảm ứng, vuốt để di chuyển hoặc chạm nhẹ để nhảy tiến lên phía trước.
            </p>
          </div>
        </div>

        {/* Brand credit */}
        <div className="mt-6 md:mt-0 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Học sinh Gà Con</span>
          </div>
          <button 
            onClick={toggleMute}
            className="p-1.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* RIGHT ACTION ROW - 3D Renderer Arena */}
      <div className="flex-1 relative flex flex-col bg-slate-950 justify-center items-center p-4">
        
        {/* State 1: none - Title Screen/Main Board */}
        {gameState === "none" && (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden z-10 flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 relative">
              <BookOpen className="w-8 h-8 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Đường Đến Trường
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
              Sách giáo khoa đã bị rơi trên các làn đường nguy hiểm, đường ray và các khúc gỗ trôi sông! Hãy nhặt sách, né tránh xe cộ, trả lời thử thách câu hỏi để đến trường an toàn!
            </p>

            {/* Rare item alert to highlight user's rare textbook spawning */}
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 px-4 mb-8 text-xs text-amber-300 w-full flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
              <span className="text-left leading-relaxed">
                <strong>Thử Thách Đọc Sách:</strong> Thu thập sách liên tục để thử thách kiến thức và rinh về số điểm cộng cực kỳ lớn!
              </span>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/25 cursor-pointer transition-all text-sm uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" /> Bắt Đầu Chơi
            </button>
          </div>
        )}

        {/* State 2: playing - True 3D Arena */}
        {gameState === "playing" && (
          <div className="w-full max-w-4xl aspect-[4/3] md:aspect-[16/10] bg-slate-900 rounded-2xl border border-slate-800 relative shadow-2xl overflow-hidden flex flex-col">
            
            {/* Top Bar Indicators */}
            <div className="absolute top-4 left-4 right-4 z-25 flex justify-between items-center pointer-events-none">
              {/* Score Badges */}
              <div className="flex gap-2">
                <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Điểm số</span>
                  <span className="text-sm font-extrabold font-mono text-white">{score}</span>
                </div>
              </div>

              {/* Power-ups Active Badges */}
              <div className="flex gap-2">
                {activePowerUps?.freeze && (
                  <div className="bg-cyan-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30 text-xs font-bold text-cyan-200 animate-pulse">
                    ❄️ Đang Đóng Băng
                  </div>
                )}
                {activePowerUps?.shield && (
                  <div className="bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold text-amber-200">
                    🛡️ Đang Bất Tử
                  </div>
                )}
                {activePowerUps?.magnet && (
                  <div className="bg-red-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/30 text-xs font-bold text-red-200 flex items-center gap-1">
                    🧲 Đang Hút Nam Châm
                  </div>
                )}
              </div>
            </div>

            {/* Bottom notice strip */}
            {notice && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-indigo-500/30 shadow-lg flex items-center gap-2 pointer-events-none text-xs font-medium text-slate-100 animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>{notice}</span>
              </div>
            )}

            {/* Interactive Overlay: Quiz from Books */}
            {quiz && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-40 flex items-center justify-center p-6 transition-all">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col animate-scale-up">
                  {/* Decorative book outline */}
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <BookOpenCheck className="w-5 h-5 flex-shrink-0 text-indigo-500" />
                    <span className="text-xs font-bold font-mono tracking-wider uppercase">Thử Thách Đọc Sách</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-4 leading-relaxed">
                    {quiz.prompt}
                  </h3>

                  {quizNotice ? (
                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 mb-2 ${
                      quizNotice.correct ? "bg-emerald-505/15 border border-emerald-500/20 text-emerald-400" : "bg-rose-505/15 border border-rose-500/20 text-rose-400"
                    }`}>
                      {quizNotice.correct ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" /> : <XCircle className="w-5 h-5 shrink-0 text-rose-500" />}
                      <span>{quizNotice.text}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quiz.answers.map((answer: string, index: number) => (
                        <button
                          key={answer}
                          onClick={() => quiz.answer(index)}
                          className="w-full text-left text-xs bg-slate-950/60 hover:bg-indigo-650 hover:bg-opacity-20 border border-slate-800/80 hover:border-indigo-500/50 p-3 px-4 rounded-xl font-medium transition-all cursor-pointer flex justify-between items-center group active:scale-[0.98]"
                        >
                          <span>{String.fromCharCode(65 + index)}. {answer}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* True WebGL Rendering Stage */}
            <div className="flex-1 relative w-full h-full bg-slate-950">
              <GestureView onSwipe={handleSwipe}>
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full block cursor-pointer outline-none select-none"
                />
              </GestureView>
              
              {/* Overlay active frozen border frame */}
              {activePowerUps?.freeze && (
                <div className="absolute inset-0 border-4 border-cyan-500/40 pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]" />
              )}
            </div>
          </div>
        )}

        {/* State 3: gameOver - Game Over board */}
        {gameState === "gameOver" && (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden z-10 flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600" />
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6">
              <XCircle className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Trò Chơi Kết Thúc
            </h2>
            <p className="text-slate-400 text-xs mb-6 font-mono">
              Bạn đã va phải chướng ngại vật hoặc hụt chân xuống dòng nước sâu!
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-500 font-bold uppercase">Điểm Đạt Được</p>
                <p className="text-2xl font-black font-mono text-indigo-400">{score}</p>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-500 font-bold uppercase">Hạng Kỷ Lục</p>
                <p className="text-2xl font-black font-mono text-amber-500">{highScore}</p>
              </div>
            </div>

            <button
              onClick={() => setGameState("playing")}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold py-3 rounded-xl shadow-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" /> Chơi Lại
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
