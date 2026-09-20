import type {
  Appointment,
  AppState,
  Mechanic,
  Pack,
  Service,
  SlotOption,
} from "./types";

export const LATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function isBlockingStatus(status: Appointment["status"]) {
  return ["pendiente", "confirmado", "en_atencion"].includes(status);
}

export function packRemaining(pack: Pack) {
  return Math.max(0, pack.creditsTotal - pack.creditsUsed);
}

export function syncPackCredits(packs: Pack[], appointments: Appointment[]): Pack[] {
  return packs.map((pack) => {
    const used = appointments.filter((a) => {
      if (a.packId !== pack.id) return false;
      return ["pendiente", "confirmado", "en_atencion", "completado", "cancelacion_tardia", "no_show"].includes(a.status);
    }).length;
    return refreshPackStatus({ ...pack, creditsUsed: used });
  });
}

export function refreshPackStatus(pack: Pack, now = new Date()): Pack {
  if (pack.status === "congelado") return pack;
  const remaining = packRemaining(pack);
  if (remaining <= 0) return { ...pack, status: "agotado" };
  if (now > new Date(`${pack.end}T23:59:59`)) return { ...pack, status: "vencido" };
  return { ...pack, status: "activo" };
}

export function canUsePack(pack: Pack, serviceDate: Date) {
  const day = serviceDate.toISOString().slice(0, 10);
  return (
    pack.status === "activo" &&
    pack.start <= day &&
    day <= pack.end &&
    packRemaining(pack) > 0
  );
}

export function isLateCancel(appointmentStart: string, now = new Date()) {
  return new Date(appointmentStart).getTime() - now.getTime() <= LATE_WINDOW_MS;
}

export function availabilitySlots(params: {
  state: AppState;
  branchId: string;
  service: Service;
  date: string;
  now?: Date;
}): SlotOption[] {
  const { state, branchId, service, date, now = new Date() } = params;
  const mechanics = state.mechanics.filter((m) => m.branchId === branchId);
  const boxes = state.boxes.filter(
    (b) => b.branchId === branchId && (!service.requiresLift || b.hasLift),
  );
  if (!mechanics.length || !boxes.length) return [];

  const slots: SlotOption[] = [];
  const dayStart = new Date(`${date}T00:00:00`);
  for (const mechanic of mechanics) {
    for (let hour = mechanic.startHour; hour < mechanic.endHour; hour++) {
      for (const minute of [0, 30]) {
        const start = new Date(dayStart);
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start.getTime() + service.durationMin * 60_000);
        if (end.getHours() > mechanic.endHour || (end.getHours() === mechanic.endHour && end.getMinutes() > 0)) {
          continue;
        }
        if (start <= now) continue;
        const box = boxes.find((b) =>
          resourceFree(state, mechanic.id, b.id, start, end),
        );
        if (!box) continue;
        slots.push({
          start: start.toISOString(),
          end: end.toISOString(),
          mechanicId: mechanic.id,
          mechanicName: mechanic.name,
          boxId: box.id,
          boxName: box.name,
        });
      }
    }
  }
  slots.sort((a, b) => a.start.localeCompare(b.start));
  return uniqueByStart(slots);
}

function uniqueByStart(slots: SlotOption[]) {
  const seen = new Set<string>();
  return slots.filter((s) => {
    if (seen.has(s.start)) return false;
    seen.add(s.start);
    return true;
  });
}

export function resourceFree(
  state: AppState,
  mechanicId: string,
  boxId: string,
  start: Date,
  end: Date,
  ignoreId?: string,
) {
  return !state.appointments.some((apt) => {
    if (apt.id === ignoreId) return false;
    if (!isBlockingStatus(apt.status)) return false;
    if (apt.mechanicId !== mechanicId && apt.boxId !== boxId) return false;
    return overlaps(start, end, new Date(apt.start), new Date(apt.end));
  });
}

export function nextCode(appointments: Appointment[]) {
  const n = appointments.length + 1;
  return `AB-${String(n).padStart(5, "0")}`;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function mechanicSettlements(state: AppState, mechanic: Mechanic, from: Date, to: Date) {
  const items = state.appointments.filter((a) => {
    if (a.mechanicId !== mechanic.id || a.status !== "completado") return false;
    const d = new Date(a.start);
    return d >= from && d <= to;
  });
  const services = Object.fromEntries(state.services.map((s) => [s.id, s]));
  const lines = items.map((a) => {
    const service = services[a.serviceId];
    const amount = Math.round(service.price * mechanic.commission);
    return { appointment: a, service, amount };
  });
  return { lines, total: lines.reduce((acc, l) => acc + l.amount, 0) };
}

export function formatMoney(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(isoOrDay: string) {
  const d = isoOrDay.length <= 10 ? new Date(`${isoOrDay}T12:00:00`) : new Date(isoOrDay);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function appointmentLabel(status: Appointment["status"]) {
  const map: Record<Appointment["status"], string> = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    cancelado: "Cancelado",
    cancelacion_tardia: "Cancelación tardía",
    en_atencion: "En atención",
    completado: "Completado",
    no_show: "No-show",
  };
  return map[status];
}
