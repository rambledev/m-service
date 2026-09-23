import * as XLSX from "xlsx";
import { ReportData } from "@/lib/report-data";

export function exportReportToExcel(data: ReportData): void {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["รายงานสรุปผลการแจ้งซ่อม — m-service"],
    [`สร้างเมื่อ ${data.generatedAtLabel}`],
    [],
    ["งานทั้งหมด", data.summary.total],
    ["รอดำเนินการ", data.summary.pending],
    ["เจ้าหน้าที่รับเรื่องแล้ว", data.summary.accepted],
    ["กำลังดำเนินการ", data.summary.inProgress],
    ["เสร็จสิ้น", data.summary.completed],
    ["ยกเลิก", data.summary.cancelled],
    ["อัตราการยกเลิก (%)", data.summary.cancelRatePercent],
  ]);
  summarySheet["!cols"] = [{ wch: 28 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "สรุป");

  const categorySheet = XLSX.utils.aoa_to_sheet([
    ["ประเภทงาน", "จำนวน (รายการ)"],
    ...data.byCategory.map((c) => [c.label, c.count]),
  ]);
  categorySheet["!cols"] = [{ wch: 24 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, categorySheet, "แยกตามประเภท");

  const ticketsSheet = XLSX.utils.json_to_sheet(
    data.rows.map((r) => ({
      "เลขที่": r.id,
      "รายการ": r.title,
      "ประเภทงาน": r.categoryLabel,
      "สถานะ": r.statusLabel,
      "ความเร่งด่วน": r.priorityLabel,
      "ผู้แจ้ง": r.requesterName,
      "หน่วยงาน": r.department,
      "ช่างผู้รับผิดชอบ": r.technicianName,
      "อาคาร": r.building,
      "แจ้งเมื่อ": r.createdAtLabel,
    }))
  );
  ticketsSheet["!cols"] = [
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(workbook, ticketsSheet, "รายการแจ้งซ่อม");

  const historySheet = XLSX.utils.json_to_sheet(
    data.history.map((h) => ({
      "เลขที่": h.ticketId,
      "รายการ": h.ticketTitle,
      "เหตุการณ์": h.eventLabel,
      "วันเวลา": h.timestampLabel,
      "ผู้ดำเนินการ": h.actor,
      "หมายเหตุ": h.note,
    }))
  );
  historySheet["!cols"] = [
    { wch: 16 },
    { wch: 32 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(workbook, historySheet, "ประวัติการซ่อม");

  XLSX.writeFile(workbook, `${data.filenameBase}.xlsx`);
}
