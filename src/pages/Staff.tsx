import { useMemo, useState } from "react";
import { appointmentLabel, formatDateTime, formatMoney, mechanicSettlements } from "../lib/engine";
import { useStore } from "../lib/store";
import { BadgeStatus } from "../Layout";

export function Recepcion() {
  const s = useStore();
  const branchId = s.currentUser?.branchId;
  const today = s.appointments
    .filter((a) => a.branchId === branchId)
    .sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div>
      <h1>Recepción · {s.branches.find((b) => b.id === branchId)?.name}</h1>
      <p className="muted">Check-in, no-show y consulta de pagos. Las excepciones las autoriza el jefe de taller.</p>
      <div className="card" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Turno</th>
              <th>Cliente / vehículo</th>
              <th>Servicio</th>
              <th>Pago</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {today.map((a) => {
              const client = s.clients.find((c) => c.id === a.clientId);
              const vehicle = s.vehicles.find((v) => v.id === a.vehicleId);
              const service = s.services.find((x) => x.id === a.serviceId);
              return (
                <tr key={a.id}>
                  <td>
                    {a.code}
                    <div className="muted">{formatDateTime(a.start)}</div>
                  </td>
                  <td>
                    {client?.name}
                    <div className="muted">{vehicle?.plate}</div>
                  </td>
                  <td>{service?.name}</td>
                  <td>
                    {a.paymentKind} · cobrado {formatMoney(a.amountPaid)}
                    {a.depositLost ? ` · seña perdida ${formatMoney(a.depositLost)}` : ""}
                  </td>
                  <td>
                    <BadgeStatus status={a.status} />
                  </td>
                  <td className="row-actions">
                    {a.status === "confirmado" && (
                      <button className="btn" onClick={() => s.setAppointmentStatus(a.id, "en_atencion")}>
                        Check-in
                      </button>
                    )}
                    {a.status === "confirmado" && (
                      <button className="btn-secondary" onClick={() => s.setAppointmentStatus(a.id, "no_show")}>
                        No-show
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Taller() {
  const s = useStore();
  const [reason, setReason] = useState("Cliente habitual: agendalo igual que lo atiendo yo.");
  const jobs = s.appointments.filter((a) => a.mechanicId === s.currentUser?.mechanicId).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div>
      <h1>Trabajos asignados</h1>
      <p className="muted">Informá inicio y cierre. Si necesitás una excepción, queda registrada: no se fuerza el sobreturno.</p>
      <div className="card">
        {jobs.map((a) => (
          <div key={a.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <strong>
              {a.code} · {s.services.find((x) => x.id === a.serviceId)?.name}
            </strong>
            <div className="muted">
              {formatDateTime(a.start)} · {s.vehicles.find((v) => v.id === a.vehicleId)?.plate} · {appointmentLabel(a.status)}
            </div>
            <div className="row-actions" style={{ marginTop: 8 }}>
              {a.status === "confirmado" && (
                <button className="btn" onClick={() => s.setAppointmentStatus(a.id, "en_atencion")}>
                  Iniciar
                </button>
              )}
              {a.status === "en_atencion" && (
                <button className="btn" onClick={() => s.setAppointmentStatus(a.id, "completado")}>
                  Completar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Pedir excepción (sin saltar el motor de disponibilidad)</h3>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => s.requestException(reason)}>
          Enviar a coordinación
        </button>
      </div>
    </div>
  );
}

export function Coordinacion() {
  const s = useStore();
  return (
    <div>
      <h1>Coordinación de taller</h1>
      <p className="muted">Disponibilidad, congelamientos y excepciones. Las reglas no se improvisan por WhatsApp.</p>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Congelamientos de pack</h3>
          {s.freezes.map((f) => {
            const pack = s.packs.find((p) => p.id === f.packId);
            return (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <div>
                  {pack?.name} · {f.days} días · <BadgeStatus status={f.status} />
                </div>
                <div className="muted">{f.reason}</div>
                {f.status === "pendiente" && (
                  <div className="row-actions" style={{ marginTop: 8 }}>
                    <button className="btn" onClick={() => s.resolveFreeze(f.id, true)}>
                      Aprobar
                    </button>
                    <button className="btn-secondary" onClick={() => s.resolveFreeze(f.id, false)}>
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="card">
          <h3>Excepciones</h3>
          {s.exceptions.map((e) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <div>
                {s.users.find((u) => u.id === e.requestedBy)?.name} · <BadgeStatus status={e.status} />
              </div>
              <div className="muted">{e.reason}</div>
              {e.status === "pendiente" && (
                <div className="row-actions" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => s.resolveException(e.id, true)}>
                    Autorizar y registrar
                  </button>
                  <button className="btn-secondary" onClick={() => s.resolveException(e.id, false)}>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Liquidaciones() {
  const s = useStore();
  const from = new Date("2026-09-01T00:00:00");
  const to = new Date("2026-09-15T23:59:59");
  return (
    <div>
      <h1>Liquidación quincenal</h1>
      <p className="muted">01/09/2026 – 15/09/2026 · sólo servicios completados. Cancelados y no-show no liquidan.</p>
      {s.mechanics.map((m) => {
        const set = mechanicSettlements(s, m, from, to);
        return (
          <div className="card" key={m.id} style={{ marginTop: 12 }}>
            <div className="topbar">
              <div>
                <h3>{m.name}</h3>
                <span className="muted">{s.branches.find((b) => b.id === m.branchId)?.name}</span>
              </div>
              <b>{formatMoney(set.total)}</b>
            </div>
            {set.lines.length === 0 && <p className="muted">Sin servicios completados en el período.</p>}
            {set.lines.map((l) => (
              <p key={l.appointment.id}>
                {l.appointment.code} · {l.service.name} · {formatMoney(l.amount)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function Auditoria() {
  const s = useStore();
  return (
    <div>
      <h1>Auditoría y alertas</h1>
      <div className="grid grid-2">
        <div className="card">
          <h3>Registro de acciones</h3>
          {s.audit
            .slice()
            .reverse()
            .map((e) => (
              <p key={e.id}>
                <span className="muted">{formatDateTime(e.at)}</span> · {e.action} · {e.detail}
              </p>
            ))}
        </div>
        <div className="card">
          <h3>Alertas (24 h / 2 h / packs)</h3>
          {s.alerts.map((a) => (
            <p key={a.id}>
              {a.kind} · {a.recipient} · {a.payload} · <BadgeStatus status={a.result} />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const s = useStore();
  const canSeeMoney = s.currentUser?.role !== "recepcion";
  const [branchId, setBranchId] = useState("todas");
  const [serviceId, setServiceId] = useState("todos");
  const [mechanicId, setMechanicId] = useState("todos");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-09-30");

  const filtered = useMemo(() => {
    return s.appointments.filter((a) => {
      const day = a.start.slice(0, 10);
      if (day < from || day > to) return false;
      if (branchId !== "todas" && a.branchId !== branchId) return false;
      if (serviceId !== "todos" && a.serviceId !== serviceId) return false;
      if (mechanicId !== "todos" && a.mechanicId !== mechanicId) return false;
      return true;
    });
  }, [s.appointments, branchId, serviceId, mechanicId, from, to]);

  const noshow = filtered.filter((a) => a.status === "no_show");
  const denom = filtered.filter((a) => new Date(a.end) < new Date() && !["pendiente", "cancelado"].includes(a.status)).length || 1;
  const noshowRate = (noshow.length / denom) * 100;

  const prevFrom = shiftMonth(from, -1);
  const prevTo = shiftMonth(to, -1);
  const prev = s.appointments.filter((a) => {
    const day = a.start.slice(0, 10);
    return day >= prevFrom && day <= prevTo;
  });
  const prevDenom = prev.filter((a) => new Date(a.end) < new Date() && !["pendiente", "cancelado"].includes(a.status)).length || 1;
  const prevRate = (prev.filter((a) => a.status === "no_show").length / prevDenom) * 100;

  const packUse = s.packs.reduce(
    (acc, p) => {
      acc.used += p.creditsUsed;
      acc.total += p.creditsTotal;
      if (p.status === "activo") acc.active += 1;
      if (p.status === "congelado") acc.frozen += 1;
      if (p.status === "vencido") acc.expiredCredits += p.creditsTotal - p.creditsUsed;
      const days = (new Date(p.end).getTime() - new Date("2026-09-07").getTime()) / 86400000;
      if (p.status === "activo" && days >= 0 && days <= 14) acc.soon += 1;
      acc.available += Math.max(0, p.creditsTotal - p.creditsUsed);
      return acc;
    },
    { used: 0, total: 0, active: 0, frozen: 0, expiredCredits: 0, soon: 0, available: 0 },
  );

  const revenue = revenueOf(s, filtered);
  const prevRevenue = revenueOf(
    s,
    s.appointments.filter((a) => {
      const day = a.start.slice(0, 10);
      return day >= prevFrom && day <= prevTo;
    }),
  );

  const byBranch = s.branches.map((b) => ({
    name: b.name.replace("AutoBox ", ""),
    value: revenueOf(
      s,
      filtered.filter((a) => a.branchId === b.id),
    ).total,
  }));
  const maxRev = Math.max(...byBranch.map((x) => x.value), 1);
  const months = ["08", "09"];
  const noshowSeries = months.map((m) => {
    const subset = s.appointments.filter((a) => a.start.startsWith(`2026-${m}`));
    const d = subset.filter((a) => !["pendiente", "cancelado"].includes(a.status)).length || 1;
    return { m, v: (subset.filter((a) => a.status === "no_show").length / d) * 100 };
  });
  const topServices = Object.entries(
    filtered.reduce<Record<string, number>>((acc, a) => {
      acc[a.serviceId] = (acc[a.serviceId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Dashboard de gestión</h1>
          <p className="muted">Feedback del sistema: no-show, packs y recaudación. Sin duplicar ingresos al usar créditos.</p>
        </div>
      </div>
      <div className="filters">
        <label>
          Desde
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label>
          Sucursal
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="todas">Todas</option>
            {s.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Servicio
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="todos">Todos</option>
            {s.services.map((sv) => (
              <option key={sv.id} value={sv.id}>
                {sv.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Profesional
          <select value={mechanicId} onChange={(e) => setMechanicId(e.target.value)}>
            <option value="todos">Todos</option>
            {s.mechanics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-3">
        <div className="card kpi">
          <span className="muted">Tasa de no-show</span>
          <b>{noshowRate.toFixed(1)}%</b>
          <span className={`delta ${noshowRate <= prevRate ? "up" : "down"}`}>
            {noshow.length} casos · período anterior {prevRate.toFixed(1)}%
          </span>
        </div>
        <div className="card kpi">
          <span className="muted">Uso de packs</span>
          <b>{packUse.total ? Math.round((packUse.used / packUse.total) * 100) : 0}%</b>
          <span className="muted">
            {packUse.active} activos · {packUse.soon} por vencer · {packUse.frozen} congelados
          </span>
        </div>
        {canSeeMoney && (
        <div className="card kpi">
          <span className="muted">Recaudación</span>
          <b>{formatMoney(revenue.total)}</b>
          <span className="muted">Anterior {formatMoney(prevRevenue.total)}</span>
        </div>
        )}
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Evolución de no-show</h3>
          <div className="chart">
            {noshowSeries.map((x) => (
              <div key={x.m} className="bar" style={{ height: `${Math.max(12, x.v * 6)}%` }} title={`${x.m}: ${x.v.toFixed(1)}%`} />
            ))}
          </div>
          <p className="muted">Ago / Sep 2026</p>
        </div>
        <div className="card">
          <h3>Recaudación por sucursal</h3>
          <div className="chart">
            {byBranch.map((x) => (
              <div key={x.name} className="bar alt" style={{ height: `${(x.value / maxRev) * 100}%` }} title={`${x.name}: ${formatMoney(x.value)}`} />
            ))}
          </div>
          <p className="muted">{byBranch.map((x) => x.name).join(" · ")}</p>
        </div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Packs</h3>
          <p>Créditos usados {packUse.used} / contratados {packUse.total}</p>
          <p>Disponibles {packUse.available} · vencidos no usados {packUse.expiredCredits}</p>
          {s.packs.map((p) => (
            <p key={p.id}>
              {p.name} · {s.clients.find((c) => c.id === p.clientId)?.name} · {p.creditsUsed}/{p.creditsTotal} · <BadgeStatus status={p.status} />
            </p>
          ))}
        </div>
        <div className="card">
          <h3>Servicios más reservados</h3>
          {topServices.map(([id, n]) => (
            <p key={id}>
              {s.services.find((x) => x.id === id)?.name} · {n}
            </p>
          ))}
          {canSeeMoney && (
          <p className="muted">
            Desglose cobrado: individuales {formatMoney(revenue.individual)} · packs {formatMoney(revenue.packs)} · penalizaciones{" "}
            {formatMoney(revenue.penalties)}
          </p>
          )}
        </div>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Turnos en el filtro: {filtered.length}
      </p>
    </div>
  );
}

function shiftMonth(day: string, delta: number) {
  const d = new Date(`${day}T12:00:00`);
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 10);
}

function revenueOf(s: ReturnType<typeof useStore>, appointments: typeof s.appointments) {
  const individual = appointments
    .filter((a) => a.paymentKind === "individual")
    .reduce((acc, a) => acc + a.amountPaid, 0);
  const penalties = appointments.reduce((acc, a) => acc + a.depositLost, 0);
  const packSales = s.packs
    .filter((p) => {
      const day = p.paidAt.slice(0, 10);
      return day >= "2026-08-01" && day <= "2026-09-30";
    })
    .reduce((acc, p) => acc + p.paidAmount, 0);
  return { individual, penalties, packs: packSales, total: individual + penalties + packSales };
}
