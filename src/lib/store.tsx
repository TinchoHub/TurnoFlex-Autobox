import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  appointmentLabel,
  availabilitySlots,
  canUsePack,
  isLateCancel,
  nextCode,
  refreshPackStatus,
  resourceFree,
  syncPackCredits,
  uid,
} from "./engine";
import { createSeed } from "./seed";
import type { Appointment, AppState, PaymentKind, Role, Service } from "./types";

const KEY = "turnoflex-autobox-v1";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* ignore */
  }
  return createSeed();
}

function persist(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

interface Store extends AppState {
  login: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  currentUser: AppState["users"][number] | null;
  currentClient: AppState["clients"][number] | undefined;
  book: (input: {
    vehicleId: string;
    serviceId: string;
    branchId: string;
    start: string;
    end: string;
    mechanicId: string;
    boxId: string;
    paymentKind: PaymentKind;
    packId?: string;
  }) => { ok: true; code: string } | { ok: false; error: string };
  cancelAppointment: (appointmentId: string) => { ok: true; message: string } | { ok: false; error: string };
  setAppointmentStatus: (appointmentId: string, status: Appointment["status"]) => { ok: true } | { ok: false; error: string };
  requestFreeze: (packId: string, days: number, reason: string) => void;
  resolveFreeze: (freezeId: string, approve: boolean) => void;
  resolveException: (id: string, approve: boolean) => void;
  requestException: (reason: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const s = loadState();
    return { ...s, packs: syncPackCredits(s.packs, s.appointments) };
  });

  const write = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const raw = updater(prev);
      const next = { ...raw, packs: syncPackCredits(raw.packs, raw.appointments) };
      persist(next);
      return next;
    });
  };

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const currentClient = state.clients.find((c) => c.id === currentUser?.clientId);

  const store: Store = useMemo(() => {
    return {
      ...state,
      currentUser,
      currentClient,
      login: (userId) => write((p) => ({ ...p, currentUserId: userId })),
      logout: () => write((p) => ({ ...p, currentUserId: null })),
      resetDemo: () => {
        localStorage.removeItem(KEY);
        const fresh = createSeed();
        persist(fresh);
        setState(fresh);
      },
      book: (input) => {
        if (!currentUser?.clientId) return { ok: false, error: "Tenés que ingresar como cliente para reservar." };
        const service = state.services.find((s) => s.id === input.serviceId);
        if (!service) return { ok: false, error: "El servicio seleccionado ya no está disponible." };
        const start = new Date(input.start);
        const end = new Date(input.end);
        if (!resourceFree(state, input.mechanicId, input.boxId, start, end)) {
          return { ok: false, error: "El horario seleccionado dejó de estar disponible. Elegí otro horario para continuar." };
        }
        let packId = input.packId;
        let amountPaid = 0;
        if (input.paymentKind === "pack") {
          const pack = state.packs.find((p) => p.id === packId && p.clientId === currentUser.clientId);
          if (!pack || !canUsePack(pack, start) || !service.packEligible) {
            return { ok: false, error: "Ese crédito no se puede usar: el pack no está vigente o el servicio no está incluido." };
          }
        } else {
          amountPaid = service.deposit;
        }
        const id = uid("apt");
        const code = nextCode(state.appointments);
        write((prev) => ({
          ...prev,
          appointments: [
            ...prev.appointments,
            {
              id,
              code,
              clientId: currentUser.clientId!,
              vehicleId: input.vehicleId,
              serviceId: input.serviceId,
              branchId: input.branchId,
              mechanicId: input.mechanicId,
              boxId: input.boxId,
              start: input.start,
              end: input.end,
              status: "confirmado",
              paymentKind: input.paymentKind,
              packId,
              amountPaid,
              depositLost: 0,
              createdAt: new Date().toISOString(),
            },
          ],
          audit: [
            ...prev.audit,
            {
              id: uid("au"),
              at: new Date().toISOString(),
              actorId: currentUser.id,
              action: "reserva",
              detail: `Reserva ${code} confirmada`,
            },
          ],
        }));
        return { ok: true, code };
      },
      cancelAppointment: (appointmentId) => {
        const apt = state.appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "No encontramos ese turno." };
        if (!["pendiente", "confirmado"].includes(apt.status)) {
          return { ok: false, error: "Ese turno ya no se puede cancelar desde el portal." };
        }
        const late = isLateCancel(apt.start);
        const service = state.services.find((s) => s.id === apt.serviceId)!;
        write((prev) => {
          const nextApt: Appointment = {
            ...apt,
            status: late ? "cancelacion_tardia" : "cancelado",
            depositLost: late && apt.paymentKind === "individual" ? service.deposit : 0,
          };
          return {
            ...prev,
            appointments: prev.appointments.map((a) => (a.id === apt.id ? nextApt : a)),
            audit: [
              ...prev.audit,
              {
                id: uid("au"),
                at: new Date().toISOString(),
                actorId: currentUser?.id ?? "sistema",
                action: "cancelacion",
                detail: `${apt.code} · ${late ? "tardía" : "sin penalización"} · ${appointmentLabel(nextApt.status)}`,
              },
            ],
          };
        });
        if (!late) {
          return {
            ok: true,
            message: apt.paymentKind === "pack"
              ? "Turno cancelado. El crédito volvió a tu pack porque faltaban más de 24 horas."
              : "Turno cancelado sin penalización. El horario ya está libre para otro cliente.",
          };
        }
        return {
          ok: true,
          message: apt.paymentKind === "pack"
            ? "Cancelación tardía: se consume 1 crédito del pack, según la política de AutoBox."
            : `Cancelación tardía: se pierde la seña de ${service.deposit.toLocaleString("es-AR")} ARS.`,
        };
      },
      setAppointmentStatus: (appointmentId, status) => {
        const apt = state.appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Turno inexistente." };
        write((prev) => {
          return {
            ...prev,
            appointments: prev.appointments.map((a) => (a.id === appointmentId ? { ...a, status } : a)),
            audit: [
              ...prev.audit,
              {
                id: uid("au"),
                at: new Date().toISOString(),
                actorId: currentUser?.id ?? "sistema",
                action: "estado",
                detail: `${apt.code} → ${appointmentLabel(status)}`,
              },
            ],
          };
        });
        return { ok: true };
      },
      requestFreeze: (packId, days, reason) => {
        write((prev) => ({
          ...prev,
          freezes: [
            ...prev.freezes,
            {
              id: uid("fz"),
              packId,
              requestedBy: currentUser?.id ?? "cliente",
              days,
              reason,
              status: "pendiente",
              at: new Date().toISOString(),
            },
          ],
        }));
      },
      resolveFreeze: (freezeId, approve) => {
        write((prev) => {
          const freeze = prev.freezes.find((f) => f.id === freezeId);
          if (!freeze) return prev;
          let packs = prev.packs;
          let newEndDate: string | undefined;
          if (approve) {
            packs = prev.packs.map((p) => {
              if (p.id !== freeze.packId) return p;
              const end = new Date(`${p.end}T12:00:00`);
              end.setDate(end.getDate() + freeze.days);
              newEndDate = end.toISOString().slice(0, 10);
              return refreshPackStatus({ ...p, end: newEndDate, status: "activo" });
            });
          }
          return {
            ...prev,
            packs,
            freezes: prev.freezes.map((f) =>
              f.id === freezeId
                ? {
                    ...f,
                    status: approve ? "aprobado" : "rechazado",
                    approvedBy: currentUser?.id,
                    newEndDate,
                  }
                : f,
            ),
            audit: [
              ...prev.audit,
              {
                id: uid("au"),
                at: new Date().toISOString(),
                actorId: currentUser?.id ?? "coord",
                action: "congelamiento",
                detail: `${approve ? "Aprobado" : "Rechazado"} ${freeze.packId} (${freeze.days} días)`,
              },
            ],
          };
        });
      },
      resolveException: (id, approve) => {
        write((prev) => ({
          ...prev,
          exceptions: prev.exceptions.map((e) =>
            e.id === id
              ? { ...e, status: approve ? "aprobada" : "rechazada", resolvedBy: currentUser?.id }
              : e,
          ),
        }));
      },
      requestException: (reason) => {
        write((prev) => ({
          ...prev,
          exceptions: [
            ...prev.exceptions,
            {
              id: uid("ex"),
              at: new Date().toISOString(),
              requestedBy: currentUser?.id ?? "mecanico",
              branchId: currentUser?.branchId ?? "norte",
              reason,
              status: "pendiente",
            },
          ],
        }));
      },
    };
  }, [state, currentUser, currentClient]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}

export function roleHome(role: Role) {
  if (role === "cliente") return "/portal";
  if (role === "recepcion") return "/recepcion";
  if (role === "mecanico") return "/taller";
  if (role === "coordinador") return "/coordinacion";
  return "/dashboard";
}

export function slotsFor(state: AppState, branchId: string, service: Service, date: string) {
  return availabilitySlots({ state, branchId, service, date });
}
