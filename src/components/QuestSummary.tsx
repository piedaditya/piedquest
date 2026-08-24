import { useState } from "react";
import { Trophy, Target, Zap, RotateCcw } from "lucide-react";
import PlayableAdModal from "./PlayableAdModal";

export default function QuestSummary() {
  // We set some dummy stats for now so you can see how it looks!
  const [showAd, setShowAd] = useState(false);
  const [xpDoubled, setXpDoubled] = useState(false);
  const [finalScore, setFinalScore] = useState(150);
  const accuracy = 85; 

  // This fires when the 20-second Playable Ad finishes
  const handleAdComplete = () => {
    setFinalScore(finalScore * 2);
    setXpDoubled(true);
    setShowAd(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden my-8">
        {/* Ambient Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[50px] pointer-events-none" />
        
        {/* Header section */}
        <div className="text-center z-10">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h2 className="text-3xl font-black text-white tracking-wide">QUEST COMPLETE</h2>
          <p className="text-gray-400 mt-1">Excellent work, Explorer!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full z-10">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
            <Target className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-2xl font-bold text-white">{accuracy}%</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Accuracy</span>
          </div>
          
          <div className={`bg-gray-800 p-4 rounded-xl border flex flex-col items-center relative overflow-hidden transition-all duration-500 ${xpDoubled ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-gray-700'}`}>
            {/* Green pulse effect that shows up only after they watch the ad */}
            {xpDoubled && <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none" />}
            
            <Zap className={`w-6 h-6 mb-2 transition-colors duration-500 ${xpDoubled ? "text-green-400" : "text-purple-400"}`} />
            <span className={`text-2xl font-bold transition-colors duration-500 ${xpDoubled ? "text-green-400" : "text-white"}`}>
              {finalScore} XP
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Earned</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 z-10 mt-2">
          {!xpDoubled ? (
            <button
              onClick={() => setShowAd(true)}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Ad to DOUBLE XP!
            </button>
          ) : (
            <div className="w-full py-4 px-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-bold text-center flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              XP Doubled Successfully!
            </div>
          )}

          <button
            onClick={() => alert("This will take the user back to the home screen!")}
            className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Return to Home
          </button>
        </div>
      </div>

      {/* Renders the ad popup if they click the purple button */}
      {showAd && (
        <PlayableAdModal 
          onComplete={handleAdComplete} 
          onClose={() => setShowAd(false)} 
        />
      )}
    </>
  );
}
