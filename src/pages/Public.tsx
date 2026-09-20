import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

export function Landing() {
  return (
    <section className="hero">
      <div>
        <span className="badge">SaaS de gestión · TurnoFlex</span>
        <h1 style={{ fontSize: 52, marginTop: 16 }}>
          AutoBox, el taller de confianza con la agenda de una red.
        </h1>
        <p className="muted" style={{ fontSize: 18, maxWidth: 620 }}>
          Tres sucursales en el AMBA. Turnos con disponibilidad real de mecánicos y boxes,
          packs para flotas, cancelaciones con reglas claras y un dashboard para gerencia.
        </p>
        <div className="row-actions" style={{ marginTop: 22 }}>
          <Link className="btn" to="/login">
            Ingresar a la demo
          </Link>
          <a className="btn-secondary" href="#capacidades">
            Ver capacidades
          </a>
        </div>
        <div className="grid grid-3" style={{ marginTop: 36 }}>
          <Mini title="Sin sobreturnos" text="Un horario sólo aparece si hay profesional y box libres." />
          <Mini title="Pack Flota 10" text="Créditos con vigencia, congelamiento y vencimiento automático." />
          <Mini title="Feedback gerencial" text="No-show, uso de packs y recaudación por sucursal." />
        </div>
      </div>
      <div className="card hero-card">
        <h3>Caso de estudio IDS</h3>
        <p className="muted">
          Prototipo alineado a las HU SMART del grupo 8: reserva, packs, cancelación 24 h y alertas.
        </p>
        <ul className="muted">
          <li>Portal de autoservicio en 5 pasos</li>
          <li>Motor de disponibilidad</li>
          <li>Política uniforme de penalización</li>
          <li>Excepciones registradas, no informales</li>
        </ul>
        <Link className="btn" to="/login">
          Probar con usuarios demo
        </Link>
      </div>
    </section>
  );
}

function Mini({ title, text }: { title: string; text: string }) {
  return (
    <div className="card" id="capacidades">
      <strong>{title}</strong>
      <p className="muted">{text}</p>
    </div>
  );
}

export function Login() {
  const { users, login } = useStore();
  const navigate = useNavigate();
  return (
    <section className="hero" style={{ gridTemplateColumns: "1fr" }}>
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Entrar a TurnoFlex</h1>
        <p className="muted">Elegí un perfil. No hay contraseña: es una demo de escritorio para la PFO.</p>
        <div className="grid grid-2" style={{ marginTop: 18 }}>
          {users.map((u) => (
            <button
              key={u.id}
              className="choice"
              onClick={() => {
                login(u.id);
                navigate(u.role === "cliente" ? "/portal" : u.role === "recepcion" ? "/recepcion" : u.role === "mecanico" ? "/taller" : u.role === "coordinador" ? "/coordinacion" : "/dashboard");
              }}
            >
              <strong>{u.name}</strong>
              <div className="muted">{u.email}</div>
              <span className="badge">{u.role}</span>
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Tip: entra como <b>Ana Gómez</b> para reservar, y como <b>Elena Varela</b> para el dashboard.
        </p>
      </div>
    </section>
  );
}
