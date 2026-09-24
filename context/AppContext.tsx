"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { CategoryId, Role, Ticket, TicketImage, User } from "@/lib/types";
import {
  acceptTicketAction,
  assignTechnicianAction,
  cancelTicketAction,
  completeTicketAction,
  createTicketAction,
  fetchTicketsAction,
  fetchUsersAction,
  startProgressAction,
  updateCategoryAction,
  type AcceptTicketResult,
  type NewTicketInput,
} from "@/app/actions/tickets";
import { setUserRoleAction } from "@/app/actions/users";

export type { NewTicketInput, AcceptTicketResult };

// Cross-tab/device visibility used to come from a `storage` event trick over localStorage —
// now that tickets live in Postgres, a short poll is the DB-appropriate equivalent (good enough
// without standing up a WebSocket layer nobody asked for).
const POLL_INTERVAL_MS = 20_000;

interface AppContextValue {
  currentUser: User | null;
  isHydrated: boolean;
  logout: () => void;
  users: User[];
  getTechnicians: () => User[];
  setUserRole: (email: string, role: Role) => Promise<User>;
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;
  createTicket: (input: NewTicketInput) => Promise<Ticket>;
  acceptTicket: (ticketId: string) => Promise<AcceptTicketResult>;
  startProgress: (ticketId: string) => Promise<void>;
  completeTicket: (ticketId: string, note: string, images?: TicketImage[]) => Promise<void>;
  assignTechnician: (ticketId: string, technicianId: string) => Promise<void>;
  updateCategory: (ticketId: string, categoryId: CategoryId) => Promise<void>;
  cancelTicket: (ticketId: string, reason: string) => Promise<Ticket>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refetch = useCallback(async () => {
    const [nextTickets, nextUsers] = await Promise.all([fetchTicketsAction(), fetchUsersAction()]);
    setTickets(nextTickets);
    setUsers(nextUsers);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    // Initial data load from the server (an external system) is only possible once the session
    // is authenticated — the sanctioned exception to this rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
      .catch((error) => console.error("[AppContext][initialLoad] ERROR", { error }))
      .finally(() => {
        if (!cancelled) setIsDataLoaded(true);
      });

    pollRef.current = setInterval(() => {
      refetch().catch((error) => console.error("[AppContext][poll] ERROR", { error }));
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, refetch]);

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

  const isHydrated = status !== "loading" && (status !== "authenticated" || isDataLoaded);

  const logout = useCallback(() => {
    void nextAuthSignOut({ callbackUrl: "/login" });
  }, []);

  const getTicket = useCallback((id: string) => tickets.find((t) => t.id === id), [tickets]);

  function upsertTicket(ticket: Ticket) {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t.id === ticket.id);
      if (idx === -1) return [ticket, ...prev];
      const next = [...prev];
      next[idx] = ticket;
      return next;
    });
  }

  const createTicket = useCallback(async (input: NewTicketInput) => {
    const ticket = await createTicketAction(input);
    upsertTicket(ticket);
    return ticket;
  }, []);

  const acceptTicket = useCallback(async (ticketId: string) => {
    console.log("[AppContext][acceptTicket] START", { ticketId });
    const result = await acceptTicketAction(ticketId);
    // The action always returns the ticket's current state (win or lose), so this tab's UI
    // reflects reality immediately even when another technician got there first.
    if (result.ticket) upsertTicket(result.ticket);
    console.log("[AppContext][acceptTicket] END", { ticketId, success: result.success });
    return result;
  }, []);

  const startProgress = useCallback(async (ticketId: string) => {
    const ticket = await startProgressAction(ticketId);
    upsertTicket(ticket);
  }, []);

  const completeTicket = useCallback(async (ticketId: string, note: string, images: TicketImage[] = []) => {
    const ticket = await completeTicketAction(ticketId, note, images);
    upsertTicket(ticket);
  }, []);

  const assignTechnician = useCallback(async (ticketId: string, technicianId: string) => {
    const ticket = await assignTechnicianAction(ticketId, technicianId);
    upsertTicket(ticket);
  }, []);

  const updateCategory = useCallback(async (ticketId: string, categoryId: CategoryId) => {
    const ticket = await updateCategoryAction(ticketId, categoryId);
    upsertTicket(ticket);
  }, []);

  const cancelTicket = useCallback(async (ticketId: string, reason: string) => {
    const ticket = await cancelTicketAction(ticketId, reason);
    upsertTicket(ticket);
    return ticket;
  }, []);

  const getTechnicians = useCallback(() => users.filter((u) => u.role === "technician"), [users]);

  const setUserRole = useCallback(async (email: string, role: Role) => {
    const user = await setUserRoleAction(email, role);
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx === -1) return [...prev, user];
      const next = [...prev];
      next[idx] = user;
      return next;
    });
    return user;
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isHydrated,
      logout,
      users,
      getTechnicians,
      setUserRole,
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
      setUserRole,
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
