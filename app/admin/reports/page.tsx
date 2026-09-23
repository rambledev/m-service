"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  FileType,
  LucideIcon,
  Table as TableIcon,
  XCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import DashboardCard from "@/components/DashboardCard";
import ReportPrintable from "@/components/ReportPrintable";
import { useApp } from "@/context/AppContext";
import { buildReportData } from "@/lib/report-data";
import { exportReportToExcel } from "@/lib/export/excel";
import { exportReportToWord } from "@/lib/export/word";
import { exportReportToPdf } from "@/lib/export/pdf";
import { categories } from "@/mock/categories";
import { statusMeta } from "@/lib/ticket-utils";
import { TicketStatus } from "@/lib/types";

type ExportKey = "excel" | "word" | "pdf";

const exportOptions: { key: ExportKey; label: string; icon: LucideIcon }[] = [
  { key: "excel", label: "Excel", icon: FileSpreadsheet },
  { key: "word", label: "Word", icon: FileText },
  { key: "pdf", label: "PDF", icon: FileType },
];

export default function AdminReportsPage() {
  const { tickets } = useApp();
  const [view, setView] = useState<"chart" | "table">("chart");
  const [exportingKey, setExportingKey] = useState<ExportKey | null>(null);
  const [exportMsg, setExportMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const printableRef = useRef<HTMLDivElement>(null);

  const reportData = useMemo(() => buildReportData(tickets), [tickets]);

  const counts = categories
    .map((c) => ({
      ...c,
      count: tickets.filter((t) => t.categoryId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...counts.map((c) => c.count));

  const byStatus = (Object.keys(statusMeta) as TicketStatus[]).map((s) => ({
    status: s,
    count: tickets.filter((t) => t.status === s).length,
  }));

  async function handleExport(key: ExportKey) {
    console.log("[AdminReportsPage][handleExport] START", { key, ticketCount: tickets.length });
    setExportingKey(key);
    setExportMsg(null);
    try {
      if (key === "excel") {
        exportReportToExcel(reportData);
      } else if (key === "word") {
        await exportReportToWord(reportData);
      } else {
        if (!printableRef.current) throw new Error("printable node not mounted");
        await exportReportToPdf(printableRef.current, reportData.filenameBase);
      }
      console.log("[AdminReportsPage][handleExport] END", { key });
      setExportMsg({
        type: "success",
        text: `ส่งออกรายงานเป็น ${exportOptions.find((o) => o.key === key)?.label} สำเร็จ`,
      });
    } catch (error) {
      console.error("[AdminReportsPage][handleExport] ERROR", { key, error });
      setExportMsg({ type: "error", text: "ไม่สามารถส่งออกไฟล์ได้ กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setExportingKey(null);
    }
  }

  return (
    <AppShell role="admin" title="รายงาน">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardCard label="งานทั้งหมด" value={tickets.length} icon={ClipboardList} />
          <DashboardCard
            label="เสร็จสิ้นแล้ว"
            value={byStatus.find((b) => b.status === "completed")?.count ?? 0}
            icon={CheckCircle2}
            accentVar="--status-completed"
          />
          <DashboardCard
            label="อัตราการยกเลิก"
            value={`${Math.round(((byStatus.find((b) => b.status === "cancelled")?.count ?? 0) / Math.max(1, tickets.length)) * 100)}%`}
            icon={XCircle}
            accentVar="--status-critical"
          />
        </div>

        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              จำนวนงานแยกตามประเภท
            </h2>
            <div className="flex gap-1 rounded-lg border p-0.5 text-xs" style={{ borderColor: "var(--border-hairline)" }}>
              <button
                onClick={() => setView("chart")}
                className="flex items-center gap-1 rounded-md px-2.5 py-1 font-medium"
                style={{
                  backgroundColor: view === "chart" ? "var(--brand-primary-soft)" : "transparent",
                  color: view === "chart" ? "var(--brand-primary)" : "var(--text-secondary)",
                }}
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                กราฟ
              </button>
              <button
                onClick={() => setView("table")}
                className="flex items-center gap-1 rounded-md px-2.5 py-1 font-medium"
                style={{
                  backgroundColor: view === "table" ? "var(--brand-primary-soft)" : "transparent",
                  color: view === "table" ? "var(--brand-primary)" : "var(--text-secondary)",
                }}
              >
                <TableIcon className="h-3.5 w-3.5" aria-hidden />
                ตาราง
              </button>
            </div>
          </div>

          {view === "chart" ? (
            <div className="flex flex-col gap-3">
              {counts.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-[var(--text-secondary)]">
                    <span aria-hidden>{c.icon}</span> {c.label}
                  </span>
                  <div className="relative h-7 flex-1 rounded-full bg-[var(--surface-1)]">
                    <div
                      className="h-7 rounded-full transition-all"
                      style={{
                        width: `${(c.count / max) * 100}%`,
                        backgroundColor: `var(${c.colorVar})`,
                        minWidth: c.count > 0 ? "1.75rem" : 0,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-[var(--text-muted)]" style={{ borderColor: "var(--border-hairline)" }}>
                    <th className="py-2 font-medium">ประเภทงาน</th>
                    <th className="py-2 text-right font-medium">จำนวน (รายการ)</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.map((c) => (
                    <tr key={c.id} className="border-b last:border-0" style={{ borderColor: "var(--border-hairline)" }}>
                      <td className="py-2">
                        <span aria-hidden>{c.icon}</span> {c.label}
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">ส่งออกรายงาน</h2>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            ไฟล์ประกอบด้วยสรุปยอด จำนวนงานแยกตามประเภท รายการแจ้งซ่อมทั้งหมด {tickets.length} รายการ
            และประวัติการซ่อม (Timeline) ของทุกรายการ {reportData.history.length} เหตุการณ์
          </p>
          <div className="flex flex-wrap gap-3">
            {exportOptions.map((opt) => (
              <Button
                key={opt.key}
                variant="secondary"
                icon={opt.icon}
                loading={exportingKey === opt.key}
                disabled={exportingKey !== null}
                onClick={() => handleExport(opt.key)}
              >
                {exportingKey === opt.key ? "กำลังสร้างไฟล์..." : `Export ${opt.label}`}
              </Button>
            ))}
          </div>
          {exportMsg && (
            <p
              className="animate-fade-in mt-3 flex items-center gap-1.5 text-sm"
              style={{
                color: exportMsg.type === "success" ? "var(--status-good)" : "var(--status-critical)",
              }}
            >
              {exportMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              )}
              {exportMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Off-screen printable template captured for the PDF export — see lib/export/pdf.ts */}
      <div style={{ position: "fixed", top: 0, left: -10000, zIndex: -1 }} aria-hidden>
        <div ref={printableRef}>
          <ReportPrintable data={reportData} />
        </div>
      </div>
    </AppShell>
  );
}
