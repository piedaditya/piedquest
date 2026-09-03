import { createServerFn } from "@tanstack/react-start";

/** Authoritative clock, immune to a tampered device clock. */
export const getServerTime = createServerFn({ method: "GET" }).handler(async () => ({
  now: Date.now(),
}));
