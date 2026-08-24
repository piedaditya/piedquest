import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import PlayableAdModal from "./PlayableAdModal";

export default function HeartsSystem() {
  const MAX_HEARTS = 5;
  const [showAd, setShowAd] = useState(false);
  
  const [hearts, setHearts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("piedquest_hearts");
      return saved !== null ? parseInt(saved, 10) : MAX_HEARTS;
    }
    return MAX_HEARTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("piedquest_hearts", hearts.toString());
    }
  }, [hearts]);

  const loseHeart = () => {
    setHearts((prev) => Math.max(0, prev - 1));
  };

  const handleAdComplete = () => {
    setHearts(MAX_HEARTS);
    setShowAd(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-5 bg-gray-900 rounded-xl border border-gray-800 w-full max-w-sm mx-auto shadow-xl">
        <div className="flex justify-between items-center w-full">
          <span className="text-white font-bold text-lg">Daily Lives</span>
          <div className="flex gap-1">
            {[...Array(MAX_HEARTS)].map((_, index) => (
              <Heart
                key={index}
                className={`w-6 h-6 transition-all duration-300 ${
                  index < hearts
                    ? "text-red-500 fill-red-500 scale-100 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    : "text-gray-700 fill-gray-800 scale-90"
                }`}
              />
            ))}
          </div>
        </div>

        {hearts === 0 ? (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in mt-2">
            <p className="text-red-400 text-sm font-semibold">Out of lives! You cannot forge right now.</p>
            <button
              onClick={() => setShowAd(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Watch Ad to Refill ❤️
            </button>
          </div>
        ) : (
          <button
            onClick={loseHeart}
            className="text-xs text-gray-500 underline mt-2 opacity-50 hover:opacity-100 transition-opacity"
          >
            (Dev Test: Click to lose a heart)
          </button>
        )}
      </div>

      {showAd && (
        <PlayableAdModal 
          onComplete={handleAdComplete} 
          onClose={() => setShowAd(false)} 
        />
      )}
    </>
  );
}
