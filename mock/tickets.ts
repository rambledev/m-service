import { CategoryId, Priority, Ticket, TicketEvent, TicketStatus } from "@/lib/types";
import { generateTicketId } from "@/lib/ticket-utils";

const TODAY = new Date("2026-09-07T09:00:00+07:00");

function daysAgo(n: number, hour: number, minute: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

interface SeedSpec {
  seq: number;
  daysAgo: number;
  title: string;
  requesterName: string;
  department: string;
  phone: string;
  categoryId: CategoryId;
  building: string;
  floor: string;
  room: string;
  detail: string;
  priority: Priority;
  status: TicketStatus;
  technicianId?: string;
  technicianName?: string;
  repairNote?: string;
  cancelReason?: string;
  cancelledBy?: string;
}

const seeds: SeedSpec[] = [
  {
    seq: 1,
    daysAgo: 6,
    title: "ไฟดับทั้งชั้น 2 อาคารเรียนรวม",
    requesterName: "อรทัย พงษ์ศิริ",
    department: "คณะครุศาสตร์",
    phone: "080-111-2233",
    categoryId: "electric",
    building: "อาคารเรียนรวม",
    floor: "2",
    room: "201",
    detail: "ไฟฟ้าดับทั้งชั้น คาดว่าเบรกเกอร์ตัด นักศึกษาไม่สามารถใช้ห้องเรียนได้",
    priority: "critical",
    status: "completed",
    technicianId: "u-tech-1",
    technicianName: "สมศักดิ์ ซ่อมดี",
    repairNote: "สับเบรกเกอร์ใหม่ และเปลี่ยนสายไฟที่ชำรุดบริเวณตู้คอนโทรล",
  },
  {
    seq: 2,
    daysAgo: 5,
    title: "แอร์ห้องสมุดไม่เย็น",
    requesterName: "กนกวรรณ ทองสุข",
    department: "สำนักวิทยบริการ",
    phone: "080-222-3344",
    categoryId: "aircon",
    building: "อาคารสำนักวิทยบริการ",
    floor: "1",
    room: "ห้องอ่านหนังสือ",
    detail: "เครื่องปรับอากาศทำงานแต่ลมไม่เย็น มีเสียงดังผิดปกติ",
    priority: "urgent",
    status: "completed",
    technicianId: "u-tech-1",
    technicianName: "สมศักดิ์ ซ่อมดี",
    repairNote: "ล้างคอยล์เย็น เติมน้ำยาแอร์ และตรวจสอบคอมเพรสเซอร์เรียบร้อย",
  },
  {
    seq: 3,
    daysAgo: 5,
    title: "คอมพิวเตอร์ห้องปฏิบัติการเปิดไม่ติด",
    requesterName: "ธีรพงษ์ วงศ์คำ",
    department: "คณะวิทยาศาสตร์",
    phone: "080-333-4455",
    categoryId: "computer",
    building: "อาคารวิทยาศาสตร์",
    floor: "3",
    room: "Lab 304",
    detail: "เครื่องคอมพิวเตอร์ 5 เครื่องเปิดไม่ติด คาดว่า Power Supply เสีย",
    priority: "normal",
    status: "completed",
    technicianId: "u-tech-2",
    technicianName: "วิไล คล่องแคล่ว",
    repairNote: "เปลี่ยน Power Supply จำนวน 3 เครื่อง อีก 2 เครื่องแก้ไขสายไฟหลวม",
  },
  {
    seq: 4,
    daysAgo: 4,
    title: "ลิฟต์หอพักนักศึกษาหญิงขัดข้อง",
    requesterName: "ปิยะดา แสงจันทร์",
    department: "กองพัฒนานักศึกษา",
    phone: "080-444-5566",
    categoryId: "elevator",
    building: "หอพักนักศึกษาหญิง 1",
    floor: "1",
    room: "โถงลิฟต์",
    detail: "ลิฟต์ขัดข้อง ไม่สามารถใช้งานได้ นักศึกษาต้องเดินขึ้นบันไดแทน",
    priority: "urgent",
    status: "completed",
    technicianId: "u-tech-1",
    technicianName: "สมศักดิ์ ซ่อมดี",
    repairNote: "ตรวจสอบมอเตอร์ลิฟต์และรีเซ็ตระบบควบคุม ลิฟต์กลับมาใช้งานได้ปกติ",
  },
  {
    seq: 5,
    daysAgo: 4,
    title: "ก๊อกน้ำห้องน้ำชายรั่วซึม",
    requesterName: "สุริยา ภูมิรัตน์",
    department: "คณะเทคโนโลยีการเกษตร",
    phone: "080-555-6677",
    categoryId: "plumbing",
    building: "อาคารเทคโนโลยีการเกษตร",
    floor: "1",
    room: "ห้องน้ำชาย",
    detail: "ก๊อกน้ำอ่างล้างมือรั่วตลอดเวลา น้ำขังบนพื้น",
    priority: "normal",
    status: "in_progress",
    technicianId: "u-tech-3",
    technicianName: "ประยุทธ มั่นคง",
  },
  {
    seq: 6,
    daysAgo: 3,
    title: "โปรเจกเตอร์ห้องประชุมภาพเพี้ยน",
    requesterName: "มานพ เจริญสุข",
    department: "สำนักงานอธิการบดี",
    phone: "080-666-7788",
    categoryId: "equipment",
    building: "อาคารสำนักงานอธิการบดี",
    floor: "3",
    room: "ห้องประชุมใหญ่",
    detail: "โปรเจกเตอร์แสดงภาพสีเพี้ยน มีเส้นแนวนอนขึ้นตลอด",
    priority: "urgent",
    status: "in_progress",
    technicianId: "u-tech-3",
    technicianName: "ประยุทธ มั่นคง",
  },
  {
    seq: 7,
    daysAgo: 3,
    title: "เพดานฝ้าห้องเรียนแตกร่อน",
    requesterName: "ศิริพร บุญมี",
    department: "คณะมนุษยศาสตร์",
    phone: "080-777-8899",
    categoryId: "building",
    building: "อาคารมนุษยศาสตร์",
    floor: "2",
    room: "205",
    detail: "แผ่นฝ้าเพดานแตกร่อนและมีรอยน้ำรั่วซึม เสี่ยงตกใส่นักศึกษา",
    priority: "critical",
    status: "in_progress",
    technicianId: "u-tech-1",
    technicianName: "สมศักดิ์ ซ่อมดี",
  },
  {
    seq: 8,
    daysAgo: 2,
    title: "ปลั๊กไฟห้องพักอาจารย์ชำรุด",
    requesterName: "จิรายุ ศรีสุข",
    department: "คณะบริหารธุรกิจ",
    phone: "080-888-9900",
    categoryId: "electric",
    building: "อาคารบริหารธุรกิจ",
    floor: "4",
    room: "ห้องพักอาจารย์",
    detail: "ปลั๊กไฟมีรอยไหม้ กลิ่นเหม็นไหม้เล็กน้อยเมื่อเสียบปลั๊ก",
    priority: "urgent",
    status: "accepted",
    technicianId: "u-tech-1",
    technicianName: "สมศักดิ์ ซ่อมดี",
  },
  {
    seq: 9,
    daysAgo: 2,
    title: "เครื่องพิมพ์สำนักงานทะเบียนใช้งานไม่ได้",
    requesterName: "นภาพร ยิ้มแย้ม",
    department: "สำนักส่งเสริมวิชาการ",
    phone: "080-999-0011",
    categoryId: "computer",
    building: "อาคารสำนักส่งเสริมวิชาการ",
    floor: "1",
    room: "งานทะเบียน",
    detail: "เครื่องพิมพ์แจ้ง Error กระดาษติดตลอด ลองแก้ไขเบื้องต้นแล้วไม่หาย",
    priority: "normal",
    status: "accepted",
    technicianId: "u-tech-2",
    technicianName: "วิไล คล่องแคล่ว",
  },
  {
    seq: 10,
    daysAgo: 1,
    title: "ท่อประปาแตกหน้าอาคารพลศึกษา",
    requesterName: "อนุชา ทรงพล",
    department: "คณะครุศาสตร์",
    phone: "080-101-2020",
    categoryId: "plumbing",
    building: "อาคารพลศึกษา",
    floor: "ชั้นล่าง",
    room: "ลานจอดรถหน้าอาคาร",
    detail: "ท่อประปาแตกน้ำไหลนองพื้น เสี่ยงลื่นล้มและสิ้นเปลืองน้ำ",
    priority: "critical",
    status: "pending",
  },
  {
    seq: 11,
    daysAgo: 1,
    title: "จอคอมพิวเตอร์ห้องธุรการไม่ติด",
    requesterName: "รัตนา แก้วมณี",
    department: "กองกลาง",
    phone: "080-202-3030",
    categoryId: "computer",
    building: "อาคารสำนักงานอธิการบดี",
    floor: "2",
    room: "ห้องธุรการ",
    detail: "จอภาพไม่แสดงผล ตรวจสอบสายสัญญาณเบื้องต้นแล้วยังไม่ติด",
    priority: "normal",
    status: "pending",
  },
  {
    seq: 12,
    daysAgo: 0,
    title: "กลอนประตูห้องเรียนชำรุด",
    requesterName: "วัชระ ศรีวิไล",
    department: "คณะเทคโนโลยีการเกษตร",
    phone: "080-303-4040",
    categoryId: "building",
    building: "อาคารเทคโนโลยีการเกษตร",
    floor: "2",
    room: "210",
    detail: "กลอนประตูล็อกไม่ได้ ประตูปิดไม่สนิท",
    priority: "normal",
    status: "pending",
  },
  {
    seq: 13,
    daysAgo: 0,
    title: "ครุภัณฑ์โต๊ะเก้าอี้ห้องประชุมชำรุด",
    requesterName: "เบญจมาศ อินทร์แก้ว",
    department: "สำนักงานอธิการบดี",
    phone: "080-404-5050",
    categoryId: "equipment",
    building: "อาคารสำนักงานอธิการบดี",
    floor: "3",
    room: "ห้องประชุมเล็ก",
    detail: "เก้าอี้ล้อเลื่อนหักหลายตัว ใช้งานไม่ได้",
    priority: "normal",
    status: "pending",
  },
  {
    seq: 14,
    daysAgo: 3,
    title: "ขอให้ติดตั้งจุดชาร์จโน้ตบุ๊กเพิ่มเติม",
    requesterName: "ชนากานต์ พลอยงาม",
    department: "คณะวิทยาการจัดการ",
    phone: "080-505-6060",
    categoryId: "other",
    building: "อาคารวิทยาการจัดการ",
    floor: "1",
    room: "โถงกิจกรรม",
    detail: "อยากให้เพิ่มปลั๊กไฟสำหรับชาร์จโน้ตบุ๊กบริเวณโถงกิจกรรม",
    priority: "normal",
    status: "cancelled",
    cancelReason: "เป็นคำขอปรับปรุงเพิ่มเติม ไม่ใช่การแจ้งซ่อมเร่งด่วน ให้ยื่นเป็นโครงการแทน",
    cancelledBy: "สมชาย ใจดี",
  },
  {
    seq: 15,
    daysAgo: 2,
    title: "เครื่องปรับอากาศห้องพักครูมีเสียงดัง",
    requesterName: "ทัศนีย์ บุญเรือง",
    department: "คณะครุศาสตร์",
    phone: "080-606-7070",
    categoryId: "aircon",
    building: "อาคารครุศาสตร์",
    floor: "3",
    room: "ห้องพักครู",
    detail: "แจ้งซ้ำกับรายการที่แก้ไขไปแล้วเมื่อวาน ขอยกเลิกรายการนี้",
    priority: "normal",
    status: "cancelled",
    cancelReason: "แจ้งซ้ำกับรายการที่มีช่างดำเนินการแก้ไขให้แล้ว",
    cancelledBy: "สมชาย ใจดี",
  },
];

function buildHistory(spec: SeedSpec, created: Date): TicketEvent[] {
  const history: TicketEvent[] = [
    {
      id: `${spec.seq}-created`,
      type: "created",
      timestamp: created.toISOString(),
      actor: spec.requesterName,
    },
  ];

  if (spec.status === "cancelled") {
    const cancelledAt = new Date(created);
    cancelledAt.setHours(cancelledAt.getHours() + 2);
    history.push({
      id: `${spec.seq}-cancelled`,
      type: "cancelled",
      timestamp: cancelledAt.toISOString(),
      actor: spec.cancelledBy ?? spec.requesterName,
      note: spec.cancelReason,
    });
    return history;
  }

  if (spec.status === "pending") return history;

  const acceptedAt = new Date(created);
  acceptedAt.setHours(acceptedAt.getHours() + 1, acceptedAt.getMinutes() + 30);
  history.push({
    id: `${spec.seq}-accepted`,
    type: "accepted",
    timestamp: acceptedAt.toISOString(),
    actor: spec.technicianName ?? "",
  });

  if (spec.status === "accepted") return history;

  const progressAt = new Date(acceptedAt);
  progressAt.setMinutes(progressAt.getMinutes() + 30);
  history.push({
    id: `${spec.seq}-progress`,
    type: "in_progress",
    timestamp: progressAt.toISOString(),
    actor: spec.technicianName ?? "",
  });

  if (spec.status === "in_progress") return history;

  const completedAt = new Date(progressAt);
  completedAt.setHours(completedAt.getHours() + 2);
  history.push({
    id: `${spec.seq}-completed`,
    type: "completed",
    timestamp: completedAt.toISOString(),
    actor: spec.technicianName ?? "",
    note: spec.repairNote,
  });

  return history;
}

export function buildInitialTickets(): Ticket[] {
  return seeds.map((spec) => {
    const created = daysAgo(spec.daysAgo, 9, 0);
    const history = buildHistory(spec, created);
    const updatedAt = history[history.length - 1].timestamp;

    return {
      id: generateTicketId(spec.seq, created),
      title: spec.title,
      requesterName: spec.requesterName,
      department: spec.department,
      phone: spec.phone,
      categoryId: spec.categoryId,
      building: spec.building,
      floor: spec.floor,
      room: spec.room,
      detail: spec.detail,
      priority: spec.priority,
      images: [],
      status: spec.status,
      technicianId: spec.technicianId,
      technicianName: spec.technicianName,
      repairNote: spec.repairNote,
      createdAt: created.toISOString(),
      updatedAt,
      history,
      cancelReason: spec.cancelReason,
      cancelledBy: spec.cancelledBy,
      cancelledAt: spec.status === "cancelled" ? updatedAt : undefined,
    } satisfies Ticket;
  });
}

export const SEED_COUNT = seeds.length;
