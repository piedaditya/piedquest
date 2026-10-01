import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const TOLERANCE_S = 300;
const CYCLE_MS: Record<string, number> = {
  daily: 86_400_000,
  monthly: 31 * 86_400_000,
  yearly: 366 * 86_400_000,
};
const GRACE_MS = 3 * 86_400_000; // renewals arrive slightly after period end

function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts["t"]);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_S) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const sigs = header
    .split(",")
    .filter((p) => p.trim().startsWith("v1="))
    .map((p) => p.trim().slice(3));
  const exp = Buffer.from(expected);
  return sigs.some((s) => {
    const b = Buffer.from(s);
    return b.length === exp.length && timingSafeEqual(b, exp);
  });
}

type Obj = Record<string, any>;

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });
        const sig = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();
        if (!verify(body, sig, secret)) return new Response("Invalid signature", { status: 400 });

        const event = JSON.parse(body) as { id: string; type: string; data: { object: Obj } };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotency: each Stripe event is applied exactly once.
        const { error: dupErr } = await supabaseAdmin
          .from("stripe_events")
          .insert({ id: event.id, type: event.type });
        if (dupErr) {
          if (dupErr.code === "23505") return Response.json({ received: true, duplicate: true });
          return new Response("DB error", { status: 500 });
        }

        const obj = event.data.object;
        const grant = async (userId: string, tier: string, expiresAt: string, extra: Obj = {}) => {
          if (!["gold", "special"].includes(tier)) return;
          await supabaseAdmin
            .from("users")
            .update({ active_tier: tier, tier_expires_at: expiresAt, ...extra })
            .eq("id", userId);
          await supabaseAdmin.from("profiles").update({ tier }).eq("id", userId);
        };

        try {
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            if (obj.payment_status !== "paid" && obj.payment_status !== "no_payment_required") {
              return Response.json({ received: true, pending: true });
            }
            const md = (obj.metadata ?? {}) as Obj;
            const userId = md.user_id as string | undefined;
            const cycle = (md.cycle as string) ?? "monthly";
            if (userId) {
              const expiresAt = new Date(
                Date.now() + (CYCLE_MS[cycle] ?? CYCLE_MS.monthly) + (cycle === "daily" ? 0 : GRACE_MS),
              ).toISOString();
              await grant(userId, md.tier, expiresAt, {
                stripe_customer_id: obj.customer ?? null,
                stripe_subscription_id: obj.subscription ?? null,
              });
              await supabaseAdmin
                .from("checkout_sessions")
                .update({ status: "completed", provider_session_id: obj.id })
                .eq("provider_session_id", obj.id);
              if (obj.client_reference_id) {
                await supabaseAdmin
                  .from("checkout_sessions")
                  .update({ status: "completed" })
                  .eq("id", obj.client_reference_id);
              }
            }
          } else if (event.type === "invoice.paid") {
            // Subscription renewals extend the paid window.
            const md = (obj.subscription_details?.metadata ??
              obj.parent?.subscription_details?.metadata ??
              {}) as Obj;
            const periodEnd = obj.lines?.data?.[0]?.period?.end as number | undefined;
            if (md.user_id && periodEnd) {
              await grant(md.user_id, md.tier, new Date(periodEnd * 1000 + GRACE_MS).toISOString());
            }
          } else if (event.type === "customer.subscription.deleted") {
            const md = (obj.metadata ?? {}) as Obj;
            if (md.user_id) {
              await supabaseAdmin
                .from("users")
                .update({ active_tier: "free", tier_expires_at: null, stripe_subscription_id: null })
                .eq("id", md.user_id)
                .eq("stripe_subscription_id", obj.id);
              await supabaseAdmin.from("profiles").update({ tier: "free" }).eq("id", md.user_id);
            }
          }
        } catch (err) {
          console.error("[stripe-webhook]", err);
          await supabaseAdmin.from("stripe_events").delete().eq("id", event.id);
          return new Response("Processing failed", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
