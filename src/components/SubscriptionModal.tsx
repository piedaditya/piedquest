import { useState } from "react";
import { Sparkles, CheckCircle2, X, Ticket, Diamond, Crown } from "lucide-react";

export default function SubscriptionModal({ onClose }: { onClose: () => void }) {
  const [billingCycle, setBillingCycle] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [activePass, setActivePass] = useState<string | null>(null);

  const handleClaimPass = (tier: string) => {
    setActivePass(tier);
    alert(`🎉 24-Hour ${tier} Pass Activated! Enjoy the ultimate experience.`);
  };

  // Pricing Dictionary (INR)
  const pricing = {
    daily: {
      gold: { price: 9, original: 10 },
      diamond: { price: 13, original: 20 }
    },
    monthly: {
      gold: { price: 99, original: 300 },
      diamond: { price: 143, original: 600 }
    },
    yearly: {
      gold: { price: 999, original: 3600 },
      diamond: { price: 1436, original: 7200 }
    }
  };

  const getDiscount = (price: number, original: number) => Math.round(((original - price) / original) * 100);
  const currentGold = pricing[billingCycle].gold;
  const currentDiamond = pricing[billingCycle].diamond;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-8 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-6xl shadow-2xl relative my-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 p-2 bg-gray-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Heart-Melting Header */}
        <div className="text-center p-8 pb-4 border-b border-gray-800/50">
          <h2 className="text-3xl font-black text-white mb-3">Choose Your Destiny</h2>
          <p className="text-gray-400 max-w-2xl mx-auto italic">
            "PIEDQUEST is, and always will be, designed to win your heart completely free. These upgrades are simply here if you want to push your experience to the absolute limit."
          </p>
          
          {/* 3-Way Cycle Toggle */}
          <div className="flex items-center justify-center gap-1 mt-6 bg-gray-900 w-fit mx-auto p-1.5 rounded-xl border border-gray-700 shadow-inner">
            <button onClick={() => setBillingCycle('daily')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'daily' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200'}`}>1-Day Pass</button>
            <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200'}`}>Yearly <span className="text-yellow-400 text-xs ml-1 bg-yellow-400/20 px-1.5 py-0.5 rounded">BEST VALUE</span></button>
          </div>
        </div>

        {/* The 3 Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
          
          {/* TIER 1: FREE */}
          <div className="p-8 flex flex-col hover:bg-gray-900/30 transition-colors">
            <h3 className="text-2xl font-bold text-gray-200 mb-2">Free Explorer</h3>
            <p className="text-gray-500 text-sm mb-6">The core game, crafted with love.</p>
            <div className="text-4xl font-black text-white mb-8">₹0<span className="text-lg text-gray-500 font-normal">/forever</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" /> Daily Global Quests</li>
              <li className="flex gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" /> Infinite Ad-Supported Play</li>
              <li className="flex gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" /> Global Leaderboards</li>
            </ul>
            <button onClick={onClose} className="w-full py-4 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
              Stay on Free
            </button>
          </div>

          {/* TIER 2: PRO (GOLD) */}
          <div className="p-8 flex flex-col bg-gradient-to-b from-amber-900/10 to-transparent relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-yellow-400">PRO (Gold)</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">For the serious trivia master.</p>
            
            {/* Dynamic Pricing Display */}
            <div className="mb-8">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white">₹{currentGold.price}</span>
                <span className="text-lg text-gray-500 line-through mb-1">₹{currentGold.original}</span>
              </div>
              <div className="inline-block bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                SAVE ₹{currentGold.original - currentGold.price} ({getDiscount(currentGold.price, currentGold.original)}% OFF)
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" /> Unlimited Custom Forging</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" /> 100% Ad-Free Experience</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" /> 1.5x Permanent XP Boost</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" /> Pro Gold Leaderboard Badge</li>
            </ul>
            
            <div className="space-y-3 mt-auto">
              {activePass !== 'PRO' ? (
                <button onClick={() => handleClaimPass('PRO')} className="w-full py-3 rounded-xl font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20 transition-all flex justify-center items-center gap-2">
                  <Ticket className="w-5 h-5" /> Activate 24H Free Pass
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl font-bold text-yellow-400 bg-yellow-400/20 border border-yellow-400 text-center">⏳ Pro Pass Active!</div>
              )}
              <button className="w-full py-4 rounded-xl font-black text-indigo-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:scale-[1.02] transition-transform">
                Upgrade to PRO
              </button>
            </div>
          </div>

          {/* TIER 3: VIP (DIAMOND) */}
          <div className="p-8 flex flex-col bg-gradient-to-b from-cyan-900/10 to-transparent relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            <div className="flex items-center gap-2 mb-2">
              <Diamond className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">VIP (Diamond)</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">The ultimate bragging rights.</p>
            
            {/* Dynamic Pricing Display */}
            <div className="mb-8">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white">₹{currentDiamond.price}</span>
                <span className="text-lg text-gray-500 line-through mb-1">₹{currentDiamond.original}</span>
              </div>
              <div className="inline-block bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 text-xs font-bold px-2 py-1 rounded">
                SAVE ₹{currentDiamond.original - currentDiamond.price} ({getDiscount(currentDiamond.price, currentDiamond.original)}% OFF)
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Everything in Gold, plus:</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> "God Mode" Difficulty Access</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Custom AI Host Personalities</li>
              <li className="flex gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Animated Profile Auras</li>
            </ul>
            
            <div className="space-y-3 mt-auto">
              {activePass !== 'VIP' ? (
                <button onClick={() => handleClaimPass('VIP')} className="w-full py-3 rounded-xl font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all flex justify-center items-center gap-2">
                  <Ticket className="w-5 h-5" /> Activate 24H Free Pass
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl font-bold text-cyan-400 bg-cyan-400/20 border border-cyan-400 text-center">⏳ VIP Pass Active!</div>
              )}
              <button className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-transform">
                Upgrade to VIP
              </button>
            </div>
          </div>
        </div>

        {/* Heart-Melting Footer */}
        <div className="text-center p-4 bg-gray-900 rounded-b-3xl border-t border-gray-800">
          <p className="text-gray-400 text-sm font-medium">
            We promise you'll never regret your choice—even if you stick with the Free tier forever! 😉
          </p>
        </div>

      </div>
    </div>
  );
}
