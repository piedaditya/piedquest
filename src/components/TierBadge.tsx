import { Crown, Gem } from "lucide-react";

/**
 * Gold Crown for Gold tier, Blue Diamond for Special tier.
 * Renders nothing for free players so the layout stays clean.
 */
export function TierBadge({ tier, className = "" }: { tier: string; className?: string }) {
  if (tier === "gold") {
    return (
      <span
        title="Gold tier"
        aria-label="Gold tier"
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${className}`}
        style={{
          background: "linear-gradient(135deg, oklch(0.9 0.17 92), oklch(0.72 0.16 70))",
          boxShadow: "0 0 14px -2px oklch(0.9 0.17 92 / 0.8)",
        }}
      >
        <Crown className="h-3 w-3" style={{ color: "oklch(0.2 0.05 70)" }} />
      </span>
    );
  }
  if (tier === "special") {
    return (
      <span
        title="Special tier"
        aria-label="Special tier"
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${className}`}
        style={{
          background: "linear-gradient(135deg, oklch(0.88 0.14 220), oklch(0.6 0.2 260))",
          boxShadow: "0 0 14px -2px oklch(0.85 0.15 225 / 0.9)",
        }}
      >
        <Gem className="h-3 w-3" style={{ color: "oklch(0.16 0.05 250)" }} />
      </span>
    );
  }
  return null;
}

export default TierBadge;
