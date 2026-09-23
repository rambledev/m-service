"use client";

import { FormEvent, ReactNode, useState } from "react";
import { FileText, ImageIcon, LucideIcon, MapPin, Send, TriangleAlert, User } from "lucide-react";
import { CategoryId, Priority, TicketImage } from "@/lib/types";
import { categories } from "@/mock/categories";
import { NewTicketInput } from "@/context/AppContext";
import Button from "@/components/Button";
import ImageUploader from "@/components/ImageUploader";

const priorityOptions: { value: Priority; label: string; desc: string }[] = [
  { value: "normal", label: "ปกติ", desc: "ดำเนินการตามลำดับคิว" },
  { value: "urgent", label: "เร่งด่วน", desc: "กระทบการเรียนการสอน/การทำงาน" },
  { value: "critical", label: "ด่วนมาก", desc: "อันตราย หรือกระทบวงกว้าง" },
];

interface RepairFormProps {
  defaultName: string;
  defaultDepartment: string;
  defaultPhone: string;
  onSubmit: (input: NewTicketInput) => void;
  submitting?: boolean;
}

const fieldClass =
  "w-full rounded-lg border bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--text-primary)]";

function SectionHeader({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
      <Icon className="h-4 w-4" style={{ color: "var(--brand-primary)" }} aria-hidden />
      {children}
    </h2>
  );
}

export default function RepairForm({
  defaultName,
  defaultDepartment,
  defaultPhone,
  onSubmit,
  submitting,
}: RepairFormProps) {
  const [requesterName, setRequesterName] = useState(defaultName);
  const [department, setDepartment] = useState(defaultDepartment);
  const [phone, setPhone] = useState(defaultPhone);
  const [categoryId, setCategoryId] = useState<CategoryId | "">("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [images, setImages] = useState<TicketImage[]>([]);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("กรุณาเลือกประเภทงานซ่อม");
      return;
    }
    if (!detail.trim()) {
      setError("กรุณาระบุรายละเอียดปัญหา");
      return;
    }
    setError("");
    onSubmit({
      requesterName,
      department,
      phone,
      categoryId,
      building,
      floor,
      room,
      detail,
      priority,
      images,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm sm:p-7"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <section>
        <SectionHeader icon={User}>ข้อมูลผู้แจ้ง</SectionHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>ชื่อ</label>
            <input
              className={fieldClass}
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>หน่วยงาน</label>
            <input
              className={fieldClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>เบอร์โทร</label>
            <input
              className={fieldClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
          ประเภทงานซ่อม <span style={{ color: "var(--status-critical)" }}>*</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className="flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor:
                  categoryId === cat.id ? "var(--brand-primary)" : "var(--border-hairline)",
                backgroundColor:
                  categoryId === cat.id ? "var(--brand-primary-soft)" : "var(--surface-2)",
              }}
            >
              <span className="text-xl" aria-hidden>
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader icon={MapPin}>สถานที่</SectionHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>อาคาร</label>
            <input
              className={fieldClass}
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="เช่น อาคารเรียนรวม"
            />
          </div>
          <div>
            <label className={labelClass}>ชั้น</label>
            <input
              className={fieldClass}
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="เช่น 2"
            />
          </div>
          <div>
            <label className={labelClass}>ห้อง</label>
            <input
              className={fieldClass}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="เช่น 201"
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={FileText}>
          รายละเอียดปัญหา <span className="ml-0.5" style={{ color: "var(--status-critical)" }}>*</span>
        </SectionHeader>
        <textarea
          className={fieldClass}
          rows={4}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="อธิบายอาการหรือปัญหาที่พบ"
        />
      </section>

      <section>
        <SectionHeader icon={TriangleAlert}>ระดับความเร่งด่วน</SectionHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {priorityOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setPriority(opt.value)}
              className="rounded-xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: priority === opt.value ? "var(--brand-primary)" : "var(--border-hairline)",
                backgroundColor:
                  priority === opt.value ? "var(--brand-primary-soft)" : "var(--surface-2)",
              }}
            >
              <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader icon={ImageIcon}>แนบรูปภาพ</SectionHeader>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {error && (
        <p
          className="animate-fade-in rounded-lg px-3 py-2 text-sm"
          style={{ color: "var(--status-critical)", backgroundColor: "var(--status-critical-soft)" }}
        >
          {error}
        </p>
      )}

      <Button type="submit" loading={submitting} icon={Send} size="md" className="sm:self-start sm:px-8">
        ส่งแจ้งซ่อม
      </Button>
    </form>
  );
}
