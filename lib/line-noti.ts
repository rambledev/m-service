// Server-side client for the RMU LINE Notification gateway (https://dtic-noti.rmu.ac.th).
// The API key must never reach the browser: import this module only from Server Actions,
// Route Handlers or Server Components.
//
// userRef = this app's User.id, which is the user's verified @rmu.ac.th e-mail (see auth.ts).

const TAG = "[lib/line-noti]";
const TIMEOUT_MS = 10_000;

interface GatewayConfig {
  baseUrl: string;
  apiKey: string;
}

export interface LinkSession {
  id: string;
  userRef: string;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  completedAt: string | null;
  lineUserId: string | null;
  linkUrl?: string;
}

export interface Subscription {
  userRef: string;
  status: "ACTIVE" | "REVOKED";
  subscribedAt: string;
  revokedAt: string | null;
  lineDisplayName?: string | null;
  following?: boolean;
}

type GatewayResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string };

/** LINE notifications are optional: when the gateway is not configured every call is a no-op. */
function config(): GatewayConfig | null {
  const baseUrl = process.env.LINE_NOTI_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.LINE_NOTI_API_KEY?.trim();
  return baseUrl && apiKey ? { baseUrl, apiKey } : null;
}

export function lineNotiEnabled(): boolean {
  return config() !== null;
}

/** Public URL of this app, used as the return address after LINE linking. */
export function appBaseUrl(): string {
  return (process.env.AUTH_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

async function call<T>(method: string, path: string, body?: unknown): Promise<GatewayResult<T>> {
  const cfg = config();
  if (!cfg) {
    console.warn(`${TAG}[call] SKIP gateway not configured (LINE_NOTI_URL / LINE_NOTI_API_KEY)`, { method, path });
    return { ok: false, status: 503, code: "NOT_CONFIGURED" };
  }
  const url = `${cfg.baseUrl}${path}`;
  console.log(`${TAG}[call] REQUEST`, { method, url, body });
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { data?: T; error?: { code?: string } } | null;
    console.log(`${TAG}[call] RESPONSE`, { method, url, status: res.status, json });
    if (!res.ok) return { ok: false, status: res.status, code: json?.error?.code ?? "HTTP_ERROR" };
    return { ok: true, data: json?.data as T };
  } catch (error) {
    console.error(`${TAG}[call] ERROR`, { method, url, error });
    return { ok: false, status: 0, code: "NETWORK_ERROR" };
  }
}

/** Starts a one-time linking session; the browser is then sent to `linkUrl`. */
export async function createLinkSession(userRef: string, returnUrl: string) {
  console.log(`${TAG}[createLinkSession] START`, { userRef, returnUrl });
  const result = await call<LinkSession>("POST", "/v1/link-sessions", { userRef, returnUrl });
  console.log(`${TAG}[createLinkSession] END`, { ok: result.ok });
  return result;
}

export async function getLinkSession(id: string) {
  console.log(`${TAG}[getLinkSession] START`, { id });
  const result = await call<LinkSession>("GET", `/v1/link-sessions/${encodeURIComponent(id)}`);
  console.log(`${TAG}[getLinkSession] END`, { ok: result.ok });
  return result;
}

/** The ACTIVE subscription of a user, or null when not subscribed. */
export async function getActiveSubscription(userRef: string) {
  console.log(`${TAG}[getActiveSubscription] START`, { userRef });
  const result = await call<Subscription[]>("GET", `/v1/subscriptions?userRef=${encodeURIComponent(userRef)}&status=ACTIVE`);
  if (!result.ok) return result;
  const active = (result.data ?? []).find((s) => s.status === "ACTIVE") ?? null;
  console.log(`${TAG}[getActiveSubscription] END`, { userRef, active: Boolean(active) });
  return { ok: true as const, data: active };
}

export async function revokeSubscription(userRef: string) {
  console.log(`${TAG}[revokeSubscription] START`, { userRef });
  const result = await call<unknown>("DELETE", `/v1/subscriptions/${encodeURIComponent(userRef)}`, {
    reason: "user unsubscribed in m-service",
  });
  console.log(`${TAG}[revokeSubscription] END`, { ok: result.ok });
  return result;
}

/**
 * Sends one text message to users by their userRef. Users who have not subscribed are
 * reported per-recipient by the gateway and simply do not receive it.
 */
export async function sendLineText(userRefs: string[], text: string, clientReference?: string) {
  const recipients = [...new Set(userRefs.filter(Boolean))];
  console.log(`${TAG}[sendLineText] START`, { recipients: recipients.length, clientReference });
  if (recipients.length === 0) return;
  const result = await call<{ id: string }>("POST", "/v1/notifications", {
    recipients: recipients.map((userRef) => ({ userRef })),
    messages: [{ type: "text", text: text.slice(0, 5000) }],
    ...(clientReference ? { clientReference } : {}),
  });
  if (!result.ok) console.error(`${TAG}[sendLineText] ERROR`, { code: result.code, status: result.status, clientReference });
  console.log(`${TAG}[sendLineText] END`, { ok: result.ok });
}
