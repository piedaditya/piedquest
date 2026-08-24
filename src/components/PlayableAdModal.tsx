import { useState, useEffect } from "react";
import { X, Gamepad2 } from "lucide-react";

export default function PlayableAdModal({ onComplete, onClose }: { onComplete: () => void, onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(15); 
  const [score, setScore] = useState(0);

  // The strict countdown timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleReward = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[500px]">
        
        {/* Ad Header with dynamic timer */}
        <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Sponsored Mini-Game</span>
          {timeLeft > 0 ? (
            <span className="text-white font-mono text-sm bg-gray-950 px-3 py-1 rounded-full border border-gray-700">
              Reward in {timeLeft}s
            </span>
          ) : (
            <button onClick={handleReward} className="text-gray-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Interactive Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-600/10 pointer-events-none" />
          
          <Gamepad2 className="w-16 h-16 text-indigo-400 mb-2 animate-bounce" />
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Block Puzzle Blast</h3>
            <p className="text-gray-400 text-sm">Tap the glowing block to score points before time runs out!</p>
          </div>

          <button 
            onClick={() => setScore(score + 10)}
            className="w-32 h-32 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] active:scale-90 transition-all flex items-center justify-center group border-2 border-white/20"
          >
            <span className="text-3xl font-black text-white group-active:text-yellow-300 drop-shadow-md">TAP!</span>
          </button>

          <div className="text-xl font-bold text-indigo-300 tracking-wide">Score: {score}</div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center">
          {timeLeft > 0 ? (
            <div className="w-full h-12 flex items-center justify-center bg-gray-700 rounded-lg text-gray-400 font-semibold cursor-not-allowed">
              Keep playing to get reward...
            </div>
          ) : (
            <button 
              onClick={handleReward}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all animate-pulse"
            >
              Claim Reward & Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
