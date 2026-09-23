"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { CategoryId, Ticket, TicketImage, User } from "@/lib/types";
import { generateTicketId } from "@/lib/ticket-utils";
import { buildInitialTickets, SEED_COUNT } from "@/mock/tickets";
import { getCategory } from "@/mock/categories";
import { initialUsers } from "@/mock/users";

const USERS_STORAGE_KEY = "mservice_users_v1";
const TICKETS_STORAGE_KEY = "mservice_tickets_v1";
const SEQ_STORAGE_KEY = "mservice_seq_v1";

export type NewTicketInput = Pick<
  Ticket,
  | "requesterName"
  | "department"
  | "phone"
  | "categoryId"
  | "building"
  | "floor"
  | "room"
  | "detail"
  | "priority"
> & { images: TicketImage[] };

export interface AcceptTicketResult {
  success: boolean;
  message: string;
}

interface AppContextValue {
  currentUser: User | null;
  isHydrated: boolean;
  logout: () => void;
  users: User[];
  getTechnicians: () => User[];
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;
  createTicket: (input: NewTicketInput) => Ticket;
  acceptTicket: (ticketId: string, technician: User) => AcceptTicketResult;
  startProgress: (ticketId: string) => void;
  completeTicket: (ticketId: string, note: string, images?: TicketImage[]) => void;
  assignTechnician: (ticketId: string, technicianId: string) => void;
  updateCategory: (ticketId: string, categoryId: CategoryId) => void;
  cancelTicket: (ticketId: string, reason: string, actorName: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function nowIso(): string {
  return new Date().toISOString();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [nextSeq, setNextSeq] = useState<number>(SEED_COUNT + 1);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
      const storedSeq = localStorage.getItem(SEQ_STORAGE_KEY);

      // Reading localStorage (an external system) is only possible after mount,
      // so hydrating React state here is the sanctioned exception to this rule.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
      setTickets(storedTickets ? JSON.parse(storedTickets) : buildInitialTickets());
      setNextSeq(storedSeq ? Number(storedSeq) : SEED_COUNT + 1);
    } catch {
      setUsers(initialUsers);
      setTickets(buildInitialTickets());
    } finally {
      setIsStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets, isStorageHydrated]);

