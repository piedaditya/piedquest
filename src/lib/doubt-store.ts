// Threaded Doubt Solver history: instant localStorage persistence in this
// browser, mirrored to the cloud (device-scoped) so it survives reloads
// everywhere the same device id is used.
import { supabase } from "@/integrations/supabase/client";
import { getClientId } from "./leaderboard";

export type DoubtRole = "user" | "assistant";

export interface DoubtMessage {
  id: string;
  role: DoubtRole;
  text: string;
}

export interface DoubtThread {
  id: string;
  title: string;
  updatedAt: number;
  messages: DoubtMessage[];
}

const KEY = "piedquest_doubt_threads_v1";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readThreads(): DoubtThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.id === "string")
      .map((t) => ({
        id: t.id as string,
        title: typeof t.title === "string" ? t.title : "New doubt",
        updatedAt: typeof t.updatedAt === "number" ? t.updatedAt : Date.now(),
        messages: Array.isArray(t.messages) ? (t.messages as DoubtMessage[]) : [],
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function writeThreads(threads: DoubtThread[]): DoubtThread[] {
  if (typeof window === "undefined") return threads;
  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  try {
    localStorage.setItem(KEY, JSON.stringify(sorted.slice(0, 60)));
  } catch {
    /* quota — ignore */
  }
  return sorted;
}

export function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New doubt";
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean;
}

/* ---------------- cloud mirror (anonymous, device scoped) ---------------- */

export async function cloudCreateThread(id: string, title: string): Promise<void> {
  const client_id = getClientId();
  if (!client_id) return;
  await supabase.from("doubt_threads").upsert(
    { id, client_id, title: title.slice(0, 200) },
    { onConflict: "id" },
  );
}

export async function cloudRenameThread(id: string, title: string): Promise<void> {
  await supabase
    .from("doubt_threads")
    .update({ title: title.slice(0, 200) })
    .eq("id", id);
}

export async function cloudDeleteThread(id: string): Promise<void> {
  await supabase.from("doubt_threads").delete().eq("id", id);
}

export async function cloudSaveMessage(
  threadId: string,
  role: DoubtRole,
  content: string,
): Promise<void> {
  const client_id = getClientId();
  if (!client_id || !content.trim()) return;
  const { error } = await supabase.from("doubt_messages").insert({
    thread_id: threadId,
    client_id,
    role,
    content: content.slice(0, 20000),
  });
  if (error) console.error("Doubt message not saved:", error.message);
}

export async function cloudLoadThreads(): Promise<DoubtThread[]> {
  const client_id = getClientId();
  if (!client_id) return [];
  const { data: threads, error } = await supabase
    .from("doubt_threads")
    .select("id, title, updated_at")
    .eq("client_id", client_id)
    .order("updated_at", { ascending: false })
    .limit(40);
  if (error || !threads?.length) return [];

  const ids = threads.map((t) => t.id);
  const { data: rows } = await supabase
    .from("doubt_messages")
    .select("id, thread_id, role, content, created_at")
    .in("thread_id", ids)
    .order("created_at", { ascending: true });

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    updatedAt: new Date(t.updated_at).getTime(),
    messages: (rows ?? [])
      .filter((r) => r.thread_id === t.id)
      .map((r) => ({ id: r.id, role: r.role as DoubtRole, text: r.content })),
  }));
}

/** Merge cloud threads into local ones, preferring whichever has more messages. */
export function mergeThreads(
  local: DoubtThread[],
  remote: DoubtThread[],
): DoubtThread[] {
  const byId = new Map<string, DoubtThread>();
  for (const t of [...remote, ...local]) {
    const existing = byId.get(t.id);
    if (!existing || t.messages.length > existing.messages.length) byId.set(t.id, t);
  }
  return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
