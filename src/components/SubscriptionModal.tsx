import { useState } from "react";
import { Sparkles, CheckCircle2, X } from "lucide-react";

export default function SubscriptionModal({ onClose }: { onClose: () => void }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-2 bg-gray-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Free Tier */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-2">Free Explorer</h3>
          <p className="text-gray-400 text-sm mb-6">Perfect for casual trivia fans.</p>
          
          <div className="text-4xl font-black text-white mb-8">$0<span className="text-lg text-gray-500 font-normal">/forever</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Daily 15-Question Drops</li>
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Standard Fandom Quests</li>
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Ad-Supported Refills</li>
          </ul>
          
          <button onClick={onClose} className="w-full py-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 transition-colors">
            Stay on Free
          </button>
        </div>

        {/* Right Side: PRO Tier */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">PIEDQUEST PRO</h3>
          </div>
          <p className="text-indigo-200 text-sm mb-6">For the ultimate trivia masters.</p>

          {/* Pricing Toggle */}
          <div className="flex items-center gap-2 mb-6 bg-gray-950/50 w-fit p-1 rounded-lg border border-indigo-500/30">
            <button onClick={() => setIsAnnual(false)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${!isAnnual ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>Monthly</button>
            <button onClick={() => setIsAnnual(true)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${isAnnual ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>Yearly <span className="text-yellow-400 text-xs ml-1">-20%</span></button>
          </div>
          
          <div className="text-4xl font-black text-white mb-8">
            {isAnnual ? "$3.99" : "$4.99"}
            <span className="text-lg text-indigo-300 font-normal">/mo</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-yellow-400" /> <span className="font-semibold">Unlimited</span> Question Forging</li>
            <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-yellow-400" /> <span className="font-semibold">Zero Ads</span> (100% uninterrupted)</li>
            <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-yellow-400" /> Premium Profile Dashboard</li>
            <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-yellow-400" /> Save & Replay Past Quests</li>
          </ul>
          
          <button className="w-full py-4 rounded-xl font-black text-indigo-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transform hover:-translate-y-1">
            Upgrade to PRO
          </button>
        </div>
      </div>
    </div>
  );
}
