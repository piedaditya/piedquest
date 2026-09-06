import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Tier = "free" | "gold" | "special";

export interface PublicPlayer {
  id: string;
  username: string;
  tier: Tier;
  xp: number;
  streak: number;
  wins: number;
  losses: number;
}

export interface LeagueSummary {
  id: string;
  code: string;
  name: string;
  owner_id: string;
  member_count: number;
}

export interface VaultQuest {
  id: string;
  topic: string;
  difficulty: string;
  mode: string;
  question_count: number;
  score: number;
  total: number;
  created_at: string;
}

const SAFE_COLUMNS = "id, username, tier, xp, streak, wins, losses";

/** Anonymous read-only client (public leaderboard during SSR). */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function clean(row: Record<string, unknown>): PublicPlayer {
  return {
    id: String(row["id"]),
    username: String(row["username"] ?? "Player"),
    tier: (row["tier"] as Tier) ?? "free",
    xp: Number(row["xp"] ?? 0),
    streak: Number(row["streak"] ?? 0),
    wins: Number(row["wins"] ?? 0),
    losses: Number(row["losses"] ?? 0),
  };
}

/* -------------------- global leaderboard -------------------- */

export const getGlobalTop = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicPlayer[]> => {
    const { data, error } = await publicClient()
      .from("profiles")
      .select(SAFE_COLUMNS)
      .order("xp", { ascending: false })
      .order("streak", { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []).map((r) => clean(r as Record<string, unknown>));
  },
);

/* -------------------- profile sync -------------------- */

export const syncProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username?: string; tier?: Tier; xp?: number; streak?: number }) => input)
  .handler(async ({ data, context }): Promise<PublicPlayer | null> => {
    const patch: Record<string, unknown> = { id: context.userId };
    if (typeof data.username === "string" && data.username.trim())
      patch["username"] = data.username.trim().slice(0, 32);
    if (data.tier) patch["tier"] = data.tier;
    if (typeof data.xp === "number") patch["xp"] = Math.max(0, Math.floor(data.xp));
    if (typeof data.streak === "number") patch["streak"] = Math.max(0, Math.floor(data.streak));

    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert(patch as never, { onConflict: "id" })
      .select(SAFE_COLUMNS)
      .maybeSingle();
    if (error || !row) return null;
    return clean(row as Record<string, unknown>);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicPlayer | null> => {
    const { data } = await context.supabase
      .from("profiles")
      .select(SAFE_COLUMNS)
      .eq("id", context.userId)
      .maybeSingle();
    return data ? clean(data as Record<string, unknown>) : null;
  });

/** Records one finished round for the win/loss ratio. */
export const recordRoundResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { won: boolean }) => ({ won: !!input.won }))
  .handler(async ({ data, context }): Promise<{ wins: number; losses: number }> => {
    const { data: row } = await context.supabase
      .from("profiles")
      .select("wins, losses")
      .eq("id", context.userId)
      .maybeSingle();
    const wins = Number(row?.wins ?? 0) + (data.won ? 1 : 0);
    const losses = Number(row?.losses ?? 0) + (data.won ? 0 : 1);
    await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, wins, losses } as never, { onConflict: "id" });
    return { wins, losses };
  });

