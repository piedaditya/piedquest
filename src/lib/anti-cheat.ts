import { useCallback, useEffect, useRef, useState } from "react";

export const TAB_SWITCH_PENALTY_MS = 10_000;

export interface AntiCheatState {
  switches: number;
  penaltyMs: number;
  disqualified: boolean;
  warning: boolean;
  dismissWarning: () => void;
}

/**
 * Active anti-cheat engine for the Global Daily Challenge.
 * 1st tab/window switch  -> warning overlay + 10s penalty
 * 2nd tab/window switch  -> instant disqualification
 */
export function useAntiCheat(active: boolean, onDisqualify: () => void): AntiCheatState {
  const [switches, setSwitches] = useState(0);
  const [warning, setWarning] = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const countRef = useRef(0);
  const dqRef = useRef(onDisqualify);
  dqRef.current = onDisqualify;
  const cooldownRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const register = () => {
      const now = Date.now();
      // Collapse blur + visibilitychange firing for the same switch.
      if (now - cooldownRef.current < 800) return;
      cooldownRef.current = now;

      countRef.current += 1;
      setSwitches(countRef.current);
      if (countRef.current >= 2) {
        setDisqualified(true);
        setWarning(false);
        dqRef.current();
      } else {
        setWarning(true);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") register();
    };

    window.addEventListener("blur", register);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", register);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  const dismissWarning = useCallback(() => setWarning(false), []);

  return {
    switches,
    penaltyMs: Math.min(switches, 1) * TAB_SWITCH_PENALTY_MS,
    disqualified,
    warning,
    dismissWarning,
  };
}

/** Blocks right-click, copy/cut and text selection inside the quiz container. */
export function useInteractionLock(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const block = (e: Event) => e.preventDefault();
    el.addEventListener("contextmenu", block);
    el.addEventListener("copy", block);
    el.addEventListener("cut", block);
    el.addEventListener("selectstart", block);
    el.addEventListener("dragstart", block);
    return () => {
      el.removeEventListener("contextmenu", block);
      el.removeEventListener("copy", block);
      el.removeEventListener("cut", block);
      el.removeEventListener("selectstart", block);
      el.removeEventListener("dragstart", block);
    };
  }, [ref, active]);
}
