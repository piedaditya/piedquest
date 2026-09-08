import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildPricing, type BillingCycle, type PaidTier, type RegionalPricing } from "@/lib/pricing";

const DEMO_HOURS = 24;

function detectCountry(): string {
  const candidates = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-country-code",
    "x-geo-country",
  ];
  for (const h of candidates) {
    const v = getRequestHeader(h);
    if (v && /^[A-Za-z]{2}$/.test(v) && v.toUpperCase() !== "XX") return v.toUpperCase();
  }
  // Last resort: infer from the browser's language region (e.g. en-IN).
  const lang = getRequestHeader("accept-language") ?? "";
  const m = lang.match(/[a-z]{2}-([A-Z]{2})/);
  return m?.[1] ?? "US";
}

/** Server-computed, geo/PPP-aware price sheet. Never trust client prices. */
export const getRegionalPricing = createServerFn({ method: "GET" }).handler(
  async (): Promise<RegionalPricing> => buildPricing(detectCountry()),
);

export interface BillingState {
  tier: "free" | "gold" | "special";
  tierExpiresAt: string | null;
  demo: {
    used: boolean;
    active: boolean;
    expiresAt: string | null;
    msRemaining: number;
  };
}

async function readState(supabase: any, userId: string): Promise<BillingState> {
  const [{ data: user }, { data: pass }] = await Promise.all([
    supabase.from("users").select("active_tier, tier_expires_at").eq("id", userId).maybeSingle(),
    supabase
      .from("demo_passes")
      .select("expires_at, revoked_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const now = Date.now();
  const expiresAt = pass?.expires_at ? new Date(pass.expires_at).getTime() : 0;
  const active = Boolean(pass) && !pass.revoked_at && expiresAt > now;

  return {
    tier: (user?.active_tier ?? "free") as BillingState["tier"],
    tierExpiresAt: user?.tier_expires_at ?? null,
    demo: {
      used: Boolean(pass),
      active,
      expiresAt: pass?.expires_at ?? null,
      msRemaining: active ? expiresAt - now : 0,
    },
  };
}

export const getBillingState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readState(context.supabase, context.userId));

export interface DemoResult {
  ok: boolean;
  reason?: "already_used" | "already_special" | "error";
  state?: BillingState;
}

/** Grants a one-time, server-timed 24 hour Special pass. */
export const activateDemoPass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DemoResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("demo_passes")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return { ok: false, reason: "already_used" };

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("active_tier")
      .eq("id", userId)
      .maybeSingle();
    if (user?.active_tier === "special") return { ok: false, reason: "already_special" };

    const expiresAt = new Date(Date.now() + DEMO_HOURS * 3600_000).toISOString();

    const { error: insErr } = await supabaseAdmin
      .from("demo_passes")
      .insert({ user_id: userId, tier: "special", expires_at: expiresAt });
    if (insErr) return { ok: false, reason: insErr.code === "23505" ? "already_used" : "error" };

    const { error: updErr } = await supabaseAdmin
      .from("users")
      .update({ active_tier: "special", tier_expires_at: expiresAt })
      .eq("id", userId);
    if (updErr) return { ok: false, reason: "error" };

    return { ok: true, state: await readState(supabaseAdmin, userId) };
  });

export interface CheckoutResult {
  ok: boolean;
  url?: string;
  reason?: "not_configured" | "invalid" | "error";
  message?: string;
}

const TIERS: PaidTier[] = ["gold", "special"];
const CYCLES: BillingCycle[] = ["daily", "monthly", "yearly"];

/** Creates a Stripe Checkout Session using prices computed only on the server. */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tier: PaidTier; cycle: BillingCycle }) => data)
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    if (!TIERS.includes(data.tier) || !CYCLES.includes(data.cycle)) {
      return { ok: false, reason: "invalid" };
    }

    const country = detectCountry();
    const pricing = buildPricing(country);
    const row = pricing.cycles[data.cycle][data.tier];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session } = await supabaseAdmin
      .from("checkout_sessions")
      .insert({
        user_id: context.userId,
        tier: data.tier,
        billing_cycle: data.cycle,
        country_code: country,
        currency: pricing.currency,
        amount_minor: row.amountMinor,
      })
      .select("id")
      .single();

    const secret = process.env["STRIPE_SECRET_KEY"];
    if (!secret) {
      return {
        ok: false,
        reason: "not_configured",
        message: "Payments aren't switched on yet. Your plan choice was saved.",
      };
    }

    const origin = new URL(getRequest().url).origin;
    const body = new URLSearchParams({
      mode: data.cycle === "daily" ? "payment" : "subscription",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": pricing.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(row.amountMinor),
      "line_items[0][price_data][product_data][name]":
        data.tier === "gold" ? "PIEDQUEST PRO (Gold)" : "PIEDQUEST SPECIAL",
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      client_reference_id: session?.id ?? context.userId,
      "metadata[user_id]": context.userId,
      "metadata[tier]": data.tier,
      "metadata[cycle]": data.cycle,
    });
    if (data.cycle !== "daily") {
      body.set(
        "line_items[0][price_data][recurring][interval]",
        data.cycle === "yearly" ? "year" : "month",
      );
    }

    try {
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const json = (await res.json()) as { url?: string; error?: { message?: string } };
      if (!res.ok || !json.url) {
        console.error("[stripe] checkout failed", json.error?.message);
        return { ok: false, reason: "error", message: "Could not start checkout. Try again." };
      }
      if (session?.id) {
        await supabaseAdmin
          .from("checkout_sessions")
          .update({ provider_session_id: (json as { id?: string }).id ?? null })
          .eq("id", session.id);
      }
      return { ok: true, url: json.url };
    } catch (err) {
      console.error("[stripe] checkout error", err);
      return { ok: false, reason: "error", message: "Could not start checkout. Try again." };
    }
  });

/** Counts a completed daily quest, server-side. */
export const registerDailyPlay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabaseAdmin
      .from("users")
      .select("daily_quests_played, daily_reset_date")
      .eq("id", context.userId)
      .maybeSingle();
    const played = row?.daily_reset_date === today ? (row?.daily_quests_played ?? 0) + 1 : 1;
    await supabaseAdmin
      .from("users")
      .update({ daily_quests_played: played, daily_reset_date: today })
      .eq("id", context.userId);
    return { played };
  });
