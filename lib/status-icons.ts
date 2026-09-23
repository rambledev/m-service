import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  LucideIcon,
  OctagonAlert,
  TriangleAlert,
  Wrench,
  XCircle,
} from "lucide-react";
import { Priority, TicketStatus } from "@/lib/types";

export const statusIcon: Record<TicketStatus, LucideIcon> = {
  pending: Clock,
  accepted: ClipboardCheck,
  in_progress: Wrench,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export const priorityIcon: Record<Priority, LucideIcon> = {
  normal: Circle,
  urgent: TriangleAlert,
  critical: OctagonAlert,
};
