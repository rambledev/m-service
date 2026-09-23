import type { CSSProperties } from "react";
import { ReportData } from "@/lib/report-data";

// Rendered off-screen and captured via html2canvas for PDF export (see lib/export/pdf.ts).
// Deliberately uses only plain hex colors / inline styles — no CSS custom properties or
// color-mix(), which html2canvas cannot always reproduce faithfully.
export default function ReportPrintable({ data }: { data: ReportData }) {
  const th: CSSProperties = {
    textAlign: "left",
    padding: "8px 10px",
    background: "#184f95",
    color: "#ffffff",
    fontSize: 12,
    border: "1px solid #d9d9d9",
  };
  const td: CSSProperties = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 12,
    border: "1px solid #d9d9d9",
    color: "#111111",
  };

  return (
    <div
      style={{
        width: 1000,
        padding: 32,
        background: "#ffffff",
        color: "#111111",
        fontFamily: "'Noto Sans Thai', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_rmu.png"
          alt="ตราสัญลักษณ์มหาวิทยาลัยราชภัฏมหาสารคาม"
          width={56}
          height={56}
          style={{ borderRadius: "50%", flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#111111" }}>
            รายงานสรุปผลการแจ้งซ่อม — m-service
          </h1>
          <p style={{ fontSize: 13, color: "#555555", margin: "4px 0 0" }}>
            มหาวิทยาลัยราชภัฏมหาสารคาม · สร้างเมื่อ {data.generatedAtLabel}
          </p>
        </div>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 28 }}>
        <tbody>
          <tr>
            <td style={td}>งานทั้งหมด</td>
            <td style={td}>{data.summary.total}</td>
            <td style={td}>รอดำเนินการ</td>
            <td style={td}>{data.summary.pending}</td>
          </tr>
          <tr>
            <td style={td}>เจ้าหน้าที่รับเรื่องแล้ว</td>
            <td style={td}>{data.summary.accepted}</td>
            <td style={td}>กำลังดำเนินการ</td>
            <td style={td}>{data.summary.inProgress}</td>
          </tr>
          <tr>
            <td style={td}>เสร็จสิ้น</td>
            <td style={td}>{data.summary.completed}</td>
            <td style={td}>ยกเลิก ({data.summary.cancelRatePercent}%)</td>
            <td style={td}>{data.summary.cancelled}</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#111111" }}>
        จำนวนงานแยกตามประเภท
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 28 }}>
        <thead>
          <tr>
            <th style={th}>ประเภทงาน</th>
            <th style={th}>จำนวน (รายการ)</th>
          </tr>
        </thead>
        <tbody>
          {data.byCategory.map((c) => (
            <tr key={c.label}>
              <td style={td}>{c.label}</td>
              <td style={td}>{c.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#111111" }}>
        รายการแจ้งซ่อมทั้งหมด
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>เลขที่</th>
            <th style={th}>รายการ</th>
            <th style={th}>ประเภทงาน</th>
            <th style={th}>สถานะ</th>
            <th style={th}>ผู้แจ้ง</th>
            <th style={th}>ช่างผู้รับผิดชอบ</th>
            <th style={th}>แจ้งเมื่อ</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.id}>
              <td style={td}>{r.id}</td>
              <td style={td}>{r.title}</td>
              <td style={td}>{r.categoryLabel}</td>
              <td style={td}>{r.statusLabel}</td>
              <td style={td}>{r.requesterName}</td>
              <td style={td}>{r.technicianName}</td>
              <td style={td}>{r.createdAtLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, margin: "28px 0 12px", color: "#111111" }}>ประวัติการซ่อม</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>เลขที่</th>
            <th style={th}>รายการ</th>
            <th style={th}>เหตุการณ์</th>
            <th style={th}>วันเวลา</th>
            <th style={th}>ผู้ดำเนินการ</th>
            <th style={th}>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {data.history.map((h, i) => (
            <tr key={`${h.ticketId}-${i}`}>
              <td style={td}>{h.ticketId}</td>
              <td style={td}>{h.ticketTitle}</td>
              <td style={td}>{h.eventLabel}</td>
              <td style={td}>{h.timestampLabel}</td>
              <td style={td}>{h.actor}</td>
              <td style={td}>{h.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
