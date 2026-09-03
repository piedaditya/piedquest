import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { getServerTime } from "@/lib/server-time.functions";
import {
  MAX_HEARTS,
  applyHeartRefill,
  applyStreak,
  clearGuest,
  defaultGuest,
  msToNextHeart,
  readGuest,
  writeGuest,
  type PlayerState,
  type PlayerTier,
} from "@/lib/player-state";

interface AuthContextValue {
  session: Session | null;
  player: PlayerState;
  ready: boolean;
  isGuest: boolean;
  /** Secure "now" in ms (server clock + local elapsed). */
  serverNow: () => number;
  msToNextHeart: number;
  maxHearts: number;
  loseHeart: () => Promise<void>;
  refillHearts: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  setTier: (tier: PlayerTier) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function rowToPlayer(row: Record<string, unknown>): PlayerState {
  return {
    id: row['id'] as string,
    role: "registered",
    xp: Number(row['xp'] ?? 0),
    hearts: Number(row['hearts'] ?? MAX_HEARTS),
    heartsUpdatedAt: new Date(String(row['hearts_updated_at'])).getTime(),
    lastLogin: new Date(String(row['last_login'])).getTime(),
    streak: Number(row['streak'] ?? 0),
    activeTier: (row['active_tier'] as PlayerTier) ?? "free",
  };
}

function playerToRow(p: PlayerState) {
  return {
    xp: p.xp,
    hearts: p.hearts,
    hearts_updated_at: new Date(p.heartsUpdatedAt).toISOString(),
    last_login: new Date(p.lastLogin).toISOString(),
    streak: p.streak,
    active_tier: p.activeTier,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<PlayerState>(() => defaultGuest(0));
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  // Secure clock: server epoch captured once, advanced by monotonic elapsed time.
  const clock = useRef<{ serverNow: number; localAt: number } | null>(null);
  const serverNow = useCallback(() => {
    const c = clock.current;
    if (!c) return Date.now();
    return c.serverNow + (Date.now() - c.localAt);
  }, []);

  const persist = useCallback(
    async (next: PlayerState) => {
      setPlayer(next);
      if (next.id) {
        await supabase.from("users").update(playerToRow(next)).eq("id", next.id);
      } else {
        writeGuest(next);
      }
    },
    [],
  );

  const loadRegistered = useCallback(
    async (userId: string, now: number) => {
      const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
      let state: PlayerState;
      if (data) {
        state = rowToPlayer(data as Record<string, unknown>);
      } else {
        // First cloud session for this account: migrate whatever the guest earned.
        const guest = readGuest(now);
        state = { ...guest, id: userId, role: "registered" };
        await supabase.from("users").insert({
          id: userId,
          role: "registered",
          migrated: true,
          ...playerToRow(state),
        });
      }
      clearGuest();
      state = applyStreak(applyHeartRefill(state, now), now);
      state.id = userId;
      state.role = "registered";
      await supabase.from("users").update(playerToRow(state)).eq("id", userId);
      setPlayer(state);
    },
    [],
  );

  // Boot: secure clock, session, then guest or cloud state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let now = Date.now();
      try {
        const res = await getServerTime();
        now = res.now;
      } catch {
        /* fall back to device clock */
      }
      clock.current = { serverNow: now, localAt: Date.now() };
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        await loadRegistered(data.session.user.id, now);
      } else {
        const guest = applyStreak(applyHeartRefill(readGuest(now), now), now);
        writeGuest(guest);
        setPlayer(guest);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRegistered]);

  // Auth transitions (sign-in from another tab, sign-out, etc.)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(next ?? null);
      const now = serverNow();
      if (next?.user) {
        void loadRegistered(next.user.id, now);
      } else {
        setPlayer(applyHeartRefill(readGuest(now), now));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRegistered, serverNow]);

  // Refill ticker (drives countdown + grants hearts as they mature).
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setPlayer((prev) => {
        const next = applyHeartRefill(prev, serverNow());
        if (next.hearts !== prev.hearts) {
          if (next.id) void supabase.from("users").update(playerToRow(next)).eq("id", next.id);
          else writeGuest(next);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [serverNow]);

  const loseHeart = useCallback(async () => {
    const now = serverNow();
    const base = applyHeartRefill(player, now);
    if (base.hearts <= 0) return;
    const anchor = base.hearts === MAX_HEARTS ? now : base.heartsUpdatedAt;
    await persist({ ...base, hearts: base.hearts - 1, heartsUpdatedAt: anchor });
  }, [player, persist, serverNow]);

  const refillHearts = useCallback(async () => {
    await persist({ ...player, hearts: MAX_HEARTS, heartsUpdatedAt: serverNow() });
  }, [player, persist, serverNow]);

  const addXp = useCallback(
    async (amount: number) => {
      await persist({ ...player, xp: Math.max(0, player.xp + amount) });
    },
    [player, persist],
  );

  const setTier = useCallback(
    async (activeTier: PlayerTier) => {
      await persist({ ...player, activeTier });
    },
    [player, persist],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) return { error: error.message };
    // Zero data loss: push the guest profile up the moment the session exists.
    if (data.session?.user) await loadRegistered(data.session.user.id, serverNow());
    return { error: null };
  }, [loadRegistered, serverNow]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session?.user) await loadRegistered(data.session.user.id, serverNow());
    return { error: null };
  }, [loadRegistered, serverNow]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    const now = serverNow();
    const guest = defaultGuest(now);
    writeGuest(guest);
    setPlayer(guest);
  }, [serverNow]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      player,
      ready,
      isGuest: !session,
      serverNow,
      msToNextHeart: msToNextHeart(player, serverNow()),
      maxHearts: MAX_HEARTS,
      loseHeart,
      refillHearts,
      addXp,
      setTier,
      signUp,
      signIn,
      signOut,
    }),
    // `tick` keeps the countdown value fresh each second
    [session, player, ready, tick, serverNow, loseHeart, refillHearts, addXp, setTier, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
