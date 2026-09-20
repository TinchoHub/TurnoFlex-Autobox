export type Role = "cliente" | "recepcion" | "mecanico" | "coordinador" | "gerencia";

export type AppointmentStatus =
  | "pendiente"
  | "confirmado"
  | "cancelado"
  | "cancelacion_tardia"
  | "en_atencion"
  | "completado"
  | "no_show";

export type PackStatus = "activo" | "congelado" | "agotado" | "vencido";

export type PaymentKind = "individual" | "pack";

export interface Branch {
  id: string;
  name: string;
  zone: string;
  address: string;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  requiresLift: boolean;
  price: number;
  deposit: number;
  packEligible: boolean;
}

export interface Mechanic {
  id: string;
  name: string;
  branchId: string;
  specialties: string[];
  startHour: number;
  endHour: number;
  commission: number;
}

export interface Box {
  id: string;
  name: string;
  branchId: string;
  hasLift: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
  mechanicId?: string;
  clientId?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  kind: "particular" | "flota";
  company?: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}

export interface FreezeRecord {
  id: string;
  packId: string;
  requestedBy: string;
  approvedBy?: string;
  days: number;
  reason: string;
  status: "pendiente" | "aprobado" | "rechazado";
  at: string;
  newEndDate?: string;
}

export interface Pack {
  id: string;
  clientId: string;
  name: string;
  creditsTotal: number;
  creditsUsed: number;
  start: string;
  end: string;
  status: PackStatus;
  paidAmount: number;
  paidAt: string;
}

export interface Appointment {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  serviceId: string;
  branchId: string;
  mechanicId: string;
  boxId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  paymentKind: PaymentKind;
  packId?: string;
  amountPaid: number;
  depositLost: number;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
}

export interface AlertLog {
  id: string;
  at: string;
  channel: "portal" | "email";
  recipient: string;
  kind: "turno_24h" | "turno_2h" | "pack_7d" | "pack_2d";
  payload: string;
  result: "enviado" | "fallido" | "reintento";
  appointmentId?: string;
  packId?: string;
}

export interface ExceptionRequest {
  id: string;
  at: string;
  requestedBy: string;
  branchId: string;
  reason: string;
  status: "pendiente" | "aprobada" | "rechazada";
  resolvedBy?: string;
}

export interface AppState {
  users: User[];
  clients: Client[];
  vehicles: Vehicle[];
  branches: Branch[];
  services: Service[];
  mechanics: Mechanic[];
  boxes: Box[];
  packs: Pack[];
  freezes: FreezeRecord[];
  appointments: Appointment[];
  audit: AuditEvent[];
  alerts: AlertLog[];
  exceptions: ExceptionRequest[];
  currentUserId: string | null;
}

export interface SlotOption {
  start: string;
  end: string;
  mechanicId: string;
  mechanicName: string;
  boxId: string;
  boxName: string;
}
