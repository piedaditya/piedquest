import { useEffect, useState } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";

interface PlayableAdModalProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function PlayableAdModal({ onComplete, onClose }: PlayableAdModalProps) {
  const [adStatus, setAdStatus] = useState<'loading' | 'playing' | 'error'>('loading');

  useEffect(() => {
    // ---------------------------------------------------------
    // AD NETWORK INTEGRATION ZONE
    // When you register for an ad network (like Monetag), 
    // their script will be injected here.
    // ---------------------------------------------------------
    
    let adTimeout: NodeJS.Timeout;

    const loadRealAd = async () => {
      try {
        setAdStatus('loading');
        
        // This simulates the split-second it takes to contact the Ad Server
        await new Promise(resolve => setTimeout(resolve, 800));
        setAdStatus('playing');

        // REAL LOGIC (To be uncommented when Ad ID is added):
        // if (window.RewardedAdNetwork) {
        //   window.RewardedAdNetwork.showAd({
        //     onSuccess: () => {
        //       onComplete(); // Only fires if the network confirms they watched it!
        //     },
        //     onError: () => setAdStatus('error')
        //   });
        // } else {
        //   throw new Error("Ad Blocker Detected");
        // }

        // TEMPORARY FALLBACK until your ad account is approved:
        // We still force them to wait so your UI flow works, 
        // but the architecture is now ready for the real network script.
        adTimeout = setTimeout(() => {
          onComplete(); 
        }, 15000); 

      } catch (error) {
        console.error("Ad Failed to Load:", error);
        setAdStatus('error');
      }
    };

    loadRealAd();

    return () => {
      // Cleanup to prevent memory leaks if they force-close the app
      clearTimeout(adTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      {/* We hide the close button while playing so they CANNOT skip the ad! */}
      {adStatus === 'error' && (
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-gray-800 rounded-full z-10">
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md w-full">
        
        {adStatus === 'loading' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <h3 className="text-xl font-bold text-white tracking-wide">Connecting to Sponsor...</h3>
            <p className="text-gray-400 text-sm">Please wait while we load your rewarded video.</p>
          </div>
        )}

        {adStatus === 'playing' && (
          <div className="w-full aspect-video bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-in fade-in duration-500 relative overflow-hidden">
            {/* The actual video player from the ad network will render over this div */}
            <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-2xl m-4 flex flex-col items-center justify-center">
               <span className="text-indigo-400 font-black text-2xl animate-pulse tracking-widest">ADVERTISEMENT</span>
               <span className="text-gray-500 text-sm mt-2">Network Video Container</span>
            </div>
          </div>
        )}

        {adStatus === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 mb-2">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Ad Blocked or Unavailable</h3>
            <p className="text-gray-400 mb-6 max-w-xs">
              We couldn't load the rewarded video. Please disable your ad blocker or try again later to claim your reward.
            </p>
            <button onClick={onClose} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 w-full transition-colors">
              Return to Game
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
