"use server";

import { auth } from "@/auth";
import {
  appBaseUrl,
  createLinkSession,
  getActiveSubscription,
  getAllActiveSubscriptions,
  getLinkSession,
  lineNotiEnabled,
  revokeSubscription,
  sendLineText,
} from "@/lib/line-noti";

export interface LineStatus {
  enabled: boolean;
  subscribed: boolean;
  displayName?: string | null;
  following?: boolean;
  /** Set when the status could not be read; shown as a polite message, never the raw error. */
  message?: string;
}

export type LineLinkResult = { ok: true; linkUrl: string } | { ok: false; message: string };
export type LineActionResult = { ok: true; message: string } | { ok: false; message: string };

const RETRY = "ระบบยังไม่สามารถเชื่อมต่อ LINE ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

// Identity always comes from the session, never from the client: the user can only link,
// read or unlink their own LINE subscription.
async function sessionUser() {
  const session = await auth();
  const id = session?.user?.id;
  const role = session?.user?.role;
  if (!id || !role) throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
  return { id, role };
}

export async function getLineStatusAction(): Promise<LineStatus> {
  const user = await sessionUser();
  console.log("[actions/line][getLineStatusAction] START", { userRef: user.id });
  if (!lineNotiEnabled()) return { enabled: false, subscribed: false };

  const result = await getActiveSubscription(user.id);
  const status: LineStatus = result.ok
    ? { enabled: true, subscribed: Boolean(result.data), displayName: result.data?.lineDisplayName, following: result.data?.following }
    : { enabled: true, subscribed: false, message: "ไม่สามารถตรวจสอบสถานะการแจ้งเตือน LINE ได้ในขณะนี้" };
  console.log("[actions/line][getLineStatusAction] END", { userRef: user.id, subscribed: status.subscribed });
  return status;
}

/** Creates a one-time LINE linking link; the client then navigates to it. */
export async function startLineLinkAction(): Promise<LineLinkResult> {
  const user = await sessionUser();
  console.log("[actions/line][startLineLinkAction] START", { userRef: user.id, role: user.role });
  if (!lineNotiEnabled()) return { ok: false, message: "ยังไม่ได้เปิดใช้การแจ้งเตือนผ่าน LINE กรุณาติดต่อผู้ดูแลระบบ" };

  const returnUrl = `${appBaseUrl()}/${user.role}/dashboard`;
  const result = await createLinkSession(user.id, returnUrl);
  if (!result.ok || !result.data?.linkUrl) {
    console.error("[actions/line][startLineLinkAction] ERROR", { userRef: user.id, result });
    return { ok: false, message: RETRY };
  }
  console.log("[actions/line][startLineLinkAction] END", { userRef: user.id, sessionId: result.data.id });
  return { ok: true, linkUrl: result.data.linkUrl };
}

/**
 * Confirms the outcome after LINE sends the user back (?line_link=success&session=<id>).
 * The query string alone is not trusted: the session is read from the gateway and must
 * belong to the signed-in user.
 */
export async function confirmLineLinkAction(sessionId: string): Promise<LineActionResult> {
  const user = await sessionUser();
  console.log("[actions/line][confirmLineLinkAction] START", { userRef: user.id, sessionId });
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return { ok: false, message: "ไม่พบข้อมูลการสมัคร กรุณาลองใหม่อีกครั้ง" };

  const result = await getLinkSession(sessionId);
  if (!result.ok || result.data.userRef !== user.id) {
    console.error("[actions/line][confirmLineLinkAction] ERROR", { userRef: user.id, sessionId, result });
    return { ok: false, message: "ไม่พบข้อมูลการสมัคร กรุณาลองใหม่อีกครั้ง" };
  }
  const done = result.data.status === "COMPLETED";
  console.log("[actions/line][confirmLineLinkAction] END", { userRef: user.id, sessionId, status: result.data.status });
  return done
    ? { ok: true, message: "เปิดรับการแจ้งเตือนผ่าน LINE เรียบร้อยแล้ว" }
    : { ok: false, message: "ยังไม่ได้สมัครรับการแจ้งเตือน กรุณากดปุ่มอีกครั้ง" };
}

/** Admin-only: sends one text message to every user in the system currently subscribed to LINE. */
export async function broadcastLineNotificationAction(text: string): Promise<LineActionResult> {
  const user = await sessionUser();
  console.log("[actions/line][broadcastLineNotificationAction] START", { by: user.id, role: user.role });
  if (user.role !== "admin") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่ส่งการแจ้งเตือนได้");

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, message: "กรุณากรอกข้อความแจ้งเตือน" };
  if (!lineNotiEnabled()) return { ok: false, message: "ยังไม่ได้เปิดใช้การแจ้งเตือนผ่าน LINE" };

  const subs = await getAllActiveSubscriptions();
  if (!subs.ok) {
    console.error("[actions/line][broadcastLineNotificationAction] ERROR", { by: user.id, subs });
    return { ok: false, message: RETRY };
  }
  const recipients = (subs.data ?? []).map((s) => s.userRef);
  if (recipients.length === 0) return { ok: false, message: "ยังไม่มีผู้ใช้งานที่เปิดรับการแจ้งเตือนผ่าน LINE" };

  const result = await sendLineText(recipients, trimmed, `broadcast-${Date.now()}`);
  console.log("[actions/line][broadcastLineNotificationAction] END", { by: user.id, ok: result.ok, recipients: recipients.length });
  return result.ok
    ? { ok: true, message: `ส่งการแจ้งเตือนถึงผู้ใช้งาน ${recipients.length} คนแล้ว` }
    : { ok: false, message: RETRY };
}

export async function unlinkLineAction(): Promise<LineActionResult> {
  const user = await sessionUser();
  console.log("[actions/line][unlinkLineAction] START", { userRef: user.id });
  const result = await revokeSubscription(user.id);
  // 404 = no active subscription left, which is the state the user asked for.
  if (!result.ok && result.status !== 404) {
    console.error("[actions/line][unlinkLineAction] ERROR", { userRef: user.id, result });
    return { ok: false, message: RETRY };
  }
  console.log("[actions/line][unlinkLineAction] END", { userRef: user.id });
  return { ok: true, message: "ยกเลิกการแจ้งเตือนผ่าน LINE แล้ว" };
}
