"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Info } from "lucide-react";
import AppShell from "@/components/AppShell";
import RepairForm from "@/components/RepairForm";
import { NewTicketInput, useApp } from "@/context/AppContext";
import { notifyTechniciansOfNewTicket } from "@/lib/notify";

export default function CreateTicketPage() {
  const { currentUser, createTicket } = useApp();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(input: NewTicketInput) {
    setSubmitting(true);
    setError("");
    try {
      const ticket = await createTicket(input);
      // Fire-and-forget — emailing technicians is a background notification, not something
      // that should block the requester from reaching their new ticket's detail page.
      void notifyTechniciansOfNewTicket(ticket);
      router.push(`/requester/detail/${ticket.id}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งแจ้งซ่อมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  return (
    <AppShell role="requester" title="แจ้งซ่อมใหม่">
      <div className="mx-auto max-w-3xl">
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--brand-primary-soft)", backgroundColor: "var(--brand-primary-soft)" }}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--brand-primary)" }} aria-hidden />
          <p className="text-sm" style={{ color: "var(--brand-primary)" }}>
            กรอกรายละเอียดปัญหาให้ครบถ้วน เพื่อให้เจ้าหน้าที่สามารถดำเนินการได้อย่างรวดเร็ว
          </p>
        </div>
        {error && (
          <div
            className="animate-fade-in mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--status-critical)", backgroundColor: "var(--status-critical-soft)", color: "var(--status-critical)" }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}
        <RepairForm
          defaultName={currentUser?.name ?? ""}
          defaultDepartment={currentUser?.department ?? ""}
          defaultPhone={currentUser?.phone ?? ""}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </AppShell>
  );
}
