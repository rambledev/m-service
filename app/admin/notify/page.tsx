"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { broadcastLineNotificationAction } from "@/app/actions/line";

type Notice = { tone: "good" | "bad"; text: string } | null;

export default function AdminNotifyPage() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function send() {
    console.log("[AdminNotifyPage][send] START", { length: text.trim().length });
    setSending(true);
    setNotice(null);
    try {
      const result = await broadcastLineNotificationAction(text);
      if (result.ok) setText("");
      setNotice({ tone: result.ok ? "good" : "bad", text: result.message });
    } catch (error) {
      console.error("[AdminNotifyPage][send] ERROR", { error });
      setNotice({ tone: "bad", text: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSending(false);
      console.log("[AdminNotifyPage][send] END");
    }
  }

  return (
    <AppShell role="admin" title="ส่งการแจ้งเตือน">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <p className="text-sm font-semibold text-[var(--text-primary)]">ส่งข้อความถึงผู้ใช้งานทุกคน</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            ส่งถึงผู้ใช้งานทุกคนในระบบที่เปิดรับการแจ้งเตือนผ่าน LINE ไว้แล้ว (ทุกบทบาท)
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="พิมพ์ข้อความที่ต้องการแจ้งเตือน..."
            className="mt-4 w-full resize-none rounded-xl border bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            style={{ borderColor: "var(--border-hairline)" }}
          />

          {notice && (
            <p
              role="status"
              className="mt-2 text-xs font-medium"
              style={{ color: notice.tone === "good" ? "var(--status-good)" : "var(--status-critical)" }}
            >
              {notice.text}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Button icon={BellRing} loading={sending} disabled={sending || !text.trim()} onClick={send}>
              ส่งการแจ้งเตือน
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
