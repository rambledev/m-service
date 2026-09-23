export type Role = "requester" | "technician" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  email?: string;
  expertise?: string[];
}

export type CategoryId =
  | "electric"
  | "plumbing"
  | "aircon"
  | "building"
  | "computer"
  | "elevator"
  | "equipment"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  colorVar: string;
}

export type Priority = "normal" | "urgent" | "critical";

export type TicketStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TicketEventType =
  | "created"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "assigned"
  | "note";

export interface TicketEvent {
  id: string;
  type: TicketEventType;
  timestamp: string;
  actor: string;
  note?: string;
  images?: TicketImage[];
}

export interface TicketImage {
  name: string;
  url: string;
}

export interface Ticket {
  id: string;
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
  images: TicketImage[];
  status: TicketStatus;
  technicianId?: string;
  technicianName?: string;
  repairNote?: string;
  repairImages?: TicketImage[];
  createdAt: string;
  updatedAt: string;
  history: TicketEvent[];
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}
