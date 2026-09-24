import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAllUsers } from "@/lib/data/tickets";
import { formatLocation } from "@/lib/ticket-utils";

interface NotifyPayload {
  ticketId: string;
  title: string;
  categoryLabel: string;
  priorityLabel: string;
  building: string;
  floor: string;
  room: string;
  detail: string;
}

export async function POST(request: NextRequest) {
  console.log("[api/notify-technicians][POST] START");

  let payload: NotifyPayload;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("[api/notify-technicians][POST] ERROR", { reason: "invalid JSON body", error });
    return NextResponse.json({ success: false, message: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  if (!payload.ticketId || !payload.title) {
    console.error("[api/notify-technicians][POST] ERROR", { reason: "missing ticket fields", payload });
    return NextResponse.json({ success: false, message: "ข้อมูลใบแจ้งซ่อมไม่ครบถ้วน" }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    console.error("[api/notify-technicians][POST] ERROR", {
      reason: "SMTP not configured — set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in .env",
    });
    return NextResponse.json(
      { success: false, message: "ยังไม่ได้ตั้งค่าเซิร์ฟเวอร์อีเมล (SMTP) กรุณาติดต่อผู้ดูแลระบบ" },
      { status: 503 }
    );
  }

  const users = await getAllUsers();
  const recipients = users
    .filter((u) => u.role === "technician")
    .map((u) => u.email)
    .filter((email): email is string => !!email);

  if (recipients.length === 0) {
    console.error("[api/notify-technicians][POST] ERROR", { reason: "no technician accounts in the database" });
    return NextResponse.json({ success: false, message: "ไม่พบอีเมลช่างซ่อมในระบบ" }, { status: 200 });
  }

  // Optional override for staging: when set, every notification is redirected to this one
  // address instead of the real technician account(s) — handy for testing without paging the
  // actual on-duty technician.
  const override = process.env.NOTIFY_OVERRIDE_EMAIL;

  const subject = `[m-service] มีรายการแจ้งซ่อมใหม่ ${payload.ticketId}`;
  const location = formatLocation(payload) || "-";
  const text = [
    "มีรายการแจ้งซ่อมใหม่เข้าสู่ระบบ m-service",
    "",
    `เลขที่: ${payload.ticketId}`,
    `รายการ: ${payload.title}`,
    `ประเภทงาน: ${payload.categoryLabel || "-"}`,
    `ความเร่งด่วน: ${payload.priorityLabel || "-"}`,
    `สถานที่: ${location}`,
    `รายละเอียด: ${payload.detail || "-"}`,
    "",
    "กรุณาเข้าสู่ระบบ m-service เพื่อรับงานนี้",
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    if (override) {
      await transporter.sendMail({ from, to: override, subject, text });
    } else {
      // bcc keeps technicians' addresses private from one another.
      await transporter.sendMail({ from, to: from, bcc: recipients, subject, text });
    }

    const sentTo = override ? 1 : recipients.length;
    console.log("[api/notify-technicians][POST] END", { ticketId: payload.ticketId, sentTo });
    return NextResponse.json({ success: true, recipientCount: sentTo });
  } catch (error) {
    console.error("[api/notify-technicians][POST] ERROR", { ticketId: payload.ticketId, error });
    return NextResponse.json({ success: false, message: "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