  // Cross-tab realtime sync: the `storage` event fires in every OTHER tab/window of this
  // origin (never the tab that made the write) whenever localStorage changes — this is what
  // lets "รับงาน" detect a job another technician just accepted in a different tab, without
  // a real backend/websocket. Same-tab updates are already covered by React state directly.
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.newValue === null) return;
      if (e.key === TICKETS_STORAGE_KEY) {
        try {
          console.log("[AppContext][handleStorage] syncing tickets from another tab");
          setTickets(JSON.parse(e.newValue));
        } catch (error) {
          console.error("[AppContext][handleStorage] ERROR", { key: e.key, error });
        }
      } else if (e.key === USERS_STORAGE_KEY) {
        try {
          setUsers(JSON.parse(e.newValue));
        } catch (error) {
          console.error("[AppContext][handleStorage] ERROR", { key: e.key, error });
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    localStorage.setItem(SEQ_STORAGE_KEY, String(nextSeq));
  }, [nextSeq, isStorageHydrated]);

  // Upsert this session's real Google display name into the users directory the first time
  // we see it, so "จัดการผู้ใช้งาน" and technician-assignment dropdowns show real names instead
  // of the raw email placeholder — sticks in localStorage from then on for everyone.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const email = session?.user?.id;
    const realName = session?.user?.name;
    if (!email || !realName) return;
    // Syncing from the external NextAuth session (only known post-mount/post-sign-in) is the
    // same sanctioned exception as the hydration effect above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === email);
      if (idx === -1 || prev[idx].name === realName) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], name: realName };
      return next;
    });
  }, [isStorageHydrated, session?.user?.id, session?.user?.name]);

  const currentUser = useMemo<User | null>(() => {
    if (!session?.user?.id) return null;
    return (
      users.find((u) => u.id === session.user.id) ?? {
        id: session.user.id,
        name: session.user.name ?? session.user.id,
        role: session.user.role ?? "requester",
        email: session.user.id,
      }
    );
  }, [session, users]);

  const isHydrated = isStorageHydrated && status !== "loading";

  const logout = useCallback(() => {
    void nextAuthSignOut({ callbackUrl: "/login" });
  }, []);

  const getTicket = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets]
  );

  const createTicket = useCallback(
    (input: NewTicketInput) => {
      const created = new Date();
      const ticket: Ticket = {
        id: generateTicketId(nextSeq, created),
        title: input.detail.slice(0, 60),
        requesterName: input.requesterName,
        department: input.department,
        phone: input.phone,
        categoryId: input.categoryId,
        building: input.building,
        floor: input.floor,
        room: input.room,
        detail: input.detail,
        priority: input.priority,
        images: input.images,
        status: "pending",
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
        history: [
          {
            id: `${created.getTime()}-created`,
            type: "created",
            timestamp: created.toISOString(),
            actor: input.requesterName,
          },
        ],
      };
      setTickets((prev) => [ticket, ...prev]);
      setNextSeq((n) => n + 1);
      return ticket;
    },
    [nextSeq]
  );

  const updateTicket = useCallback(
    (ticketId: string, updater: (ticket: Ticket) => Ticket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updater(t) : t))
      );
    },
    []
  );

  const acceptTicket = useCallback((ticketId: string, technician: User): AcceptTicketResult => {
    console.log("[AppContext][acceptTicket] START", { ticketId, technicianId: technician.id });

    // Read localStorage directly rather than trusting this tab's React state: localStorage
    // writes are synchronous and immediately visible to any other tab that reads them, but the
    // `storage` *event* that keeps React state in sync can lag by a tick or two. Basing the
    // pending-check on the live storage snapshot (not just in-memory state) closes that race
    // window — this is the "realtime" guard against two technicians both accepting the same job.
    let authoritative: Ticket[];
    try {
      const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
      authoritative = raw ? JSON.parse(raw) : tickets;
    } catch (error) {
      console.error("[AppContext][acceptTicket] ERROR reading localStorage, falling back to state", {
        error,
      });
      authoritative = tickets;
    }

    let result: AcceptTicketResult = { success: false, message: "ไม่พบรายการนี้ในระบบ" };

    const next = authoritative.map((t): Ticket => {
      if (t.id !== ticketId) return t;

      if (t.status !== "pending") {
        result = {
          success: false,
          message: t.technicianName
            ? `รับงานไม่สำเร็จ: ${t.technicianName} รับงานนี้ไปแล้ว`
            : "รับงานไม่สำเร็จ: สถานะของงานนี้เปลี่ยนไปแล้ว",
        };
        return t;
      }

      result = { success: true, message: `รับงาน ${t.id} สำเร็จ` };
      return {
        ...t,
        status: "accepted",
        technicianId: technician.id,
        technicianName: technician.name,
        updatedAt: nowIso(),
        history: [
          ...t.history,
          {
            id: `${Date.now()}-accepted`,
            type: "accepted",
            timestamp: nowIso(),
            actor: technician.name,
          },
        ],
      };
    });

    // Sync React state to the authoritative snapshot even on failure — if this tab's UI was
    // stale (hadn't yet received the `storage` event from whichever tab got there first), this
    // corrects it immediately so the "รับงาน" button reflects reality right away.
    setTickets(next);

    console.log("[AppContext][acceptTicket] END", { ticketId, result });
    return result;
  }, [tickets]);

  const startProgress = useCallback(
    (ticketId: string) => {
      updateTicket(ticketId, (t) => ({
        ...t,
        status: "in_progress",
        updatedAt: nowIso(),
        history: [
          ...t.history,
          {
            id: `${Date.now()}-progress`,
            type: "in_progress",
            timestamp: nowIso(),
            actor: t.technicianName ?? "",
          },
        ],
      }));
    },
    [updateTicket]
  );

  const completeTicket = useCallback(
    (ticketId: string, note: string, images: TicketImage[] = []) => {
      updateTicket(ticketId, (t) => ({
        ...t,
        status: "completed",
        repairNote: note,
        repairImages: images,
        updatedAt: nowIso(),
        history: [
          ...t.history,
          {
            id: `${Date.now()}-completed`,
            type: "completed",
            timestamp: nowIso(),
            actor: t.technicianName ?? "",
            note,
            images,
          },
        ],
      }));
    },
    [updateTicket]
  );

  const assignTechnician = useCallback(
    (ticketId: string, technicianId: string) => {
      const technician = users.find((u) => u.id === technicianId);
      if (!technician) return;
      updateTicket(ticketId, (t) => ({
        ...t,
        status: t.status === "pending" ? "accepted" : t.status,
        technicianId: technician.id,
        technicianName: technician.name,
        updatedAt: nowIso(),
        history: [
          ...t.history,
          {
            id: `${Date.now()}-assigned`,
            type: "assigned",
            timestamp: nowIso(),
            actor: "ผู้ดูแลระบบ",
            note: `มอบหมายงานให้ ${technician.name}`,
          },
        ],
      }));
    },
    [updateTicket, users]
  );

  const updateCategory = useCallback(
    (ticketId: string, categoryId: CategoryId) => {
      updateTicket(ticketId, (t) => {
        if (t.categoryId === categoryId) return t;
        const fromLabel = getCategory(t.categoryId).label;
        const toLabel = getCategory(categoryId).label;
        return {
          ...t,
          categoryId,
          updatedAt: nowIso(),
          history: [
            ...t.history,
            {
              id: `${Date.now()}-note`,
              type: "note",
              timestamp: nowIso(),
              actor: "ผู้ดูแลระบบ",
              note: `เปลี่ยนประเภทงานจาก "${fromLabel}" เป็น "${toLabel}"`,
            },
          ],
        };
      });
    },
    [updateTicket]
  );

  const cancelTicket = useCallback(
    (ticketId: string, reason: string, actorName: string) => {
      updateTicket(ticketId, (t) => ({
        ...t,
        status: "cancelled",
        cancelReason: reason,
        cancelledBy: actorName,
        cancelledAt: nowIso(),
        updatedAt: nowIso(),
        history: [
          ...t.history,
          {
            id: `${Date.now()}-cancelled`,
            type: "cancelled",
            timestamp: nowIso(),
            actor: actorName,
            note: reason,
          },
        ],
      }));
    },
    [updateTicket]
  );

  const getTechnicians = useCallback(
    () => users.filter((u) => u.role === "technician"),
    [users]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isHydrated,
      logout,
      users,
      getTechnicians,
      tickets,
      getTicket,
      createTicket,
      acceptTicket,
      startProgress,
      completeTicket,
      assignTechnician,
      updateCategory,
      cancelTicket,
    }),
    [
      currentUser,
      isHydrated,
      logout,
      users,
      getTechnicians,
      tickets,
      getTicket,
      createTicket,
      acceptTicket,
      startProgress,
      completeTicket,
      assignTechnician,
      updateCategory,
      cancelTicket,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
