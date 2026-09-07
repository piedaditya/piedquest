import HeartsSystem from "@/components/HeartsSystem";
import { Link } from "@tanstack/react-router";
import { Home, Lightbulb, Trophy, Users, Vault, Zap } from "lucide-react";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import ThemeSwitcher from "./ThemeSwitcher";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/my-quests", label: "My Quests", icon: Zap, exact: false },
  { to: "/quick-qa", label: "Quick Q&A", icon: Lightbulb, exact: false },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, exact: false },
  { to: "/leagues", label: "Leagues", icon: Users, exact: false },
  { to: "/vault", label: "Vault", icon: Vault, exact: false },
] as const;

export function TopNav() {
  const [showProModal, setShowProModal] = useState(false);
  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full border-b border-border/70 backdrop-blur-xl"
        style={{ background: "color-mix(in oklab, var(--color-card) 82%, transparent)" }}
        aria-label="Primary"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 overflow-x-auto px-3 py-2.5">
          {ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
              activeProps={{
                className:
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-3.5 py-2 font-display text-xs uppercase tracking-wider text-primary transition-all",
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          <ThemeSwitcher />
        </div>
      </nav>
      <div className="mt-6 px-4">
        <div className="flex justify-center gap-4 items-center">
          <HeartsSystem />
          <button
            onClick={() => setShowProModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-950 font-black rounded-lg shadow-lg hover:scale-105 transition-transform text-sm h-fit"
          >
            GO PRO
          </button>
        </div>
      </div>
      {showProModal && <SubscriptionModal onClose={() => setShowProModal(false)} />}
    </>
  );
}
