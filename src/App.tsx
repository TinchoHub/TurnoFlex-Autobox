import { Navigate, Route, Routes } from "react-router-dom";
import { Layout, RequireAuth } from "./Layout";
import { Login, Landing } from "./pages/Public";
import { PacksPage, Portal, Reservar, TurnosPage } from "./pages/Cliente";
import { Auditoria, Coordinacion, Dashboard, Liquidaciones, Recepcion, Taller } from "./pages/Staff";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route element={<RequireAuth roles={["cliente"]} />}>
          <Route path="/portal" element={<Portal />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/turnos" element={<TurnosPage />} />
          <Route path="/packs" element={<PacksPage />} />
        </Route>
        <Route element={<RequireAuth roles={["recepcion", "coordinador", "gerencia"]} />}>
          <Route path="/recepcion" element={<Recepcion />} />
        </Route>
        <Route element={<RequireAuth roles={["mecanico"]} />}>
          <Route path="/taller" element={<Taller />} />
        </Route>
        <Route element={<RequireAuth roles={["coordinador", "gerencia"]} />}>
          <Route path="/coordinacion" element={<Coordinacion />} />
          <Route path="/liquidaciones" element={<Liquidaciones />} />
          <Route path="/auditoria" element={<Auditoria />} />
        </Route>
        <Route element={<RequireAuth roles={["recepcion", "coordinador", "gerencia"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
