import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appointmentLabel, formatDate, formatDateTime, formatMoney, isLateCancel } from "../lib/engine";
import { slotsFor, useStore } from "../lib/store";
import { BadgeStatus } from "../Layout";

export function Portal() {
  const s = useStore();
  const clientId = s.currentUser?.clientId;
  const vehicles = s.vehicles.filter((v) => v.clientId === clientId);
  const packs = s.packs.filter((p) => p.clientId === clientId);
  const turnos = s.appointments
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => a.start.localeCompare(b.start));
  const next = turnos.filter((a) => ["pendiente", "confirmado", "en_atencion"].includes(a.status));
  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Hola, {s.currentClient?.name}</h1>
          <p className="muted">Próximos turnos, vehículos y créditos en un solo lugar.</p>
        </div>
        <Link className="btn" to="/reservar">
          Reservar turno
        </Link>
      </div>
      <div className="grid grid-3">
        <div className="card kpi">
          <span className="muted">Próximos turnos</span>
          <b>{next.length}</b>
        </div>
        <div className="card kpi">
          <span className="muted">Vehículos</span>
          <b>{vehicles.length}</b>
        </div>
        <div className="card kpi">
          <span className="muted">Créditos disponibles</span>
          <b>{packs.filter((p) => p.status === "activo").reduce((acc, p) => acc + (p.creditsTotal - p.creditsUsed), 0)}</b>
        </div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Vehículos</h3>
          {vehicles.map((v) => (
            <p key={v.id}>
              <strong>{v.plate}</strong> · {v.brand} {v.model} {v.year}
            </p>
          ))}
        </div>
        <div className="card">
          <h3>Packs</h3>
          {packs.length === 0 && <p className="muted">No tenés packs contratados. Podés reservar servicios individuales.</p>}
          {packs.map((p) => (
            <p key={p.id}>
              {p.name} · {p.creditsTotal - p.creditsUsed}/{p.creditsTotal} · vence {formatDate(p.end)} <BadgeStatus status={p.status} />
            </p>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Agenda</h3>
        <TurnosTable />
      </div>
    </div>
  );
}

export function TurnosPage() {
  return (
    <div>
      <h1>Mis turnos</h1>
      <p className="muted">Cancelá con más de 24 h para no perder seña ni crédito.</p>
      <div className="card" style={{ marginTop: 16 }}>
        <TurnosTable />
      </div>
    </div>
  );
}

function TurnosTable() {
  const s = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const mine = s.appointments
    .filter((a) => a.clientId === s.currentUser?.clientId)
    .sort((a, b) => b.start.localeCompare(a.start));
  return (
    <div>
      {msg && <div className="notice ok">{msg}</div>}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cuándo</th>
            <th>Servicio</th>
            <th>Sucursal</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mine.map((a) => {
            const service = s.services.find((x) => x.id === a.serviceId);
            const branch = s.branches.find((x) => x.id === a.branchId);
            const late = isLateCancel(a.start);
            return (
              <tr key={a.id}>
                <td>{a.code}</td>
                <td>{formatDateTime(a.start)}</td>
                <td>{service?.name}</td>
                <td>{branch?.name}</td>
                <td>
                  <BadgeStatus status={a.status} />
                </td>
                <td>
                  {["pendiente", "confirmado"].includes(a.status) && (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const penalty = late
                          ? a.paymentKind === "pack"
                            ? "Se va a consumir 1 crédito."
                            : `Se pierde la seña de ${formatMoney(service?.deposit ?? 0)}.`
                          : "Sin penalización.";
                        if (!confirm(`¿Cancelar ${a.code}? ${penalty}`)) return;
                        const res = s.cancelAppointment(a.id);
                        setMsg(res.ok ? res.message : res.error);
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PacksPage() {
  const s = useStore();
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("Parada operativa de la flota");
  const packs = s.packs.filter((p) => p.clientId === s.currentUser?.clientId);
  return (
    <div>
      <h1>Packs y créditos</h1>
      <p className="muted">Los créditos sólo valen entre la fecha de inicio y el vencimiento, con el pack activo.</p>
      <div className="grid" style={{ marginTop: 16 }}>
        {packs.map((p) => (
          <div className="card" key={p.id}>
            <div className="topbar">
              <div>
                <h3>{p.name}</h3>
                <BadgeStatus status={p.status} />
              </div>
              <b>
                {p.creditsTotal - p.creditsUsed} / {p.creditsTotal}
              </b>
            </div>
            <p className="muted">
              Vigencia {formatDate(p.start)} → {formatDate(p.end)} · Pagado {formatMoney(p.paidAmount)}
            </p>
            {p.status === "activo" && (
              <div className="form" style={{ marginTop: 12 }}>
                <label>
                  Días de congelamiento
                  <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                </label>
                <label>
                  Motivo
                  <input value={reason} onChange={(e) => setReason(e.target.value)} />
                </label>
                <button className="btn-secondary" onClick={() => s.requestFreeze(p.id, days, reason)}>
                  Solicitar congelamiento
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Solicitudes</h3>
        {s.freezes
          .filter((f) => packs.some((p) => p.id === f.packId))
          .map((f) => (
            <p key={f.id}>
              {f.days} días · {f.reason} · <BadgeStatus status={f.status} />
            </p>
          ))}
      </div>
    </div>
  );
}

export function Reservar() {
  const s = useStore();
  const navigate = useNavigate();
  const clientId = s.currentUser?.clientId ?? "";
  const vehicles = s.vehicles.filter((v) => v.clientId === clientId);
  const packs = s.packs.filter((p) => p.clientId === clientId && p.status === "activo" && p.creditsTotal > p.creditsUsed);
  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [serviceId, setServiceId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("2026-09-12");
  const [slotStart, setSlotStart] = useState("");
  const [paymentKind, setPaymentKind] = useState<"individual" | "pack">("individual");
  const [packId, setPackId] = useState(packs[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const service = s.services.find((x) => x.id === serviceId);
  const slots = useMemo(() => {
    if (!service || !branchId || !date) return [];
    return slotsFor(s, branchId, service, date);
  }, [s, service, branchId, date]);
  const slot = slots.find((x) => x.start === slotStart);

  const confirm = () => {
    if (!service || !slot) return;
    const res = s.book({
      vehicleId,
      serviceId,
      branchId,
      start: slot.start,
      end: slot.end,
      mechanicId: slot.mechanicId,
      boxId: slot.boxId,
      paymentKind,
      packId: paymentKind === "pack" ? packId : undefined,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(res.code);
  };

  if (done) {
    const apt = s.appointments.find((a) => a.code === done);
    const vehicle = s.vehicles.find((v) => v.id === apt?.vehicleId);
    const branch = s.branches.find((b) => b.id === apt?.branchId);
    return (
      <div className="card">
        <h1>Turno confirmado</h1>
        <p className="muted">Código único {done}</p>
        <ul>
          <li>Vehículo: {vehicle?.plate}</li>
          <li>Servicio: {service?.name}</li>
          <li>Sucursal: {branch?.name}</li>
          <li>Fecha: {apt ? formatDateTime(apt.start) : ""}</li>
          <li>Estado: {apt ? appointmentLabel(apt.status) : ""}</li>
        </ul>
        <button className="btn" onClick={() => navigate("/turnos")}>
          Ver mis turnos
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Reservar turno</h1>
      <p className="muted">Cinco pasos, con horarios que ya contemplan mecánico y box.</p>
      <div className="steps">
        {["Vehículo", "Servicio", "Sucursal", "Horario", "Confirmar"].map((label, i) => (
          <span key={label} className={`step ${step === i + 1 ? "current" : step > i + 1 ? "done" : ""}`}>
            {i + 1}. {label}
          </span>
        ))}
      </div>
      {error && <div className="notice error">{error}</div>}
      {step === 1 && (
        <div className="grid grid-2">
          {vehicles.map((v) => (
            <button key={v.id} className={`choice ${vehicleId === v.id ? "selected" : ""}`} onClick={() => setVehicleId(v.id)}>
              <strong>{v.plate}</strong>
              <div className="muted">
                {v.brand} {v.model} {v.year}
              </div>
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="grid grid-2">
          {s.services.map((sv) => (
            <button key={sv.id} className={`choice ${serviceId === sv.id ? "selected" : ""}`} onClick={() => setServiceId(sv.id)}>
              <strong>{sv.name}</strong>
              <div className="muted">
                {sv.durationMin} min · {formatMoney(sv.price)} · seña {formatMoney(sv.deposit)}
                {sv.packEligible ? " · apto pack" : ""}
              </div>
            </button>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="grid grid-3">
          {s.branches.map((b) => (
            <button key={b.id} className={`choice ${branchId === b.id ? "selected" : ""}`} onClick={() => setBranchId(b.id)}>
              <strong>{b.name}</strong>
              <div className="muted">
                {b.zone}
                <br />
                {b.address}
              </div>
            </button>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="card">
          <label>
            Fecha
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlotStart(""); }} />
          </label>
          <div className="grid grid-3" style={{ marginTop: 12 }}>
            {slots.map((sl) => (
              <button key={sl.start} className={`slot ${slotStart === sl.start ? "selected" : ""}`} onClick={() => setSlotStart(sl.start)}>
                {formatDateTime(sl.start)}
                <div className="muted">
                  {sl.mechanicName} · {sl.boxName}
                </div>
              </button>
            ))}
          </div>
          {slots.length === 0 && <p className="muted">No hay horarios con profesional y recurso libres ese día.</p>}
        </div>
      )}
      {step === 5 && service && slot && (
        <div className="card">
          <h3>Resumen antes de confirmar</h3>
          <p>
            {s.vehicles.find((v) => v.id === vehicleId)?.plate} · {service.name} · {s.branches.find((b) => b.id === branchId)?.name} ·{" "}
            {formatDateTime(slot.start)}
          </p>
          <div className="grid grid-2">
            <button className={`choice ${paymentKind === "individual" ? "selected" : ""}`} onClick={() => setPaymentKind("individual")}>
              Servicio individual · seña {formatMoney(service.deposit)}
            </button>
            <button
              className={`choice ${paymentKind === "pack" ? "selected" : ""}`}
              disabled={!service.packEligible || packs.length === 0}
              onClick={() => setPaymentKind("pack")}
            >
              Usar crédito de pack {service.packEligible ? "" : "(este servicio no está en el pack)"}
            </button>
          </div>
          {paymentKind === "pack" && (
            <label style={{ marginTop: 12 }}>
              Pack
              <select value={packId} onChange={(e) => setPackId(e.target.value)}>
                {packs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.creditsTotal - p.creditsUsed} créditos · hasta {p.end}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="muted">
            Si cancelás con menos de 24 h, se pierde la seña o se consume el crédito. El horario queda bloqueado para evitar sobreturnos.
          </p>
        </div>
      )}
      <div className="row-actions" style={{ marginTop: 16 }}>
        {step > 1 && (
          <button className="btn-secondary" onClick={() => setStep((n) => n - 1)}>
            Atrás
          </button>
        )}
        {step < 5 && (
          <button
            className="btn"
            disabled={(step === 1 && !vehicleId) || (step === 2 && !serviceId) || (step === 3 && !branchId) || (step === 4 && !slotStart)}
            onClick={() => setStep((n) => n + 1)}
          >
            Continuar
          </button>
        )}
        {step === 5 && (
          <button className="btn" onClick={confirm}>
            Confirmar reserva
          </button>
        )}
      </div>
    </div>
  );
}
