import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { ReportData } from "@/lib/report-data";
import { downloadBlob } from "@/lib/export/download";

const HEADER_FILL = "184F95";
const BORDER = { style: "single" as const, size: 2, color: "D9D9D9" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function headerCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: HEADER_FILL },
    borders: CELL_BORDERS,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })],
      }),
    ],
  });
}

function bodyCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
  });
}

function summaryLine(label: string, value: string | number): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: String(value) }),
    ],
  });
}

// Best-effort fetch of the university seal for the document letterhead — the export still
// succeeds without it (e.g. if the asset is ever missing), just without the logo image.
async function loadLogoImageRun(): Promise<ImageRun | null> {
  try {
    const res = await fetch("/logo_rmu.png");
    if (!res.ok) return null;
    const data = await res.arrayBuffer();
    return new ImageRun({
      type: "png",
      data,
      transformation: { width: 64, height: 64 },
    });
  } catch (error) {
    console.error("[wordExport][loadLogoImageRun] ERROR", { error });
    return null;
  }
}

export async function exportReportToWord(data: ReportData): Promise<void> {
  const logoImageRun = await loadLogoImageRun();
  const categoryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [headerCell("ประเภทงาน", 70), headerCell("จำนวน (รายการ)", 30)],
      }),
      ...data.byCategory.map(
        (c) =>
          new TableRow({
            children: [bodyCell(c.label, 70), bodyCell(String(c.count), 30)],
          })
      ),
    ],
  });

  const ticketWidths = [12, 26, 14, 15, 14, 14, 15];
  const ticketsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          headerCell("เลขที่", ticketWidths[0]),
          headerCell("รายการ", ticketWidths[1]),
          headerCell("ประเภทงาน", ticketWidths[2]),
          headerCell("สถานะ", ticketWidths[3]),
          headerCell("ผู้แจ้ง", ticketWidths[4]),
          headerCell("ช่างผู้รับผิดชอบ", ticketWidths[5]),
          headerCell("แจ้งเมื่อ", ticketWidths[6]),
        ],
      }),
      ...data.rows.map(
        (r) =>
          new TableRow({
            children: [
              bodyCell(r.id, ticketWidths[0]),
              bodyCell(r.title, ticketWidths[1]),
              bodyCell(r.categoryLabel, ticketWidths[2]),
              bodyCell(r.statusLabel, ticketWidths[3]),
              bodyCell(r.requesterName, ticketWidths[4]),
              bodyCell(r.technicianName, ticketWidths[5]),
              bodyCell(r.createdAtLabel, ticketWidths[6]),
            ],
          })
      ),
    ],
  });

  const historyWidths = [12, 22, 16, 16, 14, 20];
  const historyTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          headerCell("เลขที่", historyWidths[0]),
          headerCell("รายการ", historyWidths[1]),
          headerCell("เหตุการณ์", historyWidths[2]),
          headerCell("วันเวลา", historyWidths[3]),
          headerCell("ผู้ดำเนินการ", historyWidths[4]),
          headerCell("หมายเหตุ", historyWidths[5]),
        ],
      }),
      ...data.history.map(
        (h) =>
          new TableRow({
            children: [
              bodyCell(h.ticketId, historyWidths[0]),
              bodyCell(h.ticketTitle, historyWidths[1]),
              bodyCell(h.eventLabel, historyWidths[2]),
              bodyCell(h.timestampLabel, historyWidths[3]),
              bodyCell(h.actor, historyWidths[4]),
              bodyCell(h.note, historyWidths[5]),
            ],
          })
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } },
        },
        children: [
          ...(logoImageRun
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [logoImageRun],
                }),
              ]
            : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "รายงานสรุปผลการแจ้งซ่อม — m-service" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `มหาวิทยาลัยราชภัฏมหาสารคาม · สร้างเมื่อ ${data.generatedAtLabel}`,
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          summaryLine("งานทั้งหมด", data.summary.total),
          summaryLine("รอดำเนินการ", data.summary.pending),
          summaryLine("เจ้าหน้าที่รับเรื่องแล้ว", data.summary.accepted),
          summaryLine("กำลังดำเนินการ", data.summary.inProgress),
          summaryLine("เสร็จสิ้น", data.summary.completed),
          summaryLine("ยกเลิก", data.summary.cancelled),
          summaryLine("อัตราการยกเลิก", `${data.summary.cancelRatePercent}%`),
          new Paragraph({ text: "" }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "จำนวนงานแยกตามประเภท" })],
          }),
          categoryTable,
          new Paragraph({ text: "" }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "รายการแจ้งซ่อมทั้งหมด" })],
          }),
          ticketsTable,
          new Paragraph({ text: "" }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "ประวัติการซ่อม" })],
          }),
          historyTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${data.filenameBase}.docx`);
}
