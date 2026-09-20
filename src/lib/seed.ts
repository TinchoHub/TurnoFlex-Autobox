import type { AppState } from "./types";
import { uid } from "./engine";

function iso(day: string, hour: number, minute = 0) {
  const d = new Date(`${day}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function plus(day: string, hour: number, duration: number, minute = 0) {
  const start = new Date(`${day}T00:00:00`);
  start.setHours(hour, minute, 0, 0);
  return new Date(start.getTime() + duration * 60_000).toISOString();
}

export function createSeed(): AppState {
  const branches = [
    { id: "norte", name: "AutoBox Norte", zone: "Zona Norte GBA", address: "Av. Maipú 2400, Vicente López" },
    { id: "oeste", name: "AutoBox Oeste", zone: "Zona Oeste GBA", address: "Rivadavia 18500, Morón" },
    { id: "caba", name: "AutoBox CABA", zone: "Ciudad Autónoma de Buenos Aires", address: "Av. San Juan 2150, CABA" },
  ];

  const services = [
    { id: "aceite", name: "Cambio de aceite y filtros", durationMin: 60, requiresLift: true, price: 45000, deposit: 8000, packEligible: true },
    { id: "revision", name: "Revisión general", durationMin: 90, requiresLift: true, price: 62000, deposit: 10000, packEligible: true },
    { id: "frenos", name: "Frenos", durationMin: 90, requiresLift: true, price: 88000, deposit: 15000, packEligible: false },
    { id: "suspension", name: "Suspensión", durationMin: 120, requiresLift: true, price: 110000, deposit: 18000, packEligible: false },
    { id: "alineacion", name: "Alineación y balanceo", durationMin: 60, requiresLift: false, price: 38000, deposit: 7000, packEligible: true },
    { id: "bateria", name: "Baterías", durationMin: 45, requiresLift: false, price: 28000, deposit: 5000, packEligible: false },
    { id: "diagnostico", name: "Diagnóstico automotor", durationMin: 60, requiresLift: false, price: 35000, deposit: 6000, packEligible: false },
    { id: "preventivo", name: "Mantenimiento preventivo", durationMin: 90, requiresLift: true, price: 70000, deposit: 12000, packEligible: true },
  ];

  const mechanics = [
    { id: "m1", name: "Diego Rivas", branchId: "norte", specialties: ["preventivo", "aceite"], startHour: 8, endHour: 17, commission: 0.35 },
    { id: "m2", name: "Sofía Lang", branchId: "norte", specialties: ["frenos", "suspension"], startHour: 8, endHour: 17, commission: 0.35 },
    { id: "m3", name: "Pablo Núñez", branchId: "oeste", specialties: ["alineacion", "bateria"], startHour: 8, endHour: 17, commission: 0.35 },
    { id: "m4", name: "Carla Méndez", branchId: "oeste", specialties: ["diagnostico", "revision"], startHour: 9, endHour: 18, commission: 0.35 },
    { id: "m5", name: "Iván Costa", branchId: "caba", specialties: ["preventivo", "frenos"], startHour: 8, endHour: 17, commission: 0.35 },
    { id: "m6", name: "Laura Pérez", branchId: "caba", specialties: ["aceite", "revision"], startHour: 8, endHour: 16, commission: 0.35 },
  ];

  const boxes = [
    { id: "b1", name: "Box 1 · Elevador", branchId: "norte", hasLift: true },
    { id: "b2", name: "Box 2 · Rápido", branchId: "norte", hasLift: false },
    { id: "b3", name: "Box 1 · Elevador", branchId: "oeste", hasLift: true },
    { id: "b4", name: "Box 2 · Diagnóstico", branchId: "oeste", hasLift: false },
    { id: "b5", name: "Box 1 · Elevador", branchId: "caba", hasLift: true },
    { id: "b6", name: "Box 2 · Elevador", branchId: "caba", hasLift: true },
  ];

  const clients = [
    { id: "c1", name: "Ana Gómez", email: "ana.gomez@mail.com", kind: "particular" as const },
    { id: "c2", name: "Martín Duarte", email: "mduarte@mail.com", kind: "particular" as const },
    { id: "c3", name: "Flota ABC", email: "flota@distribuidoraabc.com", kind: "flota" as const, company: "Distribuidora ABC" },
    { id: "c4", name: "Reparto Sur", email: "ops@repartosur.com", kind: "flota" as const, company: "Reparto Sur" },
  ];

  const vehicles = [
    { id: "v1", clientId: "c1", plate: "AB 123 CD", brand: "Volkswagen", model: "Gol Trend", year: 2016 },
    { id: "v2", clientId: "c1", plate: "AD 890 EF", brand: "Toyota", model: "Etios", year: 2019 },
    { id: "v3", clientId: "c2", plate: "AF 445 GH", brand: "Ford", model: "Focus", year: 2014 },
    { id: "v4", clientId: "c3", plate: "AA 101 FL", brand: "Fiat", model: "Fiorino", year: 2018 },
    { id: "v5", clientId: "c3", plate: "AA 102 FL", brand: "Fiat", model: "Fiorino", year: 2018 },
    { id: "v6", clientId: "c3", plate: "AA 103 FL", brand: "Peugeot", model: "Partner", year: 2017 },
    { id: "v7", clientId: "c3", plate: "AA 104 FL", brand: "Renault", model: "Kangoo", year: 2015 },
    { id: "v8", clientId: "c3", plate: "AA 105 FL", brand: "Fiat", model: "Fiorino", year: 2020 },
    { id: "v9", clientId: "c3", plate: "AA 106 FL", brand: "Citroën", model: "Berlingo", year: 2016 },
    { id: "v10", clientId: "c4", plate: "AC 220 RS", brand: "Chevrolet", model: "Montana", year: 2013 },
  ];

  const users = [
    { id: "u-ana", name: "Ana Gómez", email: "ana.gomez@mail.com", role: "cliente" as const, clientId: "c1" },
    { id: "u-abc", name: "Distribuidora ABC", email: "flota@distribuidoraabc.com", role: "cliente" as const, clientId: "c3" },
    { id: "u-rec", name: "Lucía Benítez", email: "recepcion@autobox.com", role: "recepcion" as const, branchId: "norte" },
    { id: "u-mec", name: "Diego Rivas", email: "diego.rivas@autobox.com", role: "mecanico" as const, branchId: "norte", mechanicId: "m1" },
    { id: "u-coo", name: "Jorge Palacios", email: "norte@autobox.com", role: "coordinador" as const, branchId: "norte" },
    { id: "u-ger", name: "Elena Varela", email: "gerencia@autobox.com", role: "gerencia" as const },
  ];

  const packs = [
    {
      id: "p1",
      clientId: "c3",
      name: "Pack Flota 10",
      creditsTotal: 10,
      creditsUsed: 4,
      start: "2026-08-01",
      end: "2026-09-30",
      status: "activo" as const,
      paidAmount: 520000,
      paidAt: "2026-08-01T12:00:00",
    },
    {
      id: "p2",
      clientId: "c4",
      name: "Pack Flota 10",
      creditsTotal: 10,
      creditsUsed: 8,
      start: "2026-07-01",
      end: "2026-08-31",
      status: "vencido" as const,
      paidAmount: 520000,
      paidAt: "2026-07-01T12:00:00",
    },
    {
      id: "p3",
      clientId: "c3",
      name: "Pack Flota 10 · Q4",
      creditsTotal: 10,
      creditsUsed: 0,
      start: "2026-10-01",
      end: "2026-11-30",
      status: "activo" as const,
      paidAmount: 520000,
      paidAt: "2026-09-02T10:00:00",
    },
  ];

  const appointments = [
    apt("a1", "AB-00001", "c1", "v1", "aceite", "norte", "m1", "b1", "2026-08-12", 9, 60, "completado", "individual", 45000),
    apt("a2", "AB-00002", "c1", "v1", "revision", "norte", "m2", "b1", "2026-08-28", 10, 90, "no_show", "individual", 10000, undefined, 10000),
    apt("a3", "AB-00003", "c2", "v3", "frenos", "oeste", "m3", "b3", "2026-08-18", 11, 90, "completado", "individual", 88000),
    apt("a4", "AB-00004", "c3", "v4", "preventivo", "norte", "m1", "b1", "2026-08-05", 8, 90, "completado", "pack", 0, "p1"),
    apt("a5", "AB-00005", "c3", "v5", "aceite", "norte", "m1", "b1", "2026-08-14", 14, 60, "completado", "pack", 0, "p1"),
    apt("a6", "AB-00006", "c3", "v6", "alineacion", "oeste", "m3", "b4", "2026-08-20", 9, 60, "completado", "pack", 0, "p1"),
    apt("a7", "AB-00007", "c3", "v7", "preventivo", "caba", "m5", "b5", "2026-08-26", 10, 90, "completado", "pack", 0, "p1"),
    apt("a8", "AB-00008", "c4", "v10", "revision", "oeste", "m4", "b3", "2026-08-10", 9, 90, "completado", "pack", 0, "p2"),
    apt("a9", "AB-00009", "c2", "v3", "diagnostico", "oeste", "m4", "b4", "2026-09-02", 15, 60, "cancelacion_tardia", "individual", 0, undefined, 6000),
    apt("a10", "AB-00010", "c1", "v2", "bateria", "caba", "m6", "b5", "2026-09-03", 11, 45, "completado", "individual", 28000),
    apt("a11", "AB-00011", "c3", "v8", "preventivo", "norte", "m1", "b1", "2026-09-08", 9, 90, "confirmado", "pack", 0, "p1"),
    apt("a12", "AB-00012", "c1", "v1", "alineacion", "norte", "m2", "b2", "2026-09-09", 10, 60, "confirmado", "individual", 7000),
    apt("a13", "AB-00013", "c3", "v9", "aceite", "caba", "m6", "b6", "2026-09-10", 8, 60, "confirmado", "pack", 0, "p1"),
    apt("a14", "AB-00014", "c2", "v3", "suspension", "oeste", "m3", "b3", "2026-09-04", 8, 120, "no_show", "individual", 0, undefined, 18000),
    apt("a15", "AB-00015", "c1", "v2", "revision", "caba", "m5", "b5", "2026-09-01", 9, 90, "completado", "individual", 62000),
    apt("a16", "AB-00016", "c4", "v10", "aceite", "oeste", "m3", "b3", "2026-08-22", 13, 60, "cancelado", "individual", 0),
    apt("a17", "AB-00017", "c3", "v4", "preventivo", "norte", "m2", "b1", "2026-09-11", 14, 90, "pendiente", "pack", 0, "p1"),
    apt("a18", "AB-00018", "c1", "v1", "diagnostico", "norte", "m1", "b2", "2026-09-07", 15, 60, "en_atencion", "individual", 35000),
  ];

  return {
    users,
    clients,
    vehicles,
    branches,
    services,
    mechanics,
    boxes,
    packs,
    freezes: [
      {
        id: "f1",
        packId: "p2",
        requestedBy: "u-abc",
        days: 15,
        reason: "Parada de flota por recambio de seguros",
        status: "rechazado",
        at: "2026-08-25T11:00:00",
        approvedBy: "u-coo",
      },
    ],
    appointments,
    audit: [
      { id: uid("au"), at: "2026-09-07T10:00:00", actorId: "u-ger", action: "sistema", detail: "Semilla inicial TurnoFlex AutoBox" },
    ],
    alerts: [
      { id: uid("al"), at: "2026-09-07T08:00:00", channel: "portal", recipient: "ana.gomez@mail.com", kind: "turno_24h", payload: "Recordatorio turno AB-00012 · 09/09 10:00 Norte", result: "enviado", appointmentId: "a12" },
      { id: uid("al"), at: "2026-09-06T09:00:00", channel: "email", recipient: "flota@distribuidoraabc.com", kind: "pack_7d", payload: "Pack Flota 10 vence el 30/09 · 6 créditos restantes", result: "enviado", packId: "p1" },
    ],
    exceptions: [
      {
        id: "e1",
        at: "2026-09-06T16:20:00",
        requestedBy: "u-mec",
        branchId: "norte",
        reason: "Cliente habitual pide sobreturno. Hay elevador ocupado a las 17.",
        status: "pendiente",
      },
    ],
    currentUserId: null,
  };
}

function apt(
  id: string,
  code: string,
  clientId: string,
  vehicleId: string,
  serviceId: string,
  branchId: string,
  mechanicId: string,
  boxId: string,
  day: string,
  hour: number,
  duration: number,
  status: AppState["appointments"][number]["status"],
  paymentKind: "individual" | "pack",
  amountPaid: number,
  packId?: string,
  depositLost = 0,
): AppState["appointments"][number] {
  return {
    id,
    code,
    clientId,
    vehicleId,
    serviceId,
    branchId,
    mechanicId,
    boxId,
    start: iso(day, hour),
    end: plus(day, hour, duration),
    status,
    paymentKind,
    packId,
    amountPaid,
    depositLost,
    createdAt: iso(day, hour - 48 > 0 ? 10 : 10),
  };
}