/* -------------------- private friend leagues -------------------- */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const createLeague = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name?: string }) => input)
  .handler(async ({ data, context }): Promise<{ league: LeagueSummary | null; error?: string }> => {
    // Only Special tier players may open a private league.
    const { data: me } = await context.supabase
      .from("users")
      .select("active_tier")
      .eq("id", context.userId)
      .maybeSingle();
    if ((me?.active_tier ?? "free") !== "special") {
      return { league: null, error: "Private leagues are a Special tier perk." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const name = (data.name ?? "").trim().slice(0, 40) || "Friend League";

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = newCode();
      const { data: league, error } = await supabaseAdmin
        .from("leagues")
        .insert({ code, name, owner_id: context.userId } as never)
        .select("id, code, name, owner_id")
        .single();
      if (error) continue;
      await supabaseAdmin
        .from("league_members")
        .insert({ league_id: league.id, user_id: context.userId } as never);
      return { league: { ...(league as LeagueSummary), member_count: 1 } };
    }
    return { league: null, error: "Could not create a league right now. Try again." };
  });

export const joinLeague = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => ({ code: String(input.code ?? "").trim().toUpperCase() }))
  .handler(async ({ data, context }): Promise<{ league: LeagueSummary | null; error?: string }> => {
    if (data.code.length !== 6) return { league: null, error: "Invite codes are 6 characters." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: league } = await supabaseAdmin
      .from("leagues")
      .select("id, code, name, owner_id")
      .eq("code", data.code)
      .maybeSingle();
    if (!league) return { league: null, error: "No league found with that code." };
    await supabaseAdmin
      .from("league_members")
      .upsert({ league_id: league.id, user_id: context.userId } as never, {
        onConflict: "league_id,user_id",
      });
    const { count } = await supabaseAdmin
      .from("league_members")
      .select("id", { count: "exact", head: true })
      .eq("league_id", league.id);
    return { league: { ...(league as LeagueSummary), member_count: count ?? 1 } };
  });

export const getMyLeagues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LeagueSummary[]> => {
    const { data: memberships } = await context.supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", context.userId);
    const ids = (memberships ?? []).map((m) => m.league_id);
    if (!ids.length) return [];
    const { data: leagues } = await context.supabase
      .from("leagues")
      .select("id, code, name, owner_id")
      .in("id", ids);
    const { data: allMembers } = await context.supabase
      .from("league_members")
      .select("league_id")
      .in("league_id", ids);
    return (leagues ?? []).map((l) => ({
      ...(l as Omit<LeagueSummary, "member_count">),
      member_count: (allMembers ?? []).filter((m) => m.league_id === l.id).length,
    }));
  });

export const getLeagueBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { leagueId: string }) => ({ leagueId: String(input.leagueId) }))
  .handler(async ({ data, context }): Promise<PublicPlayer[]> => {
    const { data: members } = await context.supabase
      .from("league_members")
      .select("user_id")
      .eq("league_id", data.leagueId);
    const ids = (members ?? []).map((m) => m.user_id);
    if (!ids.length) return [];
    const { data: rows } = await context.supabase
      .from("profiles")
      .select(SAFE_COLUMNS)
      .in("id", ids)
      .order("xp", { ascending: false })
      .limit(50);
    return (rows ?? []).map((r) => clean(r as Record<string, unknown>));
  });

export const leaveLeague = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { leagueId: string }) => ({ leagueId: String(input.leagueId) }))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("league_members")
      .delete()
      .eq("league_id", data.leagueId)
      .eq("user_id", context.userId);
    return { ok: true };
  });

/* -------------------- quest vault -------------------- */

export const saveVaultQuest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      topic: string;
      difficulty: string;
      mode: string;
      questionCount: number;
      score?: number;
      total?: number;
      questions?: unknown;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("vault_quests").insert({
      user_id: context.userId,
      topic: String(data.topic ?? "Custom quest").slice(0, 200),
      difficulty: String(data.difficulty ?? "Normal"),
      mode: String(data.mode ?? "mcq"),
      question_count: Math.max(0, Math.floor(Number(data.questionCount ?? 0))),
      score: Math.max(0, Math.floor(Number(data.score ?? 0))),
      total: Math.max(0, Math.floor(Number(data.total ?? 0))),
      questions: (data.questions ?? []) as never,
    } as never);
    return { ok: !error };
  });

export const listVaultQuests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VaultQuest[]> => {
    const { data } = await context.supabase
      .from("vault_quests")
      .select("id, topic, difficulty, mode, question_count, score, total, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    return (data ?? []) as VaultQuest[];
  });

export const deleteVaultQuest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("vault_quests")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true };
  });
