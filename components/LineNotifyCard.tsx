"use client";

import { useEffect, useState } from "react";
import { BellOff, BellRing, MessageCircle } from "lucide-react";
import Button from "@/components/Button";
import {
  confirmLineLinkAction,
  getLineStatusAction,
  startLineLinkAction,
  unlinkLineAction,
  type LineStatus,
} from "@/app/actions/line";

type Notice = { tone: "good" | "bad"; text: string } | null;

const DEV = process.env.NODE_ENV === "development";

function devLog(label: string, data: unknown) {
  if (!DEV) return;
  console.group(`[DEV] LineNotifyCard ${label}`);
  console.log("Response:", data);
  console.groupEnd();
}

/**
 * "Receive notifications via LINE" card for requester / technician dashboards.
 * LINE sends the user back to the dashboard with ?line_link=success|cancelled&session=<id>;
 * the result is verified on the server before it is shown.
 */
export default function LineNotifyCard({ audience }: { audience: "requester" | "technician" }) {
  const [status, setStatus] = useState<LineStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      console.log("[LineNotifyCard][init] START");
      const params = new URLSearchParams(window.location.search);
      const outcome = params.get("line_link");
      const sessionId = params.get("session");
      if (outcome) {
        // Drop the outcome from the address bar so a refresh does not repeat the message.
        params.delete("line_link");
        params.delete("session");
        const rest = params.toString();
        window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`);
      }
      try {
        if (outcome === "success" && sessionId) {
          const confirmed = await confirmLineLinkAction(sessionId);
          devLog("confirm", confirmed);
          if (alive) setNotice({ tone: confirmed.ok ? "good" : "bad", text: confirmed.message });
        } else if (outcome === "cancelled") {
          if (alive) setNotice({ tone: "bad", text: "ยังไม่ได้สมัครรับการแจ้งเตือนผ่าน LINE" });
        }
        const current = await getLineStatusAction();
        devLog("status", current);
        if (alive) setStatus(current);
      } catch (error) {
        console.error("[LineNotifyCard][init] ERROR", { error });
        if (alive) setStatus({ enabled: true, subscribed: false, message: "ไม่สามารถตรวจสอบสถานะการแจ้งเตือน LINE ได้ในขณะนี้" });
      }
      console.log("[LineNotifyCard][init] END");
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function subscribe() {
    console.log("[LineNotifyCard][subscribe] START");
    setBusy(true);
    setNotice(null);
    try {
      const result = await startLineLinkAction();
      devLog("startLink", result);
      if (result.ok) {
        // Full navigation: opens LINE (app on mobile, LINE Login on desktop).
        window.location.href = result.linkUrl;
        return;
      }
      setNotice({ tone: "bad", text: result.message });
    } catch (error) {
      console.error("[LineNotifyCard][subscribe] ERROR", { error });
      setNotice({ tone: "bad", text: "กรุณาลองใหม่อีกครั้ง" });
    }
    setBusy(false);
    console.log("[LineNotifyCard][subscribe] END");
  }

  async function unsubscribe() {
    console.log("[LineNotifyCard][unsubscribe] START");
    if (!window.confirm("ต้องการยกเลิกการรับการแจ้งเตือนผ่าน LINE ใช่หรือไม่")) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await unlinkLineAction();
      devLog("unlink", result);
      setNotice({ tone: result.ok ? "good" : "bad", text: result.message });
      if (result.ok) setStatus((s) => (s ? { ...s, subscribed: false, displayName: null } : s));
    } catch (error) {
      console.error("[LineNotifyCard][unsubscribe] ERROR", { error });
      setNotice({ tone: "bad", text: "กรุณาลองใหม่อีกครั้ง" });
    }
    setBusy(false);
    console.log("[LineNotifyCard][unsubscribe] END");
  }

  // Hidden entirely while loading or when the deployment has no LINE gateway configured.
  if (!status || !status.enabled) return null;

  const purpose =
    audience === "technician"
      ? "รับแจ้งเตือนทาง LINE ทันทีเมื่อมีงานแจ้งซ่อมใหม่ หรือได้รับมอบหมายงาน"
      : "รับแจ้งเตือนทาง LINE เมื่อช่างรับงาน เริ่มซ่อม หรือซ่อมเสร็จ";

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: "#06C755" }}
          aria-hidden
        >
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            การแจ้งเตือนผ่าน LINE{" "}
            <span className="font-normal text-[var(--text-muted)]">
              · {status.subscribed ? "เปิดใช้งานอยู่" : "ยังไม่ได้เปิดใช้"}
            </span>
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {status.subscribed
              ? `ส่งถึงบัญชี LINE ${status.displayName ?? "ของคุณ"}${status.following === false ? " (คุณบล็อกหรือเลิกติดตาม LINE OA อยู่ กรุณาเพิ่มเพื่อนอีกครั้ง)" : ""}`
              : purpose}
          </p>
          {status.message && <p className="mt-1 text-xs text-[var(--text-muted)]">{status.message}</p>}
          {notice && (
            <p
              role="status"
              className="mt-1 text-xs font-medium"
              style={{ color: notice.tone === "good" ? "var(--status-good)" : "var(--status-critical)" }}
            >
              {notice.text}
            </p>
          )}
        </div>
      </div>
      {status.subscribed ? (
        <Button variant="secondary" size="sm" icon={BellOff} loading={busy} disabled={busy} onClick={unsubscribe}>
          ยกเลิกการแจ้งเตือน
        </Button>
      ) : (
        <Button size="sm" icon={BellRing} loading={busy} disabled={busy} onClick={subscribe}>
          รับการแจ้งเตือนผ่าน LINE
        </Button>
      )}
    </div>
  );
}
