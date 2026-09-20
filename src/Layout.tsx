import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { roleHome, useStore } from "./lib/store";
import type { Role } from "./lib/types";

const links: Record<Role, { to: string; label: string }[]> = {
  cliente: [
    { to: "/portal", label: "Mi panel" },
    { to: "/reservar", label: "Reservar turno" },
    { to: "/turnos", label: "Mis turnos" },
    { to: "/packs", label: "Packs y créditos" },
  ],
  recepcion: [
    { to: "/recepcion", label: "Recepción" },
    { to: "/dashboard", label: "Indicadores" },
  ],
  mecanico: [
    { to: "/taller", label: "Mis trabajos" },
  ],
  coordinador: [
    { to: "/coordinacion", label: "Coordinación" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/liquidaciones", label: "Liquidaciones" },
  ],
  gerencia: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/liquidaciones", label: "Liquidaciones" },
    { to: "/auditoria", label: "Auditoría" },
  ],
};

export function Layout() {
  const { currentUser, logout, resetDemo } = useStore();
  const navigate = useNavigate();
  if (!currentUser) return <Outlet />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">AB</div>
          <div>
            <strong>TurnoFlex</strong>
            <small>AutoBox · AMBA</small>
          </div>
        </div>
        <nav className="nav">
          {links[currentUser.role].map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-chip">
          <strong>{currentUser.name}</strong>
          <div className="muted">{labelRole(currentUser.role)}</div>
          <div className="row-actions" style={{ marginTop: 10 }}>
            <button
              className="btn-secondary"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Salir
            </button>
            <button className="btn-ghost" onClick={resetDemo}>
              Reset demo
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to={roleHome(currentUser.role)} replace />;
  return <Outlet />;
}

function labelRole(role: Role) {
  return {
    cliente: "Cliente",
    recepcion: "Recepción",
    mecanico: "Mecánico",
    coordinador: "Jefe de taller",
    gerencia: "Gerencia general",
  }[role];
}

export function BadgeStatus({ status }: { status: string }) {
  const danger = ["no_show", "cancelacion_tardia", "vencido", "rechazado"].includes(status);
  const ok = ["completado", "activo", "aprobado", "confirmado"].includes(status);
  const warn = ["pendiente", "en_atencion", "congelado"].includes(status);
  const cls = danger ? "danger" : ok ? "ok" : warn ? "warn" : "info";
  return <span className={`badge ${cls}`}>{status.replaceAll("_", " ")}</span>;
}
